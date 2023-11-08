"""
DB Storage module
"""

from os import getenv
import models
from models.user import User
from models.task import Task
from models.sub_tasks import SubTask
from models.base_model import Basemodel, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

classes = {"User": User, "Tasks": Task, "SubTasks": SubTask}

class DBStorage:
    """Connects with MySQL database"""
    __engine = None
    __session = None

    def __init__(self):
        """Instantiate a DBStorage object"""
        user = getenv('TB_MYSQL_USER')
        passwd = getenv('TB_MYSQL_PWD')
        host = getenv('TB_MYSQL_HOST')
        db = getenv('TB_MYSQL_DB')
        env = getenv('TB_ENV')
        self.__engine = create_engine('mysql+mysqldb://{}:{}@{}/{}'.
                                      format(user, passwd, host, db),
                                      pool_pre_ping=True)
        if env == "test":
            Base.metadata.drop_all(self.__engine)

    def new(self, obj):
        """Adds obj to the db session"""
        self.__session.add(obj)

    def save(self):
        """Commits all changes to the db"""
        self.__session.commit()

    def delete(self, obj=None):
        """Deletes obj frm db if not none"""
        if obj:
            self.__session.delete(obj)

    def all(self, cls=None):
        """Returns a dictionary of models currently in storage,
        or of a specific class"""
        objects = {}
        if cls:
            for obj in self.__session.query(cls).all():
                key = "{}.{}".format(type(obj).__name__, obj.id)
                objects[key] = obj
        else:
            for sub_cls in Base.__subclasses__():
                for obj in self.__session.query(sub_cls).all():
                    key = "{}.{}".format(type(obj).__name__, obj.id)
                    objects[key] = obj
        return (objects)

    def get(self, cls, id):
        """
        Returns the object based on the class name and its ID, or
        None if not found
        """
        if cls not in classes.values():
            return None

        all_cls = models.storage.all(cls)
        for value in all_cls.values():
            if (value.id == id):
                return value
        return None

    def get_tasks(self, user_id):
        """
        Returns tasks object for a given User
        None if not found
        """
        user = models.storage.get(User, user_id)
        if user:
            return user.task
        return None

    def get_subtasks(self, task_id):
        """
        Returns the subtasks object for a given Task
        None if not found
        """
        task = models.storage.get(Task, task_id)
        if task:
            return task.sub_tasks
        return None

    def count(self, cls=None):
        """
        count the number of objects in storage
        """
        all_class = classes.values()

        if not cls:
            count = 0
            for clas in all_class:
                count += len(models.storage.all(clas).values())
        else:
            count = len(models.storage.all(cls).values())
        return count

    def reload(self):
        """Creates all tables in the db"""
        Base.metadata.create_all(self.__engine)
        session_factory = sessionmaker(
            bind=self.__engine,
            expire_on_commit=False)
        Session = scoped_session(session_factory)
        self.__session = Session

    def close(self):
        """call close() method on the private session attribute"""
        self.__session.close()
