#!/usr/bin/python3
"""
User Class
"""

from models.base_model import Basemodel, Base
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

class User(Basemodel, Base):
    """Defines user tasks"""
    __tablename__ = 'users'
    username = Column(String(80), nullable=False)
    email = Column(String(120), nullable=False)
    password = Column(String(255), nullable=False)
    task = relationship("Task", back_populates="user")

    def __init__(self, *args, **kwargs):
        """Initializes tasks"""
        super().__init__(*args, **kwargs)
