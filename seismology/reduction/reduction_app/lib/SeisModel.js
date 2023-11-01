let canvas_trace = document.getElementById("Canvas_Trace");
let ctx_trace = canvas_trace.getContext("2d");
/**
 * Define width of Applet Draw Area
 */
let apwidth = 500;
/**
 * Define height of Applet Draw Area
 */
let apheight = 500;
/**
 * Define width of plotting area
 */
let gwidth = apwidth - 150;
/**
 * Define height of plotting area
 */
let gheight = apheight - 150;
/**
 * upper left coordinate x -- of the plotting area
 */
let ulcorx = Math.trunc((apwidth - gwidth) / 2.0);
/**
 * upper left coordinate y | of the plotting area
 */
let ulcory = Math.trunc((apheight - gheight) / 2.0);
/**
 * upper right coordinate y | of the plotting area
 */
let urcory = ulcory;
/**
 * upper right coordinate x -- of the plotting area
 */
let urcorx = ulcorx + gwidth;
/**
 * lower left coordinate x -- of the plotting area
 */
let llcorx = ulcorx;
/**
 * lower left coordinate y | of the plotting area
 */
let llcory = ulcory + gheight;
/**
 * lower right coordinate x -- of the plotting area
 */
let lrcorx = urcorx;
/**
 * Lower right coordinate y | of the plotting area
 */
let lrcory = llcory;
/**
 * Define static variables for model and survey parameters
 *
 * velocities of layer 1 (m/s)
 */
let v1;
/**
 * Define static variables for model and survey parameters
 *
 * velocities of layer 2 (m/s)
 */
let v2;
/**
 * Define static variables for model and survey parameters
 *
 * velocities of layer 3 (m/s)
 */
let v3;
/**
 * intercept and slope of bottom of layer 1
 */
let b1;
/**
 * intercept and slope of bottom of layer 1
 */
let m1;
/**
 * intercept and slope of bottom of layer 2
 */
let b2;
/**
 * intercept and slope of bottom of layer 2
 */
let m2;
/**
 * Array containing seismic readings from dataset.
 */
let sData = new Array(3000);
/**
 * Same as rData, only for x-coordinates.
 */
let xData = new Array(3000);
/**
 * number of receivers in spread
 */
let nx;
/**
 * let double sourcex=400.0; //source location (m)
 */
let sLocations = new Array(5);
/**
 * Num sources of seis model
 */
let numSources;
/**
 * Travel time bias to add to observed times
 */
let bias;
/**
 * minimum receiver spacing
 */
let xmin;
/**
 * maximum receiver spacing
 */
let xmax;
/**
 * minimum times
 */
let tmin;
/**
 * maximum times
 */
let tmax;
/**
 * plot scales
 */
let xscale;
/**
 * plot scales
 */
let tscale;
/**
 * Variable set by GetTMin used to identify the type of arrival returned by GetTMin
 */
let layer;
/**
 * Number of prints made
 */
let pnum = 0;
let startingAngle;
let endAngle;
let x;
let y;
let r;
let stroke;
function paintTraces() {
    let stringL;
    let fwidth;
    GetScales();
    ctx_trace.fillStyle = "#fff";
    ctx_trace.fillRect(0, 0, apwidth, apheight);
    ctx_trace.fillStyle = "#87ceeb";
    ctx_trace.fillRect(ulcorx, ulcory, gwidth, gheight);
    ctx_trace.fillStyle = "#000000";
    ctx_trace.rect(ulcorx, ulcory, gwidth, gheight);
    stringL = "Travel Time Versus" + " Receiver Location";
    fwidth = stringL.length;
    ctx_trace.fillText("Travel Time versus" + " Receiver Location", (ulcorx + urcorx) / 2 - fwidth / 2, ulcory - 35);
    ctx_trace.fillStyle = "#ff0000";
    ctx_trace.strokeStyle = "#ff0000";
    drawLine(ctx_trace, ulcorx + 5, ulcory - 25, ulcorx + 15, ulcory - 25);
    ctx_trace.fillText("Direct Arrival", ulcorx + 15, ulcory - 17);
    ctx_trace.fillStyle = "#FF00FF";
    ctx_trace.strokeStyle = "#FF00FF";
    stringL = "Head Wave: First Layer";
    fwidth = stringL.length;
    drawLine(ctx_trace, (ulcorx + urcorx) / 2 - fwidth / 2 - 12, ulcory - 12, (ulcorx + urcorx) / 2 - fwidth / 2 - 2, ulcory - 12);
    ctx_trace.fillText("Head Wave: First Layer", (ulcorx + urcorx) / 2 - fwidth / 2, ulcory - 4);
    ctx_trace.fillStyle = "#0000FF";
    ctx_trace.strokeStyle = "#0000FF";
    stringL = "Head Wave: Second Layer";
    fwidth = stringL.length;
    drawLine(ctx_trace, urcorx - fwidth - 35, ulcory - 25, urcorx - fwidth - 25, ulcory - 25);
    ctx_trace.fillText("Head Wave: Second Layer", urcorx - fwidth - 25, ulcory - 17);
    ctx_trace.fillStyle = "#000";
    //Put tick marks around plotting area
    //First the distance tick marks
    let inc = Math.floor((xmax - xmin) / 10.0);
    let d;
    let xp;
    let yp;
    let count = 0;
    for (d = xmin; d <= xmax; d += inc) {
        yp = YLoc(tmin);
        xp = XLoc(d);
        drawLine(ctx_trace, xp, yp, xp, yp - 5);
        //print label on every other tick mark
        if (count === 0) {
            stringL = "" + d;
            fwidth = stringL.length;
            d = parseInt("" + d);
            ctx_trace.fillText("" + d, (xp - fwidth / 2) - 5, yp + 15); //? unsure if string will work
            count = 1;
        }
        else {
            count = 0;
        }
        yp = YLoc(tmax);
        drawLine(ctx_trace, xp, yp, xp, yp + 5);
    }
    stringL = "Receiver Location (m)";
    fwidth = stringL.length;
    ctx_trace.fillText("Receiver Location (m)", (ulcorx + urcorx) / 2 - fwidth / 2, llcory + 30);
    //Now do Time tick marks
    inc = Math.floor((tmax - tmin) / 10.0);
    if (inc === 0) {
        inc = 1;
    }
    let t;
    let tlab;
    count = 0;
    let tstart = Math.floor(tmin + 1.0);
    for (t = tstart; t <= tmax; t += inc) {
        yp = YLoc(t);
        xp = XLoc(xmin);
        drawLine(ctx_trace, xp, yp, xp + 5, yp);
        //Print Label on every other tick mark
        if (count === 0) {
            stringL = "Receiver Location (m)";
            fwidth = stringL.length;
            ctx_trace.fillText("" + t, xp - fwidth - 2, yp + 5);
            count = 1;
        }
        else {
            count = 0;
        }
        xp = XLoc(xmax);
        drawLine(ctx_trace, xp, yp, xp - 5, yp);
    }
    stringL = "Time";
    fwidth = stringL.length;
    ctx_trace.fillText("Time", ulcorx / 2 - fwidth / 2, (ulcory + llcory) / 2);
    stringL = "(ms)";
    fwidth = stringL.length;
    ctx_trace.fillText("(ms)", ulcorx / 2 - fwidth / 2, (ulcory + llcory) / 2 + 15);
    ctx_trace.closePath();
    let x;
    let time;
    let xp1;
    let yp1;
    let xp2;
    let yp2;
    let gotfirst;
    //Loop through sources selected by user
    for (let i = 0; i < numSources; i++) {
        xp1 = xp2 = yp1 = yp2 = 0;
        gotfirst = false;
        for (x = xmin; x <= xmax; x += 0.25) {
            time = GetTMin(x, sLocations[i]);
            xp = XLoc(x);
            yp = YLoc(time);
            //check to make sure data is within plot bounds
            if (time >= tmin && time <= tmax) {
                ctx_trace.strokeStyle = "#ff0000";
                if (layer === 2) {
                    ctx_trace.strokeStyle = "#ff00ff";
                }
                if (layer === 3) {
                    ctx_trace.strokeStyle = "#0000ff";
                }
                if (!gotfirst) {
                    gotfirst = true;
                    xp1 = xp;
                    yp1 = yp;
                }
                else {
                    xp2 = xp;
                    yp2 = yp;
                    drawLine(ctx_trace, xp1, yp1, xp2, yp2);
                    xp1 = xp2;
                    yp1 = yp2;
                }
            }
        }
    }
    //?possible error here
    ctx_trace.fillStyle = "#000";
    let TunR;
    let i;
    for (i = 0; i < nx; i++) {
        xp = XLoc(xData[i]);
        yp = YLoc(sData[i] - bias);
        let TunR = Circle(ctx_trace, xp - 4, yp - 4, 8, "#000000");
        this.drawCir();
        ctx_trace.fillStyle = "#000000";
        ctx_trace.fill();
        ctx_trace.closePath();
    }
}
/**
 * Extract model and survey parameters from frame
 *  Description of the Method
 */
