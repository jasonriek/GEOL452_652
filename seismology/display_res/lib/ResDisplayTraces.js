//#region variable declarations
/**
 * defines width of applet
 */
let canvas_width = 800;
/**
 * defines height of applet
 */
let canvas_height = 500;
/**
 * defines height of seismogram plotting area
 */
let seis_height = canvas_height - 100;
/**
 * defines width of seismogram plotting area
 */
let seis_width = canvas_width - 100;
/**
 * for random number generator - probably dont need to use
 */
let iset;
/**
 * for random number generator - probably dont need to use
 */
let gset;
/**
 * Create Boolean Variable to determine how to plot traces:
 *
 * true for variable area - false for wiggle
 */
let varea = false;
/**
 * Variable to capture source type:
 *
 * b = betsy seisgun, h = hammer, d = dynamite
 */
let source = "h";
/**
 * Number of impacts stacked for the hammer - ignored otherwise
 */
let n_impacts = 10;
/**
 * distance between each trace in pixels
 */
let gap;
/**
 * Time increment per vertical pixel
 */
let dt;
/**
 * Variable used to construct string showing last pick time and offset
 */
let plabel = "";
/**
 * upper left cordinate x
 */
let ul_cor_x = (canvas_width - seis_width) / 2;
/**
 * upper left cordinate y
 */
let ul_cor_y = (canvas_height - seis_height) / 2;
/**
 * upper right cordinate x
 */
let ur_cor_x = ul_cor_x + seis_width;
/**
 * upper right cordinate y
 */
let ur_cor_y = ul_cor_y;
/**
 * lower left cordinate x
 */
let ll_cor_x = ul_cor_x;
/**
 * lower left cordinate y
 */
let ll_cor_y = ul_cor_y + seis_height;
/**
 * lower right cordinate x
 */
let lr_cor_x = ur_cor_x;
/**
 * lower right cordinate y
 */
let lr_cor_y = ll_cor_y;
/**
 *  Number of traces in the suite
 */
let number_of_traces;
/**
 *  Distance between the first trace and left each of plotting area.
 */
let first_gap;
/**
 * Maxium time plotted.
 */
let maximum_time;
//#endregion
/**
 * paints the red line from picked_ctx when ptime > 0
 */
function paint() {
    let x_base;
    let y_loc;
    let p_time;
    let key_name_head = "key_name";
    let keynameCount = 1;
    let key_name = `${key_name_head}_${keynameCount}`;
    picked_ctx.fillStyle = "#CC0000";
    for (let i = 0; i < nTraces; i++) {
        if (dataNodes[key_name].ptime > 0) {
            p_time = dataNodes[key_name].ptime;
            x_base = Math.trunc(ul_cor_x + first_gap + gap * i);
            y_loc = ul_cor_y + Math.trunc(p_time / dt);
            picked_ctx.fillRect(x_base - 5, y_loc - 1, 10, 2);
        }
        keynameCount++;
        key_name = `${key_name_head}_${keynameCount}`;
    }
    picked_ctx.fillText(plabel, ur_cor_x - 200, ur_cor_y - 25);
}
/**
 * Changes plot
 * @param width
 */
function changePlot(width) {
    canvas_width = width;
    seis_width = canvas_width - 100;
    ul_cor_x = (canvas_width - seis_width) / 2;
    ul_cor_y = (canvas_height - seis_height) / 2;
    ur_cor_y = ul_cor_y;
    ur_cor_x = ul_cor_x + seis_width;
    ll_cor_x = ul_cor_x;
    ll_cor_y = ul_cor_y + seis_height;
    lr_cor_x = ur_cor_x;
    lr_cor_y = ll_cor_y;
}
//global variables for canvas, gets changed in drawSeis()
let canvas;
let picked_canvas;
let ctx;
let picked_ctx;
let canvasHTMLtrace;
/**
 * (1)first it changes the canvas ploting area
 *
 * (2)then it makes the canvas html for the decared width
 */
