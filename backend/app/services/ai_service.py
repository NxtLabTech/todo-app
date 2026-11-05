import asyncio
import json
import logging
import os
import re
from typing import Any, Optional

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
            subtasks = todo.get("subtasks") or []
            line = f"{i}. [{status}] {title}"
            if desc:
                line += f" — {desc}"
            if subtasks:
                sub_done = sum(1 for s in subtasks if s.get("is_completed"))
                line += f" ({sub_done}/{len(subtasks)} subtasks done)"
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

    async def decompose_task(
        self, title: str, description: Optional[str] = None
    ) -> list[str]:
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured on the server")

        task_context = f"Task: {title}"
        if description:
            task_context += f"\nDescription: {description}"

        prompt = f"""You are an expert productivity coach.
Break down the following task into 3 to 5 clear, concise, actionable, sequential steps.

{task_context}

Rules:
1. Provide between 3 and 5 steps.
2. Each step must start with an imperative action verb (e.g. Gather, Review, Create, Draft, Schedule, Test).
3. Keep each step under 12 words.
4. Output ONLY a valid JSON array of strings. Do not add markdown fences or extra explanations.
Example format:
["First action step", "Second action step", "Third action step"]
"""

        def _generate() -> list[str]:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            raw = (response.text or "").strip()

            clean = raw
            if clean.startswith("```"):
                lines = clean.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                clean = "\n".join(lines).strip()

            try:
                parsed = json.loads(clean)
                if isinstance(parsed, list):
                    items = [str(item).strip() for item in parsed if str(item).strip()]
                    if items:
                        return items[:6]
            except Exception as e:
                logger.warning("Failed to parse JSON directly from Gemini: %s. Response: %s", e, raw)

            extracted: list[str] = []
            for line in raw.splitlines():
                cleaned_line = re.sub(r"^[\d\.\-\*\•\s]+", "", line).strip()
                if cleaned_line and not cleaned_line.startswith(("[", "]", "{", "}")):
                    extracted.append(cleaned_line)

            return extracted[:5] if extracted else [f"Start work on {title}"]

        return await asyncio.to_thread(_generate)


ai_service = AIService()

