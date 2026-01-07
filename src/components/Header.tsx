// 1. Importujemy Link, żeby móc klikać w logo i wracać na start
import { Link } from "react-router-dom";

// 2. Importujemy ikony (jeśli nie zainstalowałeś jeszcze, wpisz w terminalu: npm install react-icons)
import { FaCalendarAlt, FaBell, FaAddressCard } from "react-icons/fa";

// 3. Importujemy plik CSS (który zaraz stworzysz/uzupełnisz)
import "./Header.css";
import { SearchBar } from "./searching/SearchBar.tsx";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const { user, logout, isAdmin } = useAuth();

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
        <div className="user-avatar">{user.initial}</div>

        <button onClick={logout} className="logout-btn">
          Wyloguj
        </button>

        {isAdmin && (
          <Link to="/admin" className="admin-btn">
            <FaAddressCard />
          </Link>
        )}
      </div>
    </header>
  );
}
