import React from 'react';
import { GameProject, Scene, EventTreeNode } from '../types';

interface EventEditorProps {
  project: GameProject;
  activeScene: Scene;
  projectSprites: string[];
  onUpdateEvents: (events: EventTreeNode[]) => void;
}

const EventEditor: React.FC<EventEditorProps> = ({
  project,
  activeScene,
  projectSprites,
  onUpdateEvents,
}) => {
  return (
    <div className="flex-grow p-4 overflow-auto">
      <h2 className="text-lg font-bold mb-4">Event Editor</h2>
      <p className="text-gray-400">
        Total Events: {activeScene.events.length}
      </p>
      <div className="mt-4 space-y-2">
        {activeScene.events.map((event) => (
          <div key={event.id} className="p-3 bg-gray-800 rounded">
            <h3 className="font-medium">{event.name || 'Unnamed Event'}</h3>
            <p className="text-sm text-gray-400">ID: {event.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventEditor;
