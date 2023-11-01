//Establish variables for generating applet graphics
//Define width and height of Applet Draw Area
const gap = 20; //horizontal spacing between data points in pixels
const apwidth1 = 24 * 21 + 250;
const apheight1 = 500;
const X_OFFSET = 50;
//Define width and height of plotting area
const gwidth = apwidth1 - 150;
const gheight = apheight1 - 150;
// Table Values in html file
const table_Layer1 = document.getElementById("Layer1_val");
const table_Layer2 = document.getElementById("Layer2_val");
const table_v1 = document.getElementById("v1_val");
const table_v2 = document.getElementById("v2_val");
const table_v3 = document.getElementById("v3_val");
const table_dip = document.getElementById("dip_val");
const table_dip_mid = document.getElementById("dip_mid_val");
const table_sourceLoc = document.getElementById("sourceLoc_val");
const table_firstGeoLoc = document.getElementById("firstGeoLoc_val");
const table_gap = document.getElementById("Gap_val");
const table_lastGeoLoc = document.getElementById("lastGeoLoc_val");
const table_geoSpacing = document.getElementById("geoSpacing_val");
const table_numOfGeo = document.getElementById("numOfGeo_val");
const table_sourceToStack = document.getElementById("sourcesToStack_val");
let inter = null;
const ARROW_BUTTON_SIZE = 64;
/**
 * Refraction overlay
 */
