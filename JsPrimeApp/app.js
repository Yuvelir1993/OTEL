const { W3CTraceContextPropagator } = require("@opentelemetry/core")
const autoinstrExpressModule = require('./auto-instrumentation-express')
const { context, defaultTextMapSetter, opentelemetry } = require("@opentelemetry/api");
const tracer = autoinstrExpressModule.setupTracing('JsPrimeApp');

const express = require("express");
const PORT = parseInt(process.env.PORT || "8080");
const app = express();

app.get("/jsPrime", async (req, res) => {
    const callPrimeSpan = tracer.startSpan('jsPrimeEntry');
    const propagator = new W3CTraceContextPropagator();
    let carrier = {};
    propagator.inject(
        context.active(),
        carrier,
        defaultTextMapSetter
    );
    const settings = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'my-traceparent-id': carrier.traceparent
        }
    };
    tracer.startActiveSpan(callPrimeSpan, async () => {
        await fetch("http://127.0.0.1:8090/jsSecondary", settings)
            .then((response) => {
                res.send("Return from the 'jsSecondaryApp'.");
            })
            .catch(function (ex) {
                callPrimeSpan.recordException(ex);
                callPrimeSpan.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });

                console.log("Unable to fetch -", ex);
                res.status(500);
                res.send(ex);
            });
    })
    callPrimeSpan.end();
});

app.listen(PORT, () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
});