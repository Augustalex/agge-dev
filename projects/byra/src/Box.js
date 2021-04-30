import React, { useState, useEffect } from "react";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import Input from "@material-ui/core/Input";

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    margin: 12,
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

function Box({ onSave, result }) {
  const classes = useStyles();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(result.title);
  const [labels, setLabels] = useState(result.labels);
  const [labelsInput, setLabelsInput] = useState("");

  useEffect(() => {
    setTitle(result.title);
    setLabels(result.labels);
  }, [result.title, result.labels]);

  return (
    <Card className={classes.root} variant="outlined">
      <CardContent>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom
        >
          Box {result.index}
        </Typography>
        {editing ? (
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        ) : (
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
        )}
        <div>
          {editing && (
            <Input
              value={labelsInput}
              onChange={onLabelsInputChange}
              onKeyPress={submitLabelsInput}
            />
          )}
          {labels.map((label, index) => (
            <span style={{ display: "inline-block", padding: "4px 4px" }}>
              <Chip
                label={label}
                key={index}
                onDelete={editing ? () => deleteLabelAt(index) : undefined}
              />
            </span>
          ))}
        </div>
      </CardContent>
      <CardActions>
        {editing ? (
          <Button size="small" onClick={save}>
            Save
          </Button>
        ) : (
          <Button size="small" onClick={edit}>
            Edit
          </Button>
        )}
      </CardActions>
    </Card>
  );

  function save() {
    onSave({ title, labels });
    setEditing(false);
  }

  function edit() {
    setEditing(true);
  }

  function onLabelsInputChange(event) {
    setLabelsInput(event.target.value);
  }

  function submitLabelsInput(event) {
    if (event.key === "Enter") {
      const value = event.target.value;

      setLabels(labels.concat([value.trim()]));
      setLabelsInput("");
    }
  }

  function deleteLabelAt(index) {
    const newLabels = [...labels];
    newLabels.splice(index, 1);
    setLabels(newLabels);
  }
}

export default Box;
