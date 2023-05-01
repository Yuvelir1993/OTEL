const opentelemetry = require('@opentelemetry/api');
const autoinstrExpressModule = require('./auto-instrumentation-express')
const tracer = autoinstrExpressModule.setupTracing('JsApp');
const express = require("express");
const PORT = parseInt(process.env.PORT || "8080");
const app = express();

function generateRandNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

app.get("/entry", async (req, res) => {
  const callPrimeSpan = tracer.startSpan('CallPythonPrimeApp');
  const response = await fetch("http://127.0.0.1:7080/prime")
    .then((response) => {
      // Do something with response
      console.log("DID IT!");
      console.log(response);
      res.send(generateRandNumber(1, 6).toString());
    })
    .catch(function (ex) {
      callPrimeSpan.recordException(ex);
      callPrimeSpan.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });

      console.log("Unable to fetch -", ex);
      res.status(500);
      res.send(ex);
    });
  console.log("RESPONSE after prime call");
  console.log(response);
  callPrimeSpan.end();
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});