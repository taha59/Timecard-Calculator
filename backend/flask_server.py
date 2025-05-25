import base64
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from datetime import timedelta, datetime
import os

app = Flask(__name__, static_folder="build", static_url_path="")

GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')

CORS(app, resources={
    r"*": {
        "origins": ['*']
    }
})
client = Groq(api_key=GROQ_API_KEY)

PROMPT = """
You are given an image of a timecard. Your task is to extract the working hours for each day of the week.

Return the result as a JSON list, where each item looks like this:

{
  "day": "Monday",
  "time_in": "08:00 AM",
  "time_out": "04:30 PM"
}

- Only include days that are present on the timecard.
- Use 12-hour format with AM/PM.
- Do not include any extra commentary — just valid JSON.
"""


def clean_response(raw_text: str) -> str:
    # Remove ```json and ``` from start and end if present
    if raw_text.startswith("```json"):
        raw_text = raw_text[len("```json"):].strip()
    if raw_text.endswith("```"):
        raw_text = raw_text[:-3].strip()
    return raw_text

def get_timecard_info(base64_image: str):
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            model="meta-llama/llama-4-maverick-17b-128e-instruct",
        )
        timecard_info = chat_completion.choices[0].message.content.strip()
        
        return clean_response(timecard_info)
    except Exception as e:
        return {"error": str(e)}

def calculate_hours(time_in: str, time_out: str) -> str:
    time_format = "%I:%M %p"  # 12-hour format like "09:44 AM"
    try:
        t_in = datetime.strptime(time_in, time_format)
        t_out = datetime.strptime(time_out, time_format)

        # Handle overnight shifts (e.g., 9 PM to 5 AM)
        if t_out <= t_in:
            t_out = t_out.replace(day=t_out.day + 1)

        duration = t_out - t_in
        
        total_minutes = int(duration.total_seconds() // 60)
        hours = total_minutes // 60
        minutes = total_minutes % 60

        return f"{hours}:{minutes:02d}"
    except Exception:
        return "Invalid time format"

def add_durations(times):
    total_minutes = 0
    for time_str in times:
        if ":" not in time_str:
            continue  # skip invalid formats
        hours, minutes = map(int, time_str.split(":"))
        total_minutes += hours * 60 + minutes

    total_hours = total_minutes // 60
    remaining_minutes = total_minutes % 60
    return f"{total_hours}:{remaining_minutes:02d}"


@app.route('/')
def health_check():
    return "Backend is running!"

@app.route("/upload_timecard", methods=["POST"])
def upload_timecard():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    image_bytes = file.read()
    base64_image = base64.b64encode(image_bytes).decode("utf-8")
    response_text = get_timecard_info(base64_image)

    if isinstance(response_text, dict) and "error" in response_text:
        return jsonify(response_text), 500

    try:
        parsed_json = json.loads(response_text)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse JSON", "raw_response": response_text}), 500

    # Add duration calculation

    hours_list = []
    for entry in parsed_json:
        hours = calculate_hours(entry.get("time_in", ""), entry.get("time_out", ""))

        if hours is None:
            return "Invalid time format"

        hours_list.append(hours)
        entry["hours_worked"] = hours

    total_hours_worked = add_durations(hours_list)
    

    return jsonify({
        "entries": parsed_json,
        "total_hours_worked": total_hours_worked
    })

@app.route("/edit_timecard", methods=["PUT"])
def edit_timecard():

    json_data = request.get_json()
    
    hours_list = []
    for entry in json_data:
        hours = calculate_hours(entry.get("time_in", ""), entry.get("time_out", ""))

        if hours is None:
            return "Invalid time format"

        hours_list.append(hours)
        entry["hours_worked"] = hours

    total_hours_worked = add_durations(hours_list)
    return jsonify({
        "entries": json_data,
        "total_hours_worked": total_hours_worked
    })

if __name__ == "__main__":
    # print(GROQ_API_KEY)
    app.run(debug=True)
