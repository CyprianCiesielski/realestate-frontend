import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  FaReply,
  FaPen,
  FaRegCopy,
  FaTrashAlt,
  FaThumbtack,
  FaPlus,
  FaChevronLeft,
} from "react-icons/fa";
import "./MessageContextMenu.css";
import { useAuth } from "../../context/AuthContext.tsx";

// 1. Podstawowe reakcje (szybki wybór)
const QUICK_REACTIONS = ["❤️", "😆", "😮", "😢", "😠", "👍"];

// 2. Rozszerzona lista (po kliknięciu w plusa)
const ALL_REACTIONS = [
  ...QUICK_REACTIONS,
  "🔥",
  "🎉",
  "👀",
  "💯",
  "🚀",
  "👋",
  "✅",
  "❌",
  "🤔",
  "🥰",
  "😎",
  "😭",
  "😡",
  "💩",
  "🙏",
  "🤝",
  "👻",
  "🧠",
  "🤡",
  "🍿",
];

interface ContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onPin: () => void;
  onDelete: () => void;
  isPinned: boolean;
  isAuthor: boolean;
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
  isAuthor,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState(position);

  // NOWE: Stan do przełączania widoku emotek
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { isAdmin } = useAuth();

  useLayoutEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = menu;

      let { x, y } = position;

      if (y + offsetHeight > innerHeight) {
        y = y - offsetHeight;
      }
      if (x + offsetWidth > innerWidth) {
        x = x - offsetWidth;
      }

      setCoords({ x, y });
    }
    // Dodajemy showEmojiPicker do zależności, aby przeliczył pozycję po otwarciu siatki
  }, [position, showEmojiPicker]);

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
        {/* LOGIKA WYŚWIETLANIA EMOTEK */}
        {!showEmojiPicker ? (
          // WIDOK 1: Pasek szybkich reakcji
          <div className="reaction-bar">
            {QUICK_REACTIONS.map((emoji) => (
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
            <button
              className="reaction-btn add-reaction"
              onClick={(e) => {
                e.stopPropagation(); // Zapobiega zamykaniu menu
                setShowEmojiPicker(true);
              }}
              title="Więcej reakcji"
            >
              <FaPlus />
            </button>
          </div>
        ) : (
          // WIDOK 2: Pełna siatka emotek
          <div className="emoji-picker-container">
            <div className="emoji-picker-header">
              <span>Wybierz reakcję</span>
              <button
                className="back-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEmojiPicker(false);
                }}
              >
                <FaChevronLeft size={10} /> Wróć
              </button>
            </div>
            <div className="emoji-grid">
              {ALL_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  className="emoji-grid-item"
                  onClick={() => {
                    onReact(emoji);
                    onClose();
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="divider" />

        {/* Lista Akcji */}
        <div className="action-list">
          {(isAdmin || isAuthor) && (
            <button
              onClick={() => {
                onEdit();
                onClose();
              }}
            >
              <span>Edytuj</span>
              <FaPen />
            </button>
          )}

          <button
            onClick={() => {
              onReply();
              onClose();
            }}
          >
            <span>Odpowiedz</span>
            <FaReply />
          </button>
          <button
            onClick={() => {
              onCopy();
              onClose();
            }}
          >
            <span>Kopiuj</span>
            <FaRegCopy />
          </button>

          <button
            onClick={() => {
              onPin();
              onClose();
            }}
          >
            <span>{isPinned ? "Odepnij" : "Przypnij"}</span>
            <FaThumbtack
              style={{ transform: isPinned ? "none" : "rotate(45deg)" }}
            />
          </button>
          {isAdmin && (
            <>
              <div className="divider" />
              <button
                className="delete-btn"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
              >
                <span>Usuń</span>
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
