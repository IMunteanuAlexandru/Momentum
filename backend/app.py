from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from functools import wraps
from datetime import datetime, timedelta

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
            return {'message': 'No token provided'}, 401
        try:
            token = request.headers['Authorization'].split('Bearer ')[1]
            user = auth.verify_id_token(token)
            request.user = user
        except:
            return {'message': 'Invalid token provided'}, 401
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
        
        # Get user data including last login
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
            
        user_data = user_doc.to_dict()
        
        # Get recent tasks
        tasks_ref = db.collection('tasks').where('userId', '==', user_id).order_by('createdAt', direction=firestore.Query.DESCENDING).limit(5)
        tasks = []
        for task in tasks_ref.stream():
            task_data = task.to_dict()
            tasks.append({
                'id': task.id,
                'title': task_data.get('title'),
                'status': task_data.get('status'),
                'dueDate': task_data.get('dueDate')
            })
            
        # Get today's events
        today = datetime.now().date()
        tomorrow = today + timedelta(days=1)
        events_ref = db.collection('events').where('userId', '==', user_id).where('startTime', '>=', today).where('startTime', '<', tomorrow).order_by('startTime')
        events = []
        for event in events_ref.stream():
            event_data = event.to_dict()
            events.append({
                'id': event.id,
                'title': event_data.get('title'),
                'startTime': event_data.get('startTime')
            })
            
        # Get task statistics
        tasks_ref = db.collection('tasks').where('userId', '==', user_id)
        completed = 0
        in_progress = 0
        upcoming = 0
        
        for task in tasks_ref.stream():
            task_data = task.to_dict()
            status = task_data.get('status')
            if status == 'completed':
                completed += 1
            elif status == 'in-progress':
                in_progress += 1
            else:
                upcoming += 1
                
        return jsonify({
            'status': 'success',
            'data': {
                'lastLogin': user_data.get('lastLogin'),
                'recentTasks': tasks,
                'todayEvents': events,
                'stats': {
                    'completedTasks': completed,
                    'inProgressTasks': in_progress,
                    'upcomingTasks': upcoming
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 