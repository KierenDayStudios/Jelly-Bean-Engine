

export interface SoundAsset {
  name: string;
  dataUrl: string; // base64 encoded audio file
  // Optional metadata for editor/runtime
  defaultVolume?: number; // 0..1
  isMusic?: boolean; // true if this asset is intended to be music
}

export interface Animation {
  id: string; // For React keys
  name: string;
  frames: string[]; // array of sprite data URLs
  speed: number; // frames per second
  loop: boolean;
}

export interface GameSettings {
    title: string;
    description: string;
    version: string;
    icon?: string; // data URL
    loadingScreenImage?: string; // data URL
    resolution: { width: number; height: number };
    orientation: 'landscape' | 'portrait';
}

export interface GameProject {
  scenes: Scene[];
  assets: {
    // Sprites are no longer a global asset. They are stored as data URLs on objects/animations.
    sounds: SoundAsset[];
  };
  globalVariables: Record<string, any>;
  settings: GameSettings;
}

export interface Layer {
  name: string;
  visibleInEditor: boolean;
  parallaxX: number; // 1 = normal, <1 = slower (background), >1 = faster (foreground), 0 = fixed
  parallaxY: number; // 1 = normal, <1 = slower (background), >1 = faster (foreground), 0 = fixed
}

export interface Scene {
  id: string;
  name: string;
  layers: Layer[];
  objects: GameObject[];
  events: EventTreeNode[];
}

export type Point = { x: number; y: number };

// --- Behavior System ---
export type BehaviorType = 'top_down_movement' | 'bullet' | 'turret' | 'rotate_towards_mouse' | 'health' | 'button';

export interface BaseBehavior {
  type: BehaviorType;
}

export interface TopDownMovementBehavior extends BaseBehavior {
  type: 'top_down_movement';
  speed: number;
  acceleration: number;
  deceleration: number;
  allowDiagonals: boolean;
  controlScheme: 'wasd' | 'arrows';
}

export interface BulletBehavior extends BaseBehavior {
  type: 'bullet';
  speed: number;
  destroyOnCollision: boolean;
  lifespan: number; // in seconds
}

export interface TurretBehavior extends BaseBehavior {
  type: 'turret';
  fireRate: number; // shots per second
  bulletObjectName: string; // name of the object to fire (must have Bullet behavior)
  spawnPoint: string; // name of a Point on the object
  autoFire: boolean;
}

export interface RotateTowardsMouseBehavior extends BaseBehavior {
  type: 'rotate_towards_mouse';
  rotationSpeed: number; // degrees per second
  offset: number; // degrees to add to the final angle
}

export interface HealthBehavior extends BaseBehavior {
    type: 'health';
    maxHealth: number;
    currentHealth: number;
}

export interface ButtonBehavior extends BaseBehavior {
    type: 'button';
    // This behavior is state-driven and has no configurable properties.
    // It enables the use of button-specific conditions in the event sheet.
}


export type Behavior = TopDownMovementBehavior | BulletBehavior | TurretBehavior | RotateTowardsMouseBehavior | HealthBehavior | ButtonBehavior;
// --- End Behavior System ---

// --- Game Object System ---
interface BaseGameObject {
  id: string;
  name: string;
  position: Point;
  size: { width: number; height: number };
  scale: number;
  rotation: number;
  variables: Record<string, any>;
  layer: string;
  visible: boolean;
  points?: Record<string, Point>;
  collisionMask?: Point[];
  behaviors?: Behavior[];
}

export interface SpriteGameObject extends BaseGameObject {
  type: 'sprite' | 'tiled_sprite';
  sprite?: string; // data URL
  animations: Animation[];
  currentAnimation?: string; // name of the animation
}

export interface TextGameObject extends BaseGameObject {
  type: 'text';
  text: string;
  font: string;
  fontSize: number;
  color: string;
  align: 'left' | 'center' | 'right';
  baseline: 'top' | 'middle' | 'bottom';
}

export interface BarGameObject extends BaseGameObject {
    type: 'bar';
    maxValue: number;
    currentValue: number;
    valueFromVariable?: {
        source: 'manual' | 'global_variable' | 'object_variable';
        variableName: string;
        objectId?: string;
    }
    foregroundColor: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    showLabel: boolean;
    labelFont: string;
    labelColor: string;
    labelSize: number;
}


export type GameObject = SpriteGameObject | TextGameObject | BarGameObject;
// --- End Game Object System ---


