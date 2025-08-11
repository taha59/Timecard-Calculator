# Timecard-Reader

## Inspiration
This web app was built to make my dad’s life easier. He owns a retail business and uses old-school handwritten timecards to track employee hours. I wanted to help automate this process, so I created an app that allows him to upload images of the timecards. The app then extracts the "time in" and "time out" information and calculates the total hours worked for each employee. Now, he no longer has to do the math by hand.

## Features
- Upload handwritten timecard images
- Extracts clock-in and clock-out times using Llama 4 AI
- Calculates total hours worked automatically
- Simple and intuitive mobile friendly interface

## Installation

Clone the repository:
 ```bash
 git clone https://github.com/your-username/timecard-reader.git
 cd timecard-reader
 ```

## Backend Setup

Navigate to ```backend``` directory the do the following:

### Create a .env file
```env
GROQ_API_KEY = <groq api key>
```

### Install backend dependencies
```bash
 pip install -r requirements.txt
```

### Start flask server
```bash
python3 flask_server.py
```
## Frontend Setup

Navigate to ```frontend``` directory
### Create a .env file
```env
VITE_API_BASE_URL=http://127.0.0.1:5000
```

### Install frontend dependencies:
```
npm install
```

### Start react server
```bash
npm run dev
```



