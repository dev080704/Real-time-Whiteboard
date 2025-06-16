const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const eraserBtn = document.getElementById('eraserBtn');
const clearBtn = document.getElementById('clearBtn');

let drawing = false;
let currentColor = colorPicker.value;
let currentSize = brushSize.value;
let erasing = false;

const socket = new WebSocket('ws://' + location.host);
socket.onopen = () => console.log('WebSocket connected!');
socket.onerror = (e) => console.error('WebSocket error:', e);


// Draw function
function draw(pos, color, size) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
  ctx.fill();
}

// Event listeners
canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const pos = { x: e.offsetX, y: e.offsetY };
  const payload = {
    x: pos.x,
    y: pos.y,
    color: erasing ? '#ffffff' : currentColor,
    size: parseInt(currentSize)
  };
  draw(payload, payload.color, payload.size);
  socket.send(JSON.stringify({ type: "draw", ...payload }));
});

// Socket message handler
socket.onmessage = async (event) => {
  const text = await event.data.text(); // convert Blob to string
  const data = JSON.parse(text);        // now parse it safely
  console.log("Received:", data);

  if (data.type === "draw") {
    draw(data, data.color, data.size);
  }

  if (data.type === "clear") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  if (data.type === "join") {
    console.log("🔔 A user joined");
  }
};


// UI controls
colorPicker.addEventListener('input', () => {
  currentColor = colorPicker.value;
  erasing = false;
});

brushSize.addEventListener('input', () => {
  currentSize = brushSize.value;
});

eraserBtn.addEventListener('click', () => {
  erasing = true;
});

clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.send(JSON.stringify({ type: "clear" }));
});