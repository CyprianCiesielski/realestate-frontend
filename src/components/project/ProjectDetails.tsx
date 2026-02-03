import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Project } from "./types";
import { getProjectById, archiveProject } from "./api";
import { EditProjectModal } from "./EditProjectModal";
import { PillarBoard } from "../pillar/PillarBoard";
import "./ProjectDetails.css";
import { FaPlus, FaCog, FaSearch } from "react-icons/fa";
import { CreatePillarModal } from "../pillar/CreatePillarModal.tsx";
import type { Pillar } from "../pillar/types.ts";
import { ScopedSearchModal } from "../searching/SearchModal.tsx";
import { useAuth } from "../../context/AuthContext.tsx";

export function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stany dla modali
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const { isAdmin } = useAuth();

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

      const newPillars =
        updatedPillar.state === "archived"
          ? prevProject.pillars.filter((p) => p.id !== updatedPillar.id)
          : prevProject.pillars.map((p) =>
              p.id === updatedPillar.id ? updatedPillar : p,
            );

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
        </div>

        <div className="header-right">
          <button
            className="search-btn"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <FaSearch />
          </button>

          {isAdmin && (
            <button
              className="settings-btn"
              onClick={() => setIsEditModalOpen(true)}
              title="Edytuj projekt"
            >
              <FaCog />
            </button>
          )}
        </div>
      </header>

      {/* INFO */}
      <div className="project-info-grid">
        <InfoItem label="Firma odpowiedzialna" value={project.company?.name} />
        <InfoItem
          label="Osoba odpowiedzialna"
          value={project.personResponsible}
        />

        <InfoItem label="Data startu" value={project.startDate} />
        <InfoItem label="Deadline" value={project.deadline} />
      </div>

      {/* BOARD */}
      <section className="board-section">
        <PillarBoard
          pillars={project.pillars || []}
          projectId={projectId!}
          projectName={project.name}
          onPillarUpdated={handlePillarUpdate}
        />
      </section>

      {isAdmin && (
        <button className="add-pillar-btn" onClick={() => setIsModalOpen(true)}>
          Dodaj moduł <FaPlus />
        </button>
      )}

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
            setProject((prev) =>
              prev ? { ...prev, ...updatedProject } : null,
            );
            setIsEditModalOpen(false);
          }}
        />
      )}

      {isSearchModalOpen && (
        <ScopedSearchModal
          isOpen={true}
          onClose={() => setIsSearchModalOpen(false)}
          contextType={"project"}
          contextId={projectId}
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
