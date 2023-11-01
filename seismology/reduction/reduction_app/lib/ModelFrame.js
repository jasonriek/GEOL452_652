let canvas_layer = document.getElementById("Canvas_Layer");
let ctx_layer = canvas_layer.getContext("2d");
// const v1_slider = document.getElementById("VelocityTop");
// let inter = null;
/**
 * Define Objects for dropdown menu
 */
let choices = [1, 2, 3, 4, 5];
/**
 * Array holding number of sources that can be modeled
 */
let sLocation = [100.0, 200.0, 300.0, 400.0, 450.0];
let dsourcex = 0.5;
let sSelect;
let sky;
let l1c = "#2b4b36";
let l2c = "#49B61A";
let l3c = "#654321";
/**
 * Min output number meters/s
 */
let V1Min = 250.0;
/**
 *  Max output number meters/s
 */
let V1Max = 2500.0;
/**
 * Increment in Spacing allowed
 */
let dV1 = 50.0;
/**
 * Minimum Scroll Bar Value
 */
let V1BarMin = 1;
/**
 * Maximum Scroll Bar Value
 */
let V1BarMax = Math.trunc((V1Max - V1Min) / dV1 + 2.1) - 1;
/**
 *  Max output number meters
 */
let V2Min = 250.0;
/**
 *  Max output number meters
 */
let V2Max = 2500.0;
/**
 * Increment in Spacing allowed
 */
let dV2 = 50.0;
/**
 * Minimum Scroll Bar Value
 */
let V2BarMin = 1;
/**
 * Maximum Scroll Bar Value
 */
let V2BarMax = Math.trunc((V2Max - V2Min) / dV2 + 2.1) - 1;
/**
 *  Max output number meters
 */
let V3Min = 500.0;
/**
 *  Max output number meters
 */
let V3Max = 3500.0;
/**
 * Increment in Spacing allowed
 */
let dV3 = 50.0;
/**
 * Minimum Scroll Bar Value
 */
let V3BarMin = 1;
/**
 * Maximum Scroll Bar Value
 */
let V3BarMax = Math.trunc((V3Max - V3Min) / dV3 + 2.1) - 1;
let BiasMin = -10.0;
/**
 * Travel time pick bias_Layer minimum in ms
 */
/**
 * Travel time pick bias_Layer minimum in ms
 */
let BiasMax = 10.0;
/**
 * Increment in Spacing allowed
 */
let dBias = 0.5;
/**
 * Minimum Scroll Bar Value
 */
let BiasBarMin = 1;
/**
 * bias_Layer bar max of model frame
 */
let BiasBarMax = Math.trunc((BiasMax - BiasMin) / dBias + 2.1) - 1;
let v1Layer = 500.0;
let v2Layer = 1200.0;
let v3_Layer = 2000.0;
let bias_Layer = 0.0;
/**
 * slope of bottom of top layer
 */
let m1_Layer = 0.0;
/**
 * depth intercept of bottom of top layer
 */
let b1_Layer = 5.0;
/**
 * slope of bottom of middle layer
 */
let m2_Layer = 0.0;
/**
 * depth intercept of bottom of middle layer
 */
let b2_Layer = 10.0;
/**
 * Array to hold receiver locations
 */
let rLocs = new Array(3000);
for (let i = 0; i < 3000; i++) {
    rLocs[i] = 0.0;
}
/**
 * Number of receivers
 */
let numReceivers;
/**
 * Variable used to construct scrollbars
 */
let svalue;
/**
 * frame sizes x_Layer
 */
let framex = 600;
/**
 * frame sizes y_Layer
 */
let framey = 340;
/**
 * size of xsection part of frame
 */
let xsectx = 500;
/**
 * size of xsection part of frame
 */
let xsecty = 225;
/**
 * y_Layer location of surface of the earth
 */
let surfacey = 50;
/**
 * Maximum xsection depth (m)
 */
let DepthMax = 20.0;
/**
 * Width of plot area in meters
 */
