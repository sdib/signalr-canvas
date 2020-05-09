let previousX;
let previousY;

let canvas = undefined;
let canvasContext = undefined;
let drawing = false;

const onLoaded = () => {
    console.log("loaded");

    canvas = document.getElementById("canvas");
    canvasContext = canvas.getContext("2d");

    canvas.addEventListener("mousedown", () => {
        drawing = true;
    }, false);

    canvas.addEventListener("mousemove", ev => {
        draw(ev);
    }, false);

    canvas.addEventListener("mouseup", () => {
        stopDrawing();
    }, false);

    canvas.addEventListener("mouseleave", () => {
        stopDrawing();
    })
}

const stopDrawing = () => {
    drawing = false;
    previousY = previousX = undefined;
}

const draw = (ev) => {
    if (!drawing) {
        return;
    }

    const x = ev.clientX - canvas.offsetLeft;
    const y = ev.clientY - canvas.offsetTop;

    canvasContext.beginPath();
    canvasContext.lineJoin = "round";

    canvasContext.moveTo(previousX, previousY);
    canvasContext.lineTo(x, y)
    canvasContext.closePath();
    canvasContext.stroke();
    previousX = x;
    previousY = y;
}