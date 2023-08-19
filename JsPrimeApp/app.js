const { W3CTraceContextPropagator } = require("@opentelemetry/core")
const autoinstrExpressModule = require('./auto-instrumentation-express')
const { context, defaultTextMapSetter, opentelemetry } = require("@opentelemetry/api");
const tracer = autoinstrExpressModule.setupTracing('JsPrimeApp');

const express = require("express");
const PORT = parseInt(process.env.PORT || "8080");
const app = express();

app.get("/jsPrime", async (req, res) => {    
    /* 
    * Propagator implementation based on the Trace Context specification:
    * https://www.w3.org/TR/trace-context/
    */
    const propagator = new W3CTraceContextPropagator();
    /*
    * Carrier object will contain all necessary fields injected further by the 'W3CTraceContextPropagator'
    */
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
            /*
            * 'traceparent' was injected by propagator. 
            * Detailed spec of this field you can find in the spec https://www.w3.org/TR/trace-context/ docu.
            */
            'my-traceparent-id': carrier.traceparent
        }
    };
    const jsPrimeAppSpan = tracer.startSpan('JsPrimeAppSpan');
    tracer.startActiveSpan(jsPrimeAppSpan, async () => {
        /*
        * It's important to pass 'settings' here to deserialize included headers on the Secondary app side.
        */
        await fetch("http://127.0.0.1:8090/jsSecondary", settings)
            .then((response) => {
                res.send("Return from the 'jsSecondaryApp'.");
            })
            .catch(function (ex) {
                jsPrimeAppSpan.recordException(ex);
                jsPrimeAppSpan.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });

                console.log("Unable to fetch -", ex);
                res.status(500);
                res.send(ex);
            });
    })
    jsPrimeAppSpan.end();
});

app.listen(PORT, () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
});