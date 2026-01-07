import { Outlet } from "react-router-dom";
import { ProjectSidebarItem } from "./ProjectSidebarItem";
import { useEffect, useState } from "react";
import type { Project } from "./types";
import { getProjects } from "./api";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./ProjectLayout.css";
import { useRefresh } from "../../context/RefreshContext";

export function ProjectsLayout() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Pobieramy listę projektów RAZ (gdy wchodzimy do sekcji projektów)
  useEffect(() => {
    getProjects().then(setProjects).catch(console.error);
  }, []);

  const { refreshTrigger } = useRefresh();

  useEffect(() => {
    getProjects().then(setProjects).catch(console.error);
  }, [refreshTrigger]);

  return (
    <div
      className={`projects-layout ${!isSidebarOpen ? "sidebar-collapsed" : ""}`}
    >
      {/* LEWA KOLUMNA: Lista (Sidebar) */}
      <aside className="projects-sidebar">
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Zwiń pasek" : "Rozwiń pasek"}
        >
          {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        {/* Zawartość sidebaru owijamy w div, żeby łatwo go ukryć */}
        <div className="sidebar-content-wrapper">
          <h3>Projects</h3>
          <nav className="sidebar-nav">
            {projects.map((project) => (
              <ProjectSidebarItem key={project.id} project={project} />
            ))}
          </nav>
        </div>
      </aside>

      {/* PRAWA KOLUMNA */}
      <main className="projects-content">
        <Outlet />
      </main>
    </div>
  );
}
