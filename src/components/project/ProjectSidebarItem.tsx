import { NavLink, useParams } from "react-router-dom";
import type { Project } from "./types";
import { PillarSidebarItem } from "../pillar/PillarSidebarItem";

interface ProjectSidebarItemProps {
  project: Project;
}

export function ProjectSidebarItem({ project }: ProjectSidebarItemProps) {
  // Pobieramy parametry z URL (dodajemy pillarId)
  const { projectId, pillarId, itemId } = useParams<{
    projectId: string;
    pillarId: string;
    itemId: string;
  }>();

  // 1. Czy drzewo powinno być widoczne?
  // ZMIANA: Pokazujemy drzewo jeśli jest ID itemu LUB ID filaru
  const isTreeVisible = Boolean(itemId) || Boolean(pillarId);

  // 2. Czy ten konkretny projekt jest tym aktywnym?
  const isThisProjectActive = String(project.id) === projectId;

  // Jeśli to nie jest aktywny projekt lub nie jesteśmy w trybie szczegółowym (filar lub item)
  // to wyświetlamy płaski link.
  if (!isTreeVisible || !isThisProjectActive) {
    return (
      <NavLink
        to={`/projects/${project.id}`}
        className={({ isActive }) =>
          isActive ? "project-link active" : "project-link"
        }
      >
        {project.name}
      </NavLink>
    );
  }

  // W PRZECIWNYM RAZIE: Wyświetlamy drzewo filarów
  return (
    <div className="project-sidebar-container active-tree">
      <NavLink
        to={`/projects/${project.id}`}
        className="project-link-root active"
      >
        {project.name}
      </NavLink>

      <div className="pillar-list-nested">
        {(project.pillars || []).map((pillar) => (
          <PillarSidebarItem
            key={pillar.id}
            pillar={pillar}
            projectId={String(project.id)}
          />
        ))}
      </div>
    </div>
  );
}
