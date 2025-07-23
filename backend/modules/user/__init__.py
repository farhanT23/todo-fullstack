
from typing import List
from fastapi import APIRouter, BackgroundTasks, File,Request,Depends, Response, UploadFile,status
from sqlalchemy.ext.asyncio import AsyncSession
from utils.error_response import ErrorResponse

from middlewares.auth import get_current_user, optional_get_current_user

from utils.database import get_db
from modules.user.schema import UserCreate, UserLoginResponseSchema, Token, UserLogin
from modules.user.service import UserService


router = APIRouter(
    prefix="/user",
    tags=["user"],
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


@router.post('/',response_model=UserLoginResponseSchema,status_code=status.HTTP_201_CREATED)
async def create_user(request:Request,user:UserCreate,db:AsyncSession=Depends(get_db)):

    service = UserService(db)
    user = await service.create_user(user)
    response = UserLoginResponseSchema(
            user=user,
            token=Token(
                access_token=await service.genarate_token(user),
                refresh_token=await service.refresh_token(user)
            )
        )

    return response

@router.post('/login', response_model=UserLoginResponseSchema, status_code=status.HTTP_200_OK)
async def login(credentials: UserLogin, db:AsyncSession=Depends(get_db)):
    service = UserService(db)
    user = await service.login_user(credentials)

    response = UserLoginResponseSchema(
        user = user,
        token=Token(
            access_token=await service.genarate_token(user),
            refresh_token=await service.refresh_token(user)
        )
    )
    return response