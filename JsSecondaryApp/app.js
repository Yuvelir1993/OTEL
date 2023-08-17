const { W3CTraceContextPropagator } = require("@opentelemetry/core");
const { context, propagation, trace, metrics } = require('@opentelemetry/api');
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

app.post("/commonContext", async (req, res) => {
    res.send("Hello from JsSecondaryApp 'commonContext' API.");
})

app.get("/jsSecondary", async (req, res) => {
    const myLongId = req.headers['my-traceparent-id'];
    console.log("myLongId", myLongId);
    const myShortId = req.headers['my-short-id'];
    console.log("myShortId", myShortId);
    let carrier = {
        traceparent: myLongId
    };
    const parentCtx = propagator.extract(context.active(), carrier, defaultTextMapGetter);
    console.log("carrier", carrier);

    // Ingect here as in the JsPrimeApp ?
    // --- context propagation ---
    // https://github.com/open-telemetry/opentelemetry-js/issues/2458
    // In downstream service
    console.log("parentCtx");
    console.log(parentCtx);
    const baggage = propagation.getBaggage(context.active());
    const baggage2 = propagation.getBaggage(parentCtx);
    console.log("baggage");
    console.log(baggage);
    console.log("baggage2");
    console.log(baggage2);
    const currentSpan = trace.getActiveSpan();
    const currentSpanTraceId = currentSpan.spanContext().traceId;
    const currentSpanSpanId = currentSpan.spanContext().spanId;
    console.log(`currentSpanTraceId: ${currentSpanTraceId}`);
    console.log(`currentSpanSpanId: ${currentSpanSpanId}`);
    // const jsSecondaryAppSpan = tracer.startSpan("JsSecondaryAppSpan");
    const jsSecondaryAppSpan = tracer.startSpan("JsSecondaryAppSpan", {
        kind: 1,
        attributes: { childSpanKey: 'childSpanValue' },
    }, parentCtx);
    const jsSecondaryAppSpanTraceId = jsSecondaryAppSpan.spanContext().traceId;
    console.log(`jsSecondaryAppSpanTraceId: ${jsSecondaryAppSpanTraceId}`);
    // ---------------------------
    res.send("Hello from JsSecondaryApp 'jsSecondary' API.");
    jsSecondaryAppSpan.end();
});

app.listen(PORT, () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
});