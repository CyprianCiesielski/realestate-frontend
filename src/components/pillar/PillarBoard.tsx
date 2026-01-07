import type { Pillar } from "./types";
import "./PillarBoard.css";
import { PillarColumn } from "./PillarColumn.tsx";

interface PillarBoardProps {
  pillars: Pillar[];
  projectId: string; // 👈 NOWOŚĆ
  projectName: string;
  onPillarUpdated: (updatedPillar: Pillar) => void; // 👈 NOWOŚĆ
}

export function PillarBoard({
  pillars,
  projectId,
  projectName,
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
          projectName={projectName}
          onPillarUpdated={onPillarUpdated} // Przekazujemy funkcję aktualizującą
        />
      ))}
    </div>
  );
}
