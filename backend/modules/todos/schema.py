from pydantic import BaseModel
from typing import Optional
from enum import Enum


class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.medium
    is_completed: bool = False


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    priority: Optional[PriorityEnum] = None


class TodoOut(TodoBase):
    id: int

    class Config:
        orm_mode = True
