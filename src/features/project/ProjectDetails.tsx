import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Project } from "./types";
import { getProjectById } from "./api";
import { PillarBoard } from "../pillar/PillarBoard";
import "./ProjectDetails.css"; // 👈 IMPORTUJEMY STYLE

export function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      setIsLoading(true);
      setError(null);

      getProjectById(projectId)
        .then((data) => {
          setProject(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Nie udało się pobrać szczegółów projektu.");
          setIsLoading(false);
        });
    }
  }, [projectId]);

  if (isLoading) return <div className="loading">Ładowanie danych...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!project)
    return <div className="not-found">Nie znaleziono projektu.</div>;

  return (
    <div className="project-details-container">
      {/* 1. Czysty nagłówek */}
      <header className="project-header">
        <h1 className="project-title">{project.name}</h1>
        <span
          className={`project-status ${project.state === "active" ? "active" : ""}`}
        >
          ● {project.state}
        </span>
      </header>

      {/* 2. Czysta siatka informacji */}
      <div className="project-info-grid">
        <InfoItem label="Lokalizacja" value={project.place} />
        <InfoItem label="Wykonawca" value={project.contractor} />
        <InfoItem label="Data rozpoczęcia" value={project.startDate} />
        <InfoItem
          label="Spółka odpowiedzialna"
          value={project.companyResposible}
        />
      </div>

      {/* 3. Sekcja tablicy */}
      <section className="board-section">
        <h2>Tablica Zadań</h2>
        <PillarBoard pillars={project.pillars || []} />
      </section>
    </div>
  );
}

// --- Mały komponent pomocniczy (Pro Tip!) ---
// Zamiast kopiować 4 razy ten sam div, zrób małą funkcję na dole pliku.
// To jeszcze bardziej czyści główny kod.
function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="info-box">
      <small className="info-label">{label}</small>
      <div className="info-value">{value || "—"}</div>
    </div>
  );
}
