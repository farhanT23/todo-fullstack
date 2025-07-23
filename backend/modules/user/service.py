import os
from datetime import datetime, timezone
import random
from fastapi import HTTPException, UploadFile, status
from config import BASE_PATH
from utils.hasher import Hasher
from utils.jwt_token import JWTToken
from . import models, schema
from sqlalchemy import select


class UserService:
    def __init__(self, db):
        self.db = db
    
    async def get_user_by_email(self, email: str):
        result = await self.db.execute(select(models.User).filter(models.User.email == email))
        return result.scalars().first()

    async def create_user(self, user: schema.UserCreate):
        existing_user = await self.get_user_by_email(email=user.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        existing_user_by_username = await self.db.execute(select(models.User).filter(models.User.username==user.username))

        if existing_user_by_username.scalars().first():
            raise HTTPException(status_code=400, detail="Username already taken")

        hashed_password = Hasher.hash(user.password)
        db_user = models.User(
            username=user.username,
            email=user.email,
            password=hashed_password,
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user

    async def genarate_token(self,user):
        data = {}
        data['user_id'] = user.id
        data['email'] = user.email

        token = JWTToken.create_access_token(data)

        return token
    
    async def refresh_token(self,user):
        data = {}
        data['user_id'] = user.id

        token = JWTToken.create_refresh_token(data)

        return token
    
    async def login_user(self, credentials: schema.UserLogin):
        user = await self.get_user_by_email(credentials.email)

        if not user or not Hasher.verify(credentials.password, user.password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        
        return user
    

    