export interface GameEvent {
  id: string;
  type: 'event';
  name: string;
  comment?: string;
  conditions: Condition[];
  actions: Action[];
}

export interface EventGroup {
    id: string;
    type: 'group';
    name: string;
    comment?: string;
    isCollapsed: boolean;
    events: EventTreeNode[];
}

export interface CommentEvent {
    id: string;
    type: 'comment';
    comment: string;
}

export type EventTreeNode = GameEvent | EventGroup | CommentEvent;


// --- Condition Types ---
export type ConditionType = 'key_pressed' | 'key_released' | 'mouse_button_pressed' | 'mouse_button_released' | 'collision' | 'variable_comparison' | 'timer_greater_than' | 'every_x_seconds' | 'mouse_click_object' | 'compare_global_variable' | 'scene_start' | 'object_property' | 'for_each_object' | 'mouse_over_object' | 'distance_between_objects' | 'number_of_objects' | 'animation_is_playing' | 'save_exists' | 'compare_health' | 'camera_is_moving' | 'camera_in_bounds' | 'object_is_pressed' | 'is_sound_playing';

export interface BaseCondition {
  id: string;
  type: ConditionType;
}

export interface KeyPressedCondition extends BaseCondition {
  type: 'key_pressed';
  key: string;
}

export interface KeyReleasedCondition extends BaseCondition {
    type: 'key_released';
    key: string;
}

export interface MouseButtonPressedCondition extends BaseCondition {
    type: 'mouse_button_pressed';
    button: 'left' | 'middle' | 'right';
}

export interface MouseButtonReleasedCondition extends BaseCondition {
    type: 'mouse_button_released';
    button: 'left' | 'middle' | 'right';
}

export interface CollisionCondition extends BaseCondition {
  type: 'collision';
  objectId1: string;
  objectId2: string;
}

export interface VariableCondition extends BaseCondition {
  type: 'variable_comparison';
  objectId: string;
  variable: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: number | string;
}

export interface TimerGreaterThanCondition extends BaseCondition {
    type: 'timer_greater_than';
    name: string;
    seconds: number;
}

export interface EveryXSecondsCondition extends BaseCondition {
    type: 'every_x_seconds';
    seconds: number;
}


export interface MouseClickObjectCondition extends BaseCondition {
  type: 'mouse_click_object';
  objectId: string;
}

export interface CompareGlobalVariableCondition extends BaseCondition {
    type: 'compare_global_variable';
    variable: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
    value: number | string;
}

export interface SceneStartCondition extends BaseCondition {
    type: 'scene_start';
}

export interface ObjectPropertyCondition extends BaseCondition {
    type: 'object_property';
    objectId: string;
    property: 'position.x' | 'position.y' | 'rotation' | 'size.width' | 'size.height' | 'visible';
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
    value: number | string | boolean;
}

export interface ForEachObjectCondition extends BaseCondition {
    type: 'for_each_object';
    objectId: string; // The object whose name will be used to iterate over all instances
}

export interface MouseOverObjectCondition extends BaseCondition {
    type: 'mouse_over_object';
    objectId: string;
    invert?: boolean;
}

export interface ObjectIsPressedCondition extends BaseCondition {
    type: 'object_is_pressed';
    objectId: string;
}

export interface DistanceBetweenObjectsCondition extends BaseCondition {
    type: 'distance_between_objects';
    objectId1: string;
    objectId2: string;
    operator: '>' | '<';
    distance: number;
}

export interface NumberOfObjectsCondition extends BaseCondition {
    type: 'number_of_objects';
    objectId: string; // The object whose name will be used to count all instances
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
    count: number;
}

export interface AnimationIsPlayingCondition extends BaseCondition {
    type: 'animation_is_playing';
    objectId: string;
    animationName: string;
    invert: boolean; // True to check if the animation is NOT playing
}

export interface SaveExistsCondition extends BaseCondition {
    type: 'save_exists';
    slotName: string;
    invert: boolean;
}

export interface CompareHealthCondition extends BaseCondition {
    type: 'compare_health';
    objectId: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
    value: number;
}

export interface CameraIsMovingCondition extends BaseCondition {
    type: 'camera_is_moving';
}

