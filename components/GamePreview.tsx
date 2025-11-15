import React from 'react';
import { GameProject } from '../types';

interface GamePreviewProps {
  project: GameProject;
  initialSceneId: string;
  onClose: () => void;
}

const GamePreview: React.FC<GamePreviewProps> = ({
  project,
  initialSceneId,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl max-w-4xl w-full max-h-screen">
        <div className="flex justify-between items-center bg-gray-800 p-4">
          <h2 className="text-lg font-bold">Game Preview</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Close
          </button>
        </div>
        <div className="p-4">
          <p className="text-gray-400">
            Game preview not yet implemented. Starting scene: {initialSceneId}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GamePreview;
