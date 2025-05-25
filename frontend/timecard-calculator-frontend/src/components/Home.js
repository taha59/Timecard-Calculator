import React, { useState } from 'react';
import axios from 'axios';

function Home() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_SERVER = process.env.REACT_APP_API_BASE_URL;
  console.log("API Base URL:", API_SERVER);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setData(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(API_SERVER+"/upload_timecard", formData);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to process timecard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, field, value) => {
    const updatedEntries = [...data.entries];
    updatedEntries[index][field] = value;
    setData({ ...data, entries: updatedEntries });
  };

  const handleRecalculate = async () => {
  try {
    const payload = data.entries.map(({ day, time_in, time_out }) => ({
      day,
      time_in,
      time_out,
    }));

    const res = await axios.put(API_SERVER+"/edit_timecard", payload);
    setData(res.data);
  } catch (err) {
    console.error(err);
    setError("Failed to recalculate hours.");
  }
};


  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Timecard Calculator</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading} style={{ marginLeft: "1rem" }}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Extracted Timecard</h2>
          <ul>
            {data.entries.map((entry, index) => (
              <li key={index} style={{ marginBottom: "1rem" }}>
                <strong>{entry.day}</strong><br />
                <label>Time In: </label>
                <input
                  type="text"
                  value={entry.time_in}
                  onChange={(e) => handleChange(index, "time_in", e.target.value)}
                  style={{ marginRight: "0.5rem" }}
                />
                <label>Time Out: </label>
                <input
                  type="text"
                  value={entry.time_out}
                  onChange={(e) => handleChange(index, "time_out", e.target.value)}
                  style={{ marginRight: "0.5rem" }}
                />
                <label>Hours Worked: </label>
                <input
                  type="text"
                  value={entry.hours_worked}
                  readOnly
                />
              </li>
            ))}
          </ul>
          <p><strong>Total Hours Worked:</strong> {data.total_hours_worked}</p>
          <button onClick={handleRecalculate} style={{ marginTop: "1rem" }}>
            Recalculate Hours
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
