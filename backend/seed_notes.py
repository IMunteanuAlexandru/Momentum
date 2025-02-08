import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import pytz

# Initialize Firebase Admin
cred = credentials.Certificate("config/key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# User ID specificat
USER_ID = "dKOMIQHilZeyMPED7VPvOY5yNuV2"

# Timezone pentru România
tz = pytz.timezone('Europe/Bucharest')

# Lista de notițe pentru seed
notes = [
    {
        "title": "Idei Proiect Momentum",
        "content": """Funcționalități viitoare pentru Momentum:
- Integrare cu Google Calendar
- Sistem de reminder-uri prin SMS
- Exportare date în format PDF
- Statistici avansate pentru productivitate
- Modul de colaborare în echipă""",
        "category": "work",
        "pinned": True
    },
    {
        "title": "Meeting Notes - Sprint Planning",
        "content": """Obiective Sprint 5:
1. Implementare calendar
2. Sistem de notificări
3. Pagină de analytics
4. Optimizări performanță
5. Testare și debugging""",
        "category": "work",
        "pinned": True
    },
    {
        "title": "Rețetă Tiramisu",
        "content": """Ingrediente:
- 500g mascarpone
- 3 ouă
- 100g zahăr
- 200ml cafea tare
- Pișcoturi
- Cacao pudră

Preparare:
1. Se prepară cafeaua și se lasă să se răcească
2. Se separă ouăle
3. Se bat albușurile spumă
4. Se amestecă gălbenușurile cu zahăr
5. Se adaugă mascarpone
6. Se încorporează albușurile
7. Se înmoaie pișcoturile în cafea
8. Se alternează straturile
9. Se presară cacao deasupra""",
        "category": "personal",
        "pinned": False
    },
    {
        "title": "Cărți de citit",
        "content": """1. Clean Code - Robert C. Martin
2. The Pragmatic Programmer
3. Design Patterns
4. Refactoring
5. Domain-Driven Design
6. Test-Driven Development
7. Continuous Delivery""",
        "category": "learning",
        "pinned": True
    },
    {
        "title": "Idei Vacanță",
        "content": """Destinații posibile:
- Toscana, Italia
- Provence, Franța
- Santorini, Grecia
- Coasta Amalfi
- Barcelona, Spania

De verificat:
- Prețuri bilete avion
- Cazare
- Atracții turistice
- Perioada optimă
- Budget estimat""",
        "category": "personal",
        "pinned": False
    },
    {
        "title": "Resurse Frontend Development",
        "content": """Tutoriale și cursuri:
- Vue.js Documentation
- Frontend Masters
- CSS Tricks
- MDN Web Docs
- JavaScript.info

Framework-uri de învățat:
1. Vue.js 3
2. React
3. Svelte
4. Angular

Design & UI:
- Figma
- Adobe XD
- Material Design
- Tailwind CSS""",
        "category": "learning",
        "pinned": True
    },
    {
        "title": "Planificare Proiect E-commerce",
        "content": """Faze proiect:

1. Research & Analiză
- Analiza competiției
- Definire target audience
- Stabilire funcționalități cheie

2. Design & Arhitectură
- Wireframes
- Design UI/UX
- Arhitectură tehnică
- Alegere tehnologii

3. Dezvoltare
- Setup proiect
- Implementare backend
- Implementare frontend
- Integrare plăți

4. Testare
- Unit testing
- Integration testing
- User testing
- Performance testing

5. Deployment
- Setup servere
- Configurare CI/CD
- Monitorizare
- Backup strategy""",
        "category": "work",
        "pinned": True
    },
    {
        "title": "Exerciții Săptămânale",
        "content": """Program săptămânal:

Luni - Piept & Triceps
- Bench Press: 4x10
- Incline DB Press: 3x12
- Triceps Pushdown: 3x15
- Dips: 3x10

Marți - Spate & Biceps
- Pull-ups: 4x8
- Barbell Rows: 4x10
- Face Pulls: 3x15
- Biceps Curls: 3x12

Joi - Picioare
- Squats: 4x10
- Romanian Deadlift: 4x12
- Leg Press: 3x15
- Calf Raises: 4x20

Vineri - Umeri & Abs
- Military Press: 4x10
- Lateral Raises: 3x15
- Planks: 3x60s
- Russian Twists: 3x20""",
        "category": "personal",
        "pinned": True
    },
    {
        "title": "Idei Blog Tech",
        "content": """Articole de scris:

1. "De ce Vue.js este perfect pentru începători"
2. "Cum să-ți optimizezi aplicația web"
3. "Firebase vs. MongoDB - Comparație detaliată"
4. "Clean Architecture în aplicații moderne"
5. "TypeScript - De ce să-l folosești în 2024"
6. "State Management - Vuex vs. Pinia"
7. "Testing în Vue.js - Best Practices"
8. "PWA - Transformă-ți aplicația web într-o aplicație mobilă"
9. "Security Best Practices în Web Development"
10. "Performance Optimization Tips"

Keywords de research:
- Vue 3 Composition API
- Web Performance
- Modern JavaScript
- Frontend Architecture
- Testing Strategies""",
        "category": "work",
        "pinned": False
    },
    {
        "title": "Setup Development Environment",
        "content": """Tools & Software:

1. Editor:
- VS Code
- Extensions necesare
- Configurare personalizată

2. Terminal:
- Windows Terminal
- PowerShell
- Git Bash

3. Development:
- Node.js
- Python
- Docker
- Git

4. Databases:
- MongoDB
- PostgreSQL
- Redis

5. API Testing:
- Postman
- Insomnia

6. Browsers:
- Chrome DevTools
- Firefox Developer Edition

7. Design:
- Figma
- Adobe XD

8. Others:
- Discord
- Slack
- Notion""",
        "category": "learning",
        "pinned": False
    }
]

def seed_notes():
    notes_ref = db.collection('notes')
    
    # Adaugă fiecare notiță în Firestore
    for note in notes:
        note_data = {
            **note,
            "userId": USER_ID,
            "createdAt": firestore.SERVER_TIMESTAMP,
            "updatedAt": firestore.SERVER_TIMESTAMP
        }
        note_ref = notes_ref.document()
        note_ref.set(note_data)
        print(f"Adăugat notița: {note['title']}")

if __name__ == '__main__':
    seed_notes()
    print("Notițele au fost adăugate cu succes!") 