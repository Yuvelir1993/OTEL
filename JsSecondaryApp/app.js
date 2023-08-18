const { W3CTraceContextPropagator } = require("@opentelemetry/core");
const { context, defaultTextMapGetter } = require('@opentelemetry/api');
const autoinstrExpressModule = require('./auto-instrumentation-express')
const tracer = autoinstrExpressModule.setupTracing('JsSecondaryApp');
const propagator = new W3CTraceContextPropagator();

const express = require("express");
const PORT = parseInt(process.env.PORT || "8090");
const app = express();

app.get("/jsSecondary", async (req, res) => {
    /*
    * 'my-traceparent-id' has been passed from the upstream service.
    * In our case this contains Trace id we want to use to extract parent context further.
    */
    const traceparentId = req.headers['my-traceparent-id'];
    const carrier = {
        traceparent: traceparentId
    };
    const parentCtx = propagator.extract(context.active(), carrier, defaultTextMapGetter);
    const jsSecondaryAppSpan = tracer.startSpan("JsSecondaryAppSpan", {}, parentCtx);
    let msg = `Hello from JsSecondaryApp 'jsSecondary' endpoint. We managed to trace it as part of the trace with id '${traceparentId}' of an upstream endpoint call.`;
    console.log(msg);
    res.send(msg);
    jsSecondaryAppSpan.end();
});

app.listen(PORT, () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
});