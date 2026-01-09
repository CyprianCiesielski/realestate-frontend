import { useState } from "react";
import { FaCog, FaPlus } from "react-icons/fa";
import { EditPillarModal } from "./EditPillarModal";
import type { Pillar } from "./types";
import { archivePillar } from "./api";
import { CreateItemModal } from "../item/CreateItemModal.tsx";
import type { Item } from "../item/types.ts";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx"; // Do celów archiwizacji

interface PillarColumnProps {
  pillar: Pillar;
  projectId: string; // 👈 Musimy go dostać od ProjectDetails
  projectName: string;
  onPillarUpdated: (updatedPillar: Pillar) => void;
}

export function PillarColumn({
  pillar,
  projectId,
  projectName,
  onPillarUpdated,
}: PillarColumnProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);

  const { isAdmin } = useAuth();

  const navigate = useNavigate();

  // Funkcja nawigacji
  const handleCardClick = () => {
    navigate(`/projects/${projectId}/pillars/${pillar.id}`, {
      state: {
        projectName: projectName,
        pillarName: pillar.name,
      },
    });
  };

  // Logika archiwizacji (wywoływana z Modala)
  const handleArchive = async () => {
    if (
      !window.confirm(
        `Czy na pewno chcesz zarchiwizować filar "${pillar.name}"?`,
      )
    )
      return;
    try {
      // 1. Wywołujemy DEDYKOWANĄ funkcję, która ma adres PUT .../archive
      await archivePillar(projectId, pillar.id);

      // 2. Musimy zaktualizować filar lokalnie, żeby zniknął z widoku
      // Najprościej: robimy update, który ustawia stan na "archived" i wysyłamy do rodzica

      const archivedPillarLocalUpdate = { ...pillar, state: "archived" };

      // Powiadamiamy rodzica o zmianie statusu
      onPillarUpdated(archivedPillarLocalUpdate);

      setIsEditModalOpen(false); // Zamykamy modal
    } catch (error) {
      alert("Błąd podczas archiwizacji filaru.");
    }
  };

  const handleItemCreationSuccess = (newItem: Item) => {
    const updatedItems = [...pillar.items, newItem];
    const updatedPillar = { ...pillar, items: updatedItems };
    onPillarUpdated(updatedPillar);

    setIsCreateItemModalOpen(false);
  };

  return (
    <div
      key={pillar.id}
      className="pillar-column"
      onClick={() => handleCardClick()}
      style={{ cursor: "pointer", position: "relative" }}
    >
      {/* --- NOWY KONTENER NA PRZYCISKI --- */}
      <div className="pillar-actions">
        <button
          className="add-item-btn"
          onClick={(e) => {
            setIsCreateItemModalOpen(true);
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <FaPlus />
        </button>

        {isAdmin && (
          <button
            className="settings-pillar-btn"
            onClick={(e) => {
              setIsEditModalOpen(true);
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <FaCog />
          </button>
        )}
      </div>

      {/* Nagłówek kolumny */}
      <div className="pillar-header">
        <h3>{pillar.name}</h3>
      </div>

      {/* Lista zadań (Items) */}
      <div className="pillar-items">
        {(pillar.items || []).length === 0 ? (
          <div className="empty-state">No tasks</div>
        ) : (
          (pillar.items || []).map((item) => (
            <Link
              key={item.id}
              to={`/projects/${projectId}/pillars/${pillar.id}/items/${item.id}`} // Budujemy URL
              className="item-card-link" // Klasa do usunięcia podkreślenia (CSS niżej)
              state={{
                projectName: projectName, // Przekazujemy dalej nazwę projektu
                pillarName: pillar.name, // I dodajemy nazwę filaru
              }}
              onClick={(e) => {
                e.stopPropagation(); // To sprawia, że kliknięcie nie leci do rodzica (Filaru)
              }}
            >
              <div className="item-card">
                <div className="item-title">{item.name}</div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* MODAL EDYCJI */}
      {isEditModalOpen && (
        <EditPillarModal
          project_id={projectId}
          pillar={pillar}
          onClose={() => setIsEditModalOpen(false)}
          onArchive={handleArchive}
          onSuccess={onPillarUpdated} // Przekazujemy zaktualizowany filar do góry
        />
      )}

      {isCreateItemModalOpen && (
        <CreateItemModal
          projectId={projectId}
          pillarId={String(pillar.id)}
          onClose={() => setIsCreateItemModalOpen(false)}
          onSuccess={handleItemCreationSuccess} // Przekazujemy zaktualizowany filar do góry
        />
      )}
    </div>
  );
}
