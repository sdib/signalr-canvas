const sender = Math.random().toString(36).substr(2, 9);
const API = "http://localhost:7071/api";

let lastPoint = { x: undefined, y: undefined };
let canvas = undefined;
let canvasContext = undefined;
let drawing = false;
let unsentStrokes = [];
let hubConnection;

const onLoaded = () => {
    setupCanvas();
    setupHub();
}

const setupHub = () => {
    hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(API)
        .configureLogging(signalR.LogLevel.Information)
        .build();

    hubConnection.start();

    hubConnection.on('newStrokes', message => {
        if (message.sender === sender) {
            return;
        }

        startDrawing();
        message.strokes.map(stroke => draw(stroke.start, stroke.end));
        stopDrawing();
    });

}

const setupCanvas = () => {
    canvas = document.getElementById("canvas");
    canvasContext = canvas.getContext("2d");

    canvas.addEventListener("mousedown", ev => startDrawing(ev), false);

    canvas.addEventListener("mousemove", ev => {
        if (drawing === false) {
            return;
        }

        const end = { x: ev.clientX - canvas.offsetLeft, y: ev.clientY - canvas.offsetTop };
        draw(lastPoint, end);
        unsentStrokes.push({ start: lastPoint, end });
        lastPoint = end;
    }, false);

    canvas.addEventListener("mouseup", () => {
        stopDrawing();
    }, false);

    canvas.addEventListener("mouseleave", () => {
        stopDrawing();
    });
}

const startDrawing = (ev) => {
    if (ev) {
        lastPoint.x = ev.clientX - canvas.offsetLeft;
        lastPoint.y = ev.clientY - canvas.offsetTop;
    }
    drawing = true;
}

const stopDrawing = () => {
    drawing = false;
    lastPoint.x = lastPoint.y = undefined;
}

const draw = (start, end) => {
    canvasContext.beginPath();
    canvasContext.moveTo(start.x, start.y);
    canvasContext.lineTo(end.x, end.y)
    canvasContext.stroke();
}

const sendCoordinates = strokes => {
    const requestInfo = {
        body: JSON.stringify({ sender, strokes }),
        method: "POST"
    };
    fetch(`${API}/CanvasHub`, requestInfo);
}

setInterval(() => {
    if (unsentStrokes.length) {
        sendCoordinates(unsentStrokes);
        unsentStrokes = [];
    }
}, 250);