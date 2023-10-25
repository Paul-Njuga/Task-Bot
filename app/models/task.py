#!/usr/bin/python3
"""
Task Class
"""

import models
from models.base_model import Basemodel, Base
from sqlalchemy import Column, DateTime, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from models.sub_tasks import SubTask

class Task(Basemodel, Base):
    """Defines user tasks"""
    __tablename__ = 'tasks'
    user_id = Column(String(60), ForeignKey('users.id'), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    due_date = Column(DateTime, nullable=True)
    completed = Column(Boolean, default=False)
    user = relationship("User", back_populates="task")
    sub_tasks = relationship("SubTask", back_populates="task", cascade="all, delete, delete-orphan")

    def __init__(self, *args, **kwargs):
        """Initializes tasks"""
        super().__init__(*args, **kwargs)

    def add_subtask(self, subtask: SubTask):
        """Adds a subtask to the task"""
        self.sub_tasks.append(subtask)
        models.storage.save()

    def remove_subtask(self, subtask: SubTask):
        """Removes a subtask from the task"""
        self.sub_tasks.remove(subtask)
        models.storage.save()
