from typing import List
from fastapi import APIRouter, BackgroundTasks, File,Request,Depends, Response, UploadFile,status
from sqlalchemy.ext.asyncio import AsyncSession
from utils.error_response import ErrorResponse

from middlewares.auth import get_current_user, optional_get_current_user

from utils.database import get_db
from modules.todos.schema import TodoOut, TodoCreate, TodoUpdate
from modules.todos.service import TodoService
from fastapi.responses import JSONResponse
from modules.user.models import User


router = APIRouter(
    prefix="/todo",
    tags=["todo"],
    responses={
        404: {"model": ErrorResponse},
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        200: {"model": ErrorResponse},
        },
)

@router.get("/health")
async def health():
    return {"message": "Up"}

@router.post("/create", response_model=TodoOut, status_code=status.HTTP_201_CREATED)
async def create_todo(
    request: Request,
    todo_in: TodoCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TodoService(db)
    todo = await service.create(
        user_id=current_user["user_id"],
        todos=todo_in
    )

    return todo
    
@router.get("/", response_model=List[TodoOut], status_code=status.HTTP_200_OK)
async def get_all_todo(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TodoService(db)

    todos = await service.get_all(
        user_id=current_user["user_id"]
    )

    return todos

@router.put("/update/{todo_id}", response_model=TodoUpdate, status_code=status.HTTP_200_OK)
async def update_todo(
    request: Request,
    todo_up: TodoUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TodoService(db)

    todo = await service.update(
        user_id=current_user["user_id"],
        todo=todo_up
    )

    return todo