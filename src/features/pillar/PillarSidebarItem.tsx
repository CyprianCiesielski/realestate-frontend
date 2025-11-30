import { useState } from "react";
import type { Pillar } from "./types";
import { FaChevronRight } from "react-icons/fa";
import { ItemSidebarLink } from "../item/ItemSidebarLink";

interface PillarSidebarItemProps {
  pillar: Pillar;
  projectId: string;
}

export function PillarSidebarItem({
  pillar,
  projectId,
}: PillarSidebarItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="pillar-sidebar-item-container">
      <div
        className="sidebar-toggle-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <FaChevronRight
          className={`toggle-icon ${isExpanded ? "expanded" : ""}`}
        />
        <span className="pillar-name-text">{pillar.name}</span>
      </div>

      {isExpanded && (
        <div className="sidebar-item-list">
          {(pillar.items || []).map((item) => (
            <ItemSidebarLink key={item.id} item={item} projectId={projectId} />
          ))}
        </div>
      )}
    </div>
  );
}
