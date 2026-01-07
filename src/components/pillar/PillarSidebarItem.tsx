import { useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import type { Pillar } from "./types";
import { FaChevronRight, FaCircle } from "react-icons/fa"; // FaCube jako ikona filaru
import { ItemSidebarLink } from "../item/ItemSidebarLink";

interface PillarSidebarItemProps {
  pillar: Pillar;
  projectId: string;
}

export function PillarSidebarItem({
  pillar,
  projectId,
}: PillarSidebarItemProps) {
  const { itemId, pillarId } = useParams<{
    itemId?: string;
    pillarId?: string;
  }>();

  // Sprawdzamy, w jakim jesteśmy trybie
  const isItemView = Boolean(itemId);

  // Sprawdzamy, czy ten konkretny filar jest aktywny (żeby go podświetlić w trybie linkowym)
  const isActivePillar = String(pillar.id) === pillarId;

  // Stan zwinięcia potrzebny TYLKO w trybie ItemView
  const [isExpanded, setIsExpanded] = useState(true);

  // --- TRYB 1: PILLAR VIEW (Płaska lista linków) ---
  // Jeśli nie ma itemId w URL, filary są po prostu linkami do nawigacji.
  if (!isItemView) {
    return (
      <NavLink
        to={`/projects/${projectId}/pillars/${pillar.id}`}
        className={`pillar-sidebar-link ${isActivePillar ? "active" : ""}`}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 12px",
          textDecoration: "none",
          color: isActivePillar ? "#0084ff" : "#333", // Kolor aktywny vs zwykły
          fontWeight: isActivePillar ? 600 : 400,
          borderRadius: "6px",
          marginBottom: "2px",
          backgroundColor: isActivePillar ? "#e7f3ff" : "transparent",
        }}
      >
        {/* Ikonka Filaru zamiast strzałki */}
        <FaCircle
          style={{ marginRight: 8, fontSize: "0.4rem", opacity: 0.7 }}
        />
        <span className="pillar-name-text">{pillar.name}</span>
      </NavLink>
    );
  }

  // --- TRYB 2: ITEM VIEW (Drzewo z zadaniami) ---
  // Jeśli jest itemId, zachowujemy starą logikę (rozwijanie listy zadań)
  return (
    <div className="pillar-sidebar-item-container">
      <div
        className="sidebar-toggle-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          cursor: "pointer",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <FaChevronRight
          className={`toggle-icon ${isExpanded ? "expanded" : ""}`}
          style={{ marginRight: 8, transition: "transform 0.2s" }}
        />
        <span className="pillar-name-text" style={{ fontWeight: 500 }}>
          {pillar.name}
        </span>
      </div>

      {isExpanded && (
        <div className="sidebar-item-list" style={{ paddingLeft: 20 }}>
          {(pillar.items || []).map((item) => (
            <ItemSidebarLink
              key={item.id}
              item={item}
              projectId={projectId}
              pillarId={String(pillar.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
