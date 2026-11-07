from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


Priority = Literal["high", "medium", "low"]


class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    priority: Priority = "medium"
    due_date: Optional[datetime] = None


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    is_completed: Optional[bool] = None
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None


class TodoResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    is_completed: bool
    priority: Priority = "medium"
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class SummarizeResponse(BaseModel):
    summary: str
