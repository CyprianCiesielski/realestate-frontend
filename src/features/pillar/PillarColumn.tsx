import { useState } from "react";
import { FaCog, FaPlus } from "react-icons/fa";
import { EditPillarModal } from "./EditPillarModal";
import type { Pillar } from "./types";
import { archivePillar } from "./api";
import { CreateItemModal } from "../item/CreateItemModal.tsx";
import type { Item } from "../item/types.ts";
import { Link } from "react-router-dom"; // Do celów archiwizacji

interface PillarColumnProps {
  pillar: Pillar;
  projectId: string; // 👈 Musimy go dostać od ProjectDetails
  onPillarUpdated: (updatedPillar: Pillar) => void;
}

export function PillarColumn({
  pillar,
  projectId,
  onPillarUpdated,
}: PillarColumnProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);

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
    <div key={pillar.id} className="pillar-column">
      {/* IKONA USTAWIEŃ - Zębatka */}
      <button
        className="settings-pillar-btn"
        onClick={() => setIsEditModalOpen(true)}
      >
        <FaCog />
      </button>

      <button
        className="add-item-btn"
        onClick={() => setIsCreateItemModalOpen(true)}
      >
        <FaPlus />
      </button>

      {/* Nagłówek kolumny */}
      <div className="pillar-header">
        <h3>{pillar.name}</h3>
        <span className="item-count">Priority: {pillar.priority}</span>
      </div>

      {/* Lista zadań (Items) */}
      <div className="pillar-items">
        {(pillar.items || []).length === 0 ? (
          <div className="empty-state">No tasks</div>
        ) : (
          (pillar.items || []).map((item) => (
            <Link
              key={item.id}
              to={`/projects/${projectId}/items/${item.id}`} // Budujemy URL
              className="item-card-link" // Klasa do usunięcia podkreślenia (CSS niżej)
            >
              <div className="item-card">
                <div className="item-title">{item.name}</div>
                <div className="item-status">{item.status}</div>
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
