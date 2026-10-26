"""
Single-file Django app showing Cairn's Web Component build inside server-rendered
templates with HTMX. Same components as the Vue demo, no Vue code on this page.

    npm run build:wc                                   # builds dist-wc/cairn-wc.js
    .venv/bin/python django_demo/app.py runserver 8001
"""
import json
import sys
from pathlib import Path

from django.conf import settings
from django.core.management import execute_from_command_line
from django.http import Http404
from django.shortcuts import render
from django.urls import path

BASE_DIR = Path(__file__).resolve().parent
ROOT = BASE_DIR.parent

settings.configure(
    DEBUG=True,
    SECRET_KEY="demo-only-not-secret",
    ALLOWED_HOSTS=["localhost", "127.0.0.1"],
    ROOT_URLCONF=__name__,
    INSTALLED_APPS=["django.contrib.staticfiles"],
    TEMPLATES=[{"BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [BASE_DIR / "templates"]}],
    STATIC_URL="/static/",
    STATICFILES_DIRS=[ROOT / "dist-wc", ROOT / "src" / "tokens"],
)

DATA = json.loads((ROOT / "data" / "prices.json").read_text())

COLUMNS = [
    {"key": "hospital", "label": "Hospital", "sortable": True},
    {"key": "payer", "label": "Payer", "sortable": True},
    {"key": "plan", "label": "Plan"},
    {"key": "rate", "label": "Negotiated rate", "type": "currency", "sortable": True},
    {"key": "cash", "label": "Cash price", "type": "currency", "sortable": True},
    {
        "key": "position",
        "label": "vs. median",
        "type": "badge",
        "sortable": True,
        "tones": {"Below median": "success", "Near median": "neutral", "Above median": "warning"},
    },
]


def find_procedure(code):
    return next((p for p in DATA["procedures"] if p["value"] == code), None)


def index(request):
    code = request.GET.get("code", "70553")
    return render(
        request,
        "index.html",
        {
            "code": code,
            "procedure": find_procedure(code),
            "options_json": json.dumps(DATA["procedures"]),
            "tabs_json": json.dumps(
                [{"id": "rates", "label": "Negotiated rates"}, {"id": "about", "label": "About the data"}]
            ),
        },
    )


def rates(request):
    """HTMX partial: returns a <cn-data-table> configured entirely from server data."""
    code = request.GET.get("code", "")
    procedure = find_procedure(code)
    if procedure is None:
        raise Http404("Unknown procedure")
    return render(
        request,
        "partials/rates.html",
        {
            "procedure": procedure,
            "columns_json": json.dumps(COLUMNS),
            "rows_json": json.dumps(DATA["rates"][code]),
        },
    )


urlpatterns = [path("", index), path("rates", rates)]

if __name__ == "__main__":
    execute_from_command_line(sys.argv)
