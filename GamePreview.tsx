



import React, { useRef, useEffect, useState } from 'react';
import { Scene, GameObject, GameProject, ForEachObjectCondition, Condition, NumberOfObjectsCondition, HealthBehavior, BarGameObject, TopDownMovementBehavior, TurretBehavior, FireBulletAction, GameEvent, EventTreeNode, TextGameObject, ObjectIsPressedCondition } from './types';

interface GamePreviewProps {
  project: GameProject;
  initialSceneId: string;
  onClose: () => void;
}

type RuntimeGameObject = GameObject & {
    animationState: {
        frameIndex: number;
        frameTime: number;
    };
    behaviorState: Record<string, any>;
};

interface SaveState {
    timestamp: number;
    currentSceneId: string;
    gameObjects: RuntimeGameObject[];
    globalVariables: Record<string, any>;
    camera: {
        x: number;
        y: number;
        zoom: number;
        bounds: { minX: number; minY: number; maxX: number; maxY: number } | null;
        lerp: { startX: number; startY: number; targetX: number; targetY: number; duration: number; elapsed: number } | null;
        lastX: number;
        lastY: number;
        isMoving: boolean;
    };
    timers: Record<string, number>;
}


const checkCollision = (obj1: RuntimeGameObject, obj2: RuntimeGameObject): boolean => {
    if (!obj1.visible || !obj2.visible) return false;
    const scale1 = obj1.scale || 1;
    const scale2 = obj2.scale || 1;
    const w1 = obj1.size.width * scale1;
    const h1 = obj1.size.height * scale1;
    const w2 = obj2.size.width * scale2;
    const h2 = obj2.size.height * scale2;

    return (
        obj1.position.x < obj2.position.x + w2 &&
        obj1.position.x + w1 > obj2.position.x &&
        obj1.position.y < obj2.position.y + h2 &&
        obj1.position.y + h1 > obj2.position.y
    );
};

const getObjectProperty = (obj: GameObject, prop: string): any => {
    const parts = prop.split('.');
    let current: any = obj;
    for (const part of parts) {
        if (current === null || typeof current !== 'object' || !(part in current)) {
            return undefined;
        }
        current = current[part];
    }
    return current;
};

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

