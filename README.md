# The Cube - A Rubic's Cube Game

## Description
The Cube is a web-based Rubic's cube puzzle game designed to test your skills in solving a cube in 3D. It uses **three.js** for 3D Rendering of the cube,
and comes with a UI for timer, stats, theming, preferences, and scoring. The site shows you solve time, best and worst records, average of multiple solves,
and other metrics while you play. ([https://knorcubesnininongryanmercado.netlify.app/]) Players can double tap to start the game, and enjoy smooth transitions, animations, and interactivity for an immersive experience.

The project's source code and structure are available on GitHub ([https://github.com/Pyx-hash/The-Cube.git])

## Features

Key features of **The Cube** include:

- 3D Rubic's cube model (default 3x3x3) with full manipulation (rotation, drag, etc.)
- Scramble / randomization of the cube for new puzzles
- Timer and scoring system with best, worst, and average (of 5, 12, 25 solves) ([https://knorcubesnininongryanmercado.netlify.app/])
- Stats display of previous results
- Theming / color customization
- Smooth transitions and animation effects (zoomimg, easing, floating, etc.)
- Local storage (or similar) to save state and preferences
- Responsive design | adjust on window resize for proper camera and rendering
- UI buttons for "prefs", "theme", "stats", "reset", "back", etc.
- Touch and drag support form mobile and touch devices

## Technologies
Programming Language & Libraries

The project uses the following technologies:
Technology / Library:

- **JavaScript (ES6+}**: Core logic, UI control, animation, game loop, interaction handling
- **Three.js**: 3D Rendering engine for the cube, camera, lighting, meshes, etc.
- **HTML5 / CSS3**: Markup and styling for UI and layout
- **CSS Transitions / Animations**: Smooth visual effects and UI transitions
- **LocalStorage / Web Storage API**: Saving game state, preferences, and stats in the browser
- **Raycasting / drag controls**: Detecting interactions with the cube's 3D Faces
- **Tweening / Easing Engine**: Animation and transition effects (ease-in, ease-out, etc)


## Device Compatibility

**The Cube** is optimized for performance across multiple devices and platforms:

### Desktop / Laptop
- **Windows:** Chrome, Firefox, Edge, Opera
- **macOS:** Safari, Chrome, Firefox
- **Linux:** Chrome, Firefox
- Full mouse-based interaction: Click, drag, rotate, scramble
- Recommended for devices with WebGL-capable GPUs

### Mobile Phones
- **iOS (iPhone)**: iPhone X - iPHone XR
- iPhone 11, 12, 13, 14, 15 series
- iPhone SE (2nd & 3rd Gen)
- iPhone Pro / Pro Max (Safari, Chrome, Firefox)
  
- **Android**: Samsung Galaxy S20, S21, S22, S23, S24
- Google Pixel 5, 6, 7, 8, 9
- OnePlus 8, 9, 10, 11, 12 series
- Xiaomi / Redmi: Mi 10, Mi 11, Mi 12, Redmi Note Series
- Oppo / Vivo: Recent flagship and mid-range models (Chrome, Firefox)
- Supports touch gestures: Tap, Double Tap, Drag to Rotate

### Tablets
- **iPad (iPadOS):** iPad 7th Gen 'n iPad Pro Series
- **Android Tablets:** Samsung Galaxy Tab S6, S7, S8, S9 series
- Lenovo Tab series
- Supports both portrait and landscape modes
- Responsive scaling ensures proper cube rendering on larger screens

### Browser Support

Browser Supported Versions

- **Chrome**: Latest 2 Versions
- **Firefox**: Latest 2 Versions
- **Edge**: Latest 2 Versions
- **Safari**: Safari 13+ (iOS & macOS)
- **Opera**: Latest 2 Versions

**Peformance Tip:** For smooth gameplay on mid-range or older mobile devices, ensure hardware acceleration and WebGL are enabled in browser settings.
