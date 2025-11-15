# Event System - Quick Reference Guide

## How the Event System Works

### 1. **Event Structure**
Every event has:
- **Conditions:** Must ALL be true (AND logic) for the event to trigger
- **Actions:** Execute in order when all conditions are met

```
IF (Conditions are ALL true)
  THEN run Actions in sequence
```

---

## Condition Types by Category

### Input
| Type | Description | Example |
|------|-------------|---------|
| `key_pressed` | Key is currently held | Player holding "ArrowUp" |
| `key_released` | Key just released | Player released "Space" |
| `mouse_button_pressed` | Mouse button held (Left/Middle/Right) | Left-clicking |
| `mouse_button_released` | Mouse button just released | Finished clicking |
| `mouse_click_object` | Clicked on specific object | Clicked button |
| `mouse_over_object` | Mouse hovering over object | Hovering over enemy |
| `object_is_pressed` | Mouse button held on object | Holding down button |

### Objects & Collision
| Type | Description | Example |
|------|-------------|---------|
| `collision` | Two objects touching | Bullet hits enemy |
| `distance_between_objects` | Objects within/beyond distance | Player near door |
| `number_of_objects` | Count of object instances | 5 enemies remaining |
| `animation_is_playing` | Animation currently playing | Death animation active |

### Variables
| Type | Description | Example |
|------|-------------|---------|
| `variable_comparison` | Object variable equals/greater/less | Health > 50 |
| `compare_global_variable` | Global variable condition | Score >= 1000 |
| `object_property` | Object property value | X position > 500 |
| `compare_health` | Health with Health behavior | Health <= 0 |

### Advanced Timing
| Type | Description | Example |
|------|-------------|---------|
| `every_x_seconds` | Triggers repeatedly (e.g., every 2 seconds) | Spawn enemy |
| `timer_greater_than` | Custom timer elapsed | 5 seconds passed |
| `scene_start` | Runs once when scene loads | Initialize game |

### Camera
| Type | Description | Example |
|------|-------------|---------|
| `camera_is_moving` | Camera currently moving | Lerping to new position |
| `camera_in_bounds` | Camera in area | Checking level bounds |

### Audio
| Type | Description | Example |
|------|-------------|---------|
| `is_sound_playing` | Sound/music currently playing | Theme song playing |

### Storage
| Type | Description | Example |
|------|-------------|---------|
| `save_exists` | Save slot exists/empty | Check if save_1 exists |

### Advanced
| Type | Description | Example |
|------|-------------|---------|
| `for_each_object` | Loop over instances | Damage all enemies |

---

## Action Types by Category

### Objects - Movement
| Type | Parameters | Example |
|------|-----------|---------|
| `move_object` | Object, DX, DY | Move right by 10 pixels |
| `move_object_to` | Object, X, Y, Speed | Fly to position 100,200 |
| `move_object_towards_object` | Object, Target, Speed | Chase player |
| `move_object_at_angle` | Object, Speed | Projectile forward |

### Objects - Properties
| Type | Parameters | Example |
|------|-----------|---------|
| `set_object_position` | Object, X, Y | Teleport to 50,50 |
| `set_object_rotation` | Object, Angle | Face 90 degrees |
| `set_object_size` | Object, Width, Height | Grow to 128x128 |
| `set_object_sprite` | Object, Sprite | Change appearance |
| `toggle_object_visibility` | Object, Visible | Show/Hide object |
| `set_object_property` | Object, Property, Value | Set scale to 1.5 |
| `destroy_object` | Object | Remove from scene |
| `create_object` | Name, Sprite, X, Y, Layer | Spawn bullet |

### Objects - Animation
| Type | Parameters | Example |
|------|-----------|---------|
| `play_animation` | Object, Animation | Play "walk" animation |
| `stop_animation` | Object | Freeze current frame |
| `change_animation_speed` | Object, Animation, FPS | Speed up animation |

### Behaviors
| Type | Parameters | Example |
|------|-----------|---------|
| `damage_object` | Object, Amount | Take 10 damage |
| `set_health` | Object, Amount | Restore full health |
| `fire_bullet` | Shooter, Bullet, Point | Fire from gun muzzle |

### Variables - Object
| Type | Parameters | Example |
|------|-----------|---------|
| `change_variable` | Object, Variable, Operation, Value | health = health - 10 |

### Variables - Global
| Type | Parameters | Example |
|------|-----------|---------|
| `set_global_variable` | Variable, Value | score = 0 |
| `change_global_variable` | Variable, Operation, Value | score += 10 |

