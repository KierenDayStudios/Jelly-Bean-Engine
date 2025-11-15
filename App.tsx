

import React from 'react';
import { createRoot } from 'react-dom/client';
import { GameProject, Scene, GameObject, GameEvent, EventGroup, Layer, EventTreeNode, BarGameObject, GameSettings, SoundAsset, Point } from './types';
import LeftPanel from './components/LeftPanel';
import SceneEditor from './components/SceneEditor';
import PropertiesPanel from './components/PropertiesPanel';
import EventEditor from './components/EventEditor';
import MainToolbar from './components/MainToolbar';
import GamePreview from './components/GamePreview';
import { LayoutIcon, CodeIcon, LayerIcon, ChevronLeftIcon, ChevronRightIcon } from './components/Icons';
import Button from './components/Button';
import Input from './components/Input';
import GlobalVariablesModal from './components/GlobalVariablesModal';
import LayersModal from './components/LayersModal';
import GameDashboardModal from './components/GameDashboardModal';
import SoundManagerModal from './components/SoundManagerModal';
import { getExportHTML } from './services/exportTemplate';

const playerSprite = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAfElEQVQ4T2NkYGD4z4AG/gPQ+xGqg/9//v7/x48f/H/+/AkDc/4DcfgfS/7///8ZhBHV+P/79y8DP/78+cMw/v//n4GJgQEw/v/9+xfr/79//zL8//37FyA5/g+k/wHp/wHIfwEpfwPofwTxfw/ifwjzPwDxnYECAIL4JtrR8z8VAAAAAElFTSuQmCC';
const turretSprite = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAo0lEQVQ4T2NkYGD4z4AK/v//jwEGOPz79w8DP/78+QPD//9/JgYGBmD8//v3L8P/379/Gf7//v0Lw//fP3/+/Pnz/x8g+f/379/B//+ZgYGRgYGB+f/v379MDIwMYAwmxP/BgYGBCegakN6Lqgb//w8D+P/3718Gfvz48QeU//8M/AFp/x/U/wHy/z8o/v8D+f8/AP//AwD4OCm2lJ+xAAAAAElFTSuQmCC';
const bulletSprite = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAJElEQVQYV2NkYGD4z4AK/v//jwEGODExwfj/9+8fhgYAPgcDWBuMAAMA7OkK31f2zHAAAAAASUVORK5CYII=';
const wallSprite = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAaUlEQVQ4T2NkYGD4z4AK/v8MDBhAALIAFgZCTAwM1v+gVTEwMNz/MWB8yMDA8J+Bgb///wz/P//+B2IMDEwMDBIMDP8ZGBj/MzD8BwI2DAL6/z8DAwMDw38GBoY/DAwMDADpQxgtP2tZWQAAAABJRU5ErkJggg==';
const floorTileSprite = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGD4z4AK/v8MIMsISxIMAzAEowJmMDBgAKYCRjQwAAg+g2g/DEGgCwAClQ4o0iYVAgAAAABJRU5ErkJggg==';
const hitSound = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAJABkAAQB8AAEAfAAABAAgAZGF0YQQAAAAAAQ==';


