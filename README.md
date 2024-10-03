# Automatic Reading Tutor Project

## GitLab Repository

[Link to GitLab Repository](https://gitlab.cs.uct.ac.za/capstone-project-2024/automatic-reading-tutor.git)

The Automatic Reading Tutor is a web application designed to help users improve their pronunciation while reading stories aloud. The application includes a frontend and backend, where users can select stories, read them, and receive feedback on their pronunciation. The backend processes the user's speech and compares it to the correct phonemes using models and tools such as Wav2Vec2-xlsr-53, phonemizer, and espeak-ng.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Testing](#testing)

## Overview

The Automatic Reading Tutor project consists of two parts:

- **Frontend**: Built with React, the frontend provides an interactive UI for users to select stories, start the microphone for reading, retry any mispronounciation errors made and view overall feedback on their pronunciation.
- **Backend**: The backend is powered by Flask and handles speech-to-text processing using the Wav2Vec2 model and phoneme comparison using espeak-ng.

## Features

- User and Admin login
- Select stories by difficulty level
- Real-time speech-to-text conversion
- Phoneme comparison for pronunciation feedback
- Admin dashboard for managing stories and users

## Backend Setup

The backend is built using Flask and several Python libraries for speech processing and phoneme comparison.

### Requirements

- pip3
- homebrew
- python3
- Python Virtual Environment (venv)

### Installation

1. Navigate to backend directory

   ```bash
   git clone https://gitlab.cs.uct.ac.za/capstone-project-2024/automatic-reading-tutor.git

   cd automatic-reading-tutor/backend
   ```

2. Set up a virtual environment:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the required packages:

   ```bash
   pip3 install -r requirements.txt
   ```

4. Install `espeak-ng` and other necessary libraries:

   ```bash
   brew install espeak-ng
   brew install ncurses libx11
   ```

5. Download and install Festival and MBROLA voices:

   ```bash
   curl -O https://raw.githubusercontent.com/pettarin/setup-festival-mbrola/master/setup_festival_mbrola.sh
   ```

   ```bash
   bash setup_festival_mbrola.sh . festival
   ```

6. Run the Redis server (in a separate terminal):

   ```bash
   redis-server
   ```

   If it fails running on port then:

   ```bash
   redis-server --port <xxxx>
   ```

7. Start the Flask development server:

   ```bash
   flask run
   ```

The Flask backend will be running on [http://localhost:5000](http://localhost:5000).

### Configuration

In `app.py`, ensure that your `UPLOAD_FOLDER` is correctly set in the app configuration:

```python
app.config['UPLOAD_FOLDER'] = 'path_to_your_upload_folder'
```

## Frontend Setup

The frontend is built using React and MDBReact for UI components.

### Requirements

- Node.js (v16 or above)
- NPM (v6 or above)
- MDBReact

### Installation

1. Clone the repository:
   ```bash
   cd automatic-reading-tutor/frontend
   ```
2. Install Dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. The React application will be running on http://localhost:3000.

### Configuration

Ensure the frontend is set to communicate with the backend. Update the package.json file to include the proxy configuration for the Flask backend:

```bash
   "proxy": "http://localhost:5000"
```

## Testing

To run the unit tests for speech_checker.py navigate to the backend directory, and use the following command:

```bash
python3 -m unittest discover -s tests -p "*.py"
```

## Notes:

For flask when running server it automatically goes onto port 5000, so you must disable Settings > General > Airplay Receiver. That receiver is running on port 5000.
