[OTEL Start Node.js](https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/)

# Start app server
## Autoinstrumented
[Auto instrumentation](https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/)
`node --require ./auto-instrumentation.js app.js`

## Autoinstrumented-express
[Auto instrumentation express](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)
`node --require ./auto-instrumentation-express.js app.js`

## Manually instrumented
[Manual instrumentation](https://opentelemetry.io/docs/instrumentation/js/instrumentation/)
This gets you customized observability data.
`node --require ./tracing.js app.js`