// 1. Importujemy Link, żeby móc klikać w logo i wracać na start
import { Link } from "react-router-dom";

// 2. Importujemy ikony (jeśli nie zainstalowałeś jeszcze, wpisz w terminalu: npm install react-icons)
import { FaCalendarAlt, FaBell } from "react-icons/fa";

// 3. Importujemy plik CSS (który zaraz stworzysz/uzupełnisz)
import "./Header.css";
import { SearchBar } from "../features/searching/SearchBar.tsx";
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { user, logout, isAdmin } = useAuth();

  // --- DIAGNOSTYKA ---
  console.log("=== DEBUG HEADER ===");
  console.log("User object:", user);
  console.log("Is Admin?:", isAdmin);
  // -------------------

  if (!user) return null; // Nie pokazuj nagłówka na stronie logowania
  return (
    // GŁÓWNE PUDEŁKO (Rodzic)
    <header className="header">
      {/* --- SEKCJA LEWA: Logo / Nazwa --- */}
      <div className="header-left">
        {/* Link działa jak <a>, ale nie przeładowuje całej strony */}
        <Link to="/projects" className="logo-text">
          RealEstate<span style={{ fontWeight: "normal" }}>Tracker</span>
        </Link>
      </div>

      {/* --- SEKCJA ŚRODKOWA: Wyszukiwarka --- */}
      <SearchBar />

      {/* --- SEKCJA PRAWA: Ikony --- */}
      <div className="header-right">
        <button className="icon-btn">
          <FaCalendarAlt />
        </button>

        <button className="icon-btn">
          <FaBell />
        </button>

        {/* Udawany awatar użytkownika */}
        <div className="user-avatar">CC</div>

        <span>{user.email}</span>
        <button onClick={logout}>Wyloguj</button>

        {isAdmin && (
            <Link to="/admin" style={{ color: 'red', marginRight: '15px', fontWeight: 'bold' }}>
                Panel Admina
            </Link>
        )}
      </div>
    </header>
  );
}
