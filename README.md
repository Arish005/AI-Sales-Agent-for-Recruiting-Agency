🤖 AI Sales Agent for Recruiting Agencies
An intelligent, conversational AI agent designed to automate the initial client qualification process for recruiting agencies. This agent understands hiring needs, extracts key information, recommends services, and maintains a persistent memory of conversations.
Live Demonstration
This project features a sleek, intuitive user interface for seamless interaction with the AI agent. The panel on the right provides a real-time summary of the client's needs as understood by the AI.
**
(It is highly recommended to create a short GIF of a conversation and embed it here to showcase the agent in action.)
✨ Key Features
🧠 Conversational Intelligence: Powered by Google's Gemini 1.5 Flash model to understand natural language and engage in coherent, multi-turn dialogues.
🎯 Structured Data Extraction: Automatically identifies and extracts key hiring details (industry, location, roles, count, urgency) into a structured JSON format.
💡 Smart Service Recommendations: Suggests the most suitable hiring packages based on the extracted client needs.
💾 Persistent Memory: Utilizes a SQLite database to save conversation history and extracted data, providing full context and long-term memory for each user session.
🗣️ Voice Interaction: Supports both Speech-to-Text (STT) via a microphone input and Text-to-Speech (TTS) to read the agent's responses aloud.
☁️ Cloud-Ready Architecture: The entire backend is containerized with Docker, making it easy to deploy to any cloud service.
🛠️ Technology Stack
Category
Technology / Tool
Frontend
React.js, Tailwind CSS
Backend
Python, Flask
AI Model
Google Gemini 1.5 Flash
Database
SQLite
Containerization
Docker

🏗️ System Architecture
This project uses a modern, decoupled client-server architecture, which is a professional standard for building scalable and maintainable applications.
Frontend (The Body): A responsive React application that serves as the user interface. It contains no business logic or sensitive keys, making it secure.
Backend (The Brain): A Python Flask server that acts as the central hub. It processes all logic, manages the database, and securely handles all communication with the Gemini API.
[ User ] <--> [ React Frontend ] <--> [ Flask Backend API ] <--> [ Gemini API & SQLite DB ]


🚀 Getting Started
Follow these instructions to get the project running on your local machine for development and testing.
Prerequisites
Node.js & npm: Download & Install
Docker Desktop: Download & Install
Gemini API Key: Get your key from Google AI Studio
Installation & Setup
1. Clone the Repository
git clone [https://github.com/your-username/ai-sales-agent.git](https://github.com/your-username/ai-sales-agent.git)
cd ai-sales-agent


2. Configure the Backend
Navigate into the backend directory.
Create a file named .env.
Add your Gemini API key to this file:
GEMINI_API_KEY="YOUR_SECRET_GEMINI_API_KEY_HERE"


3. Run the Backend (Terminal 1)
From the project's root directory, build the Docker image:
docker build -t ai-sales-agent-backend ./backend


Run the container. This will start your server on http://localhost:5001.
docker run -p 5001:5001 -v ./backend:/app ai-sales-agent-backend


Leave this terminal running.
4. Run the Frontend (Terminal 2)
Open a new terminal window at the project's root directory.
Install all necessary packages:
npm install


Start the React application. This will open the UI in your browser at http://localhost:3000.
npm start


You should now have the fully functional application running!
🗺️ Future Roadmap
This project has a solid foundation that can be extended with several high-value features:
[ ] CRM Integration: Automatically create new leads in a CRM like HubSpot or Salesforce from conversations.
[ ] Calendar Integration: Allow the agent to connect to a calendar API (e.g., Google Calendar) to schedule calls.
[ ] Full Cloud Deployment: Deploy the Dockerized backend to a service like Google Cloud Run or AWS for public accessibility.
[ ] Analytics Dashboard: Build a dashboard to analyze the structured data to find hiring trends.
🤝 Contributing
Contributions are welcome! Please feel free to fork the repository, make changes, and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.
📜 License
This project is licensed under the MIT License - see the LICENSE.md file for details.