// FIX: Changed component definition to be more explicit with props and return type.
const GamePreview = ({ project, initialSceneId, onClose }: GamePreviewProps): React.ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeScene, setActiveScene] = useState<Scene>(() => project.scenes.find(s => s.id === initialSceneId)!);
  const [popup, setPopup] = useState<{ title: string; content: string; buttonText: string } | null>(null);

  const gameObjects = useRef<RuntimeGameObject[]>([]);
  const globalVariables = useRef(JSON.parse(JSON.stringify(project.globalVariables)));
  const camera = useRef({
    x: project.settings.resolution.width / 2,
    y: project.settings.resolution.height / 2,
    zoom: 1,
    bounds: null as { minX: number; minY: number; maxX: number; maxY: number } | null,
    lerp: null as { startX: number; startY: number; targetX: number; targetY: number; duration: number; elapsed: number } | null,
    lastX: 0,
    lastY: 0,
    isMoving: false,
  });
  const followedObjectId = useRef<string | null>(null);

  const keysPressed = useRef<Record<string, boolean>>({}).current;
  const prevKeysPressed = useRef<Record<string, boolean>>({}).current;
  const mouseButtonsPressed = useRef<Record<number, boolean>>({}).current;
  const prevMouseButtonsPressed = useRef<Record<number, boolean>>({}).current;

  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [patterns, setPatterns] = useState<Record<string, CanvasPattern | null>>({});
  const [sounds, setSounds] = useState<Record<string, AudioBuffer>>({});
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGain = useRef<GainNode | null>(null);
  const playingSounds = useRef<Map<string, Set<AudioBufferSourceNode>>>(new Map()).current;
  const musicSource = useRef<{source: AudioBufferSourceNode, soundName: string} | null>(null);

  const cameraShake = useRef({ intensity: 0, remaining: 0 });
  const startTime = useRef(Date.now());
  const clickedObjectId = useRef<string | null>(null);
  const mousePosition = useRef<{x: number, y: number}>({ x: -1, y: -1 });
  const lastFrameTime = useRef(Date.now());
  const ranSceneStartEvents = useRef(new Set<string>());
  const timers = useRef<Record<string, number>>({}).current;
  const repeatingTimers = useRef<Record<string, number>>({}).current;

  const initializeScene = (scene: Scene) => {
    gameObjects.current = JSON.parse(JSON.stringify(scene.objects)).map((o: GameObject) => {
        const behaviorState: Record<string, any> = {};
        o.behaviors?.forEach(b => {
            switch(b.type) {
                case 'top_down_movement': behaviorState.top_down_movement = { vx: 0, vy: 0 }; break;
                case 'bullet': behaviorState.bullet = { aliveTime: 0 }; break;
                case 'turret': behaviorState.turret = { fireCooldown: 0 }; break;
                case 'health': {
                    const healthBehavior = b as HealthBehavior;
                    healthBehavior.currentHealth = healthBehavior.maxHealth;
                    break;
                }
            }
        });
        return {
            ...o,
            animationState: { frameIndex: 0, frameTime: 0 },
            behaviorState: behaviorState,
        }
    });
  }

  useEffect(() => {
    initializeScene(activeScene);
    camera.current = {
        x: project.settings.resolution.width / 2,
        y: project.settings.resolution.height / 2,
        zoom: 1,
        bounds: null,
        lerp: null,
        lastX: project.settings.resolution.width / 2,
        lastY: project.settings.resolution.height / 2,
        isMoving: false,
    };
    followedObjectId.current = null;
    ranSceneStartEvents.current.clear();
    Object.keys(timers).forEach(key => delete timers[key]);
    Object.keys(repeatingTimers).forEach(key => delete repeatingTimers[key]);
  }, [activeScene, project.settings.resolution]);


  // Asset Loading Effects
  useEffect(() => {
    // Image loading
    const loadedImages: Record<string, HTMLImageElement> = {};
    const spriteUrls = getAllProjectSprites(project).filter(s => s && s.startsWith('data:image'));

    let imagesToLoad = spriteUrls.length;
    const onImageLoad = () => {
        imagesToLoad--;
        if (imagesToLoad === 0) setImages(loadedImages);
    };
    if (imagesToLoad === 0) setImages({});
    spriteUrls.forEach(spriteSrc => {
        const img = new Image();
        img.src = spriteSrc;
        img.onload = onImageLoad;
        img.onerror = onImageLoad;
        loadedImages[spriteSrc] = img;
    });

    // Audio loading
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        masterGain.current = audioContextRef.current.createGain();
        masterGain.current.connect(audioContextRef.current.destination);
    }
    const audioContext = audioContextRef.current;
    const loadedSounds: Record<string, AudioBuffer> = {};
    let soundsToLoad = project.assets.sounds.length;
    if(soundsToLoad === 0) setSounds({});
    project.assets.sounds.forEach(soundAsset => {
        try {
            const base64String = soundAsset.dataUrl.split(',')[1];
            if (!base64String) throw new Error('Invalid data URL format.');
            const binaryString = atob(base64String);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const arrayBuffer = bytes.buffer;

            audioContext.decodeAudioData(arrayBuffer)
                .then(audioBuffer => {
                    loadedSounds[soundAsset.name] = audioBuffer;
                })
                .catch(e => console.error(`Error decoding audio data for ${soundAsset.name}:`, e))
                .finally(() => {
                    soundsToLoad--;
                    if (soundsToLoad === 0) {
                        setSounds(loadedSounds);
                    }
                });
        } catch (e) {
            console.error(`Error processing data URL for sound ${soundAsset.name}:`, e);
            soundsToLoad--;
            if (soundsToLoad === 0) {
                setSounds(loadedSounds);
            }
        }
    });

  }, [project]);

   useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newPatterns: Record<string, CanvasPattern | null> = {};
        Object.entries(images).forEach(([src, img]) => {
            const imageEl = img as HTMLImageElement;
            if (imageEl.complete && imageEl.naturalWidth > 0) {
                newPatterns[src] = ctx.createPattern(imageEl, 'repeat');
            }
        });
    setPatterns(newPatterns);
  }, [images]);

  // Input Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysPressed[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed[e.key] = false; };
    const handleMouseDown = (e: MouseEvent) => { mouseButtonsPressed[e.button] = true; };
    const handleMouseUp = (e: MouseEvent) => { mouseButtonsPressed[e.button] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const getObjectBoundingBox = (obj: RuntimeGameObject) => {
    const scale = obj.scale || 1;
    const renderWidth = obj.size.width * scale;
    const renderHeight = obj.size.height * scale;
    return { x: obj.position.x, y: obj.position.y, width: renderWidth, height: renderHeight };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateMousePosition = (e: MouseEvent) => {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mousePosition.current.x = (e.clientX - rect.left - canvas.width / 2) / camera.current.zoom + camera.current.x;
        mousePosition.current.y = (e.clientY - rect.top - canvas.height / 2) / camera.current.zoom + camera.current.y;
    };

    const handleCanvasClick = (e: MouseEvent) => {
        if(popup) return; // Don't register clicks if popup is open
        updateMousePosition(e);

        let foundObject: GameObject | null = null;
        // Iterate through layers in render order to respect clicking on top objects first
        for (let i = activeScene.layers.length - 1; i >= 0; i--) {
            const layer = activeScene.layers[i];
            const objectsOnLayer = gameObjects.current.filter(o => o.layer === layer.name);
            for (let j = objectsOnLayer.length - 1; j >= 0; j--) {
                const obj = objectsOnLayer[j];
                if (!obj.visible) continue;
                const bbox = getObjectBoundingBox(obj);
                if (mousePosition.current.x >= bbox.x && mousePosition.current.x <= bbox.x + bbox.width &&
                    mousePosition.current.y >= bbox.y && mousePosition.current.y <= bbox.y + bbox.height) {
                    foundObject = obj;
                    break;
                }
            }
            if(foundObject) break;
        }
        if (foundObject) clickedObjectId.current = foundObject.id;
    };
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', updateMousePosition);
    return () => { 
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('mousemove', updateMousePosition);
     };
  }, [popup, activeScene]);


  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = (now - lastFrameTime.current) / 1000;
      lastFrameTime.current = now;

      if (!popup) {
        
        let currentObjects = gameObjects.current;
        let currentGlobalVars = globalVariables.current;
        
        camera.current.lastX = camera.current.x;
        camera.current.lastY = camera.current.y;

        // LERPING LOGIC
        if (camera.current.lerp) {
            const lerp = camera.current.lerp;
            lerp.elapsed += deltaTime;
            const progress = Math.min(lerp.elapsed / lerp.duration, 1);
            const easedProgress = progress * (2 - progress); // Ease out quad
            camera.current.x = lerp.startX + (lerp.targetX - lerp.startX) * easedProgress;
            camera.current.y = lerp.startY + (lerp.targetY - lerp.startY) * easedProgress;
            if (progress >= 1) {
                camera.current.lerp = null;
            }
        }

        // --- BEHAVIOR & VARIABLE PROCESSING ---
        const objectsToDestroy = new Set<string>();
        const objectsToCreate: RuntimeGameObject[] = [];

        currentObjects.forEach(obj => {
            // Sync health behavior to a variable
            const healthBehavior = obj.behaviors?.find(b => b.type === 'health') as HealthBehavior | undefined;
            if (healthBehavior) {
                obj.variables['health'] = healthBehavior.currentHealth;
            }

            // Behaviors
            obj.behaviors?.forEach(b => {
                switch(b.type) {
                    case 'top_down_movement': {
                        const behavior = b as TopDownMovementBehavior;
                        const state = obj.behaviorState.top_down_movement;
                        let moveX = 0, moveY = 0;

                        if (behavior.controlScheme === 'wasd') {
                            if(keysPressed['w']) moveY = -1;
                            if(keysPressed['s']) moveY = 1;
                            if(keysPressed['a']) moveX = -1;
                            if(keysPressed['d']) moveX = 1;
                        } else { // arrows
                            if(keysPressed['ArrowUp']) moveY = -1;
                            if(keysPressed['ArrowDown']) moveY = 1;
                            if(keysPressed['ArrowLeft']) moveX = -1;
                            if(keysPressed['ArrowRight']) moveX = 1;
                        }

                        if (!behavior.allowDiagonals && moveX !== 0 && moveY !== 0) {
                            moveY = 0; // Prioritize horizontal
                        }

                        let targetVX = moveX * behavior.speed;
                        let targetVY = moveY * behavior.speed;

                        if (behavior.allowDiagonals && moveX !== 0 && moveY !== 0) {
                            const diagScale = 1 / Math.sqrt(2);
                            targetVX *= diagScale;
                            targetVY *= diagScale;
                        }
                        
                        const accel = behavior.acceleration * deltaTime;
                        const decel = behavior.deceleration * deltaTime;

                        // Approach target velocity for X
                        if (Math.abs(targetVX) > 0) {
                            state.vx = Math.min(Math.abs(targetVX), Math.abs(state.vx + Math.sign(targetVX) * accel)) * Math.sign(targetVX);
                        } else {
                            state.vx = Math.sign(state.vx) * Math.max(0, Math.abs(state.vx) - decel);
                        }
                         // Approach target velocity for Y
                        if (Math.abs(targetVY) > 0) {
                            state.vy = Math.min(Math.abs(targetVY), Math.abs(state.vy + Math.sign(targetVY) * accel)) * Math.sign(targetVY);
                        } else {
                            state.vy = Math.sign(state.vy) * Math.max(0, Math.abs(state.vy) - decel);
                        }
                        
                        obj.position.x += state.vx * deltaTime;
                        obj.position.y += state.vy * deltaTime;
                        break;
                    }
                    case 'rotate_towards_mouse': {
                        const dx = mousePosition.current.x - (obj.position.x + (obj.size.width * (obj.scale || 1)) / 2);
                        const dy = mousePosition.current.y - (obj.position.y + (obj.size.height * (obj.scale || 1)) / 2);
                        const targetAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                        obj.rotation = targetAngle + b.offset;
                        break;
                    }
                     case 'bullet': {
                        obj.behaviorState.bullet.aliveTime += deltaTime;
                        if(obj.behaviorState.bullet.aliveTime > b.lifespan) {
                            objectsToDestroy.add(obj.id);
                            break;
                        }
                        const angleRad = obj.rotation * (Math.PI / 180);
                        obj.position.x += Math.cos(angleRad) * b.speed * deltaTime;
                        obj.position.y += Math.sin(angleRad) * b.speed * deltaTime;
                        break;
                    }
                    case 'turret': {
                        const behavior = b as TurretBehavior;
                        const state = obj.behaviorState.turret;
                        state.fireCooldown -= deltaTime;
                        if (behavior.autoFire && state.fireCooldown <= 0) {
                            const templateBullet = activeScene.objects.find(o => o.name === behavior.bulletObjectName);
                            const spawnPoint = obj.points?.[behavior.spawnPoint] || { x: obj.size.width / 2, y: obj.size.height / 2 };

                            if (templateBullet) {
                                const angleRad = obj.rotation * (Math.PI / 180);
                                const cos = Math.cos(angleRad);
                                const sin = Math.sin(angleRad);
                                const scale = obj.scale || 1;
                                
                                const localX = (spawnPoint.x - obj.size.width / 2) * scale;
                                const localY = (spawnPoint.y - obj.size.height / 2) * scale;

                                const worldX = obj.position.x + obj.size.width * scale / 2 + localX * cos - localY * sin;
                                const worldY = obj.position.y + obj.size.height * scale / 2 + localX * sin + localY * cos;

                                objectsToCreate.push({
                                    ...JSON.parse(JSON.stringify(templateBullet)),
                                    id: `runtime_${behavior.bulletObjectName}_${Date.now()}_${Math.random()}`,
                                    position: { x: worldX - templateBullet.size.width / 2, y: worldY - templateBullet.size.height / 2 },
                                    rotation: obj.rotation,
                                    behaviorState: { bullet: { aliveTime: 0 } },
                                } as RuntimeGameObject);
                                state.fireCooldown = 1 / behavior.fireRate;
                            }
                        }
                        break;
                    }
                }
            });
        });
        
        // Sync bar values from variables
        currentObjects.forEach(obj => {
            if (obj.type === 'bar' && obj.valueFromVariable && obj.valueFromVariable.source !== 'manual') {
                const bar = obj as BarGameObject;
                const config = bar.valueFromVariable!;
                let value = bar.currentValue;

                if (config.source === 'global_variable') {
                    value = currentGlobalVars[config.variableName] ?? 0;
                } else if (config.source === 'object_variable' && config.objectId) {
                    const sourceObj = currentObjects.find(o => o.id === config.objectId);
                    value = sourceObj?.variables[config.variableName] ?? 0;
                }
                bar.currentValue = value;
            }
        });

        // Update animations
        currentObjects.forEach(obj => {
          if (obj.type === 'sprite' && obj.currentAnimation) {
            const anim = obj.animations.find(a => a.name === obj.currentAnimation);
            if (anim && anim.frames.length > 0 && anim.speed > 0) {
              obj.animationState.frameTime += deltaTime;
              const frameDuration = 1 / anim.speed;
              if (obj.animationState.frameTime >= frameDuration) {
                obj.animationState.frameTime -= frameDuration;
                let nextFrame = obj.animationState.frameIndex + 1;
                if (nextFrame >= anim.frames.length) {
                  nextFrame = anim.loop ? 0 : anim.frames.length - 1;
                  if (!anim.loop) {
                    obj.currentAnimation = undefined; // Stop animation if not looping
                  }
                }
                obj.animationState.frameIndex = nextFrame;
              }
            }
          }
        });
        
        let nextSceneId: string | null = null;
        let loadRequest: string | null = null;

        const allEvents = activeScene.events.flatMap(function flatten(eventNode: EventTreeNode): GameEvent[] {
            if (eventNode.type === 'event') {
                return [eventNode];
            }
            if (eventNode.type === 'group' && !eventNode.isCollapsed) {
                return eventNode.events.flatMap(flatten);
            }
            return []; // Ignore comments and other types
        });

        allEvents.forEach(event => {
          const forEachCond = event.conditions.find(c => c.type === 'for_each_object') as ForEachObjectCondition | undefined;
          let iterationObjects: (RuntimeGameObject | null)[] = [null];

          if (forEachCond) {
              const templateObject = currentObjects.find(o => o.id === forEachCond.objectId);
              if (templateObject) {
                  iterationObjects = currentObjects.filter(o => o.name === templateObject.name);
              } else {
                  iterationObjects = [];
              }
          }

          iterationObjects.forEach(iterObject => {
              const conditionsMet = event.conditions.length === 0 || event.conditions.every(cond => {
                  if (cond.type === 'for_each_object') return true; // Already handled

                  // Dynamically change objectId for evaluation if in a for-each loop
                  const getTargetObjectId = (c: Condition) => {
                      if (iterObject && 'objectId' in c && c.objectId === forEachCond?.objectId) {
                          return iterObject.id;
                      }
                      return 'objectId' in c ? c.objectId : '';
                  };
                  
                  switch (cond.type) {
                    case 'key_pressed': return keysPressed[cond.key];
                    case 'key_released': return !keysPressed[cond.key] && prevKeysPressed[cond.key];
                    case 'mouse_button_pressed': return mouseButtonsPressed[0]; // 0 for left
                    case 'mouse_button_released': return !mouseButtonsPressed[0] && prevMouseButtonsPressed[0];
                    case 'collision': {
                      let obj1Id = cond.objectId1, obj2Id = cond.objectId2;
                      if(iterObject && forEachCond) {
                          if (cond.objectId1 === forEachCond.objectId) obj1Id = iterObject.id;
                          if (cond.objectId2 === forEachCond.objectId) obj2Id = iterObject.id;
                      }
                      const obj1s = currentObjects.filter(o => o.name === currentObjects.find(o1 => o1.id === obj1Id)?.name);
                      const obj2s = currentObjects.filter(o => o.name === currentObjects.find(o2 => o2.id === obj2Id)?.name);
                      if (obj1s.length === 0 || obj2s.length === 0) return false;
                      
                      return obj1s.some(o1 => obj2s.some(o2 => o1.id !== o2.id && checkCollision(o1, o2)));
                    }
                     case 'distance_between_objects': {
                        const obj1 = currentObjects.find(o => o.id === cond.objectId1);
                        const obj2 = currentObjects.find(o => o.id === cond.objectId2);
                        if (!obj1 || !obj2) return false;
                        const dx = (obj1.position.x + (obj1.size.width * (obj1.scale || 1)) / 2) - (obj2.position.x + (obj2.size.width * (obj2.scale || 1)) / 2);
                        const dy = (obj1.position.y + (obj1.size.height * (obj1.scale || 1)) / 2) - (obj2.position.y + (obj2.size.height * (obj2.scale || 1)) / 2);
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        return cond.operator === '<' ? distance < cond.distance : distance > cond.distance;
                    }
                    case 'number_of_objects': {
                        const templateObj = currentObjects.find(o => o.id === (cond as NumberOfObjectsCondition).objectId);
                        if(!templateObj) return false;
                        const count = currentObjects.filter(o => o.name === templateObj.name).length;
                        const compareValue = (cond as NumberOfObjectsCondition).count;
                        switch ((cond as NumberOfObjectsCondition).operator) {
                            case '==': return count == compareValue; case '!=': return count != compareValue;
                            case '>': return count > compareValue; case '<': return count < compareValue;
                            case '>=': return count >= compareValue; case '<=': return count <= compareValue;
                        }
                    }
                     case 'animation_is_playing': {
                        const obj = currentObjects.find(o => o.id === cond.objectId);
                        if (!obj || obj.type !== 'sprite') return cond.invert;
                        const isPlaying = obj.currentAnimation === cond.animationName;
                        return cond.invert ? !isPlaying : isPlaying;
                    }
                    case 'variable_comparison': {
                        const targetId = getTargetObjectId(cond);
                        const obj = currentObjects.find(o => o.id === targetId);
                        if (!obj) return false;
                        const varValue = obj.variables[cond.variable];
                        const compareValue = isNaN(Number(cond.value)) ? cond.value : Number(cond.value);
                        switch (cond.operator) {
                            case '==': return varValue == compareValue;
                            case '!=': return varValue != compareValue;
                            case '>': return varValue > compareValue;
                            case '<': return varValue < compareValue;
                            case '>=': return varValue >= compareValue;
                            case '<=': return varValue <= compareValue;
                        }
                    }
                    case 'object_property': {
                        const targetId = getTargetObjectId(cond);
                        const obj = currentObjects.find(o => o.id === targetId);
                        if (!obj) return false;
                        const propValue = getObjectProperty(obj, cond.property);
                        if (propValue === undefined) return false;
                        const compareValue = (typeof propValue === 'boolean') ? (String(cond.value).toLowerCase() === 'true') : (isNaN(Number(cond.value)) ? cond.value : Number(cond.value));
                        switch (cond.operator) {
                            case '==': return propValue == compareValue;
                            case '!=': return propValue != compareValue;
                            case '>': return propValue > compareValue;
                            case '<': return propValue < compareValue;
                            case '>=': return propValue >= compareValue;
                            case '<=': return propValue <= compareValue;
                        }
                    }
                    case 'compare_global_variable': {
                        const varValue = currentGlobalVars[cond.variable];
                        const compareValue = isNaN(Number(cond.value)) ? cond.value : Number(cond.value);
                        switch (cond.operator) {
                            case '==': return varValue == compareValue;
                            case '!=': return varValue != compareValue;
                            case '>': return varValue > compareValue;
                            case '<': return varValue < compareValue;
                            case '>=': return varValue >= compareValue;
                            case '<=': return varValue <= compareValue;
                        }
                    }
                    case 'timer_greater_than': {
                        const startTime = timers[cond.name];
                        if (!startTime) return false;
                        return (now - startTime) / 1000 >= cond.seconds;
                    }
                    case 'every_x_seconds': {
                        const key = cond.id;
                        const lastTrigger = repeatingTimers[key] || startTime.current;
                        if (now - lastTrigger >= cond.seconds * 1000) {
                            repeatingTimers[key] = now;
                            return true;
                        }
                        return false;
                    }
                    case 'mouse_click_object': return clickedObjectId.current === getTargetObjectId(cond);
                    case 'mouse_over_object': {
                        const targetId = getTargetObjectId(cond);
                        const obj = currentObjects.find(o => o.id === targetId);
                        if (!obj || !obj.visible) return false;
                        const bbox = getObjectBoundingBox(obj);
                        const isOver = (mousePosition.current.x >= bbox.x && mousePosition.current.x <= bbox.x + bbox.width &&
                                mousePosition.current.y >= bbox.y && mousePosition.current.y <= bbox.y + bbox.height);
                        return cond.invert ? !isOver : isOver;
                    }
                    case 'object_is_pressed': {
                        if (!mouseButtonsPressed[0]) return false; // only left click
                        const targetId = getTargetObjectId(cond as ObjectIsPressedCondition);
                        const obj = currentObjects.find(o => o.id === targetId);
                        if (!obj || !obj.visible) return false;

                        const bbox = getObjectBoundingBox(obj);
                        return (mousePosition.current.x >= bbox.x && mousePosition.current.x <= bbox.x + bbox.width &&
                                mousePosition.current.y >= bbox.y && mousePosition.current.y <= bbox.y + bbox.height);
                    }
                    case 'scene_start': 
                        if (!ranSceneStartEvents.current.has(event.id)) {
                            ranSceneStartEvents.current.add(event.id);
                            return true;
                        }
                        return false;
                    case 'save_exists': {
                        const exists = localStorage.getItem(`gamma_save_${cond.slotName}`) !== null;
                        return cond.invert ? !exists : exists;
                    }
                    case 'compare_health': {
                        const targetId = getTargetObjectId(cond);
                        const obj = currentObjects.find(o => o.id === targetId);
                        const healthBehavior = obj?.behaviors?.find(b => b.type === 'health') as HealthBehavior | undefined;
                        if(!healthBehavior) return false;
                        const health = healthBehavior.currentHealth;
                        switch(cond.operator){
                             case '==': return health == cond.value;
                            case '!=': return health != cond.value;
                            case '>': return health > cond.value;
                            case '<': return health < cond.value;
                            case '>=': return health >= cond.value;
                            case '<=': return health <= cond.value;
                        }
                    }
                    case 'is_sound_playing': {
                        const isPlaying = playingSounds.has(cond.sound) && playingSounds.get(cond.sound)!.size > 0;
                        return cond.invert ? !isPlaying : isPlaying;
                    }
                    case 'camera_is_moving':
                        return camera.current.isMoving;
                    case 'camera_in_bounds':
                        return (
                            camera.current.x >= cond.x &&
                            camera.current.x <= cond.x + cond.width &&
                            camera.current.y >= cond.y &&
                            camera.current.y <= cond.y + cond.height
                        );
                    default: return true;
                  }
              });

              if (conditionsMet) {
                event.actions.forEach(action => {
                   let targetObjectId = ('objectId' in action) ? action.objectId : null;
                   if (iterObject && forEachCond && targetObjectId === forEachCond.objectId) {
                       targetObjectId = iterObject.id;
                   }

                   switch (action.type) {
                     case 'move_object':
                       if (!targetObjectId) break;
                       gameObjects.current = currentObjects.map(obj => obj.id === targetObjectId ? { ...obj, position: { x: obj.position.x + action.dx, y: obj.position.y + action.dy } } : obj);
                       break;
                     case 'move_object_to':
                        if (!targetObjectId) break;
                        gameObjects.current = currentObjects.map(obj => {
                            if (obj.id === targetObjectId) {
                                const newPos = { ...obj.position };
                                const dx = action.x - obj.position.x;
                                const dy = action.y - obj.position.y;
                                const dist = Math.sqrt(dx * dx + dy * dy);
                                if (dist > 1) {
                                    const moveAmount = action.speed * deltaTime;
                                    newPos.x += (dx / dist) * Math.min(moveAmount, dist);
                                    newPos.y += (dy / dist) * Math.min(moveAmount, dist);
                                }
                                return { ...obj, position: newPos };
                            }
                            return obj;
                        });
                        break;
                    case 'move_object_towards_object':
                        if (!targetObjectId) break;
                        gameObjects.current = currentObjects.map(obj => {
                            if (obj.id === targetObjectId) {
                                const target = currentObjects.find(o => o.id === action.targetObjectId);
                                if (!target) return obj;

                                const newPos = { ...obj.position };
                                const dx = target.position.x - obj.position.x;
                                const dy = target.position.y - obj.position.y;
                                const dist = Math.sqrt(dx * dx + dy * dy);

                                if (dist > 1) {
                                    const moveAmount = action.speed * deltaTime;
                                    newPos.x += (dx / dist) * Math.min(moveAmount, dist);
                                    newPos.y += (dy / dist) * Math.min(moveAmount, dist);
                                }
                                return { ...obj, position: newPos };
                            }
                            return obj;
                        });
                        break;
                     case 'move_object_at_angle':
                        if (!targetObjectId) break;
                        gameObjects.current = currentObjects.map(obj => {
                            if (obj.id === targetObjectId) {
                                const angleRad = obj.rotation * (Math.PI / 180);
                                const moveX = Math.cos(angleRad) * action.speed * deltaTime;
                                const moveY = Math.sin(angleRad) * action.speed * deltaTime;
                                return { ...obj, position: { x: obj.position.x + moveX, y: obj.position.y + moveY } };
                            }
                            return obj;
                        });
                        break;
                     case 'set_object_position':
                        if (!targetObjectId) break;
                        gameObjects.current = currentObjects.map(obj => obj.id === targetObjectId ? { ...obj, position: { x: action.x, y: action.y } } : obj);
                        break;
                    case 'set_object_rotation':
                        if (!targetObjectId) break;
                        gameObjects.current = currentObjects.map(obj => obj.id === targetObjectId ? { ...obj, rotation: action.rotation } : obj);
                        break;
                    case 'set_object_sprite':
                        if (!targetObjectId) break;
                        gameObjects.current = currentObjects.map(obj => {
                           if (obj.id === targetObjectId && (obj.type === 'sprite' || obj.type === 'tiled_sprite')) {
                               return { ...obj, sprite: action.sprite };
                           }
                           return obj;
                        });
                        break;
                    case 'toggle_object_visibility':
                        if (!targetObjectId) break;
                        gameObjects.current = currentObjects.map(obj => obj.id === targetObjectId ? { ...obj, visible: action.visible } : obj);
                        break;
                      case 'change_variable':
                          if (!targetObjectId) break;
                          gameObjects.current = currentObjects.map(obj => {
                              if (obj.id === targetObjectId) {
                                  const newObj = JSON.parse(JSON.stringify(obj));
                                  const currentValue = newObj.variables[action.variable] || 0;
                                  const changeValue = typeof action.value === 'string' ? parseFloat(action.value) : action.value;
                                  switch(action.operation) {
                                      case '=': newObj.variables[action.variable] = changeValue; break;
                                      case '+': newObj.variables[action.variable] = currentValue + changeValue; break;
                                      case '-': newObj.variables[action.variable] = currentValue - changeValue; break;
                                      case '*': newObj.variables[action.variable] = currentValue * changeValue; break;
                                      case '/': newObj.variables[action.variable] = currentValue / changeValue; break;
                                  }
                                  return newObj;
                              }
                              return obj;
                          });
                          break;
                        case 'destroy_object':
                          if (!targetObjectId) break;
                          objectsToDestroy.add(targetObjectId);
                          break;
                        case 'camera_follow_object': followedObjectId.current = action.objectId; break;
                        case 'camera_set_position': camera.current.x = action.x; camera.current.y = action.y; break;
                        case 'camera_shake': cameraShake.current = { intensity: action.intensity, remaining: action.duration }; break;
                        case 'change_camera_zoom':
                            if (action.operation === '=') {
                                camera.current.zoom = action.zoom;
                            } else { // '+'
                                camera.current.zoom += action.zoom;
                            }
                            break;
                        case 'camera_zoom_to_fit_objects': {
                            const objectsToFit = currentObjects.filter(o => action.objectIds.includes(o.id));
                            if (objectsToFit.length > 0) {
                                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                                objectsToFit.forEach(obj => {
                                    const scale = obj.scale || 1;
                                    minX = Math.min(minX, obj.position.x);
                                    minY = Math.min(minY, obj.position.y);
                                    maxX = Math.max(maxX, obj.position.x + obj.size.width * scale);
                                    maxY = Math.max(maxY, obj.position.y + obj.size.height * scale);
                                });
                                const boxWidth = maxX - minX;
                                const boxHeight = maxY - minY;
                                const boxCenterX = minX + boxWidth / 2;
                                const boxCenterY = minY + boxHeight / 2;
                    
                                const padding = action.padding * 2;
                                const zoomX = canvas.width / (boxWidth + padding);
                                const zoomY = canvas.height / (boxHeight + padding);
                    
                                camera.current.zoom = Math.min(zoomX, zoomY);
                                camera.current.x = boxCenterX;
                                camera.current.y = boxCenterY;
                                camera.current.lerp = null;
                                followedObjectId.current = null;
                            }
                            break;
                        }
                        case 'camera_lerp_to_position':
                            camera.current.lerp = {
                                startX: camera.current.x,
                                startY: camera.current.y,
                                targetX: action.x,
                                targetY: action.y,
                                duration: action.duration,
                                elapsed: 0,
                            };
                            followedObjectId.current = null;
                            break;
                        case 'camera_set_bounds':
                            camera.current.bounds = { minX: action.minX, minY: action.minY, maxX: action.maxX, maxY: action.maxY };
                            break;
                        case 'camera_clear_bounds':
                            camera.current.bounds = null;
                            break;
                        case 'create_object':
                            const templateObject = activeScene.objects.find(o => o.name === action.name);
                            if (templateObject) {
                                objectsToCreate.push({
                                    ...JSON.parse(JSON.stringify(templateObject)),
                                    id: `runtime_${action.name}_${Date.now()}`,
                                    position: { x: action.x, y: action.y },
                                    layer: action.layer,
                                    behaviorState: {}, // Will be initialized on next loop
                                });
                            }
                            break;
                        case 'change_scene': nextSceneId = action.sceneId; break;
                        case 'set_global_variable': {
                            const value = isNaN(Number(action.value)) ? action.value : Number(action.value);
                            currentGlobalVars[action.variable] = value;
                            break;
                        }
                        case 'change_global_variable': {
                            const varName = action.variable;
                            const currentValue = currentGlobalVars[varName];

                            if (typeof currentValue !== 'number') {
                                console.warn(`Action "Change Global Variable" ignored: Variable "${varName}" is not a number.`);
                                break;
                            }

                            const changeValue = Number(action.value);
                            if (isNaN(changeValue)) {
                                console.warn(`Action "Change Global Variable" ignored: Provided value "${action.value}" is not a valid number.`);
                                break;
                            }

                            switch(action.operation) {
                                case '+': currentGlobalVars[varName] = currentValue + changeValue; break;
                                case '-': currentGlobalVars[varName] = currentValue - changeValue; break;
                                case '*': currentGlobalVars[varName] = currentValue * changeValue; break;
                                case '/': currentGlobalVars[varName] = currentValue / changeValue; break;
                            }
                            break;
                        }
                        case 'play_sound':
                            if (sounds[action.sound] && audioContextRef.current && masterGain.current) {
                                const source = audioContextRef.current.createBufferSource();
                                source.buffer = sounds[action.sound];
                                source.connect(masterGain.current);
                                source.start(0);
                                if (!playingSounds.has(action.sound)) {
                                    playingSounds.set(action.sound, new Set());
                                }
                                playingSounds.get(action.sound)!.add(source);
                                source.onended = () => {
                                    playingSounds.get(action.sound)?.delete(source);
                                };
                            }
                            break;
                        case 'stop_sound':
                            if (playingSounds.has(action.sound)) {
                                playingSounds.get(action.sound)!.forEach(source => source.stop());
                                playingSounds.get(action.sound)!.clear();
                            }
                            break;
                        case 'play_music':
                            if (musicSource.current) {
                                musicSource.current.source.stop();
                            }
                            if (sounds[action.sound] && audioContextRef.current && masterGain.current) {
                                const source = audioContextRef.current.createBufferSource();
                                source.buffer = sounds[action.sound];
                                source.loop = true;
                                source.connect(masterGain.current);
                                source.start(0);
                                musicSource.current = { source, soundName: action.sound };
                            }
                            break;
                        case 'stop_music':
                            if (musicSource.current) {
                                musicSource.current.source.stop();
                                musicSource.current = null;
                            }
                            break;
                        case 'set_volume':
                            if (masterGain.current) {
                                masterGain.current.gain.value = action.volume;
                            }
                            break;
                        case 'set_object_size':
                            if (!targetObjectId) break;
                            gameObjects.current = currentObjects.map(obj => obj.id === targetObjectId ? { ...obj, size: { width: action.width, height: action.height } } : obj);
                            break;
                        case 'show_popup':
                            setPopup({ title: action.title, content: action.content, buttonText: action.buttonText });
                            break;
                        case 'play_animation':
                            if (!targetObjectId) break;
                            gameObjects.current = currentObjects.map(obj => {
                                if (obj.id === targetObjectId && obj.type === 'sprite') {
                                    return { ...obj, currentAnimation: action.animationName, animationState: { frameIndex: 0, frameTime: 0 } };
                                }
                                return obj;
                            });
                            break;
                        case 'stop_animation':
                            if (!targetObjectId) break;
                            gameObjects.current = currentObjects.map(obj => {
                                if (obj.id === targetObjectId && obj.type === 'sprite') {
                                    return { ...obj, currentAnimation: undefined };
                                }
                                return obj;
                            });
                            break;
                        case 'change_animation_speed':
                            if (!targetObjectId) break;
                            gameObjects.current = currentObjects.map(obj => {
                                if (obj.id === targetObjectId && obj.type === 'sprite') {
                                    const newAnimations = obj.animations.map(anim => {
                                        if (anim.name === action.animationName) {
                                            return { ...anim, speed: action.speed };
                                        }
                                        return anim;
                                    });
                                    return { ...obj, animations: newAnimations };
                                }
                                return obj;
                            });
                            break;
                        case 'start_or_reset_timer':
                            timers[action.name] = now;
                            break;
                        case 'save_game_state': {
                            const saveState: SaveState = {
                                timestamp: Date.now(),
                                currentSceneId: activeScene.id,
                                gameObjects: currentObjects,
                                globalVariables: currentGlobalVars,
                                camera: camera.current,
                                timers: timers,
                            };
                            localStorage.setItem(`gamma_save_${action.slotName}`, JSON.stringify(saveState));
                            break;
                        }
                        case 'load_game_state':
                            loadRequest = action.slotName;
                            break;
                        case 'clear_game_save':
                            localStorage.removeItem(`gamma_save_${action.slotName}`);
                            break;
                        case 'damage_object':
                            if(!targetObjectId) break;
                            currentObjects.forEach(obj => {
                                if (obj.id === targetObjectId) {
                                    const healthBehavior = obj.behaviors?.find(b => b.type === 'health') as HealthBehavior;
                                    if(healthBehavior) healthBehavior.currentHealth -= action.amount;
                                }
                            });
                            break;
                        case 'set_health':
                            if(!targetObjectId) break;
                            currentObjects.forEach(obj => {
                                if (obj.id === targetObjectId) {
                                    const healthBehavior = obj.behaviors?.find(b => b.type === 'health') as HealthBehavior;
                                    if(healthBehavior) healthBehavior.currentHealth = action.amount;
                                }
                            });
                            break;
                        case 'fire_bullet': {
                            const firingObject = currentObjects.find(o => o.id === targetObjectId);
                            if (firingObject) {
                                const actionDef = action as FireBulletAction;
                                const templateBullet = activeScene.objects.find(o => o.name === actionDef.bulletObjectName);
                                const spawnPoint = firingObject.points?.[actionDef.spawnPoint] || { x: firingObject.size.width / 2, y: firingObject.size.height / 2 };
                                
                                if (templateBullet) {
                                    const angleRad = firingObject.rotation * (Math.PI / 180);
                                    const cos = Math.cos(angleRad);
                                    const sin = Math.sin(angleRad);
                                    const scale = firingObject.scale || 1;
                                    
                                    const localX = (spawnPoint.x - firingObject.size.width / 2) * scale;
                                    const localY = (spawnPoint.y - firingObject.size.height / 2) * scale;
                        
                                    const worldX = firingObject.position.x + firingObject.size.width * scale / 2 + localX * cos - localY * sin;
                                    const worldY = firingObject.position.y + firingObject.size.height * scale / 2 + localX * sin + localY * cos;
                        
                                    objectsToCreate.push({
                                        ...JSON.parse(JSON.stringify(templateBullet)),
                                        id: `runtime_${actionDef.bulletObjectName}_${Date.now()}_${Math.random()}`,
                                        position: { x: worldX - templateBullet.size.width / 2, y: worldY - templateBullet.size.height / 2 },
                                        rotation: firingObject.rotation,
                                        behaviorState: { bullet: { aliveTime: 0 } },
                                    } as RuntimeGameObject);
                                }
                            }
                            break;
                        }
                        case 'set_text': {
                            if (!targetObjectId) break;
                            gameObjects.current = currentObjects.map(obj => {
                                if (obj.id === targetObjectId && obj.type === 'text') {
                                    const newText = action.text.replace(/\$\{global\.(\w+)\}/g, (match, varName) => {
                                        return currentGlobalVars[varName] !== undefined ? currentGlobalVars[varName] : match;
                                    });
                                    return { ...obj, text: newText };
                                }
                                return obj;
                            });
                            break;
                        }
                        case 'set_bar_value': {
                            if (!targetObjectId) break;
                             gameObjects.current = currentObjects.map(obj => {
                                if (obj.id === targetObjectId && obj.type === 'bar') {
                                    return { ...obj, currentValue: action.value };
                                }
                                return obj;
                            });
                            break;
                        }
                   }
                });
              }
          });
        });
        
        if (loadRequest) {
            const saveData = localStorage.getItem(`gamma_save_${loadRequest}`);
            if (saveData) {
                try {
                    const state: SaveState = JSON.parse(saveData);
                    const newScene = project.scenes.find(s => s.id === state.currentSceneId);
                    if (newScene) {
                        setActiveScene(newScene);
                        gameObjects.current = state.gameObjects;
                        globalVariables.current = state.globalVariables;
                        camera.current = state.camera;
                        Object.keys(timers).forEach(key => delete timers[key]);
                        Object.assign(timers, state.timers);
                        return; 
                    }
                } catch (e) {
                    console.error("Failed to load game state:", e);
                }
            }
        }
        
        if (nextSceneId) {
            const newScene = project.scenes.find(s => s.id === nextSceneId);
            if (newScene) {
                setActiveScene(newScene);
            }
        } else {
          if (objectsToDestroy.size > 0 || objectsToCreate.length > 0) {
            gameObjects.current = currentObjects.filter(obj => !objectsToDestroy.has(obj.id)).concat(objectsToCreate);
          }
        }
        
        if (followedObjectId.current && !camera.current.lerp) {
            const objectToFollow = gameObjects.current.find(o => o.id === followedObjectId.current);
            if (objectToFollow) {
                const scale = objectToFollow.scale || 1;
                const renderWidth = objectToFollow.size.width * scale;
                const renderHeight = objectToFollow.size.height * scale;
                const targetX = objectToFollow.position.x + renderWidth / 2;
                const targetY = objectToFollow.position.y + renderHeight / 2;
                camera.current.x = camera.current.x + (targetX - camera.current.x) * 0.1;
                camera.current.y = camera.current.y + (targetY - camera.current.y) * 0.1;
            } else {
                followedObjectId.current = null;
            }
        }

        if (camera.current.bounds) {
            const { minX, minY, maxX, maxY } = camera.current.bounds;
            const viewWidth = canvas.width / camera.current.zoom;
            const viewHeight = canvas.height / camera.current.zoom;
    
            camera.current.x = Math.max(minX + viewWidth / 2, Math.min(camera.current.x, maxX - viewWidth / 2));
            camera.current.y = Math.max(minY + viewHeight / 2, Math.min(camera.current.y, maxY - viewHeight / 2));
        }

        camera.current.isMoving = cameraShake.current.remaining > 0 ||
                                  !!camera.current.lerp ||
                                  camera.current.x !== camera.current.lastX ||
                                  camera.current.y !== camera.current.lastY;

      }

      // --- DRAWING ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1a202c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(camera.current.zoom, camera.current.zoom);
      let shakeX = 0, shakeY = 0;
      if (cameraShake.current.remaining > 0) {
          shakeX = (Math.random() - 0.5) * 2 * cameraShake.current.intensity;
          shakeY = (Math.random() - 0.5) * 2 * cameraShake.current.intensity;
          if (!popup) {
            cameraShake.current.remaining -= deltaTime;
          }
      }
      ctx.translate(-camera.current.x + shakeX, -camera.current.y + shakeY);
      
      const currentObjectsForRender = gameObjects.current;
      activeScene.layers.forEach(layer => {
        currentObjectsForRender.filter(obj => obj.layer === layer.name).forEach(obj => {
          if (!obj.visible) return;
          const scale = obj.scale || 1;
          const renderWidth = obj.size.width * scale;
          const renderHeight = obj.size.height * scale;

          ctx.save();
          ctx.translate(obj.position.x + renderWidth / 2, obj.position.y + renderHeight / 2);
          ctx.rotate(obj.rotation * Math.PI / 180);
          ctx.translate(-(obj.position.x + renderWidth / 2), -(obj.position.y + renderHeight / 2));
          
          let spriteToDraw: string | undefined = undefined;
          if (obj.type === 'sprite' || obj.type === 'tiled_sprite') {
            spriteToDraw = obj.sprite;
          }
          if (obj.type === 'sprite' && obj.currentAnimation) {
              const anim = obj.animations.find(a => a.name === obj.currentAnimation);
              if (anim && anim.frames[obj.animationState.frameIndex]) {
                  spriteToDraw = anim.frames[obj.animationState.frameIndex];
              }
          }

          if (obj.type === 'sprite' && spriteToDraw && images[spriteToDraw]?.complete) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(images[spriteToDraw], obj.position.x, obj.position.y, renderWidth, renderHeight);
          } else if (obj.type === 'tiled_sprite' && obj.sprite && patterns[obj.sprite]) {
            ctx.fillStyle = patterns[obj.sprite]!;
            ctx.fillRect(obj.position.x, obj.position.y, renderWidth, renderHeight);
          } else if (obj.type === 'text') {
            const textObj = obj as TextGameObject;
            ctx.font = `${(textObj.fontSize || 16) * scale}px ${textObj.font || 'Arial'}`;
            ctx.fillStyle = textObj.color || '#FFFFFF';
            ctx.textAlign = textObj.align || 'left';
            ctx.textBaseline = textObj.baseline || 'top';
            
            let textX = obj.position.x;
            if (textObj.align === 'center') textX += renderWidth / 2;
            if (textObj.align === 'right') textX += renderWidth;
            
            let textY = obj.position.y;
            if (textObj.baseline === 'middle') textY += renderHeight / 2;
            if (textObj.baseline === 'bottom') textY += renderHeight;

            ctx.fillText(textObj.text || '', textX, textY);
          } else if (obj.type === 'bar') {
            const bar = obj as BarGameObject;
            ctx.fillStyle = bar.backgroundColor;
            ctx.fillRect(obj.position.x, obj.position.y, renderWidth, renderHeight);
            const fillPercentage = Math.max(0, Math.min(1, bar.currentValue / bar.maxValue));
            ctx.fillStyle = bar.foregroundColor;
            ctx.fillRect(obj.position.x, obj.position.y, renderWidth * fillPercentage, renderHeight);
            if (bar.borderWidth > 0) {
                ctx.strokeStyle = bar.borderColor;
                ctx.lineWidth = bar.borderWidth;
                ctx.strokeRect(obj.position.x, obj.position.y, renderWidth, renderHeight);
            }
            if (bar.showLabel) {
                ctx.font = `${bar.labelSize * scale}px ${bar.labelFont}`;
                ctx.fillStyle = bar.labelColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${Math.round(bar.currentValue)} / ${bar.maxValue}`, obj.position.x + renderWidth / 2, obj.position.y + renderHeight / 2);
            }
          } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(obj.position.x, obj.position.y, renderWidth, renderHeight);
          }
          ctx.restore();
        });
      });

      ctx.restore();
      clickedObjectId.current = null;
      // Update previous input states for next frame
      Object.assign(prevKeysPressed, keysPressed);
      Object.assign(prevMouseButtonsPressed, mouseButtonsPressed);
      animationFrameId = window.requestAnimationFrame(gameLoop);
    };

    animationFrameId = window.requestAnimationFrame(gameLoop);
    return () => { window.cancelAnimationFrame(animationFrameId); };
  }, [activeScene, images, sounds, patterns, project, popup]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl relative w-4/5 h-4/5">
        <button onClick={onClose} className="absolute top-2 right-2 text-white bg-red-600 hover:bg-red-500 rounded-full w-8 h-8 flex items-center justify-center z-20">
            X
        </button>
        <canvas ref={canvasRef} width={project.settings.resolution.width} height={project.settings.resolution.height} className="w-full h-full bg-gray-900"></canvas>
        {popup && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center font-sans z-10">
                <div className="bg-gray-700 text-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center border-2 border-gray-600">
                    <h3 className="text-xl font-bold mb-4">{popup.title}</h3>
                    <p className="mb-6 whitespace-pre-wrap">{popup.content}</p>
                    <button
                        onClick={() => setPopup(null)}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        {popup.buttonText}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default GamePreview;