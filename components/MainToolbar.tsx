import React from 'react';

interface MainToolbarProps {
  onSaveProject: () => void;
  onLoadProject: () => void;
  onExportProject: () => void;
  onOpenGlobalVariables: () => void;
  onOpenLayers: () => void;
  onOpenSoundManager: () => void;
  onOpenGameDashboard: () => void;
  isPreviewing: boolean;
  onTogglePreview: () => void;
  selectedObjectName?: string;
  isGridVisible: boolean;
  gridSize: number;
  onToggleGrid: () => void;
  onSetGridSize: (size: number) => void;
}

const MainToolbar: React.FC<MainToolbarProps> = ({
  onSaveProject,
  onLoadProject,
  onExportProject,
  onOpenGlobalVariables,
  onOpenLayers,
  onOpenSoundManager,
  onOpenGameDashboard,
  isPreviewing,
  onTogglePreview,
  selectedObjectName,
  isGridVisible,
  gridSize,
  onToggleGrid,
  onSetGridSize,
}) => {
  return (
    <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center gap-2 flex-wrap flex-shrink-0">
      <button
        onClick={onSaveProject}
        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
      >
        Save
      </button>
      <button
        onClick={onLoadProject}
        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
      >
        Load
      </button>
      <button
        onClick={onExportProject}
        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
      >
        Export
      </button>
      <button
        onClick={onOpenGlobalVariables}
        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
      >
        Variables
      </button>
      <button
        onClick={onOpenLayers}
        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
      >
        Layers
      </button>
      <button
        onClick={onOpenSoundManager}
        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
      >
        Sounds
      </button>
      <button
        onClick={onOpenGameDashboard}
        className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm"
      >
        Dashboard
      </button>
      <button
        onClick={onTogglePreview}
        className={`px-3 py-1 text-white rounded text-sm ${
          isPreviewing
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isPreviewing ? 'Stop Preview' : 'Preview'}
      </button>
      <div className="ml-auto flex items-center gap-2">
        <label className="text-sm">
          <input
            type="checkbox"
            checked={isGridVisible}
            onChange={onToggleGrid}
            className="mr-1"
          />
          Grid
        </label>
        <input
          type="number"
          min="10"
          max="100"
          value={gridSize}
          onChange={e => onSetGridSize(Number(e.target.value))}
          className="w-12 px-1 py-1 bg-gray-700 text-white rounded text-sm"
        />
      </div>
    </div>
  );
};

export default MainToolbar;
