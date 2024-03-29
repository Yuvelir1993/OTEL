const { W3CTraceContextPropagator, W3CBaggagePropagator } = require("@opentelemetry/core");
const {
    defaultTextMapSetter,
    ROOT_CONTEXT,
} = require("@opentelemetry/api");
const autoinstrExpressModule = require('./auto-instrumentation-express')
const { trace, context, opentelemetry } = require("@opentelemetry/api");
const tracer = autoinstrExpressModule.setupTracing('JsPrimeApp');

const express = require("express");
const PORT = parseInt(process.env.PORT || "8080");
const app = express();

function generateRandNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

app.post("/commonContext", async (req, res) => {
    await fetch("http://127.0.0.1:8090/commonContext")
        .then((response) => {
            res.send("Called 'commonContext' API.");
        })
        .catch(function (ex) {
            console.log("Unable to fetch -", ex);
            res.status(500);
            res.send(ex);
        });
})

app.get("/jsPrime", async (req, res) => {
    const callPrimeSpan = tracer.startSpan('jsPrimeEntry');
    callPrimeSpan.addEvent("REST call start")
    const propagator = new W3CTraceContextPropagator();
    let carrier = {
        'my-long-id-carrier': '152156633f7f13adf20053b01198a5b9',
        'my-short-id-carrier': 'd81a6faefca25c90'
    };

    callPrimeSpan.setAttribute("email", "Pavel Lozovikov @ mail . com")
    callPrimeSpan.setAttribute("myEmail", "Pavel Lozovikov @ mail . com")
    callPrimeSpan.setAttribute("password", "MyPassword123:):):)")

    propagator.inject(
        context.active(),
        carrier,
        defaultTextMapSetter
    );
    console.log("carrier", carrier); // transport this carrier info to other service via headers or some other way

    // --- context propagation ---
    // https://github.com/open-telemetry/opentelemetry-js/issues/2458
    // // In downstream service
    // const parentCtx = propagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter);
    // const childSpan = tracer.startSpan("child", undefined, parentCtx);
    // ---------------------------
    const settings = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'my-traceparent-id': carrier.traceparent,
            'my-short-id': 'd81a6faefca25c90'
        }
    };
    tracer.startActiveSpan(callPrimeSpan, async () => {
        await fetch("http://127.0.0.1:8090/jsSecondary", settings)
            .then((response) => {
                const currentSpanSpanId = callPrimeSpan.spanContext().spanId;
                console.log(`currentSpanSpanId: ${currentSpanSpanId}`);
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
    })
    callPrimeSpan.end();
});

app.listen(PORT, () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
});