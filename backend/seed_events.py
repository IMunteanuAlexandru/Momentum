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

# Categories for events
categories = ["Meeting", "Conference", "Workshop", "Training", "Team Building", "Client Call", "Interview", "Review"]

# Sample event titles
event_titles = [
    "Product Demo",
    "Sprint Planning",
    "Team Retrospective",
    "Client Presentation",
    "Code Review",
    "Architecture Discussion",
    "Training Session",
    "Project Kickoff",
    "Status Update",
    "Strategy Meeting",
    "Design Review",
    "Performance Review",
    "Team Building",
    "Technical Workshop",
    "Stakeholder Meeting",
    "Release Planning",
    "Security Audit",
    "User Research",
    "Product Roadmap",
    "Innovation Workshop"
]

# Sample event descriptions
event_descriptions = [
    "Strategic planning for Q2 2025",
    "Review project progress and plan next steps",
    "Discuss team performance and improvements",
    "Present new features to stakeholders",
    "Review code changes and provide feedback",
    "Discuss system architecture improvements",
    "Training session on new technologies",
    "Kickoff meeting for new project phase",
    "Weekly status update with team",
    "Strategic planning session",
    "Review design proposals and provide feedback",
    "Quarterly performance review meeting",
    "Team building activities and games",
    "Technical workshop on best practices",
    "Meeting with key stakeholders",
    "Plan next release features and timeline",
    "Security audit review and findings",
    "User research findings presentation",
    "Product roadmap planning session",
    "Innovation workshop for new ideas"
]

def generate_events():
    events = []
    start_date = datetime(2025, 5, 1)
    end_date = datetime(2025, 8, 1)
    
    for i in range(100):
        # Generate random dates within the specified range
        created_date = start_date + timedelta(
            days=random.randint(0, (end_date - start_date).days)
        )
        
        # Generate random start time between 9 AM and 4 PM
        start_hour = random.randint(9, 16)
        start_minute = random.choice([0, 15, 30, 45])
        
        # Create start and end times
        start_time = created_date.replace(
            hour=start_hour,
            minute=start_minute,
            second=0
        )
        end_time = start_time + timedelta(hours=random.randint(1, 3))
        
        # Localize times
        start_time = tz.localize(start_time)
        end_time = tz.localize(end_time)
        
        event = {
            "category": random.choice(categories),
            "createdAt": start_time,
            "description": random.choice(event_descriptions),
            "endDate": end_time,
            "notifications": True,
            "recurrence": "",
            "startDate": start_time,
            "title": random.choice(event_titles),
            "updatedAt": start_time,
            "userId": USER_ID
        }
        events.append(event)
    
    return events

def seed_events():
    events = generate_events()
    batch = db.batch()
    
    for event in events:
        doc_ref = db.collection('events').document()
        batch.set(doc_ref, event)
    
    batch.commit()
    print(f"Successfully seeded {len(events)} events")

if __name__ == "__main__":
    seed_events() 