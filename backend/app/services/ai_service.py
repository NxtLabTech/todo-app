import asyncio
import logging
import os
from typing import Any

import google.generativeai as genai

logger = logging.getLogger(__name__)


class AIService:
    async def summarize_todos(self, todos: list[dict[str, Any]]) -> str:
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured on the server")

        if not todos:
            return "You have no todos yet! Add some tasks to get started. 🎉"

        todo_lines: list[str] = []
        for i, todo in enumerate(todos, 1):
            status = "✅ Completed" if todo.get("is_completed") else "⏳ Pending"
            title = todo.get("title", "")
            desc = todo.get("description") or ""
            line = f"{i}. [{status}] {title}"
            if desc:
                line += f" — {desc}"
            todo_lines.append(line)

        todos_text = "\n".join(todo_lines)

        prompt = f"""You are a helpful assistant. Here are my todo items:

{todos_text}

Please provide:
1. A brief summary of all tasks (2-3 sentences)
2. How many are completed vs pending
3. Top 3 priority tasks I should focus on
4. A motivational message based on my progress

Keep the response friendly, concise and helpful."""

        def _generate() -> str:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            return response.text

        return await asyncio.to_thread(_generate)


ai_service = AIService()