function drawSeis() {
    // Create Seismograms and draw them - first determine
    // number of seismograms to draw and compute horizontal
    // trace offset.
    number_of_traces = nTraces;
    gap = seis_width / number_of_traces;
    first_gap = gap / 2;
    // Check horizontal trace offset. If it is less than 20. Fix the gap
    // to 20 and rescale applet's plotting area to accomodate the traces
    // For this to work, the html calling this applet must make its applet
    // width LARGER than the default applet width displayed above. If you
    // want to be able to display up to 144 seismograms, the applet width
    // as defined in the html must be 2980. In most applications this much
    // space will not be used.
    if (gap < 20) {
        gap = 20;
        first_gap = gap / 2;
        changePlot(Math.trunc(gap * (number_of_traces + 1) + 100));
    }
    //#region (2)then it makes the canvas html for the decared width 
    canvasHTMLtrace = document.getElementById("canvasWrapper");
    canvasHTMLtrace.innerHTML = `<canvas id="Trace-canvas" width=${canvas_width} height=${canvas_height} ></canvas>
  <canvas id="picked-canvas" width=${canvas_width} height=${canvas_height} onmousedown="redPick()"></canvas>`;
    canvas = document.getElementById("Trace-canvas");
    picked_canvas = document.getElementById("picked-canvas");
    ctx = canvas.getContext("2d");
    picked_ctx = picked_canvas.getContext("2d");
    //repaints the red lines
    if (!(picked_ctx === undefined)) {
        paint();
    }
    //#endregion
    //#region initialize variables 
    let stringLength = "Location (m)";
    let aninc = stringLength.length;
    let y = [seis_height];
    let s = [seis_height];
    let f = [seis_height - 1];
    maximum_time = newNode.larrival * 1.25;
    dt = maximum_time / seis_height;
    if (maximum_time < 0.05) {
        maximum_time = 0.05;
    }
    let max_amp = 1.0;
    let ppera = ((gap / 2) * 0.9) / max_amp;
    let scale;
    let j;
    let k;
    let narr;
    let index;
    let x_base;
    let y_loc;
    let time;
    let amp;
    let Q;
    let denom;
    let s1;
    let s2;
    let offset;
    let toff;
    // ll = TraceData.First()
    let i = 0;
    let key_name_head = "key_name";
    let keynameCount = 1;
    let key_name = `${key_name_head}_${keynameCount}`;
    //#endregion
    for (i = 0; i < number_of_traces; i++) {
        for (j = 0; j < seis_height; j++)
            y[j] = 0;
        for (j = 0; j < 2 * seis_height - 1; j++)
            f[j] = 0;
        //Get first arrival time - Use this time when
        //adding noise to the trace. Less noise before this
        //time more after
        time = dataNodes[key_name].farrival;
        amp = dataNodes[key_name].famp;
        index = Math.trunc(time / dt);
        if (index < 0) {
            index = 0;
        }
        s1 = 250.0;
        s2 = 8.0;
        if (source === "b") {
            s1 = 150.0;
        }
        if (source === "h") {
            s1 = 50 * Math.sqrt(n_impacts);
        }
        for (j = 0; j < seis_height; j++) {
            y[j] = (gaussianRand() * max_amp * ppera) / s1;
        }
        for (j = index; j < seis_height; j++) {
            y[j] += (gaussianRand() * amp * ppera) / s2;
        }
        narr = dataNodes[key_name].nArrivals;
        for (j = 0; j < narr; j++) {
            time = dataNodes[key_name].getTime(j);
            amp = dataNodes[key_name].getAmp(j);
            index = Math.trunc(time / dt);
            if (index < 0) {
                index = 0;
            }
            if (index < seis_height) {
                y[index] = amp * ppera;
            }
        }
        Q = 350.0;
        toff = 0.002;
        if (source === "h") {
            toff = 0.005;
            Q = 150.0;
        }
        if (source === "b") {
            toff = 0.004;
            Q = 175.0;
        }
        amp = 0.0;
        for (time = -0.025, j = 0; time <= 0.025; time += dt, j++) {
            denom = 1.0 / (4 * Q * Q) + (time - toff) * (time - toff);
            s[j] = -(time - toff) / (Q * denom * denom);
            if (s[j] < 0.0) {
                s[j] *= 0.75;
            }
            if (amp < Math.abs(s[j])) {
                amp = Math.abs(s[j]);
            }
        }
        index = j - 1;
        for (j = 0; j < seis_height; j++) {
            s[j] /= amp;
        }
        for (j = 0; j < seis_height; j++) {
            for (k = 0; k < index; k++) {
                f[j + k] = f[j + k] + y[j] * s[k];
            }
        }
        amp = 0.0;
        for (j = 0; j < seis_height + index - 1; j++) {
            if (amp < Math.abs(f[j])) {
                amp = Math.abs(f[j]);
            }
        }
        scale = ((gap / 2) * 0.9) / amp;
        for (j = 0; j < seis_height + index - 1; j++) {
            f[j] *= scale;
        }
        x_base = Math.trunc(ul_cor_x + first_gap + gap * i);
        for (j = 0; j < seis_height - 1; j++) {
            y_loc = ul_cor_y + j;
            k = j + index / 2;
            drawLine(x_base + f[Math.trunc(k)], y_loc, x_base + f[Math.trunc(k) + 1], y_loc + 1);
            if (varea) {
                if (f[Math.trunc(k)] >= 0 && f[Math.trunc(k) + 1] >= 0) {
                    drawLine(x_base, y_loc, x_base + f[Math.trunc(k)], y_loc);
                }
                else {
                    drawLine(x_base + f[Math.trunc(k)], y_loc, x_base + f[Math.trunc(k) + 1], y_loc + 1);
                }
            }
        }
        offset = dataNodes[key_name].offset;
        let stringL = "" + offset;
        k = stringL.length;
        ctx.fillText("" + offset, x_base - k / 2, ul_cor_y - 5);
        keynameCount++;
        key_name = `${key_name_head}_${keynameCount}`;
    }
    let stringL = "Location (m)";
    k = stringL.length;
    ctx.fillText("Location (m)", canvas_width / 2 - k / 2, ul_cor_y - 25);
    let dts = 0.001;
    let ds;
    if (maximum_time > 1.0) {
        dts = 0.1;
    }
    else if (maximum_time > 0.1) {
        dts = 0.05;
    }
    else if (maximum_time > 0.05) {
        dts = 0.01;
    }
    else if (maximum_time > 0.01) {
        dts = 0.005;
    }
    for (ds = 0.0; ds < maximum_time; ds += dts) {
        k = ul_cor_y + Math.trunc(ds / dt);
        drawLine(ul_cor_x, k, ur_cor_x, k);
        i = Math.trunc(ds * 1000 + 0.5);
        stringL = "" + i;
        j = stringL.length;
        ctx.fillText("" + i, ul_cor_x - j - 10, k - 1);
    }
    stringL = "Time";
    j = stringL.length;
    ctx.fillText("Time", ul_cor_x / 2 - j / 2, ll_cor_y);
    stringL = "(msec)";
    j = stringL.length;
    ctx.fillText("(msec)", ul_cor_x / 2 - j / 2, ll_cor_y + 10);
}
function selectTime(e) {
    let x = e.offsetX;
    let y = e.offsetY;
    // console.log(`x = ${x}, and y = ${y}`);
    let count;
    let tx;
    let ty;
    let ptime;
    let key_name_head = "key_name";
    let keynameCount = 1;
    let key_name = `${key_name_head}_${keynameCount}`;
    plabel = "";
    for (count = 0; count < nTraces; count++) {
        key_name = `${key_name_head}_${keynameCount}`;
        tx = Math.trunc(ul_cor_x + first_gap + gap * count);
        if (x > tx - gap / 2 && x < tx + gap / 2) {
            ptime = (y - ul_cor_y) * dt;
            if (ptime > 0.0 && ptime <= maximum_time) {
                dataNodes[key_name].ptime = ptime;
                ptime = Math.trunc(ptime * 100000.0) / 100.0; //? has a double wrapped around the java
                dataNodes[key_name].ptimeOutput = ptime;
                plabel =
                    "Location = " +
                        dataNodes[key_name].offset +
                        "m Time = " +
                        ptime +
                        " ms";
                outputData();
            }
        }
        keynameCount++;
    }
    repaint();
}
function repaint() {
    picked_ctx.clearRect(0, 0, canvas_width, canvas_height);
    paint();
}
/**
 * Draws line
 * @param x1 -starting x point ([x] , y) => (x , y)
 * @param y1 - starting y point (x , [y]) => (x , y)
 * @param x2 - ending x point (x , y) => ([x] , y)
 * @param y2 - ending y point (x , y) => (x , [y])
 * @param [color]
 */
function drawLine(x1, y1, x2, y2, color = "#000000") {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    // this.ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
}
/**
 * Gaussians rand
 * @returns rand
 */
function gaussianRand() {
    let x1, x2, rad, y1;
    do {
        x1 = 2 * Math.random() - 1;
        x2 = 2 * Math.random() - 1;
        rad = x1 * x1 + x2 * x2;
    } while (rad >= 1 || rad === 0);
    let c = Math.sqrt((-2 * Math.log(rad)) / rad);
    return x1 * c;
}
// paint();
function redPick() {
    if (picked_canvas != undefined) {
        picked_canvas.addEventListener("mousedown", selectTime, false);
    }
}
//# sourceMappingURL=ResDisplayTraces.js.map