let WidthMax = 500.0;
let MinThickness = 0.25;
let xscale_Layer = xsectx / WidthMax;
let yscale = (xsecty - surfacey) / DepthMax;
/**
 * Array for polygon points
 */
let xpts = new Array(4);
/**
 * Array for polygon points
 */
let ypts = new Array(4);
let ulcorxLayer = Math.trunc((framex - xsectx) / 2.0);
let ulcoryLayer = Math.trunc(25 + surfacey);
let urcoryLayer = ulcoryLayer;
let urcorxLayer = ulcorxLayer + xsectx;
let llcorxLayer = ulcorxLayer;
let llcoryLayer = ulcoryLayer + xsecty - surfacey;
let lrcorxLayer = urcorxLayer;
let lrcoryLayer = llcoryLayer;
/**
 * Layer 1 parameters
 */
let LastY1;
/**
 * Layer 1 parameters
 */
let LastX1;
/**
 * Layer 2 parameters
 */
let LastY2;
/**
 * Layer 2 parameters
 */
let LastX2;
/**
 * Source parameters
 */
let LastYs;
/**
 * Source parameters
 */
let LastXs;
/**
 * Receiver parameters
 */
let LastYr;
/**
 * Receiver parameters
 */
let LastXr;
let canvas_ctx;
let bg_color;
let border_thickness;
let border_color;
let x_points;
let y_points;
let startingAngle_Layer;
let endAngle_Layer;
let x_Layer;
let y_Layer;
let r_Layer;
let stroke_Layer;
let TunB;
let numSources_Layer = 1;
let s_value;
/**
 * initialized the sliders
 */
function setSlideBar() {
    //Set Vel Top
    s_value = Math.trunc(((v1Layer - V1Min) * (V1BarMax - V1BarMin)) / (V1Max - V1Min) +
        V1BarMin +
        0.5);
    //@ts-ignore
    v1_slider.value = s_value;
    //@ts-ignore
    v1_slider.min = V1BarMin;
    //@ts-ignore
    v1_slider.max = V1BarMax;
    //Set Vel Middle
    s_value = Math.trunc(((v2Layer - V2Min) * (V2BarMax - V2BarMin)) / (V2Max - V2Min) +
        V2BarMin +
        0.5);
    //@ts-ignore
    v2_slider.value = s_value;
    //@ts-ignore
    v2_slider.min = V2BarMin;
    //@ts-ignore
    v2_slider.max = V2BarMax;
    // Set Vel Bottom
    s_value = Math.trunc(((v3_Layer - V3Min) * (V3BarMax - V3BarMin)) / (V3Max - V3Min) +
        V3BarMin +
        0.5);
    //@ts-ignore
    v3_slider.value = s_value;
    //@ts-ignore
    v3_slider.min = V3BarMin;
    //@ts-ignore
    v3_slider.max = V3BarMax;
    s_value = Math.trunc(((bias_Layer - BiasMin) * (BiasBarMax - BiasBarMin)) / (BiasMax - BiasMin) +
        BiasBarMin +
        0.5);
    //@ts-ignore
    bias_slider.value = s_value;
    //@ts-ignore
    bias_slider.min = BiasBarMin;
    //@ts-ignore
    bias_slider.max = BiasBarMax;
}
/**
 * Sets values
 */
