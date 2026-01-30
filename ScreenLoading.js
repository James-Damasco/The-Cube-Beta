(function () {
        const cssStyles = `
        #unity-intro-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #232c3b;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
        opacity: 1;
        transition: opacity 1s ease-out;
        }

        .logo-container {
        margin-bottom: 20px;
        perspective: 1000px;
        }
        .cube-icon {
        width: 60px;
        height: 60px;
        position: relative;
        transform-style: preserve-3d;
        animation: rotateCube 3s infinite linear;
        }
        .face {
        position: absolute;
        width: 60px;
        height: 60px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid #fff;
        box-sizing: border-box;
        }
        .front  { transform: rotateY(0deg) translateZ(30px); }
        .back   { transform: rotateY(180deg) translateZ(30px); }
        .right  { transform: rotateY(90deg) translateZ(30px); }
        .left   { transform: rotateY(-90deg) translateZ(30px); }
        .top    { transform: rotateX(90deg) translateZ(30px); }
        .bottom { transform: rotateX(-90deg) translateZ(30px); }

        /* Text Styling */
        .intro-text {
            color: #ffffff;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-top: 20px;
        }

        /* Loading Bar */
        .loading-bar-container {
            width: 200px;
            height: 4px;
            background-color: #111;
            margin-top: 30px;
            border-radius: 2px;
            overflow: hidden;
        }

        .loading-bar-fill {
            width: 0%;
            height: 100%;
            background-color: #fff;
            animation: loadProgress 3s ease-in-out forwards;
        }

        /* Animations */
        @keyframes rotateCube {
            0% { transform: rotateX(0deg) rotateY(0deg); }
            100% { transform: rotateX(360deg) rotateY(360deg); }
        }

        @keyframes loadProgress {
            0% { width: 0%; }
            50% { width: 40%; }
            80% { width: 90%; }
            100% { width: 100%; }
        }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = cssStyles;
        document.head.appendChild(styleSheet);

        const overlay = document.createElement("div");
        overlay.id = "unity-intro-overlay";

        const logoContainer = document.createElement("div");
        logoContainer.className = "logo-container";
        const cubeIcon = document.createElement("div");
        cubeIcon.className = "cube-icon";

        const faces = ["front", "back", "right", "left", "top", "bottom"];
        faces.forEach(face => {
            const div = document.createElement("div");
            div.className = `face ${face}`;
            cubeIcon.appendChild(div);
        });
        logoContainer.appendChild(cubeIcon);

        const textNode = document.createElement("div");
        textNode.className = "intro-text";
        textNode.innerText = "THE CUBE";

        const loaderContainer = document.createElement("div");
        loaderContainer.className = "loading-bar-container";
        const loaderFill = document.createElement("div");
        loaderFill.className = "loading-bar-fill";
        loaderContainer.appendChild(loaderContainer);

        overlay.appendChild(logoContainer);
        overlay.appendChild(textNode);
        overlay.appendChild(loaderContainer);

        if (document.body) {
            document.body.appendChild(overlay);
        } else {
            window.addEventListener("DOMContentLoaded", () => {
                document.body.appendChild(overlay);
            });
        }
        setTimeout(() => {
            overlay.style.opacity = "0";
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 1000);
        }, 3500);
    })();