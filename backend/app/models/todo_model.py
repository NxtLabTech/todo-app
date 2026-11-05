import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator


class Subtask(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    is_completed: bool = False


class SubtaskCreate(BaseModel):
    title: str = Field(..., min_length=1)


class SubtaskUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None


class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    subtasks: Optional[list[Subtask]] = None


class TodoResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    is_completed: bool
    subtasks: list[Subtask] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    @field_validator("subtasks", mode="before")
    @classmethod
    def ensure_subtasks_list(cls, v: Any) -> list[Any]:
        if not v or not isinstance(v, list):
            return []
        return v


class SummarizeResponse(BaseModel):
    summary: str

