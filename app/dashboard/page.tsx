"use client";

import { useEffect, useState } from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";
import Navbar from "@/components/Navbar";
import {
  Thermometer,
  Droplets,
  Wind,
  AlertTriangle,
} from "lucide-react";

import { database } from "../../lib/firebase";
import { ref, onValue } from "firebase/database";

type SensorKey = "temperature" | "humidity" | "heat" | "ammonia";

/* =========================
   🔵 CIRCULAR GAUGE
========================= */
interface GaugeProps {
  value: number;
  max?: number;
  label: string;
  unit: string;
  color: string;
}

const CircularGauge = ({
  value,
  max = 100,
  label,
  unit,
  color,
}: GaugeProps) => {
  const radius = 45;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg height={radius * 2} width={radius * 2}>
        <circle stroke="#e5e7eb" fill="transparent" strokeWidth={stroke}
          r={normalizedRadius} cx={radius} cy={radius} />

        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: "0.5s" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />

        <text
          x={radius}
          y={radius + 10}
          textAnchor="middle"
          fontSize={14}
          fontWeight="bold"
        >
          {Math.round(value * 10) / 10}
        </text>
      </svg>

      {/* SENSOR LABEL FONT IMPROVED */}
      <p className="text-xs font-semibold tracking-wide text-gray-600 mt-1 uppercase">
        {label} ({unit})
      </p>
    </div>
  );
};

export default function DashboardPage() {
  const MAX = 10;

  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [data, setData] = useState<Record<SensorKey, number[]>>({
    temperature: Array(MAX).fill(0),
    humidity: Array(MAX).fill(0),
    heat: Array(MAX).fill(0),
    ammonia: Array(MAX).fill(0),
  });

  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    const sensorsRef = ref(database, "/sensors");

    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const values = snapshot.val();

      if (!values) {
        setFirebaseError("No data found at /sensors.");
        return;
      }

      setData((prev) => ({
        temperature: [...prev.temperature.slice(-MAX + 1), values.temperature ?? 0],
        humidity: [...prev.humidity.slice(-MAX + 1), values.humidity ?? 0],
        heat: [...prev.heat.slice(-MAX + 1), values.heat_index ?? 0],
        ammonia: [...prev.ammonia.slice(-MAX + 1), values.nh3 ?? 0],
      }));

      setLastUpdate(new Date());
      setFirebaseError(null);
    });

    return () => unsubscribe();
  }, []);

  const sensors = {
    temperature: { color: "#22c55e", max: 50, icon: Thermometer },
    humidity: { color: "#0ea5e9", max: 100, icon: Droplets },
    heat: { color: "#ef4444", max: 50, icon: Wind },
    ammonia: { color: "#eab308", max: 20, icon: AlertTriangle },
  };
  
 const tempCurrent = data.temperature.at(-1) ?? 0;
const humCurrent = data.humidity.at(-1) ?? 0;
const ammoniaCurrent = data.ammonia.at(-1) ?? 0;
const heatCurrent = data.heat.at(-1) ?? 0;

const now = new Date();
const isDisconnected =
  !lastUpdate || now.getTime() - lastUpdate.getTime() > 10000;

let message = "Environment stable.";
let warning = false;
let action = "";

// =========================
// 🧠 TREND ANALYSIS
// =========================
const ammoniaHistory = data.ammonia;

const risingTrend =
  ammoniaHistory.length >= 3 &&
  ammoniaHistory[ammoniaHistory.length - 1] >
    ammoniaHistory[ammoniaHistory.length - 2] &&
  ammoniaHistory[ammoniaHistory.length - 2] >
    ammoniaHistory[ammoniaHistory.length - 3];

const avgNH3 =
  ammoniaHistory.reduce((a, b) => a + b, 0) / ammoniaHistory.length;

const persistentAmmonia = avgNH3 > 6;

// =========================
// 🧠 INFERRED CONDITIONS
// =========================
const heatStress = heatCurrent > 35;
const extremeHeat = heatCurrent > 40;
const ammoniaStress = ammoniaCurrent > 6;
const ammoniaDanger = ammoniaCurrent > 10;

const wetLitterRisk =
  humCurrent > 75 && ammoniaCurrent > 6 && heatCurrent > 35;

