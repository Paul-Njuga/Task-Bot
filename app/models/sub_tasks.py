#!/usr/bin/python3
"""
Sub Task Class
"""

from models.base_model import Basemodel, Base
from sqlalchemy import Column, DateTime, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship

class SubTask(Basemodel, Base):
    """Defines user sub tasks"""
    __tablename__ = 'sub_tasks'
    task_id = Column(String(60), ForeignKey('tasks.id'), nullable=False)
    title = Column(String(500), nullable=False)
    completed = Column(Boolean, default=False)
    task = relationship("Task", back_populates="sub_tasks")

    def __init__(self, *args, **kwargs):
        """Initializes tasks"""
        super().__init__(*args, **kwargs)
