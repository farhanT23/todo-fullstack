
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from . import models, schema

class TodoService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, todos: schema.TodoCreate):
        
        todo_obj = models.Todo(
            owner_id=user_id,
            title=todos.title,
            is_completed=todos.is_completed,
            priority=todos.priority,            
        )

        self.db.add(todo_obj)
        await self.db.commit()
        await self.db.refresh(todo_obj)
        return todo_obj
    
    async def get_all(self, user_id:int):
        """
        Retrieves all todo items for a given user.
        """
        stmt = select(models.Todo).filter(models.Todo.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, user_id: int, todo_id: int):
        """
        Retrieves a single todo item by its ID for a given user.
        """
        result = await self.db.execute(
            select(models.Todo).filter(models.Todo.id == todo_id, models.Todo.user_id == user_id)
        )
        todo = result.scalars().first()
        if not todo:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
        return todo
    
    async def update(self, user_id: int, todo_id: int, data: schema.TodoUpdate):
        """
        Updates an existing todo item for a given user.
        """
        todo_to_update = await self.get_by_id(user_id, todo_id)

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(todo_to_update, key, value)

        await self.db.commit()
        await self.db.refresh(todo_to_update)
        return todo_to_update
    
    async def delete(self, user_id: int, todo_id: int):
        todo = await self.get_by_id(user_id, todo_id)

        if not todo:
            raise HTTPException(status_code=404, detail="Todo not found")
        
        await self.db.delete(todo)
        await self.db.commit()

        return {"message": "Todo deleted successfully"}


        

        

    