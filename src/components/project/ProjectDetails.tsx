import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Project } from "./types";
import { getProjectById, archiveProject } from "./api";
import { EditProjectModal } from "./EditProjectModal";
import { PillarBoard } from "../pillar/PillarBoard";
import "./ProjectDetails.css";
import {
  FaPlus,
  FaCog,
  FaSearch,
  FaFolderOpen,
  FaThumbtack,
  FaFilter,
} from "react-icons/fa";
import { CreatePillarModal } from "../pillar/CreatePillarModal.tsx";
import type { Pillar } from "../pillar/types.ts";
import { ScopedSearchModal } from "../searching/SearchModal.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { PinnedMessagesModal } from "../itemHistory/PinnedMessagesModal.tsx";
import { getProjectPinnedHistory } from "../itemHistory/api";
import type { ItemHistory } from "../itemHistory/types";

export function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [pinnedMessages, setPinnedMessages] = useState<ItemHistory[]>([]);
  const [isPinnedListOpen, setIsPinnedListOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const { isAdmin } = useAuth();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (projectId) {
      getProjectPinnedHistory(projectId)
        .then(setPinnedMessages)
        .catch(console.error);
    }
  }, [projectId]);

  const handleGoToMessage = (msgId: number, msg: ItemHistory) => {
    setIsPinnedListOpen(false);
    if (msg.pillarId && msg.itemId) {
      navigate(
        `/projects/${projectId}/pillars/${msg.pillarId}/items/${msg.itemId}?scrollTo=${msgId}`,
      );
    }
  };

  useEffect(() => {
    if (projectId) {
      setIsLoading(true);
      getProjectById(projectId)
        .then((data) => {
          setProject(data);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [projectId]);

  const uniqueStatuses = useMemo(() => {
    if (!project || !project.pillars) return [];
    const statusSet = new Set<string>();
    project.pillars.forEach((p) => {
      p.items?.forEach((item) => {
        if (item.state) statusSet.add(item.state);
      });
    });
    return Array.from(statusSet).sort();
  }, [project]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev: string[]) =>
      prev.includes(status)
        ? prev.filter((s: string) => s !== status)
        : [...prev, status],
    );
  };

  const handleArchive = async () => {
    if (!project || !project.id) return;
    try {
      await archiveProject(project.id);
      navigate("/projects");
    } catch {
      alert("Błąd archiwizacji.");
    }
  };

  const filteredPillars = useMemo(() => {
    if (!project || !project.pillars) return [];

    return project.pillars.filter((pillar) => {
      const pState = pillar.state || "active";

      if (pState === "active") {
        return true;
      }

      if (pState === "archived") {
        return selectedStatuses.includes("archived");
      }

      if (selectedStatuses.length === 0) {
        return true;
      }
      return selectedStatuses.includes(pState);
    });
  }, [project, selectedStatuses]);

  const handlePillarUpdate = (updatedPillar: Pillar) => {
    setProject((prev) => {
      if (!prev) return null;

      const newPillars = prev.pillars.map((p) =>
        p.id === updatedPillar.id ? updatedPillar : p,
      );

      return { ...prev, pillars: newPillars };
    });
  };

  if (isLoading) return <div className="loading">Ładowanie...</div>;
  if (!project)
    return <div className="not-found">Nie znaleziono projektu.</div>;

  const hasActiveFilters = selectedStatuses.length > 0;

  return (
    <div className="project-details-container">
      <header className="project-header">
        <div className="header-left">
          <h1 className="project-title">{project.name}</h1>
        </div>

        <div className="header-right">
          {/* PRZYWRÓCONY LINK DO DYSKU */}
          {project?.driveFolderLink && (
            <a
              href={project.driveFolderLink}
              target="_blank"
              rel="noopener noreferrer"
              className="search-btn"
              title="Otwórz folder projektu na dysku Google"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <FaFolderOpen />
            </a>
          )}

          <button
            className="search-btn"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <FaSearch />
          </button>

          <div
            className="filter-wrapper"
            ref={filterRef}
            style={{ position: "relative" }}
          >
            <button
              className={`filter-btn ${isFilterOpen || hasActiveFilters ? "active" : ""}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FaFilter />
              {hasActiveFilters && <span className="filter-dot-indicator" />}
            </button>

            {isFilterOpen && (
              <div className="filter-dropdown-menu right-aligned">
                <div className="filter-section">
                  <div className="filter-section-title">STATUS</div>
                  {/* Dodajemy te dwa checkboxy na sztywno, żeby zawsze były dostępne */}
                  <label className="filter-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes("active")}
                      onChange={() => toggleStatus("active")}
                    />
                    <span>Aktywne</span>
                  </label>

                  <label className="filter-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes("archived")}
                      onChange={() => toggleStatus("archived")}
                    />
                    <span style={{ color: "#d9534f" }}>Zarchiwizowane</span>
                  </label>

                  {/* Opcjonalnie: reszta statusów, jeśli masz jakieś dynamiczne (np. finished) */}
                  {uniqueStatuses
                    .filter((s) => s !== "active" && s !== "archived")
                    .map((status) => (
                      <label key={status} className="filter-checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={() => toggleStatus(status)}
                        />
                        <span style={{ textTransform: "capitalize" }}>
                          {status}
                        </span>
                      </label>
                    ))}
                </div>
                <div className="dropdown-divider" />
                {hasActiveFilters && (
                  <button
                    className="filter-clear-all"
                    onClick={() => setSelectedStatuses([])}
                  >
                    Wyczyść filtry
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            className="search-btn"
            onClick={() => setIsPinnedListOpen(true)}
            style={{ position: "relative" }}
          >
            <FaThumbtack />
            {pinnedMessages.length > 0 && (
              <span className="badge-count">{pinnedMessages.length}</span>
            )}
          </button>

          {isAdmin && (
            <button
              className="settings-btn"
              onClick={() => setIsEditModalOpen(true)}
            >
              <FaCog />
            </button>
          )}
        </div>
      </header>

      {/* PRZYWRÓCONY PEŁNY GRID INFORMACYJNY (Data startu, Osoba, Deadline) */}
      <div className="project-info-grid">
        <InfoItem label="Firma odpowiedzialna" value={project.company?.name} />
        <InfoItem
          label="Osoba odpowiedzialna"
          value={project.personResponsible}
        />
        <InfoItem label="Data startu" value={project.startDate} />
        <InfoItem label="Deadline" value={project.deadline} />
      </div>

      <section className="board-section">
        <PillarBoard
          pillars={filteredPillars}
          projectId={projectId!}
          projectName={project.name}
          onPillarUpdated={handlePillarUpdate}
          selectedStatuses={selectedStatuses}
        />
      </section>

      {isAdmin && (
        <button className="add-pillar-btn" onClick={() => setIsModalOpen(true)}>
          Dodaj moduł <FaPlus />
        </button>
      )}

      {isModalOpen && projectId && (
        <CreatePillarModal
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newPillar) => {
            setProject((prev) =>
              prev ? { ...prev, pillars: [...prev.pillars, newPillar] } : null,
            );
            setIsModalOpen(false);
          }}
        />
      )}

      {isEditModalOpen && (
        <EditProjectModal
          project={project}
          onClose={() => setIsEditModalOpen(false)}
          onArchive={handleArchive}
          onSuccess={(upd) =>
            setProject((prev) => (prev ? { ...prev, ...upd } : null))
          }
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
      {isPinnedListOpen && (
        <PinnedMessagesModal
          pinnedMessages={pinnedMessages}
          onClose={() => setIsPinnedListOpen(false)}
          onGoToMessage={handleGoToMessage}
        />
      )}
    </div>
  );
}

// PRZYWRÓCONA FUNKCJA INFOITEM (Zachowuje styl i kolory)
function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="info-box">
      <small className="info-label">{label}</small>
      <div className="info-value">{value || "—"}</div>
    </div>
  );
}
