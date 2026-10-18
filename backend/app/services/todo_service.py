import bleach
import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Optional

from app.models.todo_model import TodoCreate, TodoUpdate
from app.services.supabase_service import supabase_service

logger = logging.getLogger(__name__)

def sanitize_text(value: Optional[str]) -> Optional[str]:
    """Remove HTML tags from user-provided text."""
    if value is None:
        return None

    return bleach.clean(
        value,
        tags=[],
        attributes={},
        strip=True,
    )


def sanitize_todo(todo: dict[str, Any]) -> dict[str, Any]:
    """Return a todo with sanitized title and description."""
    cleaned = todo.copy()

    for field in ("title", "description"):
        if field in cleaned:
            cleaned[field] = sanitize_text(cleaned[field])

    return cleaned

class TodoService:
    async def list_user_todos(self, user_id: str) -> list[dict[str, Any]]:
        def _query() -> Any:
            return (
                supabase_service.client.table("todos")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )

        result = await asyncio.to_thread(_query)
        return [sanitize_todo(todo) for todo in (result.data or [])]

    async def get_todo(self, todo_id: str) -> Optional[dict[str, Any]]:
        def _query() -> Any:
            return (
                supabase_service.client.table("todos")
                .select("*")
                .eq("id", todo_id)
                .limit(1)
                .execute()
            )

        result = await asyncio.to_thread(_query)
        return sanitize_todo(result.data[0]) if result.data else None

    async def create_todo(self, user_id: str, data: TodoCreate) -> dict[str, Any]:
        now: str = datetime.now(timezone.utc).isoformat()

        def _query() -> Any:
            return (
                supabase_service.client.table("todos")
                .insert(
                    {
                        "title": sanitize_text(data.title),
                        "description": sanitize_text(data.description),
                        "is_completed": False,
                        "user_id": user_id,
                        "created_at": now,
                        "updated_at": now,
                    }
                )
                .execute()
            )

        result = await asyncio.to_thread(_query)
        return sanitize_todo(result.data[0])


    async def update_todo(self, todo_id: str, data: TodoUpdate) -> dict[str, Any]:
        update_fields: dict[str, Any] = data.model_dump(exclude_none=True)

        for field in ("title", "description"):
            if field in update_fields:
                update_fields[field] = sanitize_text(update_fields[field])

        update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

        def _query() -> Any:
            return (
                supabase_service.client.table("todos")
                .update(update_fields)
                .eq("id", todo_id)
                .execute()
            )

        result = await asyncio.to_thread(_query)
        return sanitize_todo(result.data[0])


    async def delete_todo(self, todo_id: str) -> None:
        def _query() -> Any:
            return (
                supabase_service.client.table("todos")
                .delete()
                .eq("id", todo_id)
                .execute()
            )

        await asyncio.to_thread(_query)


todo_service = TodoService()
