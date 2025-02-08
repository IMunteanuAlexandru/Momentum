from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from functools import wraps
from datetime import datetime, timedelta
import schedule
import time
import threading

# Load environment variables
load_dotenv()

# Initialize Firebase Admin
cred = credentials.Certificate("config/key.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

def check_token(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if not request.headers.get('Authorization'):
            return jsonify({
                'status': 'error',
                'message': 'No token provided'
            }), 401
        try:
            auth_header = request.headers['Authorization']
            if not auth_header.startswith('Bearer '):
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid token format'
                }), 401
                
            token = auth_header.split('Bearer ')[1]
            user = auth.verify_id_token(token)
            request.user = user
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': 'Invalid token provided',
                'error': str(e)
            }), 401
        return f(*args, **kwargs)
    return wrap

@app.route('/', methods=['GET'])
def check_server():
    return jsonify({"status": "success", "message": "Server is running"})

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        display_name = data.get('displayName', '')
        
        # Create user in Firebase Auth
        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name
        )
        
        # Store additional user data in Firestore
        user_data = {
            'email': email,
            'displayName': display_name,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'settings': {
                'theme': 'light',
                'notifications': True
            }
        }
        db.collection('users').document(user.uid).set(user_data)
        
        return jsonify({
            'status': 'success',
            'message': 'User registered successfully',
            'userId': user.uid
        }), 201
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/user', methods=['GET'])
@check_token
def get_user_data():
    try:
        user_id = request.user['uid']
        user_doc = db.collection('users').document(user_id).get()
        
        if user_doc.exists:
            user_data = user_doc.to_dict()
            return jsonify({
                'status': 'success',
                'data': user_data
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'User data not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/user', methods=['PUT'])
@check_token
def update_user_data():
    try:
        user_id = request.user['uid']
        update_data = request.json
        
        # Update user data in Firestore
        db.collection('users').document(user_id).update(update_data)
        
        return jsonify({
            'status': 'success',
            'message': 'User data updated successfully'
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    try:
        data = request.json
        print("Received Google auth data:", data)  # Debug log
        
        email = data.get('email')
        display_name = data.get('displayName')
        photo_url = data.get('photoURL')
        uid = data.get('uid')
        
        if not email or not uid:
            return jsonify({
                'status': 'error',
                'message': 'Email and UID are required'
            }), 400
        
        # Verify if user exists in Firestore
        user_doc = db.collection('users').document(uid).get()
        
        if not user_doc.exists:
            print(f"Creating new user document for {email}")  # Debug log
            # Create new user document if it doesn't exist
            user_data = {
                'email': email,
                'displayName': display_name,
                'photoURL': photo_url,
                'createdAt': firestore.SERVER_TIMESTAMP,
                'lastLogin': firestore.SERVER_TIMESTAMP,
                'settings': {
                    'theme': 'light',
                    'notifications': True
                }
            }
            db.collection('users').document(uid).set(user_data)
            print(f"User document created successfully")  # Debug log
        else:
            print(f"Updating existing user {email}")  # Debug log
            # Update last login for existing user
            db.collection('users').document(uid).update({
                'lastLogin': firestore.SERVER_TIMESTAMP,
                'email': email,
                'displayName': display_name,
                'photoURL': photo_url
            })
            print(f"User document updated successfully")  # Debug log
        
        return jsonify({
            'status': 'success',
            'message': 'Google authentication successful',
            'userId': uid
        })
        
    except Exception as e:
        print(f"Error in Google auth: {str(e)}")  # Debug log
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/dashboard/overview', methods=['GET'])
@check_token
def get_dashboard_overview():
    try:
        user_id = request.user['uid']
        
        # Get user's tasks
        tasks_ref = db.collection('tasks').where('userId', '==', user_id).order_by('createdAt', direction=firestore.Query.DESCENDING).stream()
        tasks = []
        completed_count = 0
        in_progress_count = 0
        upcoming_count = 0
        
        for task in tasks_ref:
            task_data = task.to_dict()
            task_data['id'] = task.id
            
            # Add task to recent tasks list
            tasks.append({
                'id': task.id,
                'title': task_data.get('title', ''),
                'description': task_data.get('description', ''),
                'status': task_data.get('status', 'pending'),
                'dueDate': task_data.get('dueDate', ''),
                'priority': task_data.get('priority', 'medium'),
                'category': task_data.get('category', 'Altele'),
                'completed': task_data.get('completed', False)
            })
            
            # Update counters
            if task_data.get('completed', False):
                completed_count += 1
            elif task_data.get('status') == 'in-progress':
                in_progress_count += 1
            else:
                upcoming_count += 1
        
        # Sort tasks by due date and get recent ones
        recent_tasks = sorted(tasks, key=lambda x: x.get('dueDate', ''), reverse=True)[:5] if tasks else []
        
        # Get user data
        user_doc = db.collection('users').document(user_id).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
                
        return jsonify({
            'status': 'success',
            'data': {
                'recentTasks': recent_tasks,
                'lastLogin': user_data.get('lastLogin', ''),
                'stats': {
                    'completedTasks': completed_count,
                    'inProgressTasks': in_progress_count,
                    'upcomingTasks': upcoming_count
                }
            }
        })
    except Exception as e:
        print(f"Error in dashboard overview: {str(e)}")  # Add debug logging
        return jsonify({
            'status': 'error',
            'message': 'Failed to fetch dashboard data',
            'error': str(e)
        }), 500

@app.route('/api/tasks', methods=['GET'])
@check_token
def get_tasks():
    try:
        user_id = request.user['uid']
        tasks_ref = db.collection('tasks').where('userId', '==', user_id).stream()
        tasks = []
        
        for task in tasks_ref:
            task_data = task.to_dict()
            task_data['id'] = task.id
            tasks.append(task_data)
        
        return jsonify({
            'status': 'success',
            'data': tasks
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/tasks', methods=['POST'])
@check_token
def create_task():
    try:
        user_id = request.user['uid']
        task_data = request.json
        task_data['userId'] = user_id
        task_data['createdAt'] = firestore.SERVER_TIMESTAMP
        task_data['updatedAt'] = firestore.SERVER_TIMESTAMP
        
        task_ref = db.collection('tasks').document()
        task_ref.set(task_data)
        
        return jsonify({
            'status': 'success',
            'taskId': task_ref.id
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/tasks/<task_id>', methods=['PUT'])
@check_token
def update_task(task_id):
    try:
        user_id = request.user['uid']
        task_ref = db.collection('tasks').document(task_id)
        task = task_ref.get()
        
        if not task.exists:
            return jsonify({
                'status': 'error',
                'message': 'Task not found'
            }), 404
            
        if task.to_dict().get('userId') != user_id:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized'
            }), 403
            
        task_data = request.json
        task_data['updatedAt'] = firestore.SERVER_TIMESTAMP
        task_ref.update(task_data)
        
        return jsonify({
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
@check_token
def delete_task(task_id):
    try:
        user_id = request.user['uid']
        task_ref = db.collection('tasks').document(task_id)
        task = task_ref.get()
        
        if not task.exists:
            return jsonify({
                'status': 'error',
                'message': 'Task not found'
            }), 404
            
        if task.to_dict().get('userId') != user_id:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized'
            }), 403
            
        task_ref.delete()
        
        return jsonify({
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/goals', methods=['POST'])
@check_token
def set_goal():
    try:
        user_id = request.user['uid']
        data = request.json
        
        goal_data = {
            'userId': user_id,
            'title': data.get('title'),
            'description': data.get('description'),
            'targetDate': data.get('targetDate'),
            'status': 'active',
            'progress': 0,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        }
        
        goal_ref = db.collection('goals').add(goal_data)
        
        return jsonify({
            'status': 'success',
            'message': 'Goal created successfully',
            'goalId': goal_ref[1].id
        }), 201
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/reminders', methods=['POST'])
@check_token
def create_reminder():
    try:
        user_id = request.user['uid']
        data = request.json
        
        reminder_data = {
            'userId': user_id,
            'title': data.get('title'),
            'description': data.get('description'),
            'reminderDate': data.get('reminderDate'),
            'status': 'active',
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        
        reminder_ref = db.collection('reminders').add(reminder_data)
        
        return jsonify({
            'status': 'success',
            'message': 'Reminder created successfully',
            'reminderId': reminder_ref[1].id
        }), 201
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/notes', methods=['GET'])
@check_token
def get_notes():
    try:
        user_id = request.user['uid']
        notes_ref = db.collection('notes').where('userId', '==', user_id).stream()
        notes = []
        
        for note in notes_ref:
            note_data = note.to_dict()
            note_data['id'] = note.id
            notes.append(note_data)
        
        return jsonify({
            'status': 'success',
            'data': notes
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/notes', methods=['POST'])
@check_token
def create_note():
    try:
        user_id = request.user['uid']
        note_data = request.json
        note_data['userId'] = user_id
        note_data['createdAt'] = firestore.SERVER_TIMESTAMP
        note_data['updatedAt'] = firestore.SERVER_TIMESTAMP
        
        note_ref = db.collection('notes').document()
        note_ref.set(note_data)
        
        return jsonify({
            'status': 'success',
            'noteId': note_ref.id
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/notes/<note_id>', methods=['PUT'])
@check_token
def update_note(note_id):
    try:
        user_id = request.user['uid']
        note_ref = db.collection('notes').document(note_id)
        note = note_ref.get()
        
        if not note.exists:
            return jsonify({
                'status': 'error',
                'message': 'Note not found'
            }), 404
            
        if note.to_dict().get('userId') != user_id:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized'
            }), 403
            
        note_data = request.json
        note_data['updatedAt'] = firestore.SERVER_TIMESTAMP
        note_ref.update(note_data)
        
        return jsonify({
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/notes/<note_id>', methods=['DELETE'])
@check_token
def delete_note(note_id):
    try:
        user_id = request.user['uid']
        note_ref = db.collection('notes').document(note_id)
        note = note_ref.get()
        
        if not note.exists:
            return jsonify({
                'status': 'error',
                'message': 'Note not found'
            }), 404
            
        if note.to_dict().get('userId') != user_id:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized'
            }), 403
            
        note_ref.delete()
        
        return jsonify({
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

def clean_completed_tasks():
    try:
        # Get all completed tasks
        completed_tasks = db.collection('tasks').where('completed', '==', True).stream()
        
        # Delete each completed task
        for task in completed_tasks:
            task.reference.delete()
            
        print(f"Cleaned completed tasks at {datetime.now()}")
    except Exception as e:
        print(f"Error cleaning completed tasks: {str(e)}")

def run_scheduler():
    # Schedule the cleanup for every Sunday at 23:59:59
    schedule.every().sunday.at("23:59:59").do(clean_completed_tasks)
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

# Start the scheduler in a separate thread
scheduler_thread = threading.Thread(target=run_scheduler)
scheduler_thread.daemon = True
scheduler_thread.start()

@app.route('/api/tasks/<task_id>/toggle', methods=['PUT'])
@check_token
def toggle_task_status(task_id):
    try:
        user_id = request.user['uid']
        task_ref = db.collection('tasks').document(task_id)
        task = task_ref.get()
        
        if not task.exists:
            return jsonify({
                'status': 'error',
                'message': 'Task not found'
            }), 404
            
        if task.to_dict().get('userId') != user_id:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized'
            }), 403
        
        # Only allow marking as completed, not uncompleting
        current_status = task.to_dict().get('completed', False)
        if current_status:
            return jsonify({
                'status': 'error',
                'message': 'Cannot unmark a completed task'
            }), 400
            
        task_ref.update({
            'completed': True,
            'completedAt': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/events', methods=['GET'])
@check_token
def get_events():
    try:
        user_id = request.user['uid']
        events_ref = db.collection('events').where('userId', '==', user_id).stream()
        events = []
        
        for event in events_ref:
            event_data = event.to_dict()
            event_data['id'] = event.id
            events.append(event_data)
        
        return jsonify({
            'status': 'success',
            'data': events
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/events', methods=['POST'])
@check_token
def create_event():
    try:
        user_id = request.user['uid']
        event_data = request.json
        event_data['userId'] = user_id
        event_data['createdAt'] = firestore.SERVER_TIMESTAMP
        event_data['updatedAt'] = firestore.SERVER_TIMESTAMP
        
        # Add the event to Firestore
        event_ref = db.collection('events').document()
        event_ref.set(event_data)
        
        return jsonify({
            'status': 'success',
            'eventId': event_ref.id
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/events/<event_id>', methods=['PUT'])
@check_token
def update_event(event_id):
    try:
        user_id = request.user['uid']
        event_ref = db.collection('events').document(event_id)
        event = event_ref.get()
        
        if not event.exists:
            return jsonify({
                'status': 'error',
                'message': 'Event not found'
            }), 404
            
        if event.to_dict().get('userId') != user_id:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized'
            }), 403
            
        event_data = request.json
        event_data['updatedAt'] = firestore.SERVER_TIMESTAMP
        event_ref.update(event_data)
        
        return jsonify({
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/events/<event_id>', methods=['DELETE'])
@check_token
def delete_event(event_id):
    try:
        user_id = request.user['uid']
        event_ref = db.collection('events').document(event_id)
        event = event_ref.get()
        
        if not event.exists:
            return jsonify({
                'status': 'error',
                'message': 'Event not found'
            }), 404
            
        if event.to_dict().get('userId') != user_id:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized'
            }), 403
            
        event_ref.delete()
        
        return jsonify({
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 