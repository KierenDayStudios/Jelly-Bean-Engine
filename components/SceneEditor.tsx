import React from 'react';
import { Scene, GameSettings, GameObject, Point } from '../types';

interface SceneEditorProps {
  scene: Scene;
  settings: GameSettings;
  selectedObjectIds: string[];
  onSelectObjects: (ids: string[]) => void;
  onUpdateObjects: (objects: GameObject[]) => void;
  isGridVisible: boolean;
  gridSize: number;
  onDuplicateObjectAtPosition: (objectId: string, position: Point) => void;
  onDeleteObjects: (ids: string[]) => void;
  onDuplicateObjects: (ids: string[]) => void;
  onShowPropertiesForObject: (id: string) => void;
}

const SceneEditor: React.FC<SceneEditorProps> = ({
  scene,
  settings,
  selectedObjectIds,
  onSelectObjects,
  onUpdateObjects,
  isGridVisible,
  gridSize,
  onDuplicateObjectAtPosition,
  onDeleteObjects,
  onDuplicateObjects,
  onShowPropertiesForObject,
}) => {
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = scene.objects.find(obj => {
      const objWidth = obj.size.width * (obj.scale || 1);
      const objHeight = obj.size.height * (obj.scale || 1);
      return (
        x >= obj.position.x - objWidth / 2 &&
        x <= obj.position.x + objWidth / 2 &&
        y >= obj.position.y - objHeight / 2 &&
        y <= obj.position.y + objHeight / 2
      );
    });

    if (clicked) {
      onSelectObjects([clicked.id]);
      onShowPropertiesForObject(clicked.id);
    } else {
      onSelectObjects([]);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLCanvasElement>, objectId: string) => {
    if (!selectedObjectIds.includes(objectId)) {
      onSelectObjects([objectId]);
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updated = scene.objects.map(obj => {
      if (selectedObjectIds.includes(obj.id)) {
        const dx = x - obj.position.x;
        const dy = y - obj.position.y;
        return {
          ...obj,
          position: {
            x: obj.position.x + dx,
            y: obj.position.y + dy,
          },
        };
      }
      return obj;
    });
    onUpdateObjects(updated);
  };

  return (
    <div className="flex-grow flex flex-col bg-gray-950 overflow-hidden">
      <canvas
        width={settings.resolution.width}
        height={settings.resolution.height}
        onClick={handleCanvasClick}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex-grow bg-gray-800 cursor-move"
        style={{
          backgroundImage: isGridVisible
            ? `linear-gradient(0deg, transparent ${gridSize - 1}px, #444 ${gridSize}px), linear-gradient(90deg, transparent ${gridSize - 1}px, #444 ${gridSize}px)`
            : 'none',
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />
    </div>
  );
};

export default SceneEditor;
