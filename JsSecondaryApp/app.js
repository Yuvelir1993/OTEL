const {W3CTraceContextPropagator} = require("@opentelemetry/core");
const {context, propagation, trace, metrics} = require('@opentelemetry/api');
const {
    defaultTextMapGetter,
    ROOT_CONTEXT,
} = require("@opentelemetry/api");

const autoinstrExpressModule = require('./auto-instrumentation-express')
const tracer = autoinstrExpressModule.setupTracing('JsSecondaryApp');

const express = require("express");
const PORT = parseInt(process.env.PORT || "8090");
const app = express();
const propagator = new W3CTraceContextPropagator();
const parentCtx = propagator.extract(ROOT_CONTEXT, {}, defaultTextMapGetter);

app.post("/commonContext", async (req, res) => {
    res.send("Hello from JsSecondaryApp 'commonContext' API.");
})

app.get("/jsSecondary", async (req, res) => {
    // Ingect here as in the JsPrimeApp ?
    // --- context propagation ---
    // https://github.com/open-telemetry/opentelemetry-js/issues/2458
    // In downstream service
    console.log("parentCtx");
    console.log(parentCtx);
    const baggage = propagation.getBaggage(context.active());
    console.log("baggage");
    console.log(baggage);
    const jsSecondaryAppSpan = tracer.startSpan("JsSecondaryAppSpan");
    // const jsSecondaryAppSpan = tracer.startSpan("JsSecondaryAppSpan", undefined, parentCtx);
    // ---------------------------
    res.send("Hello from JsSecondaryApp 'jsSecondary' API.");
    jsSecondaryAppSpan.end();
});

app.listen(PORT, () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
});