#!/usr/bin/python3
""" Starts a Flask Web Application """
import re
import json
import openai
from os import getenv
from models import storage
from models.user import User
from models.task import Task
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, render_template, url_for, redirect, flash, session, request

app = Flask(__name__)
app.secret_key = '0e88398e480fdc1b37012b473df07d0608a11fddc8e27d79ad0815b4c0abbfb2'
openai.api_key = getenv("CHATGPT_API_KEY")


@app.teardown_appcontext
def close_db(error):
    """ Remove the current SQLAlchemy Session """
    storage.close()


@app.route('/', strict_slashes=False)
def landing_page():
    """ Renders the Task Bot landing page """
    msg=''
    return render_template('lp.html', msg=msg)

@app.route('/about', strict_slashes=False)
def about():
    """ Renders the Task Bot about page """
    msg=''
    return render_template('lp-about.html', msg=msg)

@app.route('/signup', strict_slashes=False)
def signup():
    """ Renders the Task Bot signup page """
    msg=''
    return render_template('signup.html', msg=msg)


@app.route('/signup', methods=['POST'])
def signup_post():
    """ Handles the signup form """
    msg = ''
    if 'username' in request.form and 'password' in request.form and 'email' in request.form :
        _email = request.form.get('email')
        _username = request.form.get('username')
        _password = request.form.get('password')

        if not re.match(r'[A-Za-z0-9]+', _username):
            msg = 'Username must contain only characters and numbers !'
            return redirect(url_for('signup', msg=msg))
        elif not re.match(r'[^@]+@[^@]+\.[^@]+', _email):
            msg = 'Invalid email address !'
            return redirect(url_for('signup', msg=msg))
        elif not _email or not _username or not _password:
            msg = 'Please fill out the form !'
            return redirect(url_for('signup', msg=msg))
        for user in storage.all(User).values():
            if user.email == _email:
                msg = 'Email address already exists !'
                return redirect(url_for('signup', msg=msg))
        new_user = User(username=_username, email=_email,
                        password=generate_password_hash(_password))
        storage.new(new_user)
        storage.save()
        msg = 'Login Successful'
        return redirect(url_for('login', msg=msg))


@app.route('/login', strict_slashes=False)
def login():
    """ Renders the Task Bot login page """
    msg=''
    return render_template('login.html', msg=msg)


@app.route('/login', methods=['POST'], strict_slashes=False)
def login_post():
    msg = ''
    v_usr = None
    _username = request.form.get('username')
    _password = request.form.get('password')

    if not re.match(r'[A-Za-z0-9]+', _username):
        msg = 'Username must contain only characters and numbers !'
        return redirect(url_for('login', msg=msg))
    elif not _username or not _password:
        msg = 'Please fill out the form !'
        return redirect(url_for('login', msg=msg))
    for user in storage.all(User).values():
        if user.username == _username:
            v_usr = user
    if not v_usr or not check_password_hash(v_usr.password, _password):
        msg = 'Incorrect email or password, try again.'
        return render_template('login.html', msg=msg)
    
    session['loggedin'] = True
    session['id'] = v_usr.id
    session['username'] = v_usr.username
    msg = 'Logged in successfully !'
    return redirect(url_for('index'))


@app.route('/logout')
def logout():
    """ Logs out user and redirects them to landing page """
    session.pop('loggedin', None)
    session.pop('id', None)
    session.pop('username', None)
    return redirect(url_for('landing_page')) #* Redirect to landing page


@app.route('/to_do', strict_slashes=False)
def index():
    """ Taskbot to do tasks page """
    _user_id = session['id']
    tasks = storage.get_tasks(_user_id)
    tsk_dict = []
    for task in tasks:
        if not (task.completed):
            tsk_dict.append(task.to_dict())
    return render_template('index.html', tasks=tsk_dict)


@app.route('/completed', strict_slashes=False)
def done_tasks():
    """ Completed tasks page """
    _user_id = session['id']
    tasks = storage.get_tasks(_user_id)
    tsk_dict = []
    for task in tasks:
        if (task.completed):
            tsk_dict.append(task.to_dict())
    return render_template('completed.html', tasks=tsk_dict)


@app.route('/update_task/<taskId>', methods=['POST'])
def update_task_completion(taskId):
    """ Update a task as completed """
    _user_id = session['id']
    tasks = storage.get_tasks(_user_id)
    for task in tasks:
        if task.id == taskId:
            task.completed = True
            task.save()
            return 'Task added successfully', 200
    return 'Task not found', 404


@app.route('/add_task', methods=['POST'], strict_slashes=False)
def add_task():
    """ Add a new task """
    _user_id = session['id']
    if 'new-task' in request.form:
        title = request.form.get('new-task')
        new_task = Task(user_id=_user_id, title=title)
        storage.new(new_task)
        storage.save()
        return redirect(url_for('index'))


@app.route('/add_gen_task', methods=['POST'], strict_slashes=False)
def add_gen_task():
    """ Add a new generated task """
    _user_id = session['id']
    title = request.json.get('title')
    description = request.json.get('description')
    new_task = Task(user_id=_user_id, title=title, description=description)
    storage.new(new_task)
    storage.save()
    return 'Task added successfully', 200


def query_chatgpt(user_input):
    """ Queries Chat GPT """
    system_role = """
                You are a useful assistant that is skilled in breaking down a task or a goal into multiple relevant,
                actionable, manageable, layered steps that will lead to the main goal achievement.

                Focus on delivering clear and concise instructions for goal achievement.
                Concentrate on breaking down a task into layered, actionable, and trackable steps only.
                Be very straightforward and respond only from the first-person perspective.
                No small talk or advice of any kind.

                Your response should only consist of the layered steps,
                each with its own title and summary from the task or goal break down in a json format.

                The json format will be in the form: "{"index": {"title": "Title of the new task.", "summary": "A description of the new task."}}".
                The "index" key will represent the number of steps generated starting from 0.
                For example: {"0": {"title": "First generated task", "summary": "First generated task summary"}, "1": {...}}
            """
    response = openai.ChatCompletion.create(
        model = "gpt-3.5-turbo",
        messages = [
            {
                "role": "system",
                "content": system_role
            },
            {
                "role": "user",
                "content": user_input
            }
        ],
        temperature=0.5
    )
    json_args = response['choices'][0]['message']['content']
    # Parse a valid JSON string and convert it into a Python Dictionary
    dict_obj = json.loads(json_args)
    if (dict_obj):
        return (dict_obj)
    return None


@app.route('/chatbot', methods=['POST'])
def generate_task():
    """ Handles chatbot feature """
    user_input = request.json['user_input']
    # Call the function to interact with the ChatGPT 3.5 Turbo API
    # Returns a dict object
    task_responses = query_chatgpt(user_input)

    if task_responses:
        # Respond with the generated tasks in JSON format
        return json.dumps(task_responses)
    return None


if __name__ == "__main__":
    """ Main Function """
    app.run(host='0.0.0.0', port=5000, debug=True)
