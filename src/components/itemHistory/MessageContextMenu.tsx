import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  FaReply,
  FaPen,
  FaRegCopy,
  FaTrashAlt,
  FaThumbtack,
  FaPlus,
} from "react-icons/fa";
import "./MessageContextMenu.css";

// ... (Twoja lista reakcji i interfejsy) ...
const REACTIONS = ["❤️", "😆", "😮", "😢", "😠", "👍"];

interface ContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  // ... reszta propsów
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onPin: () => void;
  onDelete: () => void;
  isPinned: boolean;
}

export function MessageContextMenu({
  position,
  onClose,
  onReact,
  onReply,
  onEdit,
  onCopy,
  onPin,
  onDelete,
  isPinned,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Stan przechowujący "bezpieczną" pozycję. Na początku ustawiamy to co kliknięto.
  const [coords, setCoords] = useState(position);

  // useLayoutEffect uruchamia się PO wyrenderowaniu HTML, ale PRZED wyświetleniem na ekranie.
  // Dzięki temu użytkownik nie zobaczy "mignięcia" przy zmianie pozycji.
  useLayoutEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = menu;

      let { x, y } = position;

      // 1. Sprawdź czy menu wychodzi dołem poza ekran
      if (y + offsetHeight > innerHeight) {
        // Jeśli tak, przesuń je do góry (tak żeby dolna krawędź była w miejscu kliknięcia)
        y = y - offsetHeight;
      }

      // 2. Sprawdź czy menu wychodzi prawą stroną poza ekran
      if (x + offsetWidth > innerWidth) {
        // Jeśli tak, przesuń je w lewo
        x = x - offsetWidth;
      }

      setCoords({ x, y });
    }
  }, [position]); // Uruchom ponownie, jeśli zmieni się pozycja wejściowa

  // Zamykanie przy kliknięciu poza (bez zmian)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleScroll = () => onClose();
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  return (
    <div className="context-menu-overlay">
      <div
        className="context-menu-container"
        ref={menuRef}
        style={{
          top: coords.y,
          left: coords.x,
        }}
      >
        {/* ... RESZTA TWOJEGO KODU BEZ ZMIAN ... */}

        {/* Pasek Reakcji */}
        <div className="reaction-bar">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              className="reaction-btn"
              onClick={() => {
                onReact(emoji);
                onClose();
              }}
            >
              <span className="emoji-icon">{emoji}</span>
            </button>
          ))}
          <button className="reaction-btn add-reaction">
            <FaPlus />
          </button>
        </div>

        {/* Lista Akcji */}
        <div className="action-list">
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
          >
            <span>Edit</span>
            <FaPen />
          </button>
          <button
            onClick={() => {
              onReply();
              onClose();
            }}
          >
            <span>Reply</span>
            <FaReply />
          </button>
          <button
            onClick={() => {
              onCopy();
              onClose();
            }}
          >
            <span>Copy</span>
            <FaRegCopy />
          </button>
          <div className="divider" />
          <button
            onClick={() => {
              onPin();
              onClose();
            }}
          >
            <span>{isPinned ? "Unpin" : "Pin"}</span>
            <FaThumbtack style={{ transform: "rotate(45deg)" }} />
          </button>
          <button
            className="delete-btn"
            onClick={() => {
              onDelete();
              onClose();
            }}
          >
            <span>Delete</span>
            <FaTrashAlt />
          </button>
        </div>
      </div>
    </div>
  );
}
