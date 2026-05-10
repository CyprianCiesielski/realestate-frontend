import { useEffect, useMemo, useState } from "react";
import { FaCog, FaPlus } from "react-icons/fa";
import { EditPillarModal } from "./EditPillarModal";
import type { Pillar } from "./types";
import { archivePillar, unarchivePillar } from "./api";
import { CreateItemModal } from "../item/CreateItemModal.tsx";
import type { Item } from "../item/types.ts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import { fetchMyProfile } from "../../features/user/api.ts";
import type { UserDetailData } from "../../features/user/types.ts";

interface PillarColumnProps {
  pillar: Pillar;
  projectId: string;
  projectName: string;
  onPillarUpdated: (updatedPillar: Pillar) => void;
  selectedStatuses: string[];
}

export function PillarColumn({
  pillar,
  projectId,
  projectName,
  onPillarUpdated,
  selectedStatuses,
}: PillarColumnProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<UserDetailData | null>(null);

  useEffect(() => {
    fetchMyProfile().then(setCurrentUser).catch(console.error);
  }, []);

  const canCreate = useMemo(() => {
    if (isAdmin) return true;
    if (!currentUser || !currentUser.assignedProjects || !projectId)
      return false;

    const userProject = currentUser.assignedProjects.find(
      (p) => p.projectId.toString() === projectId,
    );

    // Upewniamy się, że szukamy dokładnie uprawnienia CAN_CREATE z enuma w Javie
    return userProject?.permissions?.includes("CAN_CREATE") ?? false;
  }, [currentUser, isAdmin, projectId]);

  const visibleItems =
    pillar.items?.filter((item) => {
      // Jeśli nie wybrano żadnego statusu w filtrze...
      if (selectedStatuses.length === 0) {
        // ...pokazuj wszystko, co NIE jest zarchiwizowane
        return item.state !== "archived";
      }

      // Jeśli filtry są zaznaczone, pokazuj tylko te elementy,
      // których stan znajduje się w tablicy selectedStatuses
      return selectedStatuses.includes(item.state || "active");
    }) || [];

  const handlePillarClick = () => {
    navigate(`/projects/${projectId}/pillars/${pillar.id}`, {
      state: { projectName, pillarName: pillar.name },
    });
  };

  const handleItemClick = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    navigate(`/projects/${projectId}/pillars/${pillar.id}/items/${itemId}`, {
      state: { projectName, pillarName: pillar.name },
    });
  };

  // Logika archiwizacji filaru
  const handleArchivePillar = async () => {
    if (
      !window.confirm(
        `Czy na pewno chcesz zarchiwizować filar "${pillar.name}"?`,
      )
    )
      return;
    try {
      await archivePillar(projectId, pillar.id);
      onPillarUpdated({ ...pillar, state: "archived" });
      setIsEditModalOpen(false);
    } catch {
      alert("Błąd podczas archiwizacji filaru.");
    }
  };

  const handleUnarchivePillar = async () => {
    try {
      await unarchivePillar(projectId, pillar.id);

      onPillarUpdated({ ...pillar, state: "active" });

      setIsEditModalOpen(false);

      alert(`Filar "${pillar.name}" został przywrócony.`);
    } catch (error) {
      console.error(error);
      alert("Błąd podczas przywracania filaru.");
    }
  };

  const handleItemCreationSuccess = (newItem: Item) => {
    const updatedItems = [...(pillar.items || []), newItem];
    onPillarUpdated({ ...pillar, items: updatedItems });
    setIsCreateItemModalOpen(false);
  };

  return (
    <div
      className="pillar-column"
      onClick={handlePillarClick}
      style={{ cursor: "pointer", position: "relative" }}
    >
      <div className="pillar-actions">
        {canCreate && ( // <--- DODAJ WARUNEK TUTAJ
          <button
            className="add-item-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsCreateItemModalOpen(true);
            }}
          >
            <FaPlus />
          </button>
        )}

        {isAdmin && (
          <button
            className="settings-pillar-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditModalOpen(true);
            }}
          >
            <FaCog />
          </button>
        )}
      </div>

      <div className="pillar-header">
        <h3>{pillar.name}</h3>
      </div>

      <div className="pillar-items">
        {visibleItems.length === 0 ? (
          <div className="empty-state">Brak zadań</div>
        ) : (
          visibleItems.map((item) => (
            <div
              key={item.id}
              className="item-card"
              onClick={(e) => handleItemClick(e, item.id)}
              style={{ position: "relative", cursor: "pointer" }}
            >
              <div className="item-title">
                <span style={{ wordBreak: "break-word", paddingRight: "20px" }}>
                  {item.name}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {isEditModalOpen && (
        <EditPillarModal
          project_id={projectId}
          pillar={pillar}
          onClose={() => setIsEditModalOpen(false)}
          onArchive={handleArchivePillar}
          onSuccess={onPillarUpdated}
          onUnarchive={handleUnarchivePillar}
        />
      )}

      {isCreateItemModalOpen && (
        <CreateItemModal
          projectId={projectId}
          pillarId={String(pillar.id)}
          onClose={() => setIsCreateItemModalOpen(false)}
          onSuccess={handleItemCreationSuccess}
        />
      )}
    </div>
  );
}
