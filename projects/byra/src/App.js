import React, { useState, useEffect } from "react";
import "./App.css";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Box from "./Box";

const LocalStorageKey = "box-data";
const appUri = (uri) => "/byra" + uri;

function App() {
  const [data, setData] = useState(
    getFromLocalStorageOr(LocalStorageKey, () => setupInitialData())
  );
  const [results, setResults] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await fetch(appUri("/data"));
      const newData = await response.json();
      setData(newData);

      const newDataText = JSON.stringify(newData);
      localStorage.setItem(LocalStorageKey, newDataText);
    })();
  }, []);

  return (
    <div className="App">
      <div className="header-container">
        <h1 className="header">Containers</h1>
        <Autocomplete
          freeSolo
          id="free-solo-2-demo"
          disableClearable
          options={data.flatMap((option) => [option.title, ...option.labels])}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search input"
              margin="normal"
              variant="outlined"
              InputProps={{ ...params.InputProps, type: "search" }}
              onChange={onSearch}
            />
          )}
        />
      </div>
      <div>
        {(results.length === 0 ? data : results).map((result) => (
          <Box
            result={result}
            onSave={(data) => onSaveBox(result.index, data)}
          />
        ))}
      </div>
    </div>
  );

  function onSearch(event) {
    const searchTerm = event.target.value.trim();

    const newResult = data.filter((box) => {
      return (
        searchTerm.includes(box.index) ||
        box.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        box.labels.some((label) =>
          label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    });

    setResults(newResult);
  }

  function onSaveBox(boxIndex, boxData) {
    const newData = [...data];
    newData.splice(boxIndex - 1, 1, { index: boxIndex, ...boxData });

    setData(newData);
    console.log("SAVE!");
    const textData = JSON.stringify(newData);
    localStorage.setItem(LocalStorageKey, textData);

    fetch(appUri("/data"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: newData }),
    })
      .then((response) => response.json())
      .then((syncedData) => {
        setData(syncedData);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

export default App;

function getFromLocalStorageOr(key, defaultDataFunction) {
  const data = localStorage.getItem(key);
  if (!data) {
    return defaultDataFunction();
  } else {
    const parsedData = JSON.parse(data);
    return parsedData;
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
