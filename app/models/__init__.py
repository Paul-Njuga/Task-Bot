#!/usr/bin/python3
"""This module instantiates an object in storage"""

from os import getenv

if getenv("TB_TYPE_STORAGE") == "db":
    from models.engine.storage import DBStorage
    storage = DBStorage()
    storage.reload()