export interface CameraInBoundsCondition extends BaseCondition {
    type: 'camera_in_bounds';
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IsSoundPlayingCondition extends BaseCondition {
    type: 'is_sound_playing';
    sound: string;
    invert: boolean;
}


export type Condition = KeyPressedCondition | KeyReleasedCondition | MouseButtonPressedCondition | MouseButtonReleasedCondition | CollisionCondition | VariableCondition | TimerGreaterThanCondition | EveryXSecondsCondition | MouseClickObjectCondition | CompareGlobalVariableCondition | SceneStartCondition | ObjectPropertyCondition | ForEachObjectCondition | MouseOverObjectCondition | DistanceBetweenObjectsCondition | NumberOfObjectsCondition | AnimationIsPlayingCondition | SaveExistsCondition | CompareHealthCondition | CameraIsMovingCondition | CameraInBoundsCondition | ObjectIsPressedCondition | IsSoundPlayingCondition;


// --- Action Types ---
export type ActionType = 'move_object' | 'change_variable' | 'destroy_object' | 'camera_follow_object' | 'camera_set_position' | 'camera_shake' | 'create_object' | 'change_scene' | 'play_sound' | 'set_global_variable' | 'change_global_variable' | 'set_object_position' | 'set_object_rotation' | 'set_object_sprite' | 'toggle_object_visibility' | 'change_camera_zoom' | 'set_object_size' | 'show_popup' | 'play_animation' | 'stop_animation' | 'move_object_to' | 'change_animation_speed' | 'move_object_towards_object' | 'move_object_at_angle' | 'start_or_reset_timer' | 'save_game_state' | 'load_game_state' | 'clear_game_save' | 'damage_object' | 'set_health' | 'fire_bullet' | 'set_text' | 'set_bar_value' | 'camera_zoom_to_fit_objects' | 'camera_lerp_to_position' | 'camera_set_bounds' | 'camera_clear_bounds' | 'set_object_property' | 'stop_sound' | 'play_music' | 'stop_music' | 'set_volume';

export interface BaseAction {
  id: string;
  type: ActionType;
}

export interface MoveObjectAction extends BaseAction {
  type: 'move_object';
  objectId: string;
  dx: number;
  dy: number;
}

export interface ChangeVariableAction extends BaseAction {
  type: 'change_variable';
  objectId: string;
  variable: string;
  operation: '=' | '+' | '-' | '*' | '/';
  value: number | string;
}

export interface DestroyObjectAction extends BaseAction {
  type: 'destroy_object';
  objectId: string;
}

export interface CameraFollowObjectAction extends BaseAction {
  type: 'camera_follow_object';
  objectId: string | null; // null to stop following
}

export interface CameraSetPositionAction extends BaseAction {
  type: 'camera_set_position';
  x: number;
  y: number;
}

export interface CameraShakeAction extends BaseAction {
  type: 'camera_shake';
  intensity: number; // pixels
  duration: number; // seconds
}

export interface CreateObjectAction extends BaseAction {
  type: 'create_object';
  name: string;
  sprite: string;
  layer: string;
  positionType: 'absolute' | 'relative';
  x: number;
  y: number;
  relativeToObjectId?: string;
  relativeToPoint?: string;
}

export interface ChangeSceneAction extends BaseAction {
  type: 'change_scene';
  sceneId: string;
}

export interface PlaySoundAction extends BaseAction {
  type: 'play_sound';
  sound: string;
}

export interface StopSoundAction extends BaseAction {
    type: 'stop_sound';
    sound: string;
}

export interface PlayMusicAction extends BaseAction {
    type: 'play_music';
    sound: string;
}

export interface StopMusicAction extends BaseAction {
    type: 'stop_music';
}

export interface SetVolumeAction extends BaseAction {
    type: 'set_volume';
    volume: number; // 0 to 1
}

export interface SetGlobalVariableAction extends BaseAction {
    type: 'set_global_variable';
    variable: string;
    value: number | string;
}

export interface ChangeGlobalVariableAction extends BaseAction {
    type: 'change_global_variable';
    variable: string;
    operation: '+' | '-' | '*' | '/';
    value: number | string;
}

export interface SetObjectPositionAction extends BaseAction {
    type: 'set_object_position';
    objectId: string;
    positionType: 'absolute' | 'relative';
    x: number;
    y: number;
    relativeToObjectId?: string;
    relativeToPoint?: string;
}

export interface SetObjectRotationAction extends BaseAction {
    type: 'set_object_rotation';
    objectId: string;
    rotation: number;
}

export interface SetObjectSpriteAction extends BaseAction {
    type: 'set_object_sprite';
    objectId: string;
    sprite: string;
}

export interface ToggleObjectVisibilityAction extends BaseAction {
    type: 'toggle_object_visibility';
    objectId: string;
    visible: boolean;
}

export interface ChangeCameraZoomAction extends BaseAction {
    type: 'change_camera_zoom';
    zoom: number;
    operation: '=' | '+';
}

export interface SetObjectSizeAction extends BaseAction {
    type: 'set_object_size';
    objectId: string;
    width: number;
    height: number;
}

export interface SetObjectPropertyAction extends BaseAction {
    type: 'set_object_property';
    objectId: string;
    property: 'scale' | 'rotation' | 'color' | 'fontSize';
    value: number | string;
}

export interface ShowPopupAction extends BaseAction {
    type: 'show_popup';
    title: string;
    content: string;
    buttonText: string;
}

export interface PlayAnimationAction extends BaseAction {
    type: 'play_animation';
    objectId: string;
    animationName: string;
}

export interface StopAnimationAction extends BaseAction {
    type: 'stop_animation';
    objectId: string;
}

export interface MoveObjectToAction extends BaseAction {
    type: 'move_object_to';
    objectId: string;
    x: number;
    y: number;
    speed: number;
}

export interface ChangeAnimationSpeedAction extends BaseAction {
    type: 'change_animation_speed';
    objectId: string;
    animationName: string;
    speed: number;
}

export interface MoveObjectTowardsObjectAction extends BaseAction {
    type: 'move_object_towards_object';
    objectId: string;
    targetObjectId: string;
    speed: number;
}

export interface MoveObjectAtAngleAction extends BaseAction {
    type: 'move_object_at_angle';
    objectId: string;
    speed: number;
}

export interface StartOrResetTimerAction extends BaseAction {
    type: 'start_or_reset_timer';
    name: string;
}

export interface SaveGameStateAction extends BaseAction {
    type: 'save_game_state';
    slotName: string;
}
export interface LoadGameStateAction extends BaseAction {
    type: 'load_game_state';
    slotName: string;
}
export interface ClearGameSaveAction extends BaseAction {
    type: 'clear_game_save';
    slotName: string;
}

export interface DamageObjectAction extends BaseAction {
    type: 'damage_object';
    objectId: string;
    amount: number;
}

export interface SetHealthAction extends BaseAction {
    type: 'set_health';
    objectId: string;
    amount: number;
}

export interface FireBulletAction extends BaseAction {
    type: 'fire_bullet';
    objectId: string; // The object that is firing
    bulletObjectName: string; // The name of the bullet object to create
    spawnPoint: string; // The name of the point to spawn at
}

export interface SetTextAction extends BaseAction {
    type: 'set_text';
    objectId: string;
    text: string;
}

export interface SetBarValueAction extends BaseAction {
    type: 'set_bar_value';
    objectId: string;
    value: number;
}

export interface CameraZoomToFitObjectsAction extends BaseAction {
    type: 'camera_zoom_to_fit_objects';
    objectIds: string[];
    padding: number; // in pixels
}

export interface CameraLerpToPositionAction extends BaseAction {
    type: 'camera_lerp_to_position';
    x: number;
    y: number;
    duration: number; // in seconds
}

export interface CameraSetBoundsAction extends BaseAction {
    type: 'camera_set_bounds';
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

export interface CameraClearBoundsAction extends BaseAction {
    type: 'camera_clear_bounds';
}



export type Action = MoveObjectAction | ChangeVariableAction | DestroyObjectAction | CameraFollowObjectAction | CameraSetPositionAction | CameraShakeAction | CreateObjectAction | ChangeSceneAction | PlaySoundAction | SetGlobalVariableAction | ChangeGlobalVariableAction | SetObjectPositionAction | SetObjectRotationAction | SetObjectSpriteAction | ToggleObjectVisibilityAction | ChangeCameraZoomAction | SetObjectSizeAction | ShowPopupAction | PlayAnimationAction | StopAnimationAction | MoveObjectToAction | ChangeAnimationSpeedAction | MoveObjectTowardsObjectAction | MoveObjectAtAngleAction | StartOrResetTimerAction | SaveGameStateAction | LoadGameStateAction | ClearGameSaveAction | DamageObjectAction | SetHealthAction | FireBulletAction | SetTextAction | SetBarValueAction | CameraZoomToFitObjectsAction | CameraLerpToPositionAction | CameraSetBoundsAction | CameraClearBoundsAction | SetObjectPropertyAction | StopSoundAction | PlayMusicAction | StopMusicAction | SetVolumeAction;