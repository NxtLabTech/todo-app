from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


Priority = Literal["high", "medium", "low"]


class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    priority: Priority = "medium"


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    priority: Optional[Priority] = None


class TodoResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    is_completed: bool
    priority: Priority = "medium"
    created_at: datetime
    updated_at: datetime


class SummarizeResponse(BaseModel):
    summary: str
