import React from 'react';
import { Scene } from '../types';

interface LayersModalProps {
  scene: Scene;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onClose: () => void;
}

const LayersModal: React.FC<LayersModalProps> = ({
  scene,
  onUpdateScene,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center bg-gray-800 p-4">
          <h2 className="text-lg font-bold">Layers</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {scene.layers.map((layer) => (
              <div key={layer.name} className="p-2 bg-gray-800 rounded">
                <p className="font-medium">{layer.name}</p>
                <p className="text-sm text-gray-400">
                  Parallax: ({layer.parallaxX}, {layer.parallaxY})
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayersModal;
