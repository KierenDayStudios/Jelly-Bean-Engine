import React from 'react';
import { GameProject, Scene } from '../types';

interface LeftPanelProps {
  project: GameProject;
  activeScene: Scene;
  selectedObjectIds: string[];
  onSelectScene: (id: string) => void;
  onSelectObjects: (ids: string[]) => void;
  onAddScene: () => void;
  onDeleteScene: (id: string) => void;
  onAddObject: () => void;
  className?: string;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  project,
  activeScene,
  selectedObjectIds,
  onSelectScene,
  onSelectObjects,
  onAddScene,
  onDeleteScene,
  onAddObject,
  className = '',
}) => {
  return (
    <div className={`bg-gray-800 border-r border-gray-700 ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2">Scenes</h2>
        <button
          onClick={onAddScene}
          className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded mb-2"
        >
          Add Scene
        </button>
        <div className="space-y-1">
          {project.scenes.map(scene => (
            <div key={scene.id} className="flex justify-between items-center">
              <button
                onClick={() => onSelectScene(scene.id)}
                className={`flex-1 text-left px-2 py-1 rounded ${
                  activeScene.id === scene.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {scene.name}
              </button>
              <button
                onClick={() => onDeleteScene(scene.id)}
                className="px-2 py-1 text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-2">Objects</h2>
        <button
          onClick={onAddObject}
          className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded mb-2"
        >
          Add Object
        </button>
        <div className="space-y-1">
          {activeScene.objects.map(obj => (
            <button
              key={obj.id}
              onClick={() => onSelectObjects([obj.id])}
              className={`w-full text-left px-2 py-1 rounded ${
                selectedObjectIds.includes(obj.id)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {obj.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;