class RefractionOverlay {
    /* #endregion */
    /**
     * Creates an instance of refraction overlay.
     */
    constructor() {
        this.y = [];
        this.s = [];
        this.f = [];
        let canvas = document.getElementById("LayerCanvas");
        let ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.ctx = ctx;
        this.canvasLeft = this.canvas.offsetLeft;
        this.canvasTop = this.canvas.offsetTop;
        this.elements = [];
        this.offScreenTImage = null;
        this.offScreenWImage = null;
        this.offScreenVImage = null;
        this.offScreenImage = null;
        //Now define the absolute coordinates of each of the four corners of
        //the plotting area
        this.ul_cor_x = (apwidth1 - gwidth) / 2.0;
        this.ul_cor_y = (apheight1 - gheight) / 2.0;
        this.ur_cor_y = this.ul_cor_y;
        this.ur_cor_x = this.ul_cor_x + gwidth;
        this.ll_cor_x = this.ul_cor_x;
        this.ll_cor_y = this.ul_cor_y + gheight;
        this.lr_cor_x = this.ur_cor_x;
        this.lr_cor_y = this.ll_cor_y;
        this.snx = 24;
        this.y = [gheight];
        this.s = [gheight];
        this.f = [2 * gheight - 1];
        this.plottraces = false;
        this.plotva = true;
        this.chanimagesize = false;
        this.iset = 0;
        this.pnum = 0;
    }
    /**
     * Starts refraction overlay
     */
    start() {
        if (this.canvas.getContext) {
            this.canvas.width = apwidth1 + 10;
            this.canvas.height = apheight1 + 5;
            this.GetParameters();
            this.paint();
            this.GetScales();
            this.MakePlots("t");
            this.MakePlots("w");
            this.MakePlots("v");
            this.setTableValues();
        }
    }
    // setValues() {
    //     throw new Error("Method not implemented.");
    // }
    // setSliders() {
    //     throw new Error("Method not implemented.");
    // }
    /**
     * Paints refraction overlay
     */
    paint() {
        //Blast out the appropriate image - either travel times only,
        //travel times with wiggle plots, or travel times with variable
        //area plots
        if (this.plottraces === false) {
            this.MakePlots("t");
        }
        else {
            if (this.plotva === false) {
                this.MakePlots("w");
            }
            else {
                this.MakePlots("v");
            }
        }
    }
    /**
     * Extract model and survey parameters from frame
     * @returns
     */
    GetParameters() {
        this.v1 = model_frame.v1;
        this.v2 = model_frame.v2;
        this.v3 = model_frame.v3;
        this.b1 = model_frame.b1;
        this.m1 = model_frame.m1;
        this.b2 = model_frame.b2;
        this.m2 = model_frame.m2;
        this.sourcex = model_frame.sourcex;
        this.recx = model_frame.recx;
        this.dx = model_frame.dx;
        this.nx = model_frame.nx;
        this.ndata = model_frame.ndata;
        this.plottraces = model_frame.plottraces;
        this.source = model_frame.stype;
        //Reset trace plotting option in MyModel to false
        //We do this so that as the user dynamically changes
        //model parameters the code doesn't try to dynamically
        //render seismograms. Thus, the user must actively select
        //the plotting of seismograms each time they want to see
        //them
        model_frame.NoTraces();
        //If we need to lets rebuild the plot images and reset the all
        //of the variables need to compute the plot scale
        if (this.nx != this.snx) {
            //User changed number of receivers - resize images
            // let width: number = (this.nx + 1) * gap + 150;
            // // this.canvas.width = width;
            // this.setImages(width);
        }
        this.snx = this.nx;
        return;
    }
    /**
     * Compute plot bounds. Minimum time is always set to zero. Maximum time is the time of the
     * latest arrival + 10% or 100.0 ms, which ever is greater.
     * @returns
     */
    GetScales() {
        this.xmin = this.recx;
        this.xmax = this.recx + (this.nx - 1) * this.dx;
        this.xscale = (gwidth - gap) / (this.xmax - this.xmin);
        this.tmin = 0.0;
        this.tmax = -100000.0;
        //Loop through receiver locations and get times
        let x;
        let time;
        for (x = this.xmin; x <= this.xmax; x += this.dx) {
            time = this.GetTMin(x);
            if (time > this.tmax) {
                this.tmax = time;
            }
        }
        this.tmax *= 1.1;
        if (this.tmax < 100.0)
            this.tmax = 100.0;
        this.tscale = gheight / (this.tmax - this.tmin);
        return;
    }
    /**
     * Compute minimum travel-time for a given receiver location
     * @param x
     * @returns time
     */
    GetTMin(x) {
        let direct;
        let ref1;
        let ref2;
        let rb1 = -1.0 * Math.atan(this.m1);
        let rb2 = -1.0 * Math.atan(this.m2);
        let offset = Math.abs(this.sourcex - x);
        let h1 = this.m1 * this.sourcex + this.b1;
        let l1depth = this.m1 * x + this.b1;
        let h2 = this.m2 * this.sourcex + this.b2;
        let l2depth = this.m2 * x + this.b2;
        direct = (offset / this.v1) * 1000.0;
        if (this.v2 > this.v1) {
            let ic = Math.asin(this.v1 / this.v2);
            ref1 =
                ((offset * Math.cos(rb1)) / this.v2 +
                    (h1 * Math.cos(ic)) / this.v1 +
                    (l1depth * Math.cos(ic)) / this.v1) *
                    1000.0;
        }
        else {
            ref1 = -999.0;
        }
        if (this.v3 > this.v2) {
            let ic = Math.asin(this.v2 / this.v3);
            let alpha = ic - (rb2 - rb1);
            let beta = ic - (rb1 - rb2);
            let i1s = Math.asin((this.v1 / this.v2) * Math.sin(alpha));
            let i1r = Math.asin((this.v1 / this.v2) * Math.sin(beta));
            let rv = offset * Math.cos(rb1) * Math.cos(rb2 - rb1);
            ref2 =
                (rv / this.v3 +
                    (h1 * Math.cos(i1s)) / this.v1 +
                    (h2 * Math.cos(ic)) / this.v2 +
                    (l1depth * Math.cos(i1r)) / this.v1 +
                    (l2depth * Math.cos(ic)) / this.v2) *
                    1000.0;
        }
        else {
            ref2 = -999.0;
        }
        let time = direct;
        this.layer = 1;
        if (ref1 < time && ref1 > 0.0) {
            time = ref1;
            this.layer = 2;
        }
        if (ref2 < time && ref2 > 0.0) {
            time = ref2;
            this.layer = 3;
        }
        return time;
    }
    /**
     * return pixel value give log of a distance
     * @param x
     */
    XLoc(x) {
        return Math.trunc((x - this.xmin) * this.xscale + this.ll_cor_x + gap / 2);
    }
    /**
     * return pixel value give of travel time
     * @param y number
     * @returns
     */
    YLoc(y) {
        return Math.trunc((this.tmax - y) * this.tscale + this.ul_cor_y);
    }
    /**
     * Generate a random numbers that are from a normal Gaussian
     * distribution. The supplied Gaussian generator didn't seem
     * to work on my platform
     * @returns  v2 * fac | gset
     */
    myGaussian() {
        let fac;
        let r;
        let v1;
        let v2;
        if (this.iset === 0) {
            do {
                v1 = 2.0 * Math.random() - 1.0;
                v2 = 2.0 * Math.random() - 1.0;
                r = v1 * v1 + v2 * v2;
            } while (r >= 1.0);
            fac = Math.sqrt((-2.0 * Math.log(r)) / r);
            this.gset = v1 * fac;
            this.iset = 1;
            return v2 * fac;
        }
        else {
            this.iset = 0;
            return this.gset;
        }
    }
    /**
     *  This method is invoked when parameters from the frame have
     * been changed. This simply queries the frame object for the
     * latest parameters, recompute seismic values, and repaints
     * the applet
     */
    frameChanged() {
        //Get Parameters
        this.GetParameters();
        //Re-establish plot scales
        this.GetScales();
        if (this.plottraces === false)
            this.MakePlots("t");
        else {
            this.MakePlots("w");
            this.MakePlots("v");
        }
    }
    /**
     * This method generates the appropriate plot. It can generate
     * a plot of arrival times only (type -> 't'), arrival times plus
     * wiggle traces(type -> 'w') or arrival times plus variable area
     * traces (type -> 'v')
     * @param type
     */
    MakePlots(type) {
        let fwidth; // font width
        let stringL; // string length
        this.ctx.beginPath();
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(0, 0, apwidth1, apheight1);
        this.ctx.closePath();
        this.ctx.beginPath();
        this.ctx.fillStyle = "#39ebee";
        this.ctx.rect(this.ul_cor_x, this.ul_cor_y, gwidth, gheight + 10);
        this.ctx.fill();
        this.ctx.strokeStyle = "#000000";
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.fillStyle = "#000000";
        stringL = "Travel Time Versus" + " Receiver Location";
        fwidth = stringL.length;
        this.ctx.fillText("Travel Time versus" + " Receiver Location", (this.ul_cor_x + this.ur_cor_x) / 2 - fwidth, this.ul_cor_y - 35);
        this.ctx.fillStyle = "#CC0000";
        stringL = "Direct Arrival";
        fwidth = stringL.length;
        this.ctx.fillRect((this.ul_cor_x + this.ur_cor_x) / 2 - fwidth - 50, this.ul_cor_y - 25, 9, 2);
        this.ctx.fillText("Direct Arrival", (this.ul_cor_x + this.ur_cor_x) / 2 - fwidth - 40, this.ul_cor_y - 17);
        this.ctx.fillStyle = "#ee23cb";
        stringL = "Head Wave: First Layer";
        fwidth = stringL.length;
        this.ctx.fillRect((this.ul_cor_x + this.ur_cor_x) / 2 - fwidth / 2 - 10, this.ul_cor_y - 12, 9, 2);
        this.ctx.fillText("Head Wave: First Layer", (this.ul_cor_x + this.ur_cor_x) / 2 - fwidth / 2, this.ul_cor_y - 4);
        this.ctx.fillStyle = "#1625cc";
        stringL = "Head Wave: Second Layer";
        fwidth = stringL.length;
        this.ctx.fillRect((this.ul_cor_x + this.ur_cor_x) / 2 + 40, this.ul_cor_y - 25, 9, 2);
        this.ctx.fillText("Head Wave: Second Layer", (this.ul_cor_x + this.ur_cor_x) / 2 + 50, this.ul_cor_y - 17);
        let inc;
        inc = 1.0;
        if (this.xmax - this.xmin > 1000.0)
            inc = 100.0;
        else if (this.xmax - this.xmin > 100.0)
            inc = 50.0;
        else if (this.xmax - this.xmin > 50.0)
            inc = 10.0;
        else if (this.xmax - this.xmin > 10.0)
            inc = 5.0;
        //plot information
        let d;
        let xp;
        let yp;
        let dlab;
        this.ctx.fillStyle = "#000000";
        for (d = Math.ceil(this.xmin); d <= this.xmax; d += inc) {
            xp = this.XLoc(d);
            dlab = Math.trunc(d);
            this.ctx.fillText("" + dlab, xp - fwidth / 2, this.ll_cor_y + 25);
            this.drawLine(xp, this.ll_cor_y, xp, this.ll_cor_y + 10);
        }
        stringL = "Receiver Location (m)";
        fwidth = stringL.length;
        this.ctx.fillText("Receiver Location (m)", (this.ul_cor_x + this.ur_cor_x) / 2 - fwidth - 30, this.ll_cor_y + 40);
        //Determine increment at which time scale should be plotted.
        inc = 1.0;
        let t;
        let tlab;
        if (this.tmax > 1000.0) {
            inc = 100.0;
        }
        else if (this.tmax > 100.0) {
            inc = 50.0;
        }
        else if (this.tmax > 50.0) {
            inc = 10.0;
        }
        else if (this.tmax > 10.0) {
            inc = 5.0;
        }
        //Plot time scale
        for (t = this.tmin; t <= this.tmax; t += inc) {
            yp = this.YLoc(t);
            this.drawLine(this.ul_cor_x, yp, this.ul_cor_x + 5, yp);
            tlab = Math.trunc(t);
            stringL = "" + tlab;
            fwidth = stringL.length;
            this.ctx.fillText("" + tlab, this.ul_cor_x - fwidth - 15, yp + 5); //didnt put fheight / 3 from java
            this.drawLine(this.ur_cor_x, yp, this.ur_cor_x - 5, yp);
        }
        stringL = "Time";
        fwidth = stringL.length;
        this.ctx.fillText("Time", this.ul_cor_x / 2 - fwidth / 2 - 10, (this.ul_cor_y + this.ll_cor_y) / 2); // did put fheight / 2 + 2 from java
        stringL = "(ms)";
        fwidth = stringL.length;
        this.ctx.fillText("(ms)", this.ul_cor_x / 2 - fwidth / 2 - 10, (this.ul_cor_y + this.ll_cor_y) / 2 + 15);
        //Generate wiggle traces or variable area traces and
        //add them to the plot
        let x;
        let time;
        let amp;
        if (type === "w") {
            for (x = this.xmin; x <= this.xmax; x += this.dx) {
                time = this.GetTMin(x);
                xp = this.XLoc(x);
                amp = this.GetAmp(x);
            }
        }
        if (type === "v") {
            for (x = this.xmin; x <= this.xmax; x += this.dx) {
                time = this.GetTMin(x);
                xp = this.XLoc(x);
                amp = this.GetAmp(x);
            }
        }
        for (let x = this.xmin; x <= this.xmax; x += this.dx) {
            time = this.GetTMin(x);
            xp = this.XLoc(x);
            yp = this.YLoc(time);
            //Set Point color depending on layer from which arrival
            //originated
            this.ctx.fillStyle = "#CC0000";
            if (this.layer === 2) {
                this.ctx.fillStyle = "#ee23cb";
            }
            if (this.layer === 3) {
                this.ctx.fillStyle = "#003efa";
            }
            //Check to make sure data is within plot bounds
            if (time >= this.tmin && time <= this.tmax) {
                this.ctx.fillRect(xp - 9, yp - 1, 20, 2); //Changed the width to make the lines bigger
            } //? changed the x1 to move over to the far right of the graph
        }
        return;
    }
    /**
     * Compute an estimate of the amplitude of the direct
     * arrival at a location x. We'll do this by simply assuming
     * a 1/sqrt(distance) amplitude decay (yah - yah I know this
     * isn't correct, but it generates good qualitative results.
     * @param xloc
     * @returns amp
     */
    GetAmp(xloc) {
        let offset;
        let amp;
        offset = Math.abs(this.sourcex - xloc);
        amp = 1.0 / (Math.sqrt(offset) + 1.0);
        return amp;
    }
    /**
      * Draws line
      * @param x1 -starting x point ([x] , y) => (x , y)
      * @param y1 - starting y point (x , [y]) => (x , y)
      * @param x2 - ending x point (x , y) => ([x] , y)
      * @param y2 - ending y point (x , y) => (x , [y])
      */
    drawLine(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
    // Sets the table values
    setTableValues(gap) {
        table_Layer1.innerHTML =
            (this.m1 * this.sourcex + this.b1).toFixed(1) + " (m)";
        table_Layer2.innerHTML =
            (this.m2 * this.sourcex + this.b2).toFixed(1) + " (m)";
        table_v1.innerHTML = this.v1 + " (m/s)";
        table_v2.innerHTML = this.v2 + " (m/s)";
        table_v3.innerHTML = this.v3 + " (m/s)";
        let dip = (Math.atan(this.m1) * 180) / Math.PI;
        table_dip.innerHTML = dip.toFixed(2) + " (degrees)";
        dip = (Math.atan(this.m2) * 180) / Math.PI;
        table_dip_mid.innerHTML = dip.toFixed(2) + " (degrees)";
        table_sourceLoc.innerHTML = (this.sourcex - 250.0).toFixed(1) + " (m)";
        table_firstGeoLoc.innerHTML = (this.recx - 250.0).toFixed(1) + " (m)";
        table_gap.innerHTML = model_frame.gapForTable + " (m)";
        table_lastGeoLoc.innerHTML =
            (this.recx + (this.nx - 1) * this.dx - 250.0).toFixed(1) + " (m)";
        table_geoSpacing.innerHTML = this.dx.toFixed(1) + " (m)";
        table_numOfGeo.innerHTML = this.nx.toFixed(0);
        table_sourceToStack.innerHTML = this.ndata.toFixed(0);
    }
}
let refraction_overlay = new RefractionOverlay();
let model_frame = new ModelFrame();
// let modal_canvas = new modalCanvas();
refraction_overlay.start();
model_frame.start();
// modal_canvas.start();
refraction_overlay.setTableValues();
//# sourceMappingURL=RefractionOverlay.js.map