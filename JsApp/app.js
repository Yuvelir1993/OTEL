const express = require("express");
const PORT = parseInt(process.env.PORT || "8080");
const app = express();

function generateRandNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

app.get("/entry", (req, res) => {
  fetch("http://localhost:7080/prime")
    .then((response) => {
      // Do something with response
      console.log("DID IT!");
    })
    .catch(function (err) {
      console.log("Unable to fetch -", err);
    });
  return (generateRandNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});