import time

from opentelemetry import trace, baggage
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.trace import Status, StatusCode
from opentelemetry import metrics
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from random import randint
from flask import Flask
from opentelemetry.instrumentation.wsgi import OpenTelemetryMiddleware

# Acquire a meter.
meter = metrics.get_meter(__name__)

otlp_endpoint = "http://127.0.0.1:4317"

resource = Resource.create(attributes={
    SERVICE_NAME: "Secondary"
})

otlp_exporter = OTLPSpanExporter(endpoint=otlp_endpoint)
provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(otlp_exporter)
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

# Now create a counter instrument to make measurements with
secondary_metrics = meter.create_counter(
    "do_secondary",
    description="Secondary description",
)

# Acquire a tracer
tracer = trace.get_tracer(__name__)

app = Flask(__name__)
app.wsgi_app = OpenTelemetryMiddleware(app.wsgi_app)


@app.route("/secondary")
def do_secondary():
    global_ctx = baggage.set_baggage("context", "global")
    with tracer.start_as_current_span(name="do_secondary", context=global_ctx) as root_span:
        parent_ctx = baggage.set_baggage("context", "parent")
        root_span.set_attribute("roll.value", "Secondary value")
        root_span.set_attribute(SERVICE_NAME, "Some secondary service")
        root_span.add_event("Secondary event...")
        baggage.get_baggage("context", global_ctx)
        do_exception()
        print("Secondary called")
        with tracer.start_span(
                name="secondary child span", context=parent_ctx
        ) as child_span:
            child_span.set_attribute("my.value", "secondary-child-custom-value")
            child_span.add_event("Secondary child span!")
            i_am_very_long()
            do_exception()
        return "Hello from secondary app"


@tracer.start_as_current_span("do_secondary_exception")
def do_exception():
    current_span = trace.get_current_span()
    try:
        raise Exception("I did this exception second time !!")
    except Exception as ex:
        print(ex)
        current_span.set_status(Status(StatusCode.ERROR))
        current_span.record_exception(ex)


@tracer.start_as_current_span("i_am_very_long")
def i_am_very_long():
    time.sleep(2)