const initialProject: GameProject = {
  settings: {
    title: 'Jelly Bean Engine Game',
    description: 'A game made with Jelly Bean Engine.',
    version: '1.0.0',
    resolution: { width: 1280, height: 720 },
    orientation: 'landscape',
  },
  scenes: [
    {
      id: 'scene1',
      name: 'Top Down Arena',
      layers: [
        { name: 'Background', visibleInEditor: true, parallaxX: 1, parallaxY: 1 },
        { name: 'Main', visibleInEditor: true, parallaxX: 1, parallaxY: 1 },
        { name: 'UI', visibleInEditor: true, parallaxX: 0, parallaxY: 0 },
      ],
      objects: [
        {
          id: 'floor1',
          name: 'Floor',
          type: 'tiled_sprite',
          position: { x: 0, y: 0 },
          size: { width: 1280, height: 720 },
          scale: 1,
          rotation: 0,
          sprite: floorTileSprite,
          variables: {},
          layer: 'Background',
          visible: true,
          animations: [],
          behaviors: [],
        },
        {
          id: 'player1',
          name: 'Player',
          type: 'sprite',
          position: { x: 600, y: 350 },
          size: { width: 32, height: 32 },
          scale: 1,
          rotation: 0,
          sprite: playerSprite,
          variables: {},
          layer: 'Main',
          visible: true,
          animations: [],
          points: { "Muzzle": { x: 16, y: 0 } },
          behaviors: [
            { type: 'top_down_movement', speed: 200, acceleration: 1000, deceleration: 1000, allowDiagonals: true, controlScheme: 'wasd' },
            { type: 'rotate_towards_mouse', rotationSpeed: 720, offset: -90 },
            { type: 'health', maxHealth: 100, currentHealth: 100 }
          ],
        },
        {
          id: 'enemy_turret_1',
          name: 'EnemyTurret',
          type: 'sprite',
          position: { x: 200, y: 200 },
          size: { width: 48, height: 48 },
          scale: 1,
          rotation: 0,
          sprite: turretSprite,
          variables: {},
          layer: 'Main',
          visible: true,
          animations: [],
          points: { "Muzzle": { x: 24, y: 0 } },
          behaviors: [
            { type: 'turret', fireRate: 1, bulletObjectName: 'EnemyBullet', spawnPoint: 'Muzzle', autoFire: true },
            { type: 'health', maxHealth: 50, currentHealth: 50 }
          ],
        },
         {
          id: 'player_bullet',
          name: 'PlayerBullet',
          type: 'sprite',
          position: { x: -1000, y: -1000 }, // Off-screen
          size: { width: 16, height: 16 },
          scale: 1,
          rotation: 0,
          sprite: bulletSprite,
          variables: {},
          layer: 'Main',
          visible: true,
          animations: [],
          behaviors: [
            { type: 'bullet', speed: 400, destroyOnCollision: true, lifespan: 2 }
          ],
        },
        {
          id: 'enemy_bullet',
          name: 'EnemyBullet',
          type: 'sprite',
          position: { x: -1000, y: -1000 }, // Off-screen
          size: { width: 16, height: 16 },
          scale: 1,
          rotation: 0,
          sprite: bulletSprite,
          variables: {},
          layer: 'Main',
          visible: true,
          animations: [],
          behaviors: [
            { type: 'bullet', speed: 300, destroyOnCollision: true, lifespan: 3 }
          ],
        },
        {
          id: 'wall_1',
          name: 'Wall',
          type: 'sprite',
          position: { x: 100, y: 100 },
          size: { width: 1080, height: 32 },
          scale: 1,
          rotation: 0,
          sprite: wallSprite,
          variables: {},
          layer: 'Main',
          visible: true,
          animations: [],
          behaviors: [],
        },
        {
          id: 'score_text_1',
          name: 'ScoreText',
          type: 'text',
          position: { x: 20, y: 50 },
          size: { width: 200, height: 40 },
          scale: 1,
          rotation: 0,
          variables: {},
          layer: 'UI',
          visible: true,
          behaviors: [],
          text: 'Score: 0',
          font: 'Arial',
          fontSize: 24,
          color: '#FFFFFF',
          align: 'left',
          baseline: 'top',
        },
        {
          id: 'player_health_bar_1',
          name: 'PlayerHealthBar',
          type: 'bar',
          position: { x: 20, y: 20 },
          size: { width: 200, height: 24 },
          scale: 1,
          rotation: 0,
          variables: {},
          layer: 'UI',
          visible: true,
          behaviors: [],
          maxValue: 100,
          currentValue: 100,
          valueFromVariable: {
              source: 'object_variable',
              objectId: 'player1',
              variableName: 'health'
          },
          backgroundColor: '#4B5563',
          foregroundColor: '#EF4444',
          borderColor: '#FFFFFF',
          borderWidth: 2,
          showLabel: true,
          labelFont: 'Arial',
          labelSize: 14,
          labelColor: '#FFFFFF',
        } as BarGameObject
      ],
      events: [
        {
            id: 'event_shoot_1',
            type: 'event',
            name: 'Player Shoots',
            conditions: [{ id: 'c1', type: 'mouse_button_pressed', button: 'left' }],
            actions: [{ id: 'a1', type: 'fire_bullet', objectId: 'player1', bulletObjectName: 'PlayerBullet', spawnPoint: 'Muzzle' }]
        },
        {
            id: 'event_bullet_hits_wall',
            type: 'event',
            name: 'Bullet Hits Wall',
            conditions: [{id: 'c1', type: 'collision', objectId1: 'player_bullet', objectId2: 'wall_1'}],
            actions: [{id: 'a1', type: 'destroy_object', objectId: 'player_bullet'}]
        },
        {
            id: 'event_hit_enemy_1',
            type: 'event',
            name: 'Player Bullet Hits Enemy',
            conditions: [{ id: 'c1', type: 'collision', objectId1: 'player_bullet', objectId2: 'enemy_turret_1' }],
            actions: [
                { id: 'a1', type: 'damage_object', objectId: 'enemy_turret_1', amount: 25 },
                { id: 'a2', type: 'play_sound', sound: 'hit.wav'},
                { id: 'a3', type: 'destroy_object', objectId: 'player_bullet' }
            ]
        },
        {
            id: 'event_enemy_dies',
            type: 'event',
            name: 'Enemy Dies',
            conditions: [{id: 'c1', type: 'compare_health', objectId: 'enemy_turret_1', operator: '<=', value: 0}],
            actions: [
                { id: 'a1', type: 'destroy_object', objectId: 'enemy_turret_1' },
                { id: 'a2', type: 'change_global_variable', variable: 'score', operation: '+', value: 10 },
            ]
        },
        {
            id: 'event_player_hit',
            type: 'event',
            name: 'Player is Hit',
            conditions: [{id: 'c1', type: 'collision', objectId1: 'player1', objectId2: 'enemy_bullet'}],
            actions: [
                {id: 'a1', type: 'damage_object', objectId: 'player1', amount: 10},
                {id: 'a2', type: 'destroy_object', objectId: 'enemy_bullet'},
            ]
        },
        {
            id: 'event_update_score_1',
            type: 'event',
            name: 'Update Score Text',
            conditions: [], // Always run
            actions: [{ id: 'a1', type: 'set_text', objectId: 'score_text_1', text: 'Score: ${global.score}' }]
        },
        {
            id: 'event_save_game_1',
            type: 'event',
            name: 'Save Game State',
            conditions: [{ id: 'c1', type: 'key_pressed', key: 'p' }],
            actions: [
                { id: 'a1', type: 'save_game_state', slotName: 'save_1' },
                { id: 'a2', type: 'show_popup', title: 'Game Saved', content: 'Your progress has been saved.', buttonText: 'OK' }
            ]
        }
      ],
    },
  ],
  assets: {
    sounds: [{ name: 'hit.wav', dataUrl: hitSound }],
  },
  globalVariables: {
    score: 0,
  }
};

