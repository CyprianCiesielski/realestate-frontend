import type { Pillar } from "./types";
import "./PillarBoard.css";
import { PillarColumn } from "./PillarColumn.tsx";

interface PillarBoardProps {
  pillars: Pillar[];
  projectId: string;
  projectName: string;
  onPillarUpdated: (updatedPillar: Pillar) => void;
  selectedStatuses: string[];
}

export function PillarBoard({
  pillars,
  projectId,
  projectName,
  onPillarUpdated,
  selectedStatuses,
}: PillarBoardProps) {
  const sortedPillars = [...pillars].sort((a, b) => a.id - b.id);

  return (
    <div className="board-container">
      {sortedPillars.map((pillar) => (
        <PillarColumn
          key={pillar.id}
          pillar={pillar}
          projectId={projectId}
          projectName={projectName}
          onPillarUpdated={onPillarUpdated}
          selectedStatuses={selectedStatuses}
        />
      ))}
    </div>
  );
}