### Camera
| Type | Parameters | Example |
|------|-----------|---------|
| `camera_follow_object` | Object or None | Follow player / stop |
| `camera_set_position` | X, Y | Jump to 500,300 |
| `camera_shake` | Intensity, Duration | Shake 10px for 0.5s |
| `change_camera_zoom` | Zoom, Operation | Zoom to 2x or += 0.5 |
| `camera_zoom_to_fit_objects` | Objects, Padding | Fit all players in view |
| `camera_lerp_to_position` | X, Y, Duration | Smoothly move for 2s |
| `camera_set_bounds` | MinX, MinY, MaxX, MaxY | Constrain to level |
| `camera_clear_bounds` | None | Remove constraints |

### Audio
| Type | Parameters | Example |
|------|-----------|---------|
| `play_sound` | Sound | Play explosion |
| `stop_sound` | Sound | Stop explosion |
| `play_music` | Sound | Play theme (loops) |
| `stop_music` | None | Stop theme |
| `set_volume` | 0.0-1.0 | Set to 50% volume |

### UI
| Type | Parameters | Example |
|------|-----------|---------|
| `set_text` | Text Object, Text | Display "Score: 100" |
| `set_bar_value` | Bar Object, Value | Set health bar to 75 |
| `show_popup` | Title, Content, Button | Show "You Won!" dialog |

### Scene & Storage
| Type | Parameters | Example |
|------|-----------|---------|
| `change_scene` | Scene | Load Level 2 |
| `save_game_state` | Slot Name | Save to save_1 |
| `load_game_state` | Slot Name | Load from save_1 |
| `clear_game_save` | Slot Name | Delete save_1 |

### Timers
| Type | Parameters | Example |
|------|-----------|---------|
| `start_or_reset_timer` | Timer Name | Start countdown_timer |

---

## Common Patterns

### Pattern: Enemy Dies
```
CONDITION: collision(Bullet, Enemy)
ACTIONS:
  1. Damage Enemy by 10
  2. Destroy Bullet
  3. IF Health <= 0: Destroy Enemy
```

### Pattern: Player Takes Damage
```
CONDITION: collision(Player, Spike)
AND every_x_seconds(1)  // Once per second
ACTIONS:
  1. Damage Player by 5
  2. Camera Shake (intensity: 5, duration: 0.2)
```

### Pattern: Level Complete
```
CONDITION: number_of_objects(Enemy) == 0
ACTIONS:
  1. Play Sound: "victory"
  2. Show Popup: "Level Complete!"
  3. Change Scene: NextLevel
```

### Pattern: Save Game
```
CONDITION: key_pressed(S) AND global variable level_complete == true
ACTIONS:
  1. Save Game State to slot_1
  2. Show Popup: "Game Saved!"
```

### Pattern: Continuous Movement
```
CONDITION: key_pressed(ArrowUp)
ACTIONS:
  1. Move Player by (0, -5)  // Every frame!
```

### Pattern: For Each Loop
```
CONDITION: for_each_object(Enemy)
AND every_x_seconds(2)
ACTIONS:
  1. Move this Enemy towards Player at speed 50
```

---

## Tips & Best Practices

### ✅ DO
- Use event groups to organize related logic
- Add comments to explain complex event logic
- Use timers for continuous effects (damage, spawning)
- Leverage for_each_object for batch operations
- Test conditions in the editor before publishing

### ❌ DON'T
- Use too many conditions (affects performance)
- Create infinite loops without exit conditions
- Reference objects that don't exist in the scene
- Forget to initialize variables before using them
- Leave empty events (no actions)

### 🎮 Game Design Tips
- Use `every_x_seconds` for frame-independent gameplay
- Use `camera_lerp_to_position` for smooth camera transitions
- Use `for_each_object` to apply logic to all instances
- Combine conditions with AND logic (all must be true)
- Use object/global variables to track game state

---

## Debugging

### Check These If Events Don't Work
1. **Are conditions triggering?** Add a visible action (camera shake, sound) to verify
2. **Is the right object selected?** Check object names in the scene
3. **Do animations exist?** Only works if animation is on the object
4. **Is the timer initialized?** Use "Start/Reset Timer" first
5. **Check variable names** - They're case-sensitive!

---

## Keyboard Keys (For key_pressed/key_released)

### Arrow Keys
- `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`

### Standard Keys
- `Space`, `Enter`, `Tab`, `Shift`, `Control`, `Alt`
- `A-Z`, `0-9` (single uppercase letters/digits)

### Special Keys
- `Escape`, `Backspace`, `Delete`, `Home`, `End`, `PageUp`, `PageDown`

---

## Performance Tips

⚡ **Optimize Your Events:**
- Use specific conditions instead of `for_each_object` when possible
- Limit collision checks to nearby objects
- Use timers (`every_x_seconds`) instead of checking every frame
- Avoid creating many objects per frame
- Keep event logic simple and focused

---

Generated: 2025-11-15
Version: 1.0
