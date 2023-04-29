# Getting Started
[Getting Started](https://opentelemetry.io/docs/instrumentation/python/getting-started/)

## Prepare environment
Run scripts below from cmd from the root project dirs.

!!! Use Python 3.9.0 !!!

### Install all dependencies from the poetry.lock
`poetry install`

### Manually instrument the app (Trace + Span + Metrics)
Captures system on the edges and what's happening inside, depending on how you instrumented your app.

[Manual Instrumentation](https://opentelemetry.io/docs/instrumentation/python/manual/)
`poetry run opentelemetry-bootstrap -a install`

The `opentelemetry-bootstrap -a install` command reads through the list of packages installed in your active site-packages folder, 
and installs the corresponding instrumentation libraries for these packages, if applicable. For example, if you already installed 
the flask package, running `opentelemetry-bootstrap -a install` will install opentelemetry-instrumentation-flask for you.

## Collector configuring
Apply to the otel-collector/README.md

#### Run the instrumented app (no console prints)
`poetry run opentelemetry-instrument flask run --port=80`

#### Execute REST GET request from postman (or any other)
`http://127.0.0.1:5000/rolldice`
You can see traces with related spans, and manually added metrics logging in the Collector's console output.