(function() {
    // 1. INJECT PEERJS & STYLES
    const script = document.createElement('script');
    script.src = "https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js";
    document.head.appendChild(script);

    const s = document.createElement('style');
    s.textContent = `
        #cube-panel { position:fixed; top:10px; right:10px; z-index:10000; font-family:sans-serif; text-align:right; pointer-events:none; }
        #cube-panel * { pointer-events: auto; }
        .c-btn { padding:8px 12px; border-radius:5px; border:none; cursor:pointer; font-weight:bold; color:white; background:#007bff; margin-bottom:5px; width:120px; }
        #qr-box { background:white; padding:8px; border-radius:8px; display:none; margin-top:5px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
        .status-txt { color:#0f0; font-size:12px; text-shadow:1px 1px #000; font-weight:bold; margin-bottom:5px; background:rgba(0,0,0,0.5); padding:2px 5px; border-radius:3px; }
    `;
    document.head.appendChild(s);

    // 2. UI STRUCTURE
    const panel = document.createElement('div');
    panel.id = "cube-panel";
    panel.innerHTML = `
        <div id="wifi-label" class="status-txt">📶 Connecting...</div>
        <button id="bt-btn" class="c-btn">Wifi Connect</button>
        <div id="qr-box"></div>
    `;
    document.body.appendChild(panel);

    // 3. CORE LOGIC: KEYBOARD INJECTION
    function fireMove(m) {
        const map = { 'U':'u','D':'d','L':'l','R':'r','F':'f','B':'b' };
        const key = map[m.toUpperCase()];
        if(!key) return;
        
        const opts = { key: key, code: 'Key' + m.toUpperCase(), bubbles: true };
        document.dispatchEvent(new KeyboardEvent('keydown', opts));
        setTimeout(() => document.dispatchEvent(new KeyboardEvent('keyup', opts)), 50);
        console.log(`📶 Remote Move: ${m}`);
    }

    // 4. GENERATE QR & HANDLE CONNECTION
    script.onload = () => {
        const id = 'cube-' + Math.random().toString(36).substr(2, 4);
        const peer = new Peer(id);

        peer.on('open', (peerId) => {
            const qr = document.getElementById('qr-box');
            document.getElementById('wifi-label').innerText = `📶 Scan to Play`;
            
            // Gumagawa ng URL na may 'remote' parameter para sa phone
            const remoteURL = window.location.href.split('?')[0] + '?remote=' + peerId;
            
            qr.innerHTML = `
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(remoteURL)}" />
                <div style="font-size:10px; color:#333; margin-top:5px; text-align:center;">Remote Gamepad</div>
            `;
            qr.style.display = 'block';
        });

        peer.on('connection', (conn) => {
            conn.on('data', (data) => fireMove(data));
            document.getElementById('wifi-label').innerText = "📶 PHONE CONNECTED";
            document.getElementById('qr-box').style.display = 'none'; // Hide QR pag connected na
        });
    };

    // 5. REMOTE INTERFACE (Para sa Phone screen)
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('remote')) {
        document.body.innerHTML = `
            <div id="remote-ui" style="display:grid; grid-template-columns:1fr 1fr; gap:15px; padding:20px; height:100vh; background:#111; box-sizing:border-box;">
                <div style="grid-column: span 2; color:#0f0; text-align:center; font-family:sans-serif;">📶 Connected to Cube</div>
            </div>`;
        
        const rPeer = new Peer();
        rPeer.on('open', () => {
            const conn = rPeer.connect(urlParams.get('remote'));
            conn.on('open', () => {
                ['U','D','L','R','F','B'].forEach(m => {
                    const b = document.createElement('button');
                    b.innerText = m;
                    b.style.cssText = "font-size:45px; background:#222; color:#fff; border:2px solid #444; border-radius:15px; touch-action:manipulation;";
                    
                    const trigger = (e) => {
                        e.preventDefault();
                        conn.send(m);
                        b.style.background = "#007bff";
                        if(navigator.vibrate) navigator.vibrate(40);
                    };
                    
                    b.ontouchstart = trigger;
                    b.ontouchend = () => b.style.background = "#222";
                    document.getElementById('remote-ui').appendChild(b);
                });
            });
        });
        return; // Stop execution para hindi mag-load ang game sa phone
    }

    // 6. BLUETOOTH CUBE INITIALIZATION
    document.getElementById('bt-btn').onclick = async () => {
        try {
            const dev = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: "GAN" }, { namePrefix: "Gi" }],
                optionalServices: ["0000fff0-0000-1000-8000-00805f9b34fb"]
            });
            const srv = await (await dev.gatt.connect()).getPrimaryService("0000fff0-0000-1000-8000-00805f9b34fb");
            const chr = await srv.getCharacteristic("0000fff5-0000-1000-8000-00805f9b34fb");
            await chr.startNotifications();
            chr.addEventListener('characteristicvaluechanged', (e) => {
                const b = new Uint8Array(e.target.value.buffer);
                if(b[16] < 6) fireMove(['U','R','F','D','L','B'][b[16]]);
            });
            document.getElementById('bt-btn').innerText = "✅ Cube Ready";
            document.getElementById('bt-btn').style.background = "#28a745";
        } catch(e) { console.warn("BT Error:", e); }
    };
})();