function setValues() {
    //Set v1
    s_value = Math.trunc(((v1Layer - V1Min) * (V1BarMax - V1BarMin)) / (V1Max - V1Min) +
        V1BarMin +
        0.5);
    //@ts-ignore
    v1_slider.value = s_value;
    //set v2
    s_value = Math.trunc(((v2Layer - V2Min) * (V2BarMax - V2BarMin)) / (V2Max - V2Min) +
        V2BarMin +
        0.5);
    //@ts-ignore
    v2_slider.value = s_value;
    // Set Standard Deviation
    s_value = Math.trunc(((v3_Layer - V3Min) * (V3BarMax - V3BarMin)) / (V3Max - V3Min) +
        V3BarMin +
        0.5);
    //@ts-ignore
    v3_slider.value = s_value;
    // Set Standard Deviation
    s_value = Math.trunc(((bias_Layer - BiasMin) * (BiasBarMax - BiasBarMin)) / (BiasMax - BiasMin) +
        BiasBarMin +
        0.5);
    //@ts-ignore
    bias_slider.value = s_value;
}
function paintLayer() {
    //Set Background color
    ctx_layer.fillStyle = "#fff";
    ctx_layer.fillRect(0, 0, framex, framey);
    ctx_layer.fillStyle = "#87ceeb";
    ctx_layer.fillRect(ulcorxLayer, ulcoryLayer - surfacey, xsectx, surfacey);
    //paint area
    //plot color for top layer
    ctx_layer.fillStyle = l1c;
    ctx_layer.fillRect(ulcorxLayer, ulcoryLayer, xsectx, xsecty - surfacey);
    ctx_layer.fillStyle = "#000";
    drawLine(ctx_layer, ulcorxLayer, ulcoryLayer, urcorxLayer, urcoryLayer);
    //Draw Layers using fillPolygon. First set bottom corner of the polygons to the bottom of the xsection area
    xpts[2] = lrcorxLayer;
    ypts[2] = lrcoryLayer;
    xpts[3] = llcorxLayer;
    ypts[3] = llcoryLayer;
    //Now set upper two points to top of middle layer
    xpts[0] = ulcorxLayer;
    ypts[0] = Math.trunc(ulcoryLayer + b1_Layer * yscale);
    xpts[1] = urcorxLayer;
    ypts[1] = Math.trunc(ulcoryLayer + (m1_Layer * WidthMax + b1_Layer) * yscale);
    fillPolygon(ctx_layer, xpts, ypts, l2c, 1, "#000");
    ctx_layer.fillStyle = "#000";
    drawLine(ctx_layer, xpts[0], ypts[0], xpts[1], ypts[1]);
    //Now set upper two points to top of bottom layer
    ypts[0] = Math.trunc(ulcoryLayer + b2_Layer * yscale);
    ypts[1] = Math.trunc(ulcoryLayer + (m2_Layer * WidthMax + b2_Layer) * yscale);
    fillPolygon(ctx_layer, xpts, ypts, l3c, 1);
    ctx_layer.fillStyle = "#000";
    drawLine(ctx_layer, xpts[0], ypts[0], xpts[1], ypts[1]);
    drawLine(ctx_layer, ulcorxLayer - 35, ulcoryLayer, llcorxLayer - 35, llcoryLayer);
    let depth;
    for (depth = 0; depth <= DepthMax; depth += 5.0) {
        drawLine(ctx_layer, ulcorxLayer - 35, Math.trunc(ulcoryLayer + depth * yscale), ulcorxLayer - 30, Math.trunc(ulcoryLayer + depth * yscale));
        ctx_layer.fillText("" + Math.trunc(depth * 10.0) / 10.0, ulcorxLayer - 27, Math.trunc(ulcoryLayer + depth * yscale + 5));
    }
    ctx_layer.fillText("Depth", ulcorxLayer - 40, ulcoryLayer - 25);
    ctx_layer.fillText("(m)", ulcorxLayer - 33, ulcoryLayer - 10);
    let i;
    for (i = 0; i < numSources_Layer; i++) {
        ctx_layer.fillStyle = "#FF0000";
        ctx_layer.beginPath();
        let TunR = Circle(ctx_layer, Math.trunc(ulcorxLayer + sLocation[i] * xscale_Layer - 4), ulcoryLayer - 4, 8, "#ff0000");
        this.drawCir();
        TunB = Circle(ctx_layer, Math.trunc(ulcorxLayer + sLocation[i] * xscale_Layer - 4), ulcoryLayer - 4, 8, "#000000");
        this.drawCir();
        ctx_layer.fillStyle = "#ff0000";
        ctx_layer.fill();
        ctx_layer.closePath();
        ctx_layer.fillText("Source", Math.trunc(ulcorxLayer + sLocation[i] * xscale_Layer - 16), ulcoryLayer + 15);
    }
    for (i = 0; i < numReceivers; i++) {
        drawLine(ctx_layer, Math.trunc(ulcorxLayer + rLocs[i] * xscale_Layer), ulcoryLayer, Math.trunc(ulcorxLayer + rLocs[i] * xscale_Layer), ulcoryLayer - 5);
    }
}
function setRecArray(rLocstemp, nx) {
    for (let i = 0; i < rLocstemp.length; i++) {
        rLocs[i] = rLocstemp[i] + 250.0;
    }
    numReceivers = nx;
    return;
}
let downFlag = false;
let sourceFlag = false;
let layer1Flag = false;
let layer1SFlag = false;
let layer2Flag = false;
let layer2SFlag = false;
canvas_layer.onmousedown = function (down) {
    let x_Layer = down.offsetX;
    let y_Layer = down.offsetY;
    // console.log(`x_Layer = ${x_Layer}, and y_Layer = ${y_Layer}`);
    let tol = 5;
    LastY1 = LastX1 = 0;
    LastY2 = LastX2 = 0;
    LastYs = LastXs = 0;
    LastYr = LastXr = 0;
    //First see if we are near the source
    for (let i = 0; i < numSources_Layer; i++) {
        if (y_Layer >= ulcoryLayer - 4 - tol &&
            y_Layer <= ulcoryLayer + 4 + tol &&
            x_Layer >=
                Math.trunc(ulcorxLayer + sLocation[i] * xscale_Layer - 4 - tol) &&
            x_Layer <= Math.trunc(ulcorxLayer + sLocation[i] * xscale_Layer + 4 + tol)) {
            downFlag = true;
            sourceFlag = true;
            LastXs = x_Layer;
            sSelect = i;
        }
    }
    //See if we are near top layer boundary
    let layer1Test = ulcoryLayer +
        ((m1_Layer * (x_Layer - ulcorxLayer)) / xscale_Layer + b1_Layer) * yscale -
        tol;
    let layer1Test2 = ulcoryLayer +
        ((m1_Layer * (x_Layer - ulcorxLayer)) / xscale_Layer + b1_Layer) * yscale +
        tol;
    if (y_Layer >= layer1Test &&
        y_Layer <= layer1Test2 &&
        x_Layer >= ulcorxLayer &&
        x_Layer <= urcorxLayer) {
        downFlag = true;
        layer1Flag = true;
        LastX1 = x_Layer;
        LastY1 = y_Layer;
    }
    //See if we are newer middle layer boundary
    if (y_Layer >=
        ulcoryLayer +
            ((m2_Layer * (x_Layer - ulcorxLayer)) / xscale_Layer + b2_Layer) *
                yscale -
            tol &&
        y_Layer <=
            ulcoryLayer +
                ((m2_Layer * (x_Layer - ulcorxLayer)) / xscale_Layer + b2_Layer) *
                    yscale +
                tol &&
        x_Layer >= ulcorxLayer &&
        x_Layer <= urcorxLayer) {
        downFlag = true;
        layer2Flag = true;
        LastX2 = x_Layer;
        LastY2 = y_Layer;
    }
};
canvas_layer.onmouseup = function (up) {
    downFlag = false;
    sourceFlag = false;
    layer1Flag = false;
    layer1SFlag = false;
    layer2Flag = false;
    layer2SFlag = false;
    // Reset variables used to hold location of initial mouse down.
    LastY1 = LastX1 = 0;
    LastY2 = LastX2 = 0;
    LastYs = LastXs = 0;
    LastYr = LastXr = 0;
};
canvas_layer.onmouseleave = function () {
    downFlag = false;
    sourceFlag = false;
    layer1Flag = false;
    layer1SFlag = false;
    layer2Flag = false;
    layer2SFlag = false;
    // Reset variables used to hold location of initial mouse down.
    LastY1 = LastX1 = 0;
    LastY2 = LastX2 = 0;
    LastYs = LastXs = 0;
    LastYr = LastXr = 0;
};
canvas_layer.onmousemove = function (e) {
    if (downFlag) {
        let x_Layer = e.offsetX;
        let y_Layer = e.offsetY;
        // console.log(`x_Layer = ${x_Layer}, and y_Layer = ${y_Layer}`);
        //See if the source is moving. Do not allow source to move
        //beyond distance bounds
        if (LastXs != 0 && x_Layer >= ulcorxLayer && x_Layer <= urcorxLayer) {
            let dist = (x_Layer - ulcorxLayer) / xscale_Layer - sLocation[sSelect];
            if (Math.abs(dist) >= dsourcex) {
                //Round distance to lowest increment of dsourcex
                dist = Math.floor(dist / dsourcex) * dsourcex;
                sLocation[sSelect] += dist;
                //signal Applet that something has changed and repaint frame
                repaint();
                return;
            }
        }
        //See if we need to move top layer boundary.
        if (LastX1 != 0 && LastY1 != 0) {
            if (x_Layer >= ulcorxLayer && x_Layer <= urcorxLayer - 20) {
                //Make sure layer does not come above surface or below the
                //middle layer
                let oldyx = (m1_Layer * (x_Layer - ulcorxLayer)) / xscale_Layer + b1_Layer;
                let diff = (y_Layer - ulcoryLayer) / yscale - oldyx;
                let nb1 = diff + b1_Layer;
                let pmt = Math.trunc(MinThickness * yscale);
                let yl1test = Math.trunc(ulcoryLayer + nb1 * yscale);
                let yr1test = Math.trunc(ulcoryLayer + (m1_Layer * WidthMax + nb1) * yscale);
                let yl2test = Math.trunc(ulcoryLayer + b2_Layer * yscale);
                let yr2test = Math.trunc(ulcoryLayer + (m2_Layer * WidthMax + b2_Layer) * yscale);
                if (yl1test >= ulcoryLayer + pmt &&
                    yr1test >= urcoryLayer + pmt &&
                    yl1test <= yl2test - pmt &&
                    yr1test <= yr2test - pmt) {
                    b1_Layer = nb1;
                    repaint();
                    return;
                }
            }
            //If user clicked near right side of graph allow them to change slope
            //by moving right side of line with left side anchored
            if (x_Layer > urcorxLayer - 20 && x_Layer <= urcorxLayer) {
                //Make sure layer does not come above surface or below the
                //middle layer
                let nm1 = ((y_Layer - ulcoryLayer) / yscale - b1_Layer) / WidthMax;
                let pmt = Math.trunc(MinThickness * yscale);
                let yr1test = Math.trunc(ulcoryLayer + (nm1 * WidthMax + b1_Layer) * yscale);
                let yr2test = Math.trunc(ulcoryLayer + (m2_Layer * WidthMax + b2_Layer) * yscale);
                if (yr1test >= ulcoryLayer + pmt && yr1test <= yr2test - pmt) {
                    m1_Layer = nm1;
                    //Signal Applet that something has changed
                    frameChanged();
                    repaint();
                    return;
                }
            }
        }
        //See if we need to move bottom layer boundary.
        if (LastX2 != 0 && LastY2 != 0) {
            //If user clicked near the middle of the graph change the depth
            //to the layer boundary without changing its dip
            if (x_Layer >= ulcorxLayer && x_Layer <= urcorxLayer - 20) {
                //Make sure layer does not come above surface or below the
                //middle layer
                let oldyx = (m2_Layer * (x_Layer - ulcorxLayer)) / xscale_Layer + b2_Layer;
                let diff = (y_Layer - ulcoryLayer) / yscale - oldyx;
                let nb2 = diff + b2_Layer;
                let pmt = Math.trunc(MinThickness * yscale);
                let yl1test = Math.trunc(ulcoryLayer + b1_Layer * yscale);
                let yr1test = Math.trunc(ulcoryLayer + (m1_Layer * WidthMax + b1_Layer) * yscale);
                let yl2test = Math.trunc(ulcoryLayer + nb2 * yscale);
                let yr2test = Math.trunc(ulcoryLayer + (m2_Layer * WidthMax + nb2) * yscale);
                if (yl2test >= yl1test + pmt &&
                    yl2test <= Math.trunc(ulcoryLayer + DepthMax * yscale) &&
                    yr2test >= yr1test + pmt &&
                    yr2test <= Math.trunc(ulcoryLayer + DepthMax * yscale)) {
                    b2_Layer = nb2;
                    //Signal Applet that something has changed
                    frameChanged();
                    repaint();
                    return;
                }
            }
            //If user clicked near right side of graph allow them to change slope
            //by moving right side of line with left side anchored
            if (x_Layer > urcorxLayer - 20 && x_Layer <= urcorxLayer) {
                //Make sure layer does not come above surface or below the
                //middle layer
                let nm2 = ((y_Layer - ulcoryLayer) / yscale - b2_Layer) / WidthMax;
                let pmt = Math.trunc(MinThickness * yscale);
                let yr1test = Math.trunc(ulcoryLayer + (m1_Layer * WidthMax + b1_Layer) * yscale);
                let yr2test = Math.trunc(ulcoryLayer + (nm2 * WidthMax + b2_Layer) * yscale);
                if (yr2test >= yr1test + pmt &&
                    yr2test <= Math.trunc(ulcoryLayer + DepthMax * yscale)) {
                    m2_Layer = nm2;
                    //Signal Applet that something has changed
                    frameChanged();
                    repaint();
                    return;
                }
            }
        }
    }
};
//
/**
 *
 *Return source location for a given source index
 * @param  index  Description of the Parameter
 * @return        Description of the Return Value
 */
