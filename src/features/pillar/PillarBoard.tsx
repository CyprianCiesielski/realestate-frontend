import type { Pillar } from "./types";
import "./PillarBoard.css"; // Zaraz stworzymy style

interface PillarBoardProps {
  pillars: Pillar[];
}

export function PillarBoard({ pillars }: PillarBoardProps) {
  // Sortujemy filary po ID (żeby zawsze były w tej samej kolejności: Design -> Comm -> Sale)
  // Możesz to zmienić, jeśli masz pole 'order' w bazie
  const sortedPillars = [...pillars].sort((a, b) => a.id - b.id);

  return (
    <div className="board-container">
      {sortedPillars.map((pillar) => (
        <div key={pillar.id} className="pillar-column">
          {/* Nagłówek kolumny */}
          <div className="pillar-header">
            <h3>{pillar.name}</h3>
            <span className="item-count">{pillar.items.length} zadań</span>
          </div>

          {/* Lista zadań (Items) */}
          <div className="pillar-items">
            {pillar.items.length === 0 ? (
              <div className="empty-state">Brak zadań</div>
            ) : (
              pillar.items.map((item) => (
                <div key={item.id} className="item-card">
                  <div className="item-title">{item.name}</div>
                  <div className="item-status">{item.status}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
