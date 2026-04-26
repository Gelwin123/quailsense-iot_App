"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { Home, BarChart3, User } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="nav">

        {/* LOGO */}
        <div className="logo">
          <img src="/icon/quaillogo.png" />
          <span>QuailSense</span>
        </div>

        {/* DESKTOP LINKS */}
        <div className="links">
          <a href="/dashboard">Dashboard</a>
          <a href="/historical">Historical</a>

          <button onClick={() => setOpen(!open)}>Profile</button>

          {open && (
            <div className="dropdown">
              <p>{user?.email || "Not logged in"}</p>
              <button onClick={logout}>Logout</button>
            </div>
          )}
        </div>

        {/* HAMBURGER */}
        <button
          className="burger"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <>
          <div
            className="overlay"
            onClick={() => setMobileOpen(false)}
          />

          <div className="mobile">
            <a href="/dashboard">
            <Home size={17} />
            <span>Dashboard</span>
          </a>

          <a href="/historical">
            <BarChart3 size={17} />
            <span>Historical</span>
          </a>

            <p className="email">{user?.email || "Not logged in"}</p>

            <button onClick={logout} className="logout">
              Logout
            </button>
          </div>
        </>
      )}

      {/* ================= CSS ================= */}
      <style jsx>{`
        /* GLOBAL RESET */
        :global(body, html) {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
        }

        * {
          box-sizing: border-box;
        }

        /* NAVBAR */
        .nav {
          position: fixed;
          top: 0;
          left: 0;

          width: 100vw;
          height: 64px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 20px;

          background: rgba(4,120,87,0.95);
          backdrop-filter: blur(14px);

          z-index: 9999;

          box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        }

        /* LOGO */
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .logo img {
          height: 38px;
        }

        .logo span {
          font-size: 18px;
          font-weight: 800;
          color: white;
        }

        /* DESKTOP LINKS */
        .links {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .links a,
        .links button {
          padding: 8px 12px;
          border-radius: 10px;

          font-size: 14px;
          font-weight: 600;

          color: white;
          text-decoration: none;

          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.15);

          cursor: pointer;
        }

        /* DROPDOWN */
        .dropdown {
          position: absolute;
          top: 70px;
          right: 16px;

          background: white;
          color: black;

          padding: 12px;
          border-radius: 12px;

          display: flex;
          flex-direction: column;
          gap: 10px;

          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .dropdown button {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 10px;
          cursor: pointer;
        }

        /* HAMBURGER FIX (IMPORTANT PART) */
        .burger {
          display: none;

          position: absolute;
          right: 16px;   /* 🔥 FIX ALIGNMENT */

          flex-direction: column;
          gap: 4px;

          background: none;
          border: none;
          cursor: pointer;
        }

        .burger span {
          width: 26px;
          height: 3px;
          background: white;
          border-radius: 3px;
        }

        /* OVERLAY */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 9998;
        }

        /* MOBILE MENU */
        .mobile {
          position: fixed;
          top: 64px;
          right: 10px;

          width: 240px;

          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(16px);

          padding: 14px;
          border-radius: 14px;

          display: flex;
          flex-direction: column;
          gap: 10px;

          z-index: 9999;

          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
        }

        .mobile a {
          padding: 10px;
          background: #f3f4f6;
          border-radius: 10px;
          text-decoration: none;
          color: black;
          font-weight: 600;
        }

        .email {
          font-size: 12px;
          color: #047857;
          font-weight: 600;
        }

        .logout {
          background: #ef4444;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 10px;
          font-weight: 600;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .links {
            display: none;
          }

          .burger {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}