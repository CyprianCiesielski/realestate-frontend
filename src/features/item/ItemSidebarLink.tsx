import { NavLink } from "react-router-dom";
import type { Item } from "./types.ts";
import { FaCircle } from "react-icons/fa"; // 👈 ZMIEŃ Z div NA NavLink

// Zamiast propsa onItemSelect, użyjemy URL-a
interface ItemSidebarLinkProps {
  item: Item;
  projectId: string; // Potrzebne do złożenia URL-a
}

export function ItemSidebarLink({ item, projectId }: ItemSidebarLinkProps) {
  // Tworzymy pełną ścieżkę do zadania
  const itemPath = `/projects/${projectId}/items/${item.id}`;

  return (
    <NavLink
      to={itemPath}
      className={({ isActive }) =>
        isActive ? "sidebar-item-link item-selected" : "sidebar-item-link"
      }
    >
      <FaCircle className="status-dot" style={{ color: "#97a0af" }} />
      <span className="item-name-text">{item.name}</span>
    </NavLink>
  );
}
