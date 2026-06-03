import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaBell, FaPlus, FaAddressCard } from "react-icons/fa";
import "./Header.css";

import { SearchBar } from "../components/searching/SearchBar.tsx";
import { CreateProjectModal } from "../components/project/CreateProjectModal.tsx";
// 👇 Import nowego modala
import { EditProfileModal } from "../features/user/EditProfileModal.tsx";
import type { Project } from "../components/project/types.ts";
import { useAuth } from "../context/AuthContext";
import type { UserDetailData } from "../features/user/types.ts";
import { fetchMyProfile } from "../features/user/api.ts";

export function Header() {
  const { user, logout, isAdmin } = useAuth();

  // Stan dla modala projektu
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  // 👇 Stan dla modala profilu
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUserData, setCurrentUserData] = useState<UserDetailData | null>(
    null,
  );

  // Wyciągamy funkcję ładowania danych na zewnątrz useEffect, aby móc jej użyć ponownie
  const loadUserData = async () => {
    if (user) {
      try {
        const data = await fetchMyProfile();
        setCurrentUserData(data);
      } catch (err) {
        console.error("Błąd pobierania profilu:", err);
      }
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  if (!user) return null;

  const getDisplayInitials = () => {
    if (currentUserData?.firstName && currentUserData?.lastName) {
      return (
        currentUserData.firstName.charAt(0) + currentUserData.lastName.charAt(0)
      ).toUpperCase();
    }
    return user.initial?.toUpperCase() || "?";
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/projects" className="logo-text">
          RealEstate<span style={{ fontWeight: "normal" }}>Tracker</span>
        </Link>

        {(isAdmin || currentUserData?.canCreateProjects) && (
          <button
            className="add-project-btn"
            onClick={() => setIsProjectModalOpen(true)}
          >
            Dodaj Projekt <FaPlus />
          </button>
        )}
      </div>

      <SearchBar />

      <div className="header-right">
        <a
          href="https://calendar.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="icon-btn"
          title="Otwórz Kalendarz Google"
          style={{ textDecoration: "none" }}
        >
          <FaCalendarAlt />
        </a>
        <button className="icon-btn">
          <FaBell />
        </button>

        {/* 👇 Dodano onClick i style kursora */}
        <div
          className="user-avatar"
          style={{ cursor: "pointer" }}
          onClick={() => setIsProfileModalOpen(true)}
          title="Kliknij, aby edytować profil"
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

        {/* Modal Projektu */}
        {isProjectModalOpen && (
          <CreateProjectModal
            onClose={() => setIsProjectModalOpen(false)}
            onSuccess={(newProject) => {
              setProjects([...projects, newProject]);
              setIsProjectModalOpen(false);
            }}
          />
        )}

        {/* 👇 Modal Edycji Profilu */}
        {isProfileModalOpen && currentUserData && (
          <EditProfileModal
            currentUser={currentUserData}
            onClose={() => setIsProfileModalOpen(false)}
            onSuccess={() => {
              // Po udanej edycji, pobierz dane ponownie, żeby zaktualizować inicjały/dymek
              loadUserData();
            }}
          />
        )}
      </div>
    </header>
  );
}
