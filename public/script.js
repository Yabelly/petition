//========SETUP==========
const form = $("form");

const canvas = document.getElementById("canvas");

const submit = $("#submit");
const ctx = canvas.getContext("2d");
let coordinates = { x: 0, y: 0 };
//========SETUP==========
//
//========EVENTS==========

$(canvas).on("mousedown", (e) => {
    reposition(e);
    $(canvas).on("mousemove", drawing);
});
$(canvas).on("mouseup", () => {
    $(canvas).off("mousemove", drawing);
});

function reposition(e) {
    coordinates.x = e.clientX - canvas.offsetLeft;
    coordinates.y = e.clientY - canvas.offsetTop;
}
function drawing(e) {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
    ctx.moveTo(coordinates.x, coordinates.y);
    reposition(e);
    ctx.lineTo(coordinates.x, coordinates.y);
    ctx.stroke();
}
// canvas.on("mouseup", (e) => {
//     console.log("mouse is let go");
// });
//========EVENTS==========
