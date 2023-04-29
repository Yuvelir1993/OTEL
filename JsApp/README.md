[OTEL Start Node.js](https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/)

# Start app server
## Autoinstrumented
[Auto instrumentation](https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/)
`node --require ./instrumentation.js app.js`
## Manually instrumented
[Manual instrumentation](https://opentelemetry.io/docs/instrumentation/js/instrumentation/)
This gets you customized observability data.
`node --require ./tracing.js app.js`