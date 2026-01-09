import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useOutletContext,
} from "react-router-dom";
import type { Pillar } from "./types";
import { getPillarById, archivePillar } from "./api";
import { EditPillarModal } from "./EditPillarModal";
import "../project/ProjectDetails.css";
import { FaPlus, FaCog, FaSearch } from "react-icons/fa";
import type { Item } from "../item/types.ts";
import { CreateItemModal } from "../item/CreateItemModal.tsx";
import { Breadcrumbs } from "../common/Breadcrumbs.tsx";
import type { Project } from "../project/types.ts";
import { ScopedSearchModal } from "../searching/SearchModal.tsx";
import { useAuth } from "../../context/AuthContext.tsx";

export function PillarDetails() {
  const { projectId, pillarId } = useParams<{
    projectId: string;
    pillarId: string;
    projectName: string;
  }>();
  const navigate = useNavigate();

  const project = useOutletContext<Project>();

  const [pillar, setPillar] = useState<Pillar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stany dla modali
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const { isAdmin } = useAuth();

  // 1. Pobieranie danych przy wejściu na stronę
  useEffect(() => {
    if (projectId && pillarId) {
      setIsLoading(true);
      setError(null);

      getPillarById(projectId, pillarId)
        .then((data) => {
          setPillar(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Nie udało się pobrać szczegółów filaru.");
          setIsLoading(false);
        });
    }
  }, [projectId, pillarId]);

  // 2. Obsługa Archiwizacji (usuwa filar i wraca do projektu)
  const handleArchive = async () => {
    if (!pillar || !projectId) return;

    if (
      !window.confirm(
        `Czy na pewno chcesz zarchiwizować filar "${pillar.name}"?`,
      )
    ) {
      return;
    }

    try {
      await archivePillar(projectId, pillar.id);
      // Po archiwizacji ten widok nie ma już sensu, wracamy do projektu
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error(err);
      alert("Błąd archiwizacji.");
    }
  };

  // 3. Obsługa sukcesu edycji filaru (z modala EditPillarModal)
  const handlePillarUpdateSuccess = (updatedPillar: Pillar) => {
    setPillar(updatedPillar); // Aktualizujemy lokalny stan
    setIsEditModalOpen(false); // Zamykamy modal
  };

  // 4. Obsługa dodania nowego zadania (Item)
  const handleItemCreationSuccess = (newItem: Item) => {
    setPillar((prev) => {
      if (!prev) return null;
      // Zakładamy, że Pillar ma tablicę 'items'
      const updatedItems = [...(prev.items || []), newItem];
      return { ...prev, items: updatedItems };
    });
    setIsCreateItemModalOpen(false);
  };

  if (isLoading) return <div className="loading">Ładowanie danych...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!pillar) return <div className="not-found">Nie znaleziono filaru.</div>;

  return (
    <div className="project-details-container">
      {/* NAGŁÓWEK */}
      <header className="project-header">
        <div className="header-left">
          <Breadcrumbs />
          <h1 className="project-title">{pillar.name}</h1>
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
              title="Edytuj filar"
            >
              <FaCog />
            </button>
          )}
        </div>
      </header>

      {/* INFO GRID */}
      <div className="project-info-grid">
        <InfoItem
          label="Firma odpowiedzialna"
          value={pillar.companyResposible}
        />
        <InfoItem label="Deadline" value={pillar.deadline} />
        <InfoItem label="Data startu" value={pillar.startDate} />
        <InfoItem
          label="Priorytet"
          value={`${pillar.priority > 0 ? pillar.priority : "—"}`}
        />
      </div>

      {/* SEKCJA ZADAŃ (ITEMS) */}
      <div className="items-section-header">
        <button
          className="add-pillar-btn" // Klasa CSS może zostać ta sama, jeśli styl pasuje
          onClick={() => setIsCreateItemModalOpen(true)}
        >
          Dodaj Item <FaPlus />
        </button>
      </div>

      {/* Tutaj możesz wyrenderować listę zadań, jeśli chcesz je widzieć w szczegółach */}
      <div className="items-list">
        {pillar.items && pillar.items.length > 0 ? (
          <ul>
            {pillar.items.map((item) => (
              <Link
                key={item.id}
                to={`/projects/${projectId}/pillars/${pillar.id}/items/${item.id}`} // Budujemy URL
                className="task-tile-link" // Klasa do usunięcia podkreślenia (CSS niżej)
                state={{
                  projectName: project.name, // Przekazujemy dalej nazwę projektu
                  pillarName: pillar.name, // I dodajemy nazwę filaru
                }}
                onClick={(e) => {
                  e.stopPropagation(); // To sprawia, że kliknięcie nie leci do rodzica (Filaru)
                }}
              >
                <div className="task-tile">
                  <div className="task-tile-title">{item.name}</div>
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          <p className="empty-state">Brak zadań w tym filarze.</p>
        )}
      </div>

      {/* MODAL: TWORZENIE ZADANIA */}
      {isCreateItemModalOpen && projectId && (
        <CreateItemModal
          projectId={projectId}
          pillarId={String(pillar.id)}
          onClose={() => setIsCreateItemModalOpen(false)}
          onSuccess={handleItemCreationSuccess}
        />
      )}

      {/* MODAL: EDYCJA FILARU */}
      {isEditModalOpen && projectId && (
        <EditPillarModal
          project_id={projectId}
          pillar={pillar}
          onClose={() => setIsEditModalOpen(false)}
          onArchive={handleArchive}
          onSuccess={handlePillarUpdateSuccess}
        />
      )}

      {isSearchModalOpen && (
        <ScopedSearchModal
          isOpen={true}
          onClose={() => setIsSearchModalOpen(false)}
          contextType={"pillar"}
          contextId={pillarId}
        />
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  return (
    <div className="info-box">
      <small className="info-label">{label}</small>
      <div className="info-value">{value || "—"}</div>
    </div>
  );
}
