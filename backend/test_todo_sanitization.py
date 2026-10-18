import pytest

from app.services.todo_service import sanitize_text, sanitize_todo


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("<b>Finish homework</b>", "Finish homework"),
        ("<script>alert(1)</script>", "alert(1)"),
        ('<img src=x onerror="alert(1)">Task', "Task"),
        ("Plain text", "Plain text"),
        ("", ""),
        (None, None),
    ],
)
def test_sanitize_text(value, expected):
    assert sanitize_text(value) == expected


def test_sanitize_todo_cleans_title_and_description():
    todo = {
        "title": "<b>Finish homework</b>",
        "description": "<i>Study Python</i>",
        "is_completed": False,
    }

    result = sanitize_todo(todo)

    assert result["title"] == "Finish homework"
    assert result["description"] == "Study Python"
    assert todo["title"] == "<b>Finish homework</b>"


def test_sanitize_todo_handles_missing_description():
    result = sanitize_todo({"title": "Plain task"})

    assert result["title"] == "Plain task"
    assert "description" not in result
