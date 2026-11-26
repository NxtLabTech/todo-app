import unittest
from datetime import datetime, timezone

from pydantic import ValidationError

from app.models.todo_model import TodoCreate, TodoResponse, TodoUpdate
from app.services.sanitizer import sanitize_text


class TestSanitizer(unittest.TestCase):
    def test_sanitize_text_strips_html_tags(self):
        self.assertEqual(sanitize_text("<script>alert('xss')</script>Buy milk"), "alert('xss')Buy milk")
        self.assertEqual(sanitize_text("<img src=x onerror=alert(1)>Task"), "Task")
        self.assertIsNone(sanitize_text(None))

    def test_todo_create_sanitizes_title_and_description(self):
        todo = TodoCreate(
            title="<b>Clean</b> room",
            description="<script>evil()</script>Details",
        )
        self.assertEqual(todo.title, "Clean room")
        self.assertEqual(todo.description, "evil()Details")

    def test_todo_create_rejects_empty_title_after_sanitization(self):
        with self.assertRaises(ValidationError):
            TodoCreate(title="<img src=x onerror=alert(1)>", description="Valid")

    def test_todo_update_sanitizes_and_rejects_empty_title(self):
        update = TodoUpdate(title="<i>Updated</i>", description="<p>Note</p>")
        self.assertEqual(update.title, "Updated")
        self.assertEqual(update.description, "Note")

        with self.assertRaises(ValidationError):
            TodoUpdate(title="<div>   </div>")

    def test_todo_response_sanitizes_legacy_html(self):
        now = datetime.now(timezone.utc)
        resp = TodoResponse(
            id="1",
            user_id="u1",
            title="<script>x</script>Legacy",
            description="<b>Bold</b>",
            is_completed=False,
            created_at=now,
            updated_at=now,
        )
        self.assertEqual(resp.title, "xLegacy")
        self.assertEqual(resp.description, "Bold")


if __name__ == "__main__":
    unittest.main()