interface TabButtonProps {
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive 
                ? 'bg-red-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const getAllProjectSprites = (project: GameProject): string[] => {
    const spriteSet = new Set<string>();
    project.scenes.forEach(scene => {
        scene.objects.forEach(obj => {
            if (obj.type === 'sprite' || obj.type === 'tiled_sprite') {
                if (obj.sprite) {
                    spriteSet.add(obj.sprite);
                }
                obj.animations.forEach(anim => {
                    anim.frames.forEach(frame => {
                        spriteSet.add(frame);
                    });
                });
            }
        });
    });
    return Array.from(spriteSet);
};


const App: React.FC = () => {
  const [project, setProject] = React.useState<GameProject>(initialProject);
  const [activeSceneId, setActiveSceneId] = React.useState<string>(initialProject.scenes[0]?.id || '');
  const [selectedObjectIds, setSelectedObjectIds] = React.useState<string[]>([]);
  const [isPreviewing, setIsPreviewing] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<'scene' | 'events'>('scene');
  const [isGlobalVarsModalOpen, setIsGlobalVarsModalOpen] = React.useState(false);
  const [isLayersModalOpen, setIsLayersModalOpen] = React.useState(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = React.useState(false);
  const [isSoundManagerModalOpen, setIsSoundManagerModalOpen] = React.useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = React.useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = React.useState(false);
  const [isGridVisible, setIsGridVisible] = React.useState(true);
  const [gridSize, setGridSize] = React.useState(50);
  const loadProjectInputRef = React.useRef<HTMLInputElement>(null);

  const activeScene = project.scenes.find(s => s.id === activeSceneId);
  const firstSelectedObject = activeScene?.objects.find(o => o.id === selectedObjectIds[0]);

  const handleSelectScene = (id: string) => {
    setActiveSceneId(id);
    setSelectedObjectIds([]);
  };
  
  const handleAddScene = () => {
    const newScene: Scene = {
      id: `scene_${Date.now()}`,
      name: `New Scene ${project.scenes.length + 1}`,
      layers: [
        { name: 'Background', visibleInEditor: true, parallaxX: 1, parallaxY: 1 },
        { name: 'Main', visibleInEditor: true, parallaxX: 1, parallaxY: 1 },
        { name: 'UI', visibleInEditor: true, parallaxX: 0, parallaxY: 0 },
      ],
      objects: [],
      events: [],
    };
    setProject(prev => ({
      ...prev,
      scenes: [...prev.scenes, newScene],
    }));
    setActiveSceneId(newScene.id);
  };
  
  const handleDeleteScene = (id: string) => {
    if (project.scenes.length <= 1) {
        alert("Cannot delete the last scene.");
        return;
    }
    if (window.confirm("Are you sure you want to delete this scene?")) {
        const newScenes = project.scenes.filter(s => s.id !== id);
        setProject(prev => ({ ...prev, scenes: newScenes }));
        if (activeSceneId === id) {
            setActiveSceneId(newScenes[0]?.id || '');
        }
    }
  };

  const handleUpdateScene = React.useCallback((sceneId: string, updates: Partial<Scene>) => {
    setProject(prev => ({
        ...prev,
        scenes: prev.scenes.map(s => s.id === sceneId ? {...s, ...updates} : s)
    }));
  }, []);

  const handleAddObject = () => {
    if (!activeScene) return;
    const newObject: GameObject = {
      id: `obj_${Date.now()}`,
      name: 'New Object',
      type: 'sprite',
      position: { x: 50, y: 50 },
      size: { width: 32, height: 32 },
      scale: 1,
      rotation: 0,
      sprite: undefined,
      variables: {},
      layer: activeScene.layers[1]?.name || activeScene.layers[0]?.name || 'Main',
      visible: true,
      animations: [],
      behaviors: [],
    };
    setProject(prev => {
      const newScenes = prev.scenes.map(scene => {
        if (scene.id === activeSceneId) {
          return { ...scene, objects: [...scene.objects, newObject] };
        }
        return scene;
      });
      return { ...prev, scenes: newScenes };
    });
    setSelectedObjectIds([newObject.id]);
  };
  
  const handleDeleteObjects = (objectIds: string[]) => {
      if (!activeScene) return;
      if (window.confirm(`Are you sure you want to delete ${objectIds.length} object(s)?`)) {
          setProject(prev => {
              const newScenes = prev.scenes.map(scene => {
                  if (scene.id === activeSceneId) {
                      return { ...scene, objects: scene.objects.filter(o => !objectIds.includes(o.id)) };
                  }
                  return scene;
              });
              return { ...prev, scenes: newScenes };
          });
          setSelectedObjectIds([]);
      }
  };

  const handleDuplicateObjects = (objectIds: string[]) => {
      if (!activeScene) return;
      const objectsToDuplicate = activeScene.objects.filter(o => objectIds.includes(o.id));
      if (objectsToDuplicate.length === 0) return;

      const newObjects: GameObject[] = objectsToDuplicate.map(originalObject => ({
          ...JSON.parse(JSON.stringify(originalObject)),
          id: `obj_${Date.now()}_${Math.random()}`,
          name: `${originalObject.name} (Copy)`,
          position: {
              x: originalObject.position.x + 20,
              y: originalObject.position.y + 20,
          }
      }));

      setProject(prev => {
          const newScenes = prev.scenes.map(scene => {
              if (scene.id === activeSceneId) {
                  return { ...scene, objects: [...scene.objects, ...newObjects] };
              }
              return scene;
          });
          return { ...prev, scenes: newScenes };
      });
      setSelectedObjectIds(newObjects.map(o => o.id));
  };
  
  const handleDuplicateObjectAtPosition = (objectId: string, position: Point) => {
    if (!activeScene) return;
    const originalObject = activeScene.objects.find(o => o.id === objectId);
    if (!originalObject) return;

    const newObject: GameObject = {
        ...JSON.parse(JSON.stringify(originalObject)),
        id: `obj_${Date.now()}_${Math.random()}`,
        name: originalObject.name,
        position: {
            x: position.x - (originalObject.size.width * (originalObject.scale || 1)) / 2,
            y: position.y - (originalObject.size.height * (originalObject.scale || 1)) / 2,
        }
    };

    setProject(prev => {
        const newScenes = prev.scenes.map(scene => {
            if (scene.id === activeSceneId) {
                return { ...scene, objects: [...scene.objects, newObject] };
            }
            return scene;
        });
        return { ...prev, scenes: newScenes };
    });
    setSelectedObjectIds([newObject.id]);
  };
  
  const handleShowPropertiesForObject = (objectId: string) => {
      setSelectedObjectIds([objectId]);
      setIsRightPanelCollapsed(false);
  };

  const handleSaveProject = () => {
    try {
        const projectData = JSON.stringify(project, null, 2);
        const blob = new Blob([projectData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'project.jelly';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error saving project:", error);
        alert('Could not save project.');
    }
  };
  
  const handleExportProject = () => {
     try {
        const htmlContent = getExportHTML(project);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'game.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error exporting project:", error);
        alert('Could not export project.');
    }
  }

  const handleLoadProject = () => {
    loadProjectInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const contents = e.target?.result as string;
            const loadedProject: GameProject = JSON.parse(contents);

            // Backwards compatibility for projects with string[] layers
            loadedProject.scenes.forEach((scene: Scene) => {
                if (scene.layers.length > 0 && typeof scene.layers[0] === 'string') {
                    scene.layers = (scene.layers as unknown as string[]).map(name => ({
                        name,
                        visibleInEditor: true,
                        parallaxX: 1,
                        parallaxY: 1,
                    }));
                }
            });
            
            // Backwards compatibility for projects without settings
            if (!loadedProject.settings) {
                loadedProject.settings = initialProject.settings;
            }

            // Backwards compatibility for old sound format
            if (loadedProject.assets.sounds.length > 0 && typeof loadedProject.assets.sounds[0] === 'string') {
                console.warn("Old sound format detected. Sounds will be ignored.");
                loadedProject.assets.sounds = [];
            }

            if (loadedProject.scenes && loadedProject.assets) {
                setProject(loadedProject);
                setActiveSceneId(loadedProject.scenes[0]?.id || '');
                setSelectedObjectIds([]);
                alert('Project loaded!');
            } else {
                alert('Invalid project file.');
            }
        } catch (error) {
            console.error("Error parsing project file:", error);
            alert('Could not load project. The file might be corrupt or in the wrong format.');
        }
    };
    
    reader.onerror = () => {
        console.error("Error reading file:", reader.error);
        alert('Could not read the selected file.');
    };

    reader.readAsText(file);
    
    if (event.target) {
        event.target.value = '';
    }
  };

  const updateObjects = React.useCallback((updatedObjects: GameObject[]) => {
      setProject(prevProject => {
          const updatedIds = new Set(updatedObjects.map(o => o.id));
          const newScenes = prevProject.scenes.map(scene => {
              if (scene.id === activeSceneId) {
                  return {
                      ...scene,
                      objects: scene.objects.map(obj => {
                          const updated = updatedObjects.find(u => u.id === obj.id);
                          return updated || obj;
                      })
                  };
              }
              return scene;
          });
          return { ...prevProject, scenes: newScenes };
      });
  }, [activeSceneId]);
  
  const updateEvents = React.useCallback((updatedEvents: EventTreeNode[]) => {
      setProject(prevProject => {
        const newScenes = prevProject.scenes.map(scene => {
          if (scene.id === activeSceneId) {
            return {
              ...scene,
              events: updatedEvents
            };
          }
          return scene;
        });
        return { ...prevProject, scenes: newScenes };
      });
    }, [activeSceneId]);

  const handleUpdateGlobalVariables = React.useCallback((updatedVariables: Record<string, any>) => {
    setProject(prev => ({...prev, globalVariables: updatedVariables}));
  }, []);

  const handleUpdateSettings = React.useCallback((updatedSettings: GameSettings) => {
    setProject(prev => ({...prev, settings: updatedSettings}));
  }, []);

  const handleUpdateSounds = React.useCallback((updatedSounds: SoundAsset[]) => {
      setProject(prev => ({
          ...prev,
          assets: { ...prev.assets, sounds: updatedSounds }
      }));
  }, []);

  if (!activeScene) {
    return <div className="p-4 text-red-500">No active scene found.</div>;
  }
  
  const projectSprites = getAllProjectSprites(project);

  return (
    <div className="flex flex-col h-screen bg-black text-gray-100 font-sans">
      <input 
        type="file" 
        ref={loadProjectInputRef}
        onChange={handleFileSelected}
        accept=".jelly,.gamma,application/json"
        style={{ display: 'none' }} 
      />
      <header className="bg-gray-900 text-white p-2 text-center shadow-md z-10 flex-shrink-0">
        <h1 className="text-xl font-bold">Jelly Bean Engine V1.0</h1>
      </header>
      <MainToolbar 
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onExportProject={handleExportProject}
        onOpenGlobalVariables={() => setIsGlobalVarsModalOpen(true)}
        onOpenLayers={() => setIsLayersModalOpen(true)}
        onOpenSoundManager={() => setIsSoundManagerModalOpen(true)}
        onOpenGameDashboard={() => setIsDashboardModalOpen(true)}
        isPreviewing={isPreviewing}
        onTogglePreview={() => setIsPreviewing(!isPreviewing)}
        selectedObjectName={firstSelectedObject?.name}
        isGridVisible={isGridVisible}
        gridSize={gridSize}
        onToggleGrid={() => setIsGridVisible(v => !v)}
        onSetGridSize={setGridSize}
      />
       <div className="bg-gray-900 border-b border-gray-800 px-4 py-1 flex items-center gap-2 flex-shrink-0">
            <TabButton 
                label="Scene"
                icon={<LayoutIcon />}
                isActive={activeTab === 'scene'}
                onClick={() => setActiveTab('scene')}
            />
            <TabButton 
                label="Events"
                icon={<CodeIcon />}
                isActive={activeTab === 'events'}
                onClick={() => setActiveTab('events')}
            />
        </div>
      <div className="flex flex-grow overflow-hidden">
        <LeftPanel 
          project={project}
          activeScene={activeScene}
          selectedObjectIds={selectedObjectIds}
          onSelectScene={handleSelectScene}
          onSelectObjects={setSelectedObjectIds}
          onAddScene={handleAddScene}
          onDeleteScene={handleDeleteScene}
          onAddObject={handleAddObject}
          className={`flex-shrink-0 ${isLeftPanelCollapsed ? 'w-0 !p-0 !border-0' : 'w-64 p-4'}`}
        />
        <div 
          onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)} 
          title={isLeftPanelCollapsed ? 'Show Panel' : 'Hide Panel'} 
          className="flex-shrink-0 w-4 bg-gray-900 hover:bg-gray-800 cursor-pointer flex items-center justify-center border-y border-r border-gray-800"
        >
          {isLeftPanelCollapsed ? <ChevronRightIcon className="h-4 w-4 text-gray-400" /> : <ChevronLeftIcon className="h-4 w-4 text-gray-400" />}
        </div>

        <div className="flex-grow flex overflow-hidden">
          {activeTab === 'scene' ? (
              <>
                  <main className="flex-grow flex flex-col relative">
                      <SceneEditor 
                          scene={activeScene}
                          settings={project.settings}
                          selectedObjectIds={selectedObjectIds}
                          onSelectObjects={setSelectedObjectIds}
                          onUpdateObjects={updateObjects}
                          isGridVisible={isGridVisible}
                          gridSize={gridSize}
                          onDuplicateObjectAtPosition={handleDuplicateObjectAtPosition}
                          onDeleteObjects={handleDeleteObjects}
                          onDuplicateObjects={handleDuplicateObjects}
                          onShowPropertiesForObject={handleShowPropertiesForObject}
                      />
                  </main>
                  <div 
                    onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)} 
                    title={isRightPanelCollapsed ? 'Show Panel' : 'Hide Panel'} 
                    className="flex-shrink-0 w-4 bg-gray-900 hover:bg-gray-800 cursor-pointer flex items-center justify-center border-y border-l border-gray-800"
                  >
                    {isRightPanelCollapsed ? <ChevronLeftIcon className="h-4 w-4 text-gray-400" /> : <ChevronRightIcon className="h-4 w-4 text-gray-400" />}
                  </div>
                  <aside className={`bg-gray-900 text-white flex-shrink-0 border-l border-gray-800 transition-all duration-300 ease-in-out overflow-hidden ${isRightPanelCollapsed ? 'w-0 !p-0 !border-0' : 'w-96 p-4'}`}>
                      <div className="w-96 h-full overflow-y-auto">
                        <PropertiesPanel 
                            key={selectedObjectIds.join('-')} 
                            selectedObjectIds={selectedObjectIds}
                            projectSprites={projectSprites}
                            sceneLayers={activeScene.layers}
                            sceneObjects={activeScene.objects}
                            onUpdate={obj => updateObjects([obj])}
                            onDelete={handleDeleteObjects}
                            onDuplicate={handleDuplicateObjects}
                        />
                      </div>
                  </aside>
              </>
          ) : (
              <EventEditor
                  project={project}
                  activeScene={activeScene}
                  projectSprites={projectSprites}
                  onUpdateEvents={updateEvents}
              />
          )}
        </div>
      </div>
      {isPreviewing && activeScene && (
        <GamePreview 
          project={project}
          initialSceneId={project.scenes[0]?.id || activeScene.id}
          onClose={() => setIsPreviewing(false)} 
        />
      )}
      {isGlobalVarsModalOpen && (
        <GlobalVariablesModal
            variables={project.globalVariables}
            onUpdate={handleUpdateGlobalVariables}
            onClose={() => setIsGlobalVarsModalOpen(false)}
        />
      )}
      {isLayersModalOpen && (
        <LayersModal
          scene={activeScene}
          onUpdateScene={handleUpdateScene}
          onClose={() => setIsLayersModalOpen(false)}
        />
      )}
       {isSoundManagerModalOpen && (
        <SoundManagerModal
            sounds={project.assets.sounds}
            onUpdate={handleUpdateSounds}
            onClose={() => setIsSoundManagerModalOpen(false)}
        />
      )}
      {isDashboardModalOpen && (
        <GameDashboardModal
            settings={project.settings}
            onUpdate={handleUpdateSettings}
            onClose={() => setIsDashboardModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;