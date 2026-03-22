import { FaTimes, FaThumbtack, FaArrowRight } from "react-icons/fa";
import "./PinnedMessagesModal.css";
import type { ItemHistory } from "./types";

interface PinnedMessagesModalProps {
  pinnedMessages: ItemHistory[];
  onClose: () => void;
  onGoToMessage: (id: number, msg: ItemHistory) => void;
}

export function PinnedMessagesModal({
  pinnedMessages,
  onClose,
  onGoToMessage,
}: PinnedMessagesModalProps) {
  return (
    <div className="pinned-modal-overlay" onClick={onClose}>
      <div
        className="pinned-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pinned-modal-header">
          <h3>
            <FaThumbtack /> Przypięte wiadomości ({pinnedMessages.length})
          </h3>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="pinned-list">
          {pinnedMessages.length === 0 ? (
            <p className="no-pins">Brak przypiętych wiadomości.</p>
          ) : (
            pinnedMessages.map((msg) => (
              <div
                key={msg.id}
                className="pinned-item"
                onClick={() => {
                  onGoToMessage(msg.id, msg);
                  onClose();
                }}
              >
                <div className="pinned-item-header">
                  <span className="pinned-author">{msg.author}</span>
                  <span className="pinned-date">
                    {new Date(msg.changeDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="pinned-desc">{msg.description}</p>
                <div className="pinned-action">
                  Przejdź do wiadomości <FaArrowRight />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
