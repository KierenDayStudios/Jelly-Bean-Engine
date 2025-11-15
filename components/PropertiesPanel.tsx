import React from 'react';
import { GameObject } from '../types';

interface PropertiesPanelProps {
  selectedObjectIds: string[];
  projectSprites: string[];
  sceneLayers: any[];
  sceneObjects: GameObject[];
  onUpdate: (obj: GameObject) => void;
  onDelete: (ids: string[]) => void;
  onDuplicate: (ids: string[]) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObjectIds,
  projectSprites,
  sceneLayers,
  sceneObjects,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const selectedObject = sceneObjects.find(o => o.id === selectedObjectIds[0]);

  if (!selectedObject) {
    return <div className="p-4 text-gray-400">Select an object to view properties</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={selectedObject.name}
          onChange={e =>
            onUpdate({ ...selectedObject, name: e.target.value })
          }
          className="w-full px-2 py-1 bg-gray-700 text-white rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Position X</label>
        <input
          type="number"
          value={selectedObject.position.x}
          onChange={e =>
            onUpdate({
              ...selectedObject,
              position: { ...selectedObject.position, x: Number(e.target.value) },
            })
          }
          className="w-full px-2 py-1 bg-gray-700 text-white rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Position Y</label>
        <input
          type="number"
          value={selectedObject.position.y}
          onChange={e =>
            onUpdate({
              ...selectedObject,
              position: { ...selectedObject.position, y: Number(e.target.value) },
            })
          }
          className="w-full px-2 py-1 bg-gray-700 text-white rounded"
        />
      </div>

      <div className="space-y-2">
        <button
          onClick={() => onDuplicate([selectedObject.id])}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Duplicate
        </button>
        <button
          onClick={() => onDelete([selectedObject.id])}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
