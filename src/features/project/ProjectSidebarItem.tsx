import { NavLink, useParams } from "react-router-dom";
import type { Project } from "./types";
import { PillarSidebarItem } from "../pillar/PillarSidebarItem";

interface ProjectSidebarItemProps {
  project: Project;
}

export function ProjectSidebarItem({ project }: ProjectSidebarItemProps) {
  // Pobieramy oba parametry z URL
  const { projectId, itemId } = useParams<{
    projectId: string;
    itemId: string;
  }>();

  // 1. Czy jesteśmy w trybie "głębokim" (czy w URL jest ID Itemu?)
  // To jest kluczowa zmiana: drzewo rozwijamy TYLKO jak jest itemId.
  const isDeepDetailView = Boolean(itemId);

  // 2. Czy ten konkretny projekt jest tym aktywnym?
  const isThisProjectActive = String(project.id) === projectId;

  // 🛑 WARUNEK BLOKUJĄCY:
  // Jeśli NIE ma itemId w URL (czyli jesteśmy na liście projektów LUB w szczegółach projektu)
  // LUB jeśli to nie jest ten aktywny projekt...
  // ...to wyświetlamy tylko prosty link (bez drzewa).
  if (!isDeepDetailView || !isThisProjectActive) {
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

  // ✅ W PRZECIWNYM RAZIE (Jesteśmy w szczegółach ITEMU w tym projekcie):
  // Wyświetlamy link + drzewo filarów i itemów.
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
