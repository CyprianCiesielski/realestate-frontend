import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Project } from "./types";
import { getProjectById, archiveProject } from "./api"; // 👈 ZMIANA IMPORTU
import { EditProjectModal } from "./EditProjectModal";
import { PillarBoard } from "../pillar/PillarBoard";
import "./ProjectDetails.css";
import { FaPlus, FaCog } from "react-icons/fa";
import { CreatePillarModal } from "../pillar/CreatePillarModal.tsx";
import type { Pillar } from "../pillar/types.ts";

export function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stany dla modali i menu
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  // 👇 ZMIANA: Obsługa archiwizacji
  const handleArchive = async () => {
    if (!project || !project.id) return;
    try {
      await archiveProject(project.id);
      navigate("/projects");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Błąd archiwizacji.");
    }
  };

  const handlePillarUpdate = (updatedPillar: Pillar) => {
    setProject((prevProject) => {
      if (!prevProject) return null;

      // 👇 ZMIANA LOGIKI: FILTRUJEMY, a nie tylko mapujemy/podmieniamy

      // Jeśli status to 'archived', filtrujemy go z listy (usuwamy).
      // Jeśli status jest inny (np. 'active'), podmieniamy go.
      const newPillars =
        updatedPillar.state === "archived"
          ? prevProject.pillars.filter((p) => p.id !== updatedPillar.id) // USUNIĘCIE
          : prevProject.pillars.map((p) =>
              p.id === updatedPillar.id ? updatedPillar : p,
            ); // AKTUALIZACJA

      return { ...prevProject, pillars: newPillars };
    });
  };

  if (isLoading) return <div className="loading">Ładowanie danych...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!project)
    return <div className="not-found">Nie znaleziono projektu.</div>;

  return (
    <div className="project-details-container">
      {/* NAGŁÓWEK */}
      <header className="project-header">
        <div className="header-left">
          <h1 className="project-title">{project.name}</h1>
          <span
            className={`project-status ${project.state === "active" ? "active" : ""}`}
          >
            ● {project.state}
          </span>

          <div className="project-tags-row">
            {project.tags &&
              project.tags.map((tag) => (
                <span key={tag.id} className="tag-badge">
                  #{tag.name}
                </span>
              ))}
          </div>
        </div>

        <div className="header-right">
          <button
            className="settings-btn"
            onClick={() => setIsEditModalOpen(true)}
            title="Edytuj projekt"
          >
            <FaCog />
          </button>
        </div>
      </header>

      {/* INFO */}
      <div className="project-info-grid">
        <InfoItem label="Place" value={project.place} />
        <InfoItem label="Contractor" value={project.contractor} />
        <InfoItem label="Start date" value={project.startDate} />
        <InfoItem
          label="Company responsible"
          value={project.companyResposible}
        />
        <InfoItem label="Priority" value={`${project.priority}`} />
      </div>

      {/* BOARD */}
      <section className="board-section">
        <h2>Pillar Table</h2>
        <PillarBoard
          pillars={project.pillars || []}
          projectId={projectId!} // 👈 Przekazujemy ID projektu
          onPillarUpdated={handlePillarUpdate} // 👈 Przekazujemy funkcję do aktualizacji
        />
      </section>

      {/* GUZIK DODAWANIA FILARU */}
      <button className="add-pillar-btn" onClick={() => setIsModalOpen(true)}>
        Add Pillar <FaPlus />
      </button>

      {/* MODAL DODAWANIA FILARU */}
      {isModalOpen && projectId && (
        <CreatePillarModal
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newPillar) => {
            setProject((prevProject) => {
              if (!prevProject) return null;
              return {
                ...prevProject,
                pillars: [...(prevProject.pillars || []), newPillar],
              };
            });
            setIsModalOpen(false);
          }}
        />
      )}

      {isEditModalOpen && (
        <EditProjectModal
          project={project}
          onClose={() => setIsEditModalOpen(false)}
          onArchive={handleArchive}
          onSuccess={(updatedProject) => {
            // Aktualizujemy dane na ekranie
            setProject((prev) =>
              prev ? { ...prev, ...updatedProject } : null,
            );
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="info-box">
      <small className="info-label">{label}</small>
      <div className="info-value">{value || "—"}</div>
    </div>
  );
}
