import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { getProjectById } from "./api"; // Upewnij się, że masz tę funkcję w API
import type { Project } from "./types";

export function SingleProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      setIsLoading(true);
      // Pobieramy projekt RAZ dla wszystkich podstron (Szczegóły, Filary, Itemy)
      getProjectById(projectId)
        .then((data) => {
          setProject(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [projectId]);

  if (isLoading) return <div className="loading">Ładowanie projektu...</div>;
  if (!project) return <div className="error">Nie znaleziono projektu.</div>;

  return (
    // 👇 TO JEST KLUCZOWE: Przekazujemy obiekt projektu do wszystkich dzieci
    <Outlet context={project} />
  );
}
