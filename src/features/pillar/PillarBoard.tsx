import type { Pillar } from "./types";
import "./PillarBoard.css";
import { PillarColumn } from "./PillarColumn.tsx"; // Zaraz stworzymy style

interface PillarBoardProps {
  pillars: Pillar[];
  projectId: string; // 👈 NOWOŚĆ
  onPillarUpdated: (updatedPillar: Pillar) => void; // 👈 NOWOŚĆ
}

export function PillarBoard({
  pillars,
  projectId,
  onPillarUpdated,
}: PillarBoardProps) {
  const sortedPillars = [...pillars].sort((a, b) => a.id - b.id);

  return (
    <div className="board-container">
      {sortedPillars.map((pillar) => (
        // 2. Używamy nowego komponentu
        <PillarColumn
          key={pillar.id}
          pillar={pillar}
          projectId={projectId} // Przekazujemy ID projektu
          onPillarUpdated={onPillarUpdated} // Przekazujemy funkcję aktualizującą
        />
      ))}
    </div>
  );
}
