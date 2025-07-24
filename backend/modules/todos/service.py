
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from . import models, schema

class TodoService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, todos: schema.TodoCreate):
        
        todo_obj = models.Todo(
            user_id=user_id,
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
        # Create a select statement to query all todos for the user
        stmt = select(models.Todo).filter(models.Todo.user_id == user_id)
        
        # Execute the query
        result = await self.db.execute(stmt)
        
        # Return all results
        return result.scalars().all()
    
    async def update(self, user_id: int, todo:schema.TodoUpdate):
        

        

    