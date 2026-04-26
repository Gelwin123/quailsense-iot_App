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
          style={{ strokeDashoffset, transition: "0.6s ease" }}
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
  const [ammoniaML, setAmmoniaML] = useState<number | null>(null);

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

      setAmmoniaML(values.ammonia_ml ?? 0);
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

  if (isDisconnected) {
    message = "Sensor disconnected.";
    action = "Check ESP32 or Firebase.";
    warning = true;
  } else if (heatCurrent > 40 || ammoniaCurrent > 10) {
    message = "CRITICAL ENVIRONMENT ALERT!";
    action = "Emergency ventilation required.";
    warning = true;
  } else if (heatCurrent > 35) {
    message = "Heat stress detected.";
    action = "Turn ON cooling/ventilation.";
    warning = true;
  } else if (ammoniaCurrent > 6) {
    message = "Ammonia level rising.";
    action = "Ventilation ON.";
    warning = true;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-100 p-4 page">
      <Navbar />
{/* HEADER */}
<div className="flex justify-center items-center mb-6 w-full header">
  <h1 className="text-lg md:text-xl font-bold text-green-900 text-center px-4">
    🐤 Smart Poultry Dashboard
  </h1>
</div>

      {/* SMART INSIGHT */}
      <div className={`smartInsight ${warning ? "danger" : "safe"}`}>
        <div className="insightHeader">
          <div className={`dot ${warning ? "red" : "green"}`} />
          <h2>Smart Insight</h2>
        </div>

        <div className="mlText">
          🤖 ML Predicted Ammonia:{" "}
          <b>
            {ammoniaML !== null && ammoniaML !== undefined
              ? `${ammoniaML.toFixed(2)} ppm`
              : "⏳ Waiting for prediction..."}
          </b>
        </div>

        <p className="message">{message}</p>

        {action && <div className="actionBox">💡 {action}</div>}
      </div>

      {/* GAUGES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto mt-4">
        {Object.keys(sensors).map((key) => {
          const Icon = sensors[key as SensorKey].icon;

          return (
            <div key={key} className="bg-white p-4 rounded-lg shadow gaugeCard">
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

      {/* ================= UI TRANSITION + UPGRADE CSS ================= */}
      <style jsx>{`
        /* PAGE ANIMATION */
        .page {
          animation: pageIn 0.6s ease-out;
           padding-top: 80px;
        }

        @keyframes pageIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* HEADER FLOAT */
        .header {
          transition: all 0.3s ease;
        }

        .header:hover {
          transform: translateY(-2px);
        }

        /* GAUGE CARDS */
        .gaugeCard {
          transition: all 0.3s ease;
        }

        .gaugeCard:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 35px rgba(0,0,0,0.12);
        }

        /* SMART INSIGHT */
        .smartInsight {
          max-width: 340px;
          margin: 0 auto 18px;
          padding: 18px;
          border-radius: 20px;
          text-align: center;

          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(16px);

          transition: all 0.4s ease;
        }

        .smartInsight:hover {
          transform: translateY(-4px);
        }

        /* DOT PULSE */
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          animation: pulse 1.3s infinite;
        }

        .green { background: #22c55e; }
        .red { background: #ef4444; }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* ACTION BOX */
        .actionBox {
          margin-top: 12px;
          padding: 12px;
          border-radius: 14px;
          background: rgba(243,244,246,0.8);
          border-left: 4px solid #22c55e;
          transition: all 0.3s ease;
        }

        .danger .actionBox {
          border-left: 4px solid #ef4444;
        }

        /* TEXT SMOOTHNESS */
        h1, h2, p, span {
          transition: color 0.3s ease;
        }
      `}</style>
    </div>
  );
}