// =========================
// 🚨 PRIORITY LOGIC (HIGHEST FIRST)
// =========================

if (isDisconnected) {
  message = "Sensor disconnected.";
  action = "Check ESP32 or Firebase.";
  warning = true;
}

// 🔴 CRITICAL EMERGENCY
else if (extremeHeat || ammoniaDanger) {
  message = "CRITICAL ENVIRONMENT ALERT!";
  action = "Emergency ventilation + cooling required.";
  warning = true;
}

// 🟠 COMBINED STRESS
else if (heatStress && ammoniaStress) {
  message = "Heat + Ammonia stress detected.";
  action = "Increase ventilation immediately.";
  warning = true;
}

// 🟡 HEAT STRESS
else if (heatStress) {
  message = "Heat stress detected.";
  action = "Turn ON cooling/ventilation.";
  warning = true;
}

// 🟡 AMMONIA STRESS
else if (ammoniaStress) {
  message = "Ammonia level rising.";
  action = "Ventilation ON.";
  warning = true;
}

// 🟡 COLD CONDITION
else if (tempCurrent < 28) {
  message = "Low temperature detected.";
  action = "Heating ON.";
  warning = true;
}

// =========================
// 🧠 SMART INFERENCE LAYER
// (THIS IS YOUR UPGRADE)
// =========================

// 🔵 Wet litter inference
else if (wetLitterRisk) {
  message = "Possible wet litter detected.";
  action = "Check bedding moisture immediately.";
  warning = true;
}

// 🔵 Rising ammonia trend
else if (risingTrend && ammoniaCurrent > 6) {
  message = "Ammonia is rising continuously.";
  action = "Inspect ventilation and litter condition.";
  warning = true;
}

// 🔵 Persistent ammonia problem
else if (persistentAmmonia) {
  message = "Persistent ammonia levels detected.";
  action = "Perform coop cleaning and maintenance.";
  warning = true;
}

// 🟢 NORMAL STATE
else {
  message = "Environment stable.";
  action = "No action needed.";
  warning = false;
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-100 p-4">
      <Navbar />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-green-900">🐤 Dashboard</h1>
      </div>

      {/* ================= SMART INSIGHT (SMALLER) ================= */}
      <div className={`smartInsight ${warning ? "danger" : "safe"}`}>
        <div className="insightHeader">
          <div className={`dot ${warning ? "red" : "green"}`} />
          <h2>Smart Insight</h2>
        </div>

        <p className="message">{message}</p>

        {action && (
          <div className="actionBox">
            <p className="actionText">💡 {action}</p>
          </div>
        )}
      </div>

      {/* GAUGES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto mt-4">
        {Object.keys(sensors).map((key) => {
          const Icon = sensors[key as SensorKey].icon;

          return (
            <div key={key} className="bg-white p-4 rounded-lg shadow">
              
              {/* ICON + TITLE FONT ADDED */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon size={16} />
                <span className="text-sm font-bold uppercase tracking-wide text-gray-700">
                  {key}
                </span>
              </div>

              <CircularGauge
                value={data[key as SensorKey].at(-1) ?? 0}
                label={key}
                unit="value"
                color={sensors[key as SensorKey].color}
                max={sensors[key as SensorKey].max}
              />

              <Sparklines data={data[key as SensorKey]} height={30}>
                <SparklinesLine color={sensors[key as SensorKey].color} />
              </Sparklines>
            </div>
          );
        })}
      </div>

      {/* ================= CSS ================= */}
      <style jsx>{`
        .smartInsight {
          max-width: 300px;   /* SMALLER BOX */
          margin: 0 auto 18px auto;
          padding: 14px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 10px 20px rgba(0,0,0,0.12);
          background: white;
        }

        .safe {
          background: linear-gradient(145deg, #ecfdf5, #ffffff);
        }

        .danger {
          background: linear-gradient(145deg, #fef2f2, #ffffff);
        }

        .insightHeader {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .insightHeader h2 {
          font-size: 14px;
          font-weight: 800;
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .green { background: #22c55e; }
        .red { background: #ef4444; }

        .message {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }

        .actionBox {
          margin-top: 10px;
          padding: 10px;
          border-radius: 10px;
          background: #f3f4f6;
        }

        .actionText {
          font-size: 12px;
          font-weight: 600;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}