function GetSourceX(index) {
    return sLocation[index] - 250.0;
    //Convert back to user coordinates
}
/**
 * format
 * @param value
 * @param [number_value]
 * @returns format
 */
function v1Format(value, number_value = false) {
    let v1 = (value - 1) * dV1 + V1Min;
    if (number_value)
        return v1;
    return v1Layer.toFixed(2);
}
/**
 * format
 * @param value
 * @param [number_val]
 * @returns  v2
 */
function v2Format(value, number_val = false) {
    let v2 = (value - 1) * dV2 + V2Min;
    if (number_val)
        return v2;
    return v2.toFixed(2);
}
/**
 * format
 * @param value
 * @param [number_val]
 * @returns v3
 */
function v3Format(value, number_val = false) {
    let v3 = (value - 1) * dV3 + V3Min;
    if (number_val)
        return v3;
    return v3.toFixed(2);
}
/**
 * bias_Layer format
 * @param value
 * @param [number_val]
 * @returns bias
 */
function biasFormat(value, number_val = false) {
    let bias = (value - 1) * dBias + BiasMin;
    if (number_val)
        return bias;
    return bias.toFixed(1);
}
function fillPolygon(canvas_ctx, x_points = [], y_points = [], bg_color = "#000000", border_thickness = 1, border_color = "#000000") {
    canvas_ctx = canvas_ctx;
    bg_color = bg_color;
    border_thickness = border_thickness;
    border_color = border_color;
    x_points = x_points;
    y_points = y_points;
    canvas_ctx.fillStyle = bg_color;
    canvas_ctx.lineWidth = border_thickness;
    canvas_ctx.strokeStyle = border_color;
    canvas_ctx.beginPath();
    canvas_ctx.moveTo(x_points[0], y_points[0]);
    for (let i = 1; i < x_points.length; i++)
        canvas_ctx.lineTo(x_points[i], y_points[i]);
    canvas_ctx.fill();
    canvas_ctx.stroke();
    canvas_ctx.closePath();
}
//# sourceMappingURL=ModelFrame.js.map