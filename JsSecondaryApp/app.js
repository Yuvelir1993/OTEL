const { W3CTraceContextPropagator } = require("@opentelemetry/core");
const {
  defaultTextMapGetter,
  ROOT_CONTEXT,
} = require("@opentelemetry/api");

const autoinstrExpressModule = require('./auto-instrumentation-express')
const { trace } = require("@opentelemetry/api");
const tracer = autoinstrExpressModule.setupTracing('JsSecondaryApp');

const express = require("express");
const PORT = parseInt(process.env.PORT || "8090");
const app = express();

app.get("/jsSecondary", async (req, res) => {
  const propagator = new W3CTraceContextPropagator();
  // Ingect here as in the JsPrimeApp ?
  // --- context propagation ---
  // https://github.com/open-telemetry/opentelemetry-js/issues/2458
  // In downstream service
  const parentCtx = propagator.extract(ROOT_CONTEXT, {}, defaultTextMapGetter);
  const jsSecondaryAppSpan = tracer.startSpan("JsSecondaryAppSpan", undefined, parentCtx);
  // ---------------------------
  jsSecondaryAppSpan.end();
  res.send("Hello from JsSecondaryApp");
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});