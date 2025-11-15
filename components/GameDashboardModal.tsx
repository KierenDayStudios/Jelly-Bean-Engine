import React from 'react';
import { GameSettings } from '../types';

interface GameDashboardModalProps {
  settings: GameSettings;
  onUpdate: (settings: GameSettings) => void;
  onClose: () => void;
}

const GameDashboardModal: React.FC<GameDashboardModalProps> = ({
  settings,
  onUpdate,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center bg-gray-800 p-4">
          <h2 className="text-lg font-bold">Game Dashboard</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={settings.title}
              onChange={e =>
                onUpdate({ ...settings, title: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={settings.description}
              onChange={e =>
                onUpdate({ ...settings, description: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Version</label>
            <input
              type="text"
              value={settings.version}
              onChange={e =>
                onUpdate({ ...settings, version: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameDashboardModal;
