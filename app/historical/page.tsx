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
  time_readable?: string;
};

export default function HistoricalPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [records, setRecords] = useState<SensorData[]>([]);

  const [latest, setLatest] = useState<SensorData>({
    temperature: 0,
    humidity: 0,
    heat: 0,
    ammonia: 0,
    time_readable: "",
  });

  /* =========================
     🔴 FIREBASE REALTIME HISTORY
  ========================= */
  useEffect(() => {
    const sensorRef = ref(
      database,
      `/sensorsHistory/${selectedDate}`
    );

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setRecords([]);
        return;
      }

      // convert Firebase object → array
      const list: SensorData[] = Object.values(data);

      // 🧠 sort by time_readable (chronological order)
      const sortedList = list.sort((a, b) => {
        const t1 = a.time_readable ?? "";
        const t2 = b.time_readable ?? "";
        return t1.localeCompare(t2);
      });

      setRecords(sortedList);

      // latest record
      if (sortedList.length > 0) {
        setLatest(sortedList[sortedList.length - 1]);
      }
    });

    return () => unsubscribe();
  }, [selectedDate]);

  return (
    <div className="page">
      <Navbar />

      <div className="container">
        <h1 className="title">
          📅 Historical Monitoring (Live Firebase Logs)
        </h1>

        {/* DATE PICKER */}
        <div className="calendar">
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* 🔴 LATEST READINGS */}
        <div className="latestBox">
          <div>🌡 Temperature: {latest.temperature} °C</div>
          <div>💧 Humidity: {latest.humidity} %</div>
          <div>🔥 Heat: {latest.heat} °C</div>
          <div>☠ Ammonia: {latest.ammonia} ppm</div>
        </div>

        {/* 📊 TABLE LOGS */}
        <div className="logBox">
          <h3>📡 Sensor Logs ({selectedDate})</h3>

          {records.length === 0 ? (
            <p className="empty">No data available for this date</p>
          ) : (
            <div className="tableWrapper">
              <table className="dataTable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Time</th>
                    <th>🌡 Temp (°C)</th>
                    <th>💧 Humidity (%)</th>
                    <th>🔥 Heat (°C)</th>
                    <th>☠ Ammonia (ppm)</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{r.time_readable ?? "N/A"}</td>
                      <td>{r.temperature}</td>
                      <td>{r.humidity}</td>
                      <td>{r.heat}</td>
                      <td>{r.ammonia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= CSS ================= */}
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #ecfdf5;
          padding: 20px;
          font-family: Arial;
        }

        .container {
          max-width: 1000px;
          margin: auto;
        }

        .title {
          font-size: 22px;
          font-weight: bold;
          color: #065f46;
          margin-bottom: 15px;
        }

        .calendar {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 15px;
        }

        .calendar input {
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        .latestBox {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 20px;
          font-weight: bold;
        }

        .latestBox div {
          background: white;
          padding: 10px;
          border-radius: 10px;
        }

        .tableWrapper {
          overflow-x: auto;
        }

        .dataTable {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 10px;
          overflow: hidden;
        }

        .dataTable th {
          background: #065f46;
          color: white;
          padding: 10px;
          text-align: left;
        }

        .dataTable td {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }

        .dataTable tr:hover {
          background: #f0fdf4;
        }

        .empty {
          color: gray;
          font-style: italic;
        }

        @media (max-width: 600px) {
          .latestBox {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}