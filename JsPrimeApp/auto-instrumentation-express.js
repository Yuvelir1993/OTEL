const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { BatchSpanProcessor, AlwaysOnSampler } = require('@opentelemetry/sdk-trace-base');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-proto");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { trace } = require("@opentelemetry/api");

const setupTracing = (serviceName) => {
    const resource =
        Resource.default().merge(
            new Resource({
                [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
                [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
            })
        );
    const provider = new NodeTracerProvider({
        sampler: new AlwaysOnSampler(),
        resource: resource,
    });
    provider.register();

    registerInstrumentations({
        tracerProvider: provider,
        instrumentations: [
            // Express instrumentation expects HTTP layer to be instrumented
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
        ],
    });

    const exporter = new OTLPTraceExporter({
        // optional - default url is http://localhost:4318/v1/traces
        url: "http://localhost:4318/v1/traces",
        // optional - collection of custom headers to be sent with each request, empty by default
        headers: {},
    });
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    provider.register();
    return trace.getTracer(serviceName);
};

module.exports = { setupTracing };