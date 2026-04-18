"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const [isDesktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();

  /* =========================
     🔐 FIREBASE AUTH LISTENER
  ========================= */
  useEffect(() => {
    setIsClient(true);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  /* =========================
     🚪 LOGOUT
  ========================= */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="navbar">
      {/* Logo + Name */}
      <div className="logo-container">
        <img src="icon/quaillogo.png" alt="QuailSense" className="logo-img" />
        <span className="logo-text">QuailSense</span>
      </div>

      {/* Desktop Links */}
      {isClient && (
        <div className="nav-links">
          <a href="/dashboard" className="link">Dashboard</a>
          <a href="/historical" className="link">Historical Data</a>

          {/* Profile Button */}
          <button
            className="profile-btn"
            onClick={() => setDesktopDropdownOpen(!isDesktopDropdownOpen)}
          >
            Profile
          </button>

          {/* Desktop Dropdown */}
          {isDesktopDropdownOpen && (
            <div className="desktop-dropdown">
              <span className="dropdown-email">
                {user?.email ?? "Not logged in"}
              </span>

              <button
                onClick={handleLogout}
                className="dropdown-item logout-btn"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hamburger */}
      {isClient && (
        <>
          <button
            className="hamburger"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Mobile Dropdown */}
          {isMobileMenuOpen && (
            <div className="mobile-dropdown">
              <a href="/dashboard" className="dropdown-item">Dashboard</a>
              <a href="/historical" className="dropdown-item">Historical Data</a>

              <div className="dropdown-divider"></div>

              <span className="dropdown-email">
                {user?.email ?? "Not logged in"}
              </span>

              <button onClick={handleLogout} className="dropdown-item logout-btn">
                Log Out
              </button>
            </div>
          )}
        </>
      )}

      {/* CSS (UNCHANGED - YOUR ORIGINAL) */}
      <style jsx>{`
        nav.navbar {
          background-color: #047857;
          color: white;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          font-family: Arial, sans-serif;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-img { height: 40px; }
        .logo-text { font-size: 24px; font-weight: 800; }

        .nav-links { display: flex; align-items: center; gap: 12px; position: relative; }

        .link, .profile-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          color: white;
          border: none;
          cursor: pointer;
        }

        .link { background-color: #059669; }
        .profile-btn { background-color: #059669; }

        /* Desktop dropdown */
        .desktop-dropdown {
          position: absolute;
          top: 50px;
          right: 0;
          width: 200px;
          background-color: white;
          color: #1f2937;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 50;
        }

        .desktop-dropdown .dropdown-item {
          background-color: #ef4444;
          color: white;
          padding: 8px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }

        .desktop-dropdown .dropdown-email {
          text-align: center;
          font-weight: 600;
          color: #047857;
        }

        /* Hamburger */
        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 24px;
          height: 18px;
          border: none;
          background: transparent;
          cursor: pointer;
        }

        .hamburger span {
          height: 3px;
          width: 100%;
          background-color: white;
          border-radius: 2px;
        }

        /* Mobile dropdown */
        .mobile-dropdown {
          position: absolute;
          top: 60px;
          right: 12px;
          width: 200px;
          background-color: white;
          color: #1f2937;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }

        .mobile-dropdown .dropdown-item {
          background-color: #059669;
          color: white;
          padding: 8px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          text-decoration: none;
        }

        .mobile-dropdown .logout-btn {
          background-color: #ef4444;
        }

        .mobile-dropdown .dropdown-email {
          text-align: center;
          font-weight: 600;
          color: #047857;
        }

        @media (max-width: 768px) {
          .nav-links a, .profile-btn { display: none; }
          .hamburger { display: flex; }
        }
      `}</style>
    </nav>
  );
}