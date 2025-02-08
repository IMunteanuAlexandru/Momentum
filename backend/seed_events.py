import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import pytz
import random

# Initialize Firebase Admin
cred = credentials.Certificate("config/key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Timezone pentru România
tz = pytz.timezone('Europe/Bucharest')

# User ID specificat
USER_ID = "dKOMIQHilZeyMPED7VPvOY5yNuV2"

# Liste pentru generare aleatorie
titluri_intalniri = [
    "Ședință de planificare", "Întâlnire cu clientul", "Review sprint", 
    "Prezentare proiect", "Discuție tehnică", "Workshop echipă",
    "Interviu candidat", "Training nou", "Retrospectivă"
]

titluri_evenimente = [
    "Conferință IT", "Hackathon", "Team Building", "Lansare produs",
    "Webinar tech", "Workshop design", "Meetup dezvoltatori"
]

titluri_reminder = [
    "Deadline raport", "Review cod", "Update documentație",
    "Testare aplicație", "Deploy producție", "Backup date"
]

locatii = [
    "Sala Mare", "Sala Conferințe", "Online - Zoom", "Biroul 101",
    "Hub Innovation", "Sala Training", "Meeting Room 2"
]

# Generare evenimente
events = []
current_date = datetime.now(tz)

for i in range(20):
    # Calculăm o dată aleatorie în următoarele 30 de zile
    random_days = random.randint(0, 30)
    random_hour = random.randint(9, 17)
    event_date = current_date + timedelta(days=random_days)
    event_date = event_date.replace(hour=random_hour, minute=0)
    
    # Alegem tipul de eveniment și detaliile corespunzătoare
    event_type = random.choice(['meeting', 'event', 'reminder', 'birthday'])
    
    if event_type == 'meeting':
        title = random.choice(titluri_intalniri)
        duration = random.choice([1, 1.5, 2])  # ore
        category = "meeting"
    elif event_type == 'event':
        title = random.choice(titluri_evenimente)
        duration = random.choice([4, 6, 8])  # ore
        category = "event"
    elif event_type == 'reminder':
        title = random.choice(titluri_reminder)
        duration = 1  # ore
        category = "reminder"
    else:
        title = f"Zi de naștere {random.choice(['Alex', 'Maria', 'Andrei', 'Elena', 'Radu'])}"
        duration = 24  # ore
        category = "birthday"
    
    end_date = event_date + timedelta(hours=duration)
    location = random.choice(locatii) if event_type != 'birthday' else ""
    
    event = {
        "title": title,
        "description": f"Locație: {location}" if location else "Eveniment important",
        "startDate": event_date.isoformat(),
        "endDate": end_date.isoformat(),
        "category": category,
        "recurrence": "weekly" if random.random() < 0.3 else "",
        "notifications": {
            "email": random.choice([True, False]),
            "push": random.choice([True, False])
        },
        "userId": USER_ID,
        "createdAt": firestore.SERVER_TIMESTAMP,
        "updatedAt": firestore.SERVER_TIMESTAMP
    }
    events.append(event)

def seed_events():
    events_ref = db.collection('events')
    
    # Adaugă fiecare eveniment în Firestore
    for event in events:
        event_ref = events_ref.document()
        event_ref.set(event)
        print(f"Adăugat eveniment: {event['title']}")

if __name__ == '__main__':
    seed_events()
    print("Evenimentele au fost adăugate cu succes!") 