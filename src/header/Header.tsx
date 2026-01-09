import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaBell, FaPlus, FaAddressCard } from "react-icons/fa";
import "./Header.css";

import { SearchBar } from "../components/searching/SearchBar.tsx";
import { CreateProjectModal } from "../components/project/CreateProjectModal.tsx";
import type { Project } from "../components/project/types.ts";
import { useAuth } from "../context/AuthContext";
import type { UserDetailData } from "../features/user/types.ts";
import { fetchMyProfile } from "../features/user/api.ts";

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUserData, setCurrentUserData] = useState<UserDetailData | null>(
    null,
  );

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          // Pobieramy dane zalogowanej osoby bez przekazywania ID w URL
          const data = await fetchMyProfile();
          setCurrentUserData(data);
        } catch (err) {
          console.error("Błąd pobierania profilu:", err);
        }
      }
    };
    loadUserData();
  }, [user]);

  if (!user) return null;

  const getDisplayInitials = () => {
    // Używamy firstName i lastName zgodnie z Twoim interfejsem UserDetailData
    if (currentUserData?.firstName && currentUserData?.lastName) {
      return (
        currentUserData.firstName.charAt(0) + currentUserData.lastName.charAt(0)
      ).toUpperCase();
    }
    // Jeśli dane się jeszcze ładują, pokazujemy inicjał z maila (z AuthContext)
    return user.initial?.toUpperCase() || "?";
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/projects" className="logo-text">
          RealEstate<span style={{ fontWeight: "normal" }}>Tracker</span>
        </Link>

        {isAdmin && (
          <button
            className="add-project-btn"
            onClick={() => setIsModalOpen(true)}
          >
            Dodaj Projekt <FaPlus />
          </button>
        )}
      </div>

      <SearchBar />

      <div className="header-right">
        <button className="icon-btn">
          <FaCalendarAlt />
        </button>
        <button className="icon-btn">
          <FaBell />
        </button>

        {/* Wyświetlanie inicjałów z imienia i nazwiska */}
        <div
          className="user-avatar"
          title={
            currentUserData
              ? `${currentUserData.firstName} ${currentUserData.lastName}`
              : "Profil"
          }
        >
          {getDisplayInitials()}
        </div>

        <button onClick={logout} className="logout-btn">
          Wyloguj
        </button>

        {isAdmin && (
          <Link to="/admin" className="admin-btn">
            <FaAddressCard />
          </Link>
        )}

        {isModalOpen && (
          <CreateProjectModal
            onClose={() => setIsModalOpen(false)}
            onSuccess={(newProject) => {
              setProjects([...projects, newProject]);
              setIsModalOpen(false);
            }}
          />
        )}
      </div>
    </header>
  );
}
