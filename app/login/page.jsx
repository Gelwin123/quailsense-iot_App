"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Incorrect email or password.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url('/quailsbg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "280px",
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          border: "1px solid #bbf7d0",
          borderRadius: "0.75rem", // ✅ more square
          boxShadow: "0 15px 30px rgba(0,0,0,0.25)",
          overflow: "hidden",
          animation: "fadeIn 0.6s ease-out",
        }}
      >
        {/* GREEN HEADER */}
        <div
          style={{
            background: "linear-gradient(to right, #16a34a, #22c55e)",
            padding: "1.5rem 1rem",
            textAlign: "center",
          }}
        >
          <img
            src="/icon/quaillogo.png"
            alt="QuailSense Logo"
            style={{
              width: "110px",
              height: "110px",
              objectFit: "contain",
              marginBottom: "0.5rem",
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
            }}
          />

          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              color: "white",
            }}
          >
            QuailSense
          </h1>
        </div>

        {/* CONTENT */}
        <div
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <p style={{ textAlign: "center", color: "#15803d", fontSize: "0.9rem" }}>
            Smart Quail Farm Monitoring System
          </p>

          {error && (
            <p style={{ color: "#dc2626", textAlign: "center" }}>
              {error}
            </p>
          )}

          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
          >
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "0.6rem",
                borderRadius: "0.6rem",
                border: "1px solid #bbf7d0",
                outline: "none",
                fontSize: "0.9rem",
              }}
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "0.6rem",
                borderRadius: "0.6rem",
                border: "1px solid #bbf7d0",
                outline: "none",
                fontSize: "0.9rem",
              }}
            />

            <button
              type="submit"
              style={{
                padding: "0.6rem",
                borderRadius: "0.8rem",
                fontWeight: "bold",
                color: "white",
                background: "linear-gradient(to right, #16a34a, #facc15)",
                cursor: "pointer",
                transition: "transform 0.3s",
                fontSize: "0.9rem",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              Login
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#15803d" }}>
            Don’t have an account?{" "}
            <a href="/signup" style={{ textDecoration: "underline", color: "#065f46" }}>
              Sign Up
            </a>
          </p>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.75rem",
              color: "#166534",
            }}
          >
            © {new Date().getFullYear()} QuailSense IoT System
          </p>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}