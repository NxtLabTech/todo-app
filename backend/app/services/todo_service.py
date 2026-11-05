import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from app.models.todo_model import TodoCreate, TodoUpdate
from app.services.supabase_service import supabase_service

logger = logging.getLogger(__name__)


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
        return result.data or []

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
        return result.data[0] if result.data else None

    async def create_todo(self, user_id: str, data: TodoCreate) -> dict[str, Any]:
        now: str = datetime.now(timezone.utc).isoformat()

        def _query() -> Any:
            return (
                supabase_service.client.table("todos")
                .insert(
                    {
                        "title": data.title,
                        "description": data.description,
                        "is_completed": False,
                        "user_id": user_id,
                        "created_at": now,
                        "updated_at": now,
                    }
                )
                .execute()
            )

        result = await asyncio.to_thread(_query)
        return result.data[0]

    async def update_todo(self, todo_id: str, data: TodoUpdate) -> dict[str, Any]:
        update_fields: dict[str, Any] = data.model_dump(exclude_none=True)
        update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

        # If marking main todo complete/incomplete, also cascade to subtasks if present
        if data.is_completed is not None and "subtasks" not in update_fields:
            todo = await self.get_todo(todo_id)
            if todo and todo.get("subtasks"):
                current_subtasks = [dict(s) for s in todo["subtasks"]]
                for s in current_subtasks:
                    s["is_completed"] = data.is_completed
                update_fields["subtasks"] = current_subtasks

        def _query() -> Any:
            return (
                supabase_service.client.table("todos")
                .update(update_fields)
                .eq("id", todo_id)
                .execute()
            )

        result = await asyncio.to_thread(_query)
        return result.data[0]

    async def delete_todo(self, todo_id: str) -> None:
        def _query() -> Any:
            return (
                supabase_service.client.table("todos")
                .delete()
                .eq("id", todo_id)
                .execute()
            )

        await asyncio.to_thread(_query)

    async def set_ai_subtasks(self, todo_id: str, titles: list[str]) -> dict[str, Any]:
        now: str = datetime.now(timezone.utc).isoformat()
        subtasks = [
            {"id": str(uuid.uuid4()), "title": title, "is_completed": False}
            for title in titles
        ]

        def _query() -> Any:
            return (
                supabase_service.client.table("todos")
                .update(
                    {
                        "subtasks": subtasks,
                        "is_completed": False,
                        "updated_at": now,
                    }
                )
                .eq("id", todo_id)
                .execute()
            )

        result = await asyncio.to_thread(_query)
        return result.data[0]

    async def update_subtask(
        self,
        todo_id: str,
        subtask_id: str,
        is_completed: Optional[bool] = None,
        title: Optional[str] = None,
    ) -> dict[str, Any]:
        todo = await self.get_todo(todo_id)
        if not todo:
            raise ValueError("Todo not found")

        subtasks = [dict(s) for s in (todo.get("subtasks") or [])]
        found = False
        for s in subtasks:
            if s.get("id") == subtask_id:
                found = True
                if is_completed is not None:
                    s["is_completed"] = is_completed
                if title is not None:
                    s["title"] = title
                break

        if not found:
            raise ValueError("Subtask not found")

        all_completed = len(subtasks) > 0 and all(bool(s.get("is_completed")) for s in subtasks)
        now: str = datetime.now(timezone.utc).isoformat()

        def _query() -> Any:
            return (
                supabase_service.client.table("todos")
                .update(
                    {
                        "subtasks": subtasks,
                        "is_completed": all_completed,
                        "updated_at": now,
                    }
                )
                .eq("id", todo_id)
                .execute()
            )

        result = await asyncio.to_thread(_query)
        return result.data[0]

    async def add_subtask(self, todo_id: str, title: str) -> dict[str, Any]:
        todo = await self.get_todo(todo_id)
        if not todo:
            raise ValueError("Todo not found")

        subtasks = [dict(s) for s in (todo.get("subtasks") or [])]
        subtasks.append(
            {
                "id": str(uuid.uuid4()),
                "title": title.strip(),
                "is_completed": False,
            }
        )
        now: str = datetime.now(timezone.utc).isoformat()

        def _query() -> Any:
            return (
                supabase_service.client.table("todos")
                .update(
                    {
                        "subtasks": subtasks,
                        "is_completed": False,
                        "updated_at": now,
                    }
                )
                .eq("id", todo_id)
                .execute()
            )

        result = await asyncio.to_thread(_query)
        return result.data[0]

    async def delete_subtask(self, todo_id: str, subtask_id: str) -> dict[str, Any]:
        todo = await self.get_todo(todo_id)
        if not todo:
            raise ValueError("Todo not found")

        subtasks = [dict(s) for s in (todo.get("subtasks") or []) if s.get("id") != subtask_id]
        all_completed = len(subtasks) > 0 and all(bool(s.get("is_completed")) for s in subtasks)
        now: str = datetime.now(timezone.utc).isoformat()

        def _query() -> Any:
            return (
                supabase_service.client.table("todos")
                .update(
                    {
                        "subtasks": subtasks,
                        "is_completed": all_completed if subtasks else todo.get("is_completed", False),
                        "updated_at": now,
                    }
                )
                .eq("id", todo_id)
                .execute()
            )

        result = await asyncio.to_thread(_query)
        return result.data[0]


todo_service = TodoService()

