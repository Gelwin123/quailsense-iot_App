"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      console.error("Signup Error:", err);

      switch (err.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format.");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters.");
          break;
        default:
          setError("Signup failed. Please try again.");
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
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
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      ></div>

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          border: "1px solid #bbf7d0",
          borderRadius: "1.5rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          width: "300px",
          overflow: "hidden", // 🔥 important for header rounding
          animation: "fadeIn 0.6s ease-out forwards",
        }}
      >
        {/* GREEN HEADER (LOGO + TITLE ONLY) */}
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

        {/* CONTENT BELOW */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ textAlign: "center", color: "#15803d", fontSize: "0.9rem" }}>
            Create your account to monitor your quail farm
          </p>

          {/* ERROR / SUCCESS */}
          {error && (
            <p style={{ color: "#dc2626", textAlign: "center", fontWeight: 500 }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ color: "#16a34a", textAlign: "center", fontWeight: 500 }}>
              {success}
            </p>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSignup}
            style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
                background: "linear-gradient(to right, #16a34a, #facc15)",
                color: "white",
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
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
              Sign Up
            </button>
          </form>

          {/* LOGIN LINK */}
          <p style={{ textAlign: "center", color: "#15803d", fontSize: "0.85rem" }}>
            Already have an account?{" "}
            <a href="/login" style={{ textDecoration: "underline", color: "#065f46" }}>
              Login
            </a>
          </p>

          {/* FOOTER */}
          <div
            style={{
              textAlign: "center",
              color: "#166534",
              fontSize: "0.75rem",
            }}
          >
            &copy; {new Date().getFullYear()} Quail IoT Farm System
          </div>
        </div>
      </div>

      {/* ANIMATION */}
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