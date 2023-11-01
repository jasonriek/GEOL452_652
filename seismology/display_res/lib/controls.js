/**
 * boxes adjustment for Source Type
 */
function selectSource() {
    ctx.clearRect(0, 0, canvas_width, canvas_height);
    var e = document.getElementById("source");
    source = e.options[e.selectedIndex].value;
    console.log(source);
    drawSeis();
}
let vareaText = "Wiggle";
document.getElementById("plotValueid").innerHTML = vareaText;
/**
 * used for the Variable Area/Wiggle button
 *
 * to change what type of trace is being used
 */
function TraceTypeAction() {
    ctx.clearRect(0, 0, canvas_width, canvas_height);
    if (varea === true) {
        varea = false;
        vareaText = "Wiggle";
    }
    else {
        varea = true;
        vareaText = "Variable Area";
    }
    document.getElementById("plotValueid").innerHTML = vareaText;
    drawSeis();
}
function removeTable() {
    var table = document.getElementById("stats");
    table.innerHTML = "";
}
function clearAll() {
    let key_name_head = "key_name";
    let keynameCount = 1;
    let key_name = `${key_name_head}_${keynameCount}`;
    picked_ctx.clearRect(0, 0, canvas_width, canvas_height);
    for (let i = 0; i < nTraces; i++) {
        //@ts-ignore
        if (dataNodes[key_name].ptime != -1) {
            dataNodes[key_name].ptime = -1;
        }
        keynameCount++;
        key_name = `${key_name_head}_${keynameCount}`;
    }
    removeTable();
}
function deleteRow(r, count) {
    var i = r.parentNode.parentNode.rowIndex;
    document.getElementById("stats").deleteRow(i);
    let keynameCount = 1;
    let key_name_head = "key_name";
    let key_name = `${key_name_head}_${keynameCount}`;
    for (let i = 0; i < nTraces; i++) {
        if (dataNodes[key_name].outputOrder === count) {
            dataNodes[key_name].ptime = -1;
        }
        keynameCount++;
        key_name = `${key_name_head}_${keynameCount}`;
    }
    repaint();
}
//# sourceMappingURL=controls.js.map