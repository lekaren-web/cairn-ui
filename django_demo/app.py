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

DATA = json.loads((ROOT / "data" / "rotations.json").read_text())

COLUMNS = [
    {"key": "site", "label": "Site", "sortable": True},
    {"key": "setting", "label": "Setting", "sortable": True},
    {"key": "starts", "label": "Starts", "type": "date", "sortable": True},
    {"key": "weeks", "label": "Weeks", "type": "number"},
    {"key": "seatsOpen", "label": "Open seats", "type": "number", "sortable": True},
    {
        "key": "status",
        "label": "Status",
        "type": "badge",
        "sortable": True,
        "tones": {"Open": "success", "Waitlist": "warning", "Full": "neutral"},
    },
]


def find_specialty(code):
    return next((s for s in DATA["specialties"] if s["value"] == code), None)


def index(request):
    code = request.GET.get("specialty", "im")
    return render(
        request,
        "index.html",
        {
            "code": code,
            "specialty": find_specialty(code),
            "options_json": json.dumps(DATA["specialties"]),
            "tabs_json": json.dumps(
                [{"id": "rotations", "label": "Rotations"}, {"id": "about", "label": "About the data"}]
            ),
        },
    )


def rotations(request):
    """HTMX partial: returns a <cn-data-table> configured entirely from server data."""
    code = request.GET.get("specialty", "")
    specialty = find_specialty(code)
    if specialty is None:
        raise Http404("Unknown specialty")
    return render(
        request,
        "partials/rotations.html",
        {
            "specialty": specialty,
            "columns_json": json.dumps(COLUMNS),
            "rows_json": json.dumps(DATA["rotations"][code]),
        },
    )


urlpatterns = [path("", index), path("rotations", rotations)]

if __name__ == "__main__":
    execute_from_command_line(sys.argv)
