"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { database } from "../../lib/firebase";
import { ref, onValue } from "firebase/database";

type SensorData = {
  temperature: number;
  humidity: number;
  heat: number;
  ammonia: number;
  time: string;
  date: string;
};

export default function HistoricalPage() {
  const [records, setRecords] = useState<SensorData[]>([]);
  const [filtered, setFiltered] = useState<SensorData[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    const sensorRef = ref(database, "/sensorsLogs");

    return onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setRecords([]);
        return;
      }

      const loaded: SensorData[] = Object.values(data);
      const sorted = loaded.sort((a, b) => (a.time < b.time ? 1 : -1));

      setRecords(sorted);
    });
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setFiltered(records.filter((r) => r.date === selectedDate));
  }, [selectedDate, records]);

  const exportCSV = () => {
    if (!filtered.length) return alert("No data to export");

    const headers = ["Date", "Time", "Temp", "Humidity", "Heat", "Ammonia"];

    const rows = filtered.map((r) => [
      r.date,
      r.time,
      r.temperature,
      r.humidity,
      r.heat,
      r.ammonia,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `sensor-${selectedDate}.csv`;
    a.click();
  };

  return (
    <div className="page">
      <Navbar />

      <div className="container">
        {/* HEADER */}
        <div className="header">
          <h1>📊 Sensor History</h1>

          <div className="controls">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <button onClick={exportCSV}>⬇ Export CSV</button>
          </div>
        </div>

        <p className="latestText">📡 Latest Readings</p>

        {/* SUMMARY CARDS */}
        {filtered.length > 0 && (
          <div className="cards">
            <div className="card">🌡 {filtered[0].temperature}°C</div>
            <div className="card">💧 {filtered[0].humidity}%</div>
            <div className="card">🔥 {filtered[0].heat}°C</div>

            <div className="card ammoniaCard">
              ☠ {filtered[0].ammonia} ppm
              <span
                className={`tag ${
                  filtered[0].ammonia > 10
                    ? "danger"
                    : filtered[0].ammonia > 6
                    ? "warning"
                    : "safe"
                }`}
              >
                {filtered[0].ammonia > 10
                  ? "Danger"
                  : filtered[0].ammonia > 6
                  ? "Warning"
                  : "Safe"}
              </span>
            </div>
          </div>
        )}

        {/* DATA CARDS */}
        <div className="dataSection">
          {filtered.length === 0 ? (
            <p className="empty">No data found</p>
          ) : (
            filtered.map((r, i) => (
              <div key={i} className="dataCard">
                <div className="top">
                  <span>#{i + 1}</span>
                  <span>{r.time}</span>
                </div>

                <div className="grid">
                  <p>🌡 Temp: {r.temperature}°C</p>
                  <p>💧 Humidity: {r.humidity}%</p>
                  <p>🔥 Heat: {r.heat}°C</p>

                  <div className="ammoniaBox">
                    <p>☠ Ammonia: {r.ammonia} ppm</p>

                    <span
                      className={`tag ${
                        r.ammonia > 10
                          ? "danger"
                          : r.ammonia > 6
                          ? "warning"
                          : "safe"
                      }`}
                    >
                      {r.ammonia > 10
                        ? "Danger"
                        : r.ammonia > 6
                        ? "Warning"
                        : "Safe"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===================== UI UPGRADE ONLY ===================== */}
      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 16px;
          font-family: system-ui;

          /* STRONG VISIBLE FARM DASHBOARD BACKGROUND */
          background: 
            radial-gradient(circle at top left, #a7f3d0, transparent 55%),
            radial-gradient(circle at bottom right, #bbf7d0, transparent 55%),
            linear-gradient(135deg, #ecfdf5, #f0fdf4);

          animation: fadeIn 0.6s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .container {
          max-width: 950px;
          margin: auto;
        }

        /* HEADER */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;

          padding: 16px;
          border-radius: 18px;

          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(14px);

          box-shadow: 0 15px 35px rgba(0,0,0,0.08);
        }

        h1 {
          font-size: 22px;
          font-weight: 900;
          color: #064e3b;
        }

        .controls {
          display: flex;
          gap: 10px;
        }

        input {
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: white;
          transition: 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.2);
        }

        button {
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          padding: 8px 14px;
          border-radius: 10px;
          border: none;
          cursor: pointer;

          font-weight: 700;
          box-shadow: 0 10px 20px rgba(5,150,105,0.25);
          transition: 0.25s;
        }

        button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(5,150,105,0.35);
        }

        /* SUMMARY */
        .cards {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .card {
          background: white;
          padding: 14px;
          border-radius: 16px;
          text-align: center;
          font-weight: 800;

          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          transition: 0.25s;
        }

        .card:hover {
          transform: translateY(-6px);
        }

        /* DATA */
        .dataSection {
          margin-top: 22px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dataCard {
          background: white;
          padding: 14px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          transition: 0.25s;
        }

        .dataCard:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 35px rgba(0,0,0,0.12);
        }

        .top {
          display: flex;
          justify-content: space-between;
          font-weight: 800;
          color: #047857;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          margin-top: 10px;
          font-size: 14px;
          gap: 8px;
        }

        .ammoniaBox {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* TAGS */
        .tag {
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 999px;
          font-weight: 800;
          width: fit-content;
        }

        .safe {
          background: #22c55e;
          color: white;
        }

        .warning {
          background: #facc15;
          color: #111827;
        }

        .danger {
          background: #ef4444;
          color: white;
        }

        .empty {
          text-align: center;
          color: #6b7280;
          padding: 30px;
        }

        @media (max-width: 768px) {
          .cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
          }

          button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}