# AI Sales Agent for Recruiting Agency (Docker Version)

This project is a fully functional, AI-powered sales agent designed for a recruiting agency. It features a React frontend that communicates with a self-hosted Python (Flask) backend. The backend handles all business logic, including conversations with Google's Gemini API and data persistence using a SQLite database. The entire backend is containerized with Docker for easy setup and deployment.

## Architecture

-   **Frontend**: A standalone React application (UI layer).
-   **Backend**: A Python Flask server that provides a REST API. It manages conversation state, interacts with the Gemini API, and saves data to a local SQLite database.
-   **Containerization**: The backend is fully containerized using Docker, ensuring a consistent and isolated environment.

---

## Setup Instructions

### 1. Prerequisites

-   **Node.js and npm**: To run the React frontend.
-   **Docker**: To build and run the backend container. [Install Docker here](https://docs.docker.com/get-docker/).

### 2. Get Your Gemini API Key

1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Click on **"Get API key"** and create one.
3.  Copy this key for the next step.

### 3. Configure and Run the Backend

1.  **Create `.env` file**: Inside the `backend` folder, create a file named `.env`. Add your Gemini API key to it:
    ```
    GEMINI_API_KEY=YOUR_SECRET_GEMINI_API_KEY_HERE
    ```

2.  **Build the Docker Image**: Open your terminal in the project's root directory and run:
    ```bash
    docker build -t ai-sales-agent-backend ./backend
    ```

3.  **Run the Docker Container**:
    ```bash
    docker run -p 5001:5001 -v ./backend:/app ai-sales-agent-backend
    ```
    Your backend is now running at `http://localhost:5001`.

### 4. Configure and Run the Frontend

1.  **Install Dependencies**: In a new terminal, navigate to the project's root directory and run:
    ```bash
    npm install
    ```

2.  **Run the App**:
    ```bash
    npm start
    ```
    The application will open in your browser at `http://localhost:3000`.

### 4. Screenshots:

![AI Sales Agent UI](./assets/ui-screenshot.png)

![Backend Log](./assets/log-image.png)
    



    
