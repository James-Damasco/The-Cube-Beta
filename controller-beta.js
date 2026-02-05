/**
 * smart-bridge.js
 * Universal Controller Bridge for The-Cube-Beta
 * * FEATURES:
 * 1. Gamepad Support (Xbox, PS4, Generic Bluetooth Controllers)
 * 2. Smart Cube Support (Web Bluetooth API for GAN/Giiker)
 * 3. Non-intrusive (Injects KeyboardEvents to control the existing game)
 */

(function() {
    console.log("%c 🚀 Smart Bridge Controller Active ", "background: #222; color: #bada55; font-size:14px;");

    // =========================================
    // CONFIGURATION: KEY MAPPINGS
    // =====================================
    // Default: Standard Rubik's Notation (U, D, L, R, F, B)
    const CONTROLS = {
        UP:    { key: 'u', code: 'KeyU', keyCode: 85 },
        DOWN:  { key: 'd', code: 'KeyD', keyCode: 68 },
        LEFT:  { key: 'l', code: 'KeyL', keyCode: 76 },
        RIGHT: { key: 'r', code: 'KeyR', keyCode: 82 },
        FRONT: { key: 'f', code: 'KeyF', keyCode: 70 },
        BACK:  { key: 'b', code: 'KeyB', keyCode: 66 },
        UP_PRIME:    { key: 'U', code: 'KeyU', shiftKey: true }, // Shift+U (Example for inverse)
        // Add more if the game supports primes via Shift
    };

    // =========================================
    // CORE: INPUT INJECTOR
    // =========================================
    function triggerGameAction(actionName) {
        const map = CONTROLS[actionName];
        if (!map) return;

        const eventConfig = {
            key: map.key,
            code: map.code,
            keyCode: map.keyCode,
            charCode: map.keyCode,
            which: map.keyCode,
            bubbles: true,
            cancelable: true,
            view: window,
            shiftKey: map.shiftKey || false
        };

        // Fire both keydown and keyup to simulate a full press
        document.dispatchEvent(new KeyboardEvent('keydown', eventConfig));
        window.dispatchEvent(new KeyboardEvent('keydown', eventConfig));
        
        setTimeout(() => {
            document.dispatchEvent(new KeyboardEvent('keyup', eventConfig));
        }, 50);

        console.log(`🎮 Action Triggered: ${actionName}`);
    }

    // =========================================
    // MODULE 1: GAMEPAD / CONTROLLER
    // =========================================
    let gamepadIndex = null;
    const buttonCache = {}; 

    window.addEventListener("gamepadconnected", (e) => {
        console.log("Joystick Connected:", e.gamepad.id);
        gamepadIndex = e.gamepad.index;
        loopGamepad();
    });

    function loopGamepad() {
        if (gamepadIndex === null) return;
        const gp = navigator.getGamepads()[gamepadIndex];
        
        if (gp) {
            // Mapping: Xbox/Standard Layout
            // Button 0 (A), 1 (B), 2 (X), 3 (Y)
            // Button 12 (D-Up), 13 (D-Down), 14 (D-Left), 15 (D-Right)
            
            handleButton(gp, 12, 'UP');
            handleButton(gp, 13, 'DOWN');
            handleButton(gp, 14, 'LEFT');
            handleButton(gp, 15, 'RIGHT');
            handleButton(gp, 0,  'FRONT'); // Button A
            handleButton(gp, 1,  'BACK');  // Button B
        }
        requestAnimationFrame(loopGamepad);
    }

    function handleButton(gp, btnIdx, action) {
        const pressed = gp.buttons[btnIdx] && gp.buttons[btnIdx].pressed;
        
        // Debounce: Only trigger on initial press, not hold
        if (pressed && !buttonCache[btnIdx]) {
            triggerGameAction(action);
            buttonCache[btnIdx] = true;
        } else if (!pressed) {
            buttonCache[btnIdx] = false;
        }
    }

    // =========================================
    // MODULE 2: SMART CUBE (BLUETOOTH)
    // =========================================
    // Standard UUIDs for GAN and many smart cubes
    const UUIDS = {
        SERVICE: "0000fff0-0000-1000-8000-00805f9b34fb",
        CHARACTERISTIC: "0000fff5-0000-1000-8000-00805f9b34fb"
    };

    // UI Overlay for Connection
    const ui = document.createElement('div');
    ui.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:10000; display:flex; gap:10px;";
    
    const btBtn = document.createElement('button');
    btBtn.innerText = "Bluetooth Connect";
    btBtn.style.cssText = "padding:12px 20px; background:#007bff; color:white; border:none; border-radius:8px; font-family:sans-serif; cursor:pointer; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.1);";
    
    btBtn.onclick = initBluetooth;
    ui.appendChild(btBtn);
    document.body.appendChild(ui);

    async function initBluetooth() {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: "GAN" }, { namePrefix: "Gi" }, { namePrefix: "MG" }],
                optionalServices: [UUIDS.SERVICE]
            });

            const server = await device.gatt.connect();
            const service = await server.getPrimaryService(UUIDS.SERVICE);
            const characteristic = await service.getCharacteristic(UUIDS.CHARACTERISTIC);
            
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', parseCubeData);

            btBtn.innerText = "✅ Cube Linked";
            btBtn.style.background = "#28a745";
            
        } catch (err) {
            console.error(err);
            alert("Bluetooth Error: " + err.message);
        }
    }

    // =========================================
    // SMART CUBE DECODER (LOGIC ENGINE)
    // =========================================
    let lastState = null;

    function parseCubeData(event) {
        const value = event.target.value;
        const data = new Uint8Array(value.buffer);
        
        // NOTE: GAN Cubes vary by version (v2, v3, i3).
        // This is a robust parser for the "Unencrypted" state report usually found in bytes 16-19
        // or the specific Move Byte.
        
        // Decoding Strategy: 
        // Karamihan sa cubes ay nagpapadala ng buong state. 
        // Pero ang pinaka-reliable para sa generic input ay ang pag-detect ng pagbabago.
        
        // Simple mapping based on Giiker/GAN Standard Protocol:
        // Byte 12 often indicates the face turned, Byte 13 the direction.
        
        // Hex signatures for faces (Common mapping):
        // 1: B, 2: D, 3: L, 4: U, 5: R, 6: F (Standard)
        // Direction: 1: CW, 3: CCW
        
        // Let's inspect the payload length to determine logic
        // GAN Standard usually sends 20 bytes.
        
        if (data.length >= 12) {
             // Heuristic: Check if this is a move event
             // Note: Encryption might scramble this, but this works on standard modes.
             
             // Example Parsing Logic (Simplified for reliability without heavy math libraries)
             // We map the raw byte changes to actions.
             
             // KUNG GUMAGANA: Mapping raw bytes to face (generic approach)
             // Face Indices: 0:U, 1:R, 2:F, 3:D, 4:L, 5:B
             
             // NOTE: Dahil hindi natin alam ang exact model (GAN i3 vs GAN 356 i2),
             // gagamit tayo ng "Move Mapping" mula sa standard protocol.
             
             // Look for the "Last Move" byte. Usually at index 16 or 17 depending on padding.
             // Or detect changes in the encryption pattern.
             
             // FALLBACK: Simplest interpretation logic
             // Kung ang bytes ay encrypted, kailangan ng key.
             // Assuming unencrypted / standard connection:
             
             const faceByte = data[16]; // Common location for face
             const dirByte = data[17];  // Common location for direction
             
             // Map bytes to controls
             // Ito ay example mapping. Kung mali ang ikot, pagpalitin lang ang values dito.
             let action = null;
             
             // Basic Face detection logic (Adjust based on console logs if needed)
             switch(faceByte) {
                 case 0: action = 'UP'; break;
                 case 1: action = 'RIGHT'; break;
                 case 2: action = 'FRONT'; break;
                 case 3: action = 'DOWN'; break;
                 case 4: action = 'LEFT'; break;
                 case 5: action = 'BACK'; break;
             }
             
             if (action) {
                 // Kung Counter-Clockwise (Prime), pwede magdagdag ng logic dito
                 // Sa ngayon, trigger basic face move
                 triggerGameAction(action);
             }
             
             // DEBUG: Uncomment to see your cube's specific data structure
             // console.log("Cube Data:", data);
        }
    }

})();