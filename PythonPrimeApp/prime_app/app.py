import time

from opentelemetry import trace, baggage
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.trace import Status, StatusCode
from opentelemetry import metrics
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from random import randint
from flask import Flask
from opentelemetry.instrumentation.wsgi import OpenTelemetryMiddleware

import requests

# Acquire a meter.
meter = metrics.get_meter(__name__)

resource = Resource(attributes={
    SERVICE_NAME: "My World's First Service"
})

jaeger_exporter = JaegerExporter(
    agent_host_name="localhost",
    agent_port=6831,
)
provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(jaeger_exporter)
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

# Now create a counter instrument to make measurements with
roll_counter = meter.create_counter(
    "roll_counter",
    description="The number of rolls by roll value",
)

# Acquire a tracer
tracer = trace.get_tracer(__name__)

app = Flask(__name__)
app.wsgi_app = OpenTelemetryMiddleware(app.wsgi_app)


@app.route("/prime")
def prime_entrypoint():
    do_work()
    do_exception()
    return str(do_roll())


def do_roll():
    global_ctx = baggage.set_baggage("context", "global")
    # This creates a new span that's the child of the current one
    with tracer.start_as_current_span("do_roll") as root_span:
        parent_ctx = baggage.set_baggage("context", "parent")
        res = randint(1, 6)
        time.sleep(1)
        root_span.set_attribute("roll.value", res)
        root_span.set_attribute(SERVICE_NAME, "My World's First Service")
        root_span.add_event("Rolling it out!")
        # This adds 1 to the counter for the given roll value
        roll_counter.add(1, {"roll.value": res})
        root_span.add_event("Rolled out!!!")
        print("Rolled out!!!")
        do_os_error()
        root_span.set_status(Status(StatusCode.OK))
        with tracer.start_as_current_span(
                name="child span", context=parent_ctx
        ) as child_span:
            print("Entered child span!")
            child_span.set_attribute("my.value", "child-custom-value")
            child_span.add_event("Child span!")
            child_ctx = baggage.set_baggage("context", "child")
            print(baggage.get_baggage("context", global_ctx))
            print(baggage.get_baggage("context", parent_ctx))
            print(baggage.get_baggage("context", child_ctx))
            secondary_response = requests.get('http://127.0.0.1:7090/secondary', timeout=10)
            if secondary_response.status_code == 200:
                # do something with the data
                child_span.set_attribute("my.secondary.response", secondary_response.text)
            else:
                do_exception()
        # handle error
        return res


@tracer.start_as_current_span("do_work")
def do_work():
    print("This span doing stuff!")


@tracer.start_as_current_span("do_exception")
def do_exception():
    current_span = trace.get_current_span()
    try:
        raise Exception("I did this exception!")
    except Exception as ex:
        print(ex)
        current_span.set_status(Status(StatusCode.ERROR))
        current_span.record_exception(ex)


@tracer.start_as_current_span("do_os_error")
def do_os_error():
    current_span = trace.get_current_span()
    try:
        raise OSError("I did this os error!")
    except OSError as ex:
        print(ex)
        current_span.set_status(Status(StatusCode.ERROR))
        current_span.record_exception(ex)
