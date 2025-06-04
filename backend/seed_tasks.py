import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import pytz
import random

# Initialize Firebase Admin
cred = credentials.Certificate("config/key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# User ID
USER_ID = "dKOMIQHilZeyMPED7VPvOY5yNuV2"

# Timezone for Romania
tz = pytz.timezone('Europe/Bucharest')

# Categories for tasks
categories = ["Work", "Personal", "Health", "Finance", "Learning"]
priorities = ["low", "medium", "high"]

# Sample task titles
task_titles = [
    "Research new software tools",
    "Complete project documentation",
    "Schedule team meeting",
    "Review code changes",
    "Update project timeline",
    "Prepare presentation",
    "Send weekly report",
    "Update dependencies",
    "Fix critical bugs",
    "Optimize database queries",
    "Write unit tests",
    "Deploy to production",
    "Backup database",
    "Update security policies",
    "Review pull requests",
    "Plan next sprint",
    "Update user documentation",
    "Monitor system performance",
    "Implement new feature",
    "Refactor legacy code"
]

# Sample task descriptions
task_descriptions = [
    "Pay electricity, water, and internet bills",
    "Review and update project documentation",
    "Schedule team meeting for sprint planning",
    "Review recent code changes and provide feedback",
    "Update project timeline with new milestones",
    "Prepare presentation for client meeting",
    "Send weekly progress report to stakeholders",
    "Update project dependencies to latest versions",
    "Fix critical bugs reported by users",
    "Optimize database queries for better performance",
    "Write unit tests for new features",
    "Deploy latest changes to production",
    "Perform database backup and verify integrity",
    "Update security policies and procedures",
    "Review and merge pull requests",
    "Plan next sprint goals and tasks",
    "Update user documentation with new features",
    "Monitor system performance and optimize",
    "Implement new feature based on requirements",
    "Refactor legacy code to improve maintainability"
]

def generate_tasks():
    tasks = []
    start_date = datetime(2025, 5, 1)
    end_date = datetime(2025, 8, 1)
    
    for i in range(100):
        # Generate random dates within the specified range
        created_date = start_date + timedelta(
            days=random.randint(0, (end_date - start_date).days)
        )
        due_date = created_date + timedelta(days=random.randint(1, 30))
        
        # Format dates
        created_at = created_date.replace(
            hour=random.randint(8, 17),
            minute=random.randint(0, 59),
            second=random.randint(0, 59)
        )
        created_at = tz.localize(created_at)
        
        task = {
            "category": random.choice(categories),
            "completed": False,
            "createdAt": created_at,
            "description": random.choice(task_descriptions),
            "dueDate": due_date.strftime("%Y-%m-%d"),
            "priority": random.choice(priorities),
            "title": random.choice(task_titles),
            "updatedAt": created_at,
            "userId": USER_ID
        }
        tasks.append(task)
    
    return tasks

def seed_tasks():
    tasks = generate_tasks()
    batch = db.batch()
    
    for task in tasks:
        doc_ref = db.collection('tasks').document()
        batch.set(doc_ref, task)
    
    batch.commit()
    print(f"Successfully seeded {len(tasks)} tasks")

if __name__ == "__main__":
    seed_tasks() 