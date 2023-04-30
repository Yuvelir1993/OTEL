const express = require("express");
const PORT = parseInt(process.env.PORT || "8080");
const app = express();

function generateRandNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

app.get("/entry", async (req, res) => {
  const response = await fetch("http://127.0.0.1:7080/prime")
    .then((response) => {
      // Do something with response
      console.log("DID IT!");
      console.log(response);
    })
    .catch(function (err) {
      console.log("Unable to fetch -", err);
      return err;
    });
  console.log("RESPONSE after prime call");
  console.log(response);
  res.send(generateRandNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});