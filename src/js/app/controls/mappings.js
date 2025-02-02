app.controls.mappings = {
  game: {
    lookDown: {
      gamepadAxis: [
        [3, 1],
      ],
      gamepadDigital: [],
      keyboard: [
        'ArrowDown',
        'PageDown',
      ],
      mouseAxis: [
        ['y', 1]
      ],
      mouseButton: [],
    },
    lookUp: {
      gamepadAxis: [
        [3, -1],
      ],
      gamepadDigital: [],
      keyboard: [
        'ArrowUp',
        'PageUp',
      ],
      mouseAxis: [
        ['y', -1]
      ],
      mouseButton: [],
    },
    moveBackward: {
      gamepadAxis: [
        [1, 1],
      ],
      gamepadDigital: [],
      keyboard: [
        'KeyS',
        'Numpad5',
      ],
      mouseAxis: [],
      mouseButton: [],
    },
    moveForward: {
      gamepadAxis: [
        [1, -1],
      ],
      gamepadDigital: [],
      keyboard: [
        'KeyW',
        'Numpad8',
      ],
      mouseAxis: [],
      mouseButton: [
        2,
      ],
    },
    turnLeft: {
      gamepadAxis: [
        [2, -1],
      ],
      gamepadDigital: [],
      keyboard: [
        'ArrowLeft',
        'KeyQ',
        'Numpad7',
      ],
      mouseAxis: [
        ['x', -1],
      ],
      mouseButton: [],
    },
    turnRight: {
      gamepadAxis: [
        [2, 1],
      ],
      gamepadDigital: [],
      keyboard: [
        'ArrowRight',
        'KeyE',
        'Numpad9',
      ],
      mouseAxis: [
        ['x', 1],
      ],
      mouseButton: [],
    },
  },
  ui: {
    // Navigation
    up: {
      gamepadAxis: [
        [1, 1],
        [3, 1],
      ],
      gamepadDigital: [
        12,
      ],
      keyboard: [
        'ArrowUp',
        'KeyW',
        'Numpad8',
      ],
      mouseAxis: [],
      mouseButton: [],
    },
    down: {
      gamepadAxis: [
        [1, -1],
        [3, -1],
      ],
      gamepadDigital: [
        13,
      ],
      keyboard: [
        'ArrowDown',
        'KeyS',
        'Numpad5',
      ],
      mouseAxis: [],
      mouseButton: [],
    },
    left: {
      gamepadAxis: [
        [0, -1],
        [2, -1],
      ],
      gamepadDigital: [
        14,
      ],
      keyboard: [
        'ArrowLeft',
        'KeyA',
        'KeyQ',
        'Numpad4',
        'Numpad7',
      ],
      mouseAxis: [],
      mouseButton: [],
    },
    right: {
      gamepadAxis: [
        [0, 1],
        [2, 1],
      ],
      gamepadDigital: [
        15,
      ],
      keyboard: [
        'ArrowRight',
        'KeyD',
        'KeyE',
        'Numpad6',
        'Numpad9',
      ],
      mouseAxis: [],
      mouseButton: [],
    },
    // Actions
    confirm: {
      gamepadAxis: [],
      gamepadDigital: [
        0,
      ],
      keyboard: [
        'KeyF',
        'NumpadEnter',
      ],
      mouseAxis: [],
      mouseButton: [],
    },
    back: {
      gamepadAxis: [],
      gamepadDigital: [
        1,
      ],
      keyboard: [],
      mouseAxis: [],
      mouseButton: [
        3,
      ],
    },
    pause: {
      gamepadAxis: [],
      gamepadDigital: [
        8,
        9,
      ],
      keyboard: [
        'Backspace',
        'Escape',
        'NumpadDecimal',
      ],
      mouseAxis: [],
      mouseButton: [
        3,
      ],
    },
    // Individual special buttons
    enter: {
      gamepadAxis: [],
      gamepadDigital: [],
      keyboard: [
        'Enter',
        'NumpadEnter',
      ],
      mouseAxis: [],
      mouseButton: [],
    },
    select: {
      gamepadAxis: [],
      gamepadDigital: [
        8,
      ],
      keyboard: [],
      mouseAxis: [],
      mouseButton: [],
    },
    space: {
      gamepadAxis: [],
      gamepadDigital: [],
      keyboard: [
        'Space',
      ],
      mouseAxis: [],
      mouseButton: [],
    },
    start: {
      gamepadAxis: [],
      gamepadDigital: [
        9,
      ],
      keyboard: [],
      mouseAxis: [],
      mouseButton: [],
    },
  },
}