function GetParameters() {
    v1 = v1Layer;
    v2 = v2Layer;
    v3 = v3_Layer;
    b1 = b1_Layer;
    m1 = m1_Layer;
    b2 = b2_Layer;
    m2 = m2_Layer;
    numSources = numSources_Layer;
    bias = bias_Layer;
    for (let i = 0; i < numSources; i++) {
        sLocations[i] = GetSourceX(i);
    }
    return;
}
function GetScales() {
    let i;
    xmin = 100000.0;
    xmax = -100000.0;
    for (i = 0; i < nx; i++) {
        if (xData[i] < xmin) {
            xmin = xData[i];
        }
        if (xData[i] > xmax) {
            xmax = xData[i];
        }
    }
    xscale = gwidth / (xmax - xmin);
    //Determine time bounds
    tmin = 100000.0;
    tmax = -100000.0;
    //First Loop through observed data and set min and max times
    for (i = 0; i < nx; i++) {
        if (tmin > sData[i]) {
            tmin = sData[i];
        }
        if (tmax < sData[i]) {
            tmax = sData[i];
        }
    }
    //Now Loop though the receiver locations and check times computed from model
    let x;
    let time;
    let j;
    for (i = 0; i < numSources; i++) {
        for (j = 0; j < nx; j++) {
            time = GetTMin(xData[j], sLocations[i]); //TODO make GetTMin
            if (time < tmin) {
                tmin = time;
            }
            if (time > tmax) {
                tmax = time;
            }
        }
    }
    tscale = gheight / (tmax - tmin);
}
/**
 * Gets tmin
 * @param x
 * @param sourcex
 * @returns time
 */
function GetTMin(x, sourcex) {
    /**Variables to hold times */
    let direct;
    /**Variables to hold times */
    let ref1;
    /**Variables to hold times */
    let ref2;
    /**compute layer dips */
    let rb1 = -1.0 * Math.atan(m1);
    /**compute layer dips */
    let rb2 = -1.0 * Math.atan(m2);
    /**Compute some constants we'll need */
    let offset = Math.abs(sourcex - x);
    let h1 = m1 * sourcex + b1;
    /** layer depth under receiver */
    let l1depth = m1 * x + b1;
    /** layer depth under receiver */
    let h2 = m2 * sourcex + b2;
    /** layer depth under receiver */
    let l2depth = m2 * x + b2;
    direct = (offset / v1) * 1000.0;
    if (v2 > v1) {
        let ic = Math.asin(v1 / v2);
        ref1 =
            ((offset * Math.cos(rb1)) / v2 +
                (h1 * Math.cos(ic)) / v1 +
                (l1depth * Math.cos(ic)) / v1) *
                1000.0;
    }
    else {
        ref1 = -999.0;
    }
    /**Now compute refraction off of bottom of second layer */
    if (v3 > v2) {
        /**we can get a refraction off of this layer */
        let ic = Math.asin(v2 / v3);
        let alpha = ic - (rb2 - rb1);
        let beta = ic - (rb1 - rb2);
        let i1s = Math.asin((v1 / v2) * Math.sin(alpha));
        let i1r = Math.asin((v1 / v2) * Math.sin(beta));
        let rv = offset * Math.cos(rb1) * Math.cos(rb2 - rb1);
        ref2 =
            (rv / v3 +
                (h1 * Math.cos(i1s)) / v1 +
                (h2 * Math.cos(ic)) / v2 +
                (l1depth * Math.cos(i1r)) / v1 +
                (l2depth * Math.cos(ic)) / v2) *
                1000.0;
    }
    else {
        /**No refraction off of this layer - set time to -999.0 */
        ref2 = -999.0;
    }
    let time = direct;
    layer = 1;
    if (ref1 < time && ref1 > 0.0) {
        time = ref1;
        layer = 2;
    }
    if (ref2 < time && ref2 > 0.0) {
        time = ref2;
        layer = 3;
    }
    return time;
}
/**
 * return pixel value give log of a distance
 * @param x
 * @returns
 */
function XLoc(x) {
    return Math.trunc((x - xmin) * xscale + llcorx);
}
/**
 * return pixel value give of travel time
 * @param y
 * @returns
 */
function YLoc(y) {
    return Math.trunc((tmax - y) * tscale + ulcory);
}
function frameChanged() {
    //Get Parameters
    GetParameters();
    //Re-establish plot scales
    GetScales();
}
/**
 *
 * Draws line
 * @param ctx_name canvas ctx name
 * @param x1 -starting x point ([x] , y) => (x , y)
 * @param y1 - starting y point (x , [y]) => (x , y)
 * @param x2 - ending x point (x , y) => ([x] , y)
 * @param y2 - ending y point (x , y) => (x , [y])
 */
function drawLine(ctx_name, x1, y1, x2, y2) {
    ctx_name.beginPath();
    ctx_name.moveTo(x1, y1);
    ctx_name.lineTo(x2, y2);
    ctx_name.stroke();
    ctx_name.closePath();
}
function Circle(ctx_name, x, y, r, stroke) {
    startingAngle = 0;
    endAngle = 2 * Math.PI;
    x = x;
    y = y;
    r = r;
    stroke = stroke;
    this.drawCir = function () {
        ctx_name.beginPath();
        // Treating r as a diameter to mimic java oval() function.
        // arc() method doesn't center to diameter, but builds out from origin.
        // I've added the radius to center the oval/circle object to grid.
        // -Jason
        ctx_name.arc(x + r / 2, y + r / 2, r / 2, startingAngle, endAngle);
        ctx_name.lineWidth = 1;
        ctx_name.strokeStyle = stroke;
        ctx_name.stroke();
    };
}
//# sourceMappingURL=SeisModel.js.map