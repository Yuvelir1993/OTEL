The same setup as for the main app, but run Flask on different port.

`poetry run opentelemetry-instrument flask --app=secondary_app.app run --port=7090`

#### Execute REST GET request from postman (or any other)
`http://127.0.0.1:7090/secondary`