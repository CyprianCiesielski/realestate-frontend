import { Outlet, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Project } from "./types";
import { getProjects } from "./api";
import "./ProjectLayout.css"; // Zaraz go stworzymy

export function ProjectsLayout() {
  const [projects, setProjects] = useState<Project[]>([]);

  // Pobieramy listę projektów RAZ (gdy wchodzimy do sekcji projektów)
  useEffect(() => {
    getProjects().then(setProjects).catch(console.error);
  }, []);

  return (
    <div className="projects-layout">
      {/* LEWA KOLUMNA: Lista (Sidebar) */}
      <aside className="projects-sidebar">
        <h3>Projekty</h3>
        <nav>
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
      </aside>

      {/* PRAWA KOLUMNA: Szczegóły (To się zmienia!) */}
      <main className="projects-content">
        <Outlet />
      </main>
    </div>
  );
}
