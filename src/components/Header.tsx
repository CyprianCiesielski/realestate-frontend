// 1. Importujemy Link, żeby móc klikać w logo i wracać na start
import { Link } from "react-router-dom";

// 2. Importujemy ikony (jeśli nie zainstalowałeś jeszcze, wpisz w terminalu: npm install react-icons)
import { FaSearch, FaCalendarAlt, FaBell } from "react-icons/fa";

// 3. Importujemy plik CSS (który zaraz stworzysz/uzupełnisz)
import "./Header.css";

export function Header() {
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
      <div className="header-center">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Szukaj projektu..."
            className="search-input"
          />
        </div>
      </div>

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
      </div>
    </header>
  );
}
