import { Outlet, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Project } from "./types";
import { getProjects } from "./api";
import { FaPlus } from "react-icons/fa";
import { CreateProjectModal } from "./CreateProjectModal.tsx";
import "./ProjectLayout.css";

export function ProjectsLayout() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pobieramy listę projektów RAZ (gdy wchodzimy do sekcji projektów)
  useEffect(() => {
    getProjects().then(setProjects).catch(console.error);
  }, []);

  return (
    <div className="projects-layout">
      {/* LEWA KOLUMNA: Lista (Sidebar) */}
      <aside className="projects-sidebar">
        <h3>Projects</h3>
        <nav className="sidebar-nav">
          {projects.map((project) => (
            <NavLink
              key={project.id}
              to={`/projects/${project.id}`}
              className={({ isActive }) =>
                isActive ? "project-link active" : "project-link"
              }
            >
              {project.name}
            </NavLink>
          ))}
        </nav>
        <button
          className="add-project-btn"
          onClick={() => setIsModalOpen(true)}
        >
          Add Project <FaPlus />
        </button>
      </aside>

      {/* PRAWA KOLUMNA: Szczegóły (To się zmienia!) */}
      <main className="projects-content">
        <Outlet />
      </main>
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
  );
}
