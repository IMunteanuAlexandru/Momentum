
# Momentum - AI-Powered Time Management App

Momentum is a web application designed to help users manage their time effectively. It features task planning, productivity statistics, and an AI-powered voice assistant for simple commands. The app includes user authentication, customizable design, interactive charts, and notifications to keep users on track.

---

## Features

- **Task Planning**: Plan tasks by day, week, month, and year.
- **AI Voice Assistant**: Perform simple commands like adding tasks or checking schedules.
- **User Authentication**: Secure registration and login.
- **Customizable Design**: Personalize the interface to your liking.
- **Charts and Statistics**: Visualize productivity with interactive charts.
- **Notifications**: Get reminders for upcoming tasks and deadlines.

---

## Technologies Used

### Frontend
- **React.js**: For building the user interface.
- **Tailwind CSS**: For styling the app.
- **Chart.js**: For displaying charts and graphs.
- **Firebase SDK**: For authentication and database integration.

### Backend
- **Flask**: A lightweight Python framework for the backend API.
- **Firebase Firestore**: For storing user data and tasks.

### AI Integration
- **OpenAI API**: For natural language processing and voice assistant functionality.
- **Web Speech API**: For speech-to-text and text-to-speech features.

---

## Getting Started

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/momentum.git
   cd momentum
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

4. **Run the Application**:
   - Start the frontend and backend servers.
   - Access the app at `http://localhost:3000`.

---

## Project Structure

```
momentum/
├── frontend/               # React frontend
│   ├── src/                # React components and logic
│   └── package.json        # Frontend dependencies
│
├── backend/                # Flask backend
│   ├── app.py              # Flask application
│   └── requirements.txt    # Python dependencies
│
└── README.md               # Project documentation
```


---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
