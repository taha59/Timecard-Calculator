import React, { useState } from 'react';
import axios from 'axios';
import './../styles/Home.css';

function Home() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_SERVER = process.env.REACT_APP_API_BASE_URL;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setData([]);
    setSelectedCardIndex(0);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_SERVER}/upload_timecard`, formData);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to process timecard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (dayIndex, field, value) => {
    const updatedCards = [...data];
    updatedCards[selectedCardIndex].days[dayIndex][field] = value;
    setData(updatedCards);
  };

  const handleRecalculate = async () => {
    try {
      const res = await axios.put(`${API_SERVER}/edit_timecard`, data[selectedCardIndex].days);
      const updatedCards = [...data];
      updatedCards[selectedCardIndex].days = res.data.entries;
      updatedCards[selectedCardIndex].total_hours_worked = res.data.total_hours_worked;
      setData(updatedCards);
    } catch (err) {
      console.error(err);
      setError("Failed to recalculate hours.");
    }
  };

  const selectedCard = data[selectedCardIndex];

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2 className="sidebar-title">Timecards</h2>
        <ul className="timecard-list">
          {data.map((card, idx) => (
            <li
              key={idx}
              onClick={() => setSelectedCardIndex(idx)}
              className={`timecard-item ${idx === selectedCardIndex ? 'active' : ''}`}
            >
              {card.name || `Timecard ${idx + 1}`}
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        <h1>Timecard Calculator</h1>
        <div className="upload-section">
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {selectedCard && (
          <div className="timecard-details">
            <h2>{selectedCard.name || `Timecard ${selectedCardIndex + 1}`}</h2>
            <ul className="day-list">
              {selectedCard.days.map((entry, dayIndex) => (
                <li key={dayIndex} className="day-entry">
                  <strong>{entry.day}</strong><br />

                  <label>Time In: </label>
                  <input
                    type="text"
                    className="time-input"
                    value={entry.time_in?.split(' ')[0] || ""}
                    onChange={(e) =>
                      handleChange(dayIndex, "time_in", `${e.target.value} ${entry.time_in?.split(' ')[1] || "AM"}`)
                    }
                  />
                  <select
                    className="time-select"
                    value={entry.time_in?.split(' ')[1] || "AM"}
                    onChange={(e) =>
                      handleChange(dayIndex, "time_in", `${entry.time_in?.split(' ')[0] || ""} ${e.target.value}`)
                    }
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                  
                  <label>Time Out: </label>
                  <input
                    type="text"
                    className="time-input"
                    value={entry.time_out?.split(' ')[0] || ""}
                    onChange={(e) =>
                      handleChange(dayIndex, "time_out", `${e.target.value} ${entry.time_out?.split(' ')[1] || "AM"}`)
                    }
                  />
                  <select
                    className="time-select"
                    value={entry.time_out?.split(' ')[1] || "AM"}
                    onChange={(e) =>
                      handleChange(dayIndex, "time_out", `${entry.time_out?.split(' ')[0] || ""} ${e.target.value}`)
                    }
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>


                  <label>Hours Worked: </label>
                  <input type="text" 
                  value={entry.hours_worked} 
                  className="time-input"
                  readOnly />
                </li>
              ))}
            </ul>
            <p><strong>Total Hours Worked:</strong> {selectedCard.total_hours_worked}</p>
            <button onClick={handleRecalculate} className="recalculate-btn">
              Recalculate Hours
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
