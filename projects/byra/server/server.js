const Express = require("express");
const path = require("path");
const fs = require("fs").promises;

let data = setupInitialData();

const app = Express();

const publicPath = path.join(__dirname, "..", "build");
app.use(Express.static(publicPath));
app.use(Express.urlencoded({ extended: false }));
app.use(Express.json());
//CATCH ALL ERRORS NAD LOG WHAT IS GOING ON!

app.use(function (err, req, res, next) {
  if (err) {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  }
});

app.listen("8081", () => {
  console.log("Trying to restore data...");
  restoreData();
  console.log("Data restored succesfully!");

  console.log("Listening on port 8080.");
});

app.post("/data", (req, res) => {
  const newData = req.body.data;
  data = newData;

  res.json(data);

  dumpData();
});

app.get("/data", (req, res) => {
  res.json(data);
});

app.post("/data/add-labels", (req, res) => {
  const newItem = {
    index: parseInt(req.body.boxNumber, 10),
    labels: req.body.labels.split(",").map((word) => word.trim()),
  };

  const existingItem = data.find((box) => box.index === newItem.index);

  if (!existingItem) {
    const result =
      "Could not add items to that container, since a container with number " +
      newItem.index +
      " does not exist.";
    res.end(result);
  } else {
    const newLabels = newItem.labels.filter(
      (label) => !existingItem.labels.includes(label)
    );
    existingItem.labels.push(...newLabels);
    const result =
      "Added these items to container number " +
      newItem.index +
      ": " +
      newItem.labels.join(", ");
    res.end(result);
  }

  dumpData();
});

app.post("/data/remove-labels", (req, res) => {
  const newItem = {
    index: parseInt(req.body.boxNumber, 10),
    labels: req.body.labels.split(",").map((word) => word.trim()),
  };
  const existingItem = data.find((box) => box.index === newItem.index);
  if (!existingItem) {
    res.end(
      "Could not remove items from that container, since a container with number " +
        newItem.index +
        " does not exist."
    );
  } else {
    existingItem.labels = existingItem.labels.filter(
      (label) => !newItem.labels.includes(label)
    );
    res.end(
      "Removed these items from container number " +
        newItem.index +
        ": " +
        newItem.labels.join(", ")
    );
  }

  dumpData();
});

app.post("/data/change-title", (req, res) => {
  const newItem = {
    index: parseInt(req.body.boxNumber, 10),
    title: req.body.title,
  };
  const existingItem = data.find((box) => box.index === newItem.index);
  if (!existingItem) {
    res.end(
      "Could not add item. A container with number " +
        newItem.index +
        " did not exist."
    );
  } else {
    const oldTitle = existingItem.title;
    existingItem.title = req.body.title;
    res.end(
      "Updated title of container number " +
        newItem.index +
        " from " +
        oldTitle +
        " to " +
        newItem.title
    );
  }

  dumpData();
});

app.get("/search", (req, res) => {
  const searchTerm = req.query.term;

  const text = search(searchTerm);
  res.end(text);
});

app.get("/advice", (req, res) => {
  const searchTerm = req.query.term;

  const text = advice(searchTerm);
  res.end(text);
});

