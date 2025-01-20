// Real-Time Clock
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    document.getElementById("clock").textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);

// Fetch Weather
async function fetchWeather() {
    try {
        const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=40&longitude=-74&current_weather=true");
        const data = await response.json();
        const temperature = data.current_weather.temperature;
        document.getElementById("weather").textContent = `Temp: ${temperature}°C`;
    } catch {
        document.getElementById("weather").textContent = "Weather unavailable";
    }
}
fetchWeather();

// Matrix Background Animation
const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const characters = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const fontSize = 16;
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(0);

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00ffea";
    ctx.font = `${fontSize}px monospace`;

    drops.forEach((y, index) => {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, index * fontSize, y * fontSize);

        if (y * fontSize > canvas.height && Math.random() > 0.975) {
            drops[index] = 0;
        }
        drops[index]++;
    });

    requestAnimationFrame(drawMatrix);
}
drawMatrix();

// Toggle Terminal and Microphone Visualizer
const aiModeButton = document.getElementById("btn-ai-mode");
const terminal = document.getElementById("terminal");
const terminalInput = document.getElementById("terminal-input");
const terminalOutput = document.getElementById("terminal-output");
const microphoneVisualizer = document.getElementById("microphone-visualizer");
const microphoneCanvas = document.getElementById("microphoneCanvas");
const microphoneCtx = microphoneCanvas.getContext("2d");

aiModeButton.addEventListener("click", () => {
    terminal.style.display = terminal.style.display === "none" ? "block" : "none";
    microphoneVisualizer.style.display = terminal.style.display === "block" ? "block" : "none";

    if (terminal.style.display === "block") {
        startMicrophoneVisualization();
    } else {
        if (audioContext) {
            audioContext.close();
        }
    }
});

// Microphone Visualization
let audioContext;
let analyser;
let dataArray;

async function startMicrophoneVisualization() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);
        drawMicrophoneWave();
    } catch (error) {
        console.error("Microphone access denied:", error);
        alert("Microphone access is required for the wave animation.");
    }
}

function drawMicrophoneWave() {
    microphoneCtx.clearRect(0, 0, microphoneCanvas.width, microphoneCanvas.height);

    analyser.getByteTimeDomainData(dataArray);

    microphoneCtx.lineWidth = 2;
    microphoneCtx.strokeStyle = "#00ffea";
    microphoneCtx.beginPath();

    const sliceWidth = microphoneCanvas.width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * microphoneCanvas.height) / 2;

        if (i === 0) {
            microphoneCtx.moveTo(x, y);
        } else {
            microphoneCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    microphoneCtx.lineTo(microphoneCanvas.width, microphoneCanvas.height / 2);
    microphoneCtx.stroke();

    requestAnimationFrame(drawMicrophoneWave);
}

// Terminal Command Input
terminalInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const command = terminalInput.value.trim();
        if (command) {
            terminalOutput.innerHTML += `<div>> ${command}</div>`;
            terminalInput.value = "";
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    }
});
