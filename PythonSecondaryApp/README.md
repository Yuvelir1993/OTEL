The same setup as for the main app, but run Flask on different port.

`poetry run opentelemetry-instrument flask --app=secondary_app.app run --port=90`