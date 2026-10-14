from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.services.sanitizer import sanitize_text


class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None

    @field_validator("title", mode="before")
    @classmethod
    def sanitize_title(cls, v: str) -> str:
        if isinstance(v, str):
            v = sanitize_text(v)
            if not v:
                raise ValueError("Title cannot be empty")
        return v


    @field_validator("description", mode="before")
    @classmethod
    def sanitize_description(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return sanitize_text(v)
        return v


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None

    @field_validator("title", mode="before")
    @classmethod
    def sanitize_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and isinstance(v, str):
            v = sanitize_text(v)
            if not v:
                raise ValueError("Title cannot be empty")
        return v


    @field_validator("description", mode="before")
    @classmethod
    def sanitize_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and isinstance(v, str):
            return sanitize_text(v)
        return v


class TodoResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    @field_validator("title", mode="before")
    @classmethod
    def sanitize_title(cls, v: str) -> str:
        if isinstance(v, str):
            return sanitize_text(v) or v
        return v

    @field_validator("description", mode="before")
    @classmethod
    def sanitize_description(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return sanitize_text(v)
        return v


class SummarizeResponse(BaseModel):
    summary: str