function search(searchTerm) {
  const newResult = data.filter((box) => {
    return (
      searchTerm.includes(box.index) ||
      box.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      box.labels.some((label) =>
        label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  const foundItem = !!newResult[0];

  if (foundItem) {
    const indexes = newResult.map((result) => result.index);

    if (indexes.length === 1) {
      return "It's most likely in container number " + indexes[0].toString();
    } else if (indexes.length === 2) {
      return (
        "It's in either container number " +
        indexes[0] +
        " or container number " +
        indexes[1]
      );
    } else {
      const [lastIndex, ...startingIndexes] = indexes.slice().reverse();
      return (
        "It's in one of containers number, " +
        startingIndexes.join(", ") +
        " or " +
        lastIndex
      );
    }
  } else {
    return "Could not find what you where looking for.";
  }
}

function advice(searchTerm) {
  const newResult = data.filter((box) => {
    return (
      searchTerm.includes(box.index) ||
      box.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      box.labels.some((label) =>
        label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  const foundItem = !!newResult[0];

  if (foundItem) {
    const sortedResultByLabel = newResult
      .slice()
      .sort(
        (a, b) =>
          countLabelOccurrence(a, searchTerm) -
          countLabelOccurrence(b, searchTerm)
      );
    const sortedResultByTitle = newResult
      .slice()
      .sort(
        (a, b) =>
          countTitleOccurrence(a, searchTerm) -
          countTitleOccurrence(b, searchTerm)
      );
    const sortedResultByAll = newResult
      .slice()
      .sort(
        (a, b) =>
          countAllOccurrence(a, searchTerm) - countAllOccurrence(b, searchTerm)
      );

    const overallIndex = sortedResultByAll[0].index;
    const titleIndex = sortedResultByTitle[0].index;
    const labelIndex = sortedResultByLabel[0].index;
    const allText =
      "The best choice of container overall would be number " + overallIndex;
    const titleText =
      "But based on the title of each container, it should be in number " +
      titleIndex;
    const labelText =
      "And based on label it should be in container number " + labelIndex;

    if (overallIndex === titleIndex && overallIndex === labelIndex) {
      return (
        "The best choice of container would be number " + overallIndex + "."
      );
    } else if (overallIndex === titleIndex && overallIndex !== labelIndex) {
      return allText + ". " + labelText + ".";
    } else if (overallIndex !== titleIndex && overallIndex === labelIndex) {
      return allText + ". " + titleText + ".";
    } else {
      return allText + ". " + titleText + ". " + labelText + ".";
    }
  } else {
    return "Could not find a container suitable for your item. You need to make space for it in a container of your choice!";
  }
}

function countAllOccurrence(box, term) {
  const lowerCaseTerm = term.toLowerCase();
  return (
    box.title.toLowerCase().split(lowerCaseTerm).length +
    box.labels.reduce(
      (acc, label) => acc + label.toLowerCase().split(lowerCaseTerm).length,
      0
    )
  );
}

function countTitleOccurrence(box, term) {
  const lowerCaseTerm = term.toLowerCase();
  return box.title.toLowerCase().split(lowerCaseTerm).length;
}

function countLabelOccurrence(box, term) {
  const lowerCaseTerm = term.toLowerCase();
  return box.labels.reduce(
    (acc, label) => acc + label.toLowerCase().split(lowerCaseTerm).length,
    0
  );
}

app.get("/open", (req, res) => {
  const boxNumber = parseInt(req.query.boxNumber, 10);

  const box = data.find((b) => b.index === boxNumber);
  if (!box) {
    res.end("There is no container number " + boxNumber);
  } else {
    const first =
      "The title of container number " + boxNumber + " is " + box.title;
    const labels =
      box.labels.length > 0
        ? "It contains these items: " + joinListAsReaderFriendly(box.labels)
        : "It has no logged items.";

    res.end(first + ". " + labels + ".");
  }
});

function joinListAsReaderFriendly(list) {
  if (list.length === 1) {
    return list[0].toString();
  } else if (list.length === 2) {
    return list[0] + " and " + indexes[1];
  } else {
    const [lastItem, ...startingItems] = list.slice().reverse();
    return startingItems.join(", ") + " and " + lastItem;
  }
}

async function dumpData() {
  try {
    await fs.writeFile(
      path.join(__dirname, "data.json"),
      JSON.stringify(data, 4, null),
      "utf-8"
    );
  } catch (error) {
    console.error("Failed writing file with error: " + error);
  }
}

async function restoreData() {
  try {
    const restoredDataText = await fs.readFile(
      path.join(__dirname, "data.json"),
      "utf-8"
    );
    data = JSON.parse(restoredDataText);
  } catch (error) {
    console.error("Failed restoring data from file, with error: " + error);
    data = setupInitialData();
  }
}

function setupInitialData() {
  const size = 51;

  const data = [];
  for (let i = 0; i < size; i++) {
    data.push({
      index: i + 1,
      title: "Empty",
      labels: [],
    });
  }

  return data;
}
