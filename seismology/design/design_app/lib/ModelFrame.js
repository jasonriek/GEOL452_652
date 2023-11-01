// Range Sliders
const v1_slider = document.getElementById("VelocityTop");
const v2_slider = document.getElementById("VelocityMiddle");
const v3_slider = document.getElementById("VelocityBottom");
const nx_slider = document.getElementById("SourceStack");
const ndata_slider = document.getElementById("NumOfGeophones");
const dx_slider = document.getElementById("Spacing");
const source_slider = document.getElementById("MoveSource");
const geophone_slider = document.getElementById("MoveGeophone");
//radio buttons
const hammer_radio = document.getElementById("hammer");
const shotgun_radio = document.getElementById("shotgun");
const dynamite_radio = document.getElementById("dynamite");
// let stype = "d";
// const canvas_layer = document.querySelector('.Trace_Canvas');
// const ctx_layer = canvas_layer.getContext
class ModelFrame {
    /*#endregion*/
    /**
     * Creates an instance of model frame.
     */
    constructor() {
        this.xpts = []; //Array for polygon points
        this.ypts = []; //Array for polygon points
        this.clickX = [];
        this.clickY = [];
        this.clickDrag = [];
        let canvas_layer = document.getElementById("TraceCanvas");
        let ctx_layer = canvas_layer.getContext("2d");
        this.canvas_layer = canvas_layer;
        this.ctx_layer = ctx_layer;
        this.V1Min = 300.0; // meters/s
        this.V1Max = 2500.0;
        this.dV1 = 50.0; //Incrememtn in Spacing allowed
        this.V1BarMin = 1; //Minimum Scroll Bar Value
        this.V1BarMax = Math.trunc((this.V1Max - this.V1Min) / this.dV1 + 2.1); //Maximum Scroll Bar Value
        this.V2Min = 300.0; //meters
        this.V2Max = 2500.0;
        this.dV2 = 50.0; //Increment in Spacing allowed
        this.V2BarMin = 1; //Minimum Scroll Bar Value
        this.V2BarMax = Math.trunc((this.V2Max - this.V2Min) / this.dV2 + 2.1); //Maximum Scroll Bar Value
        this.V3Min = 300.0; // Meters
        this.V3Max = 2500.0;
        this.dV3 = 50.0; //Increment in Spacing allowed
        this.V3BarMin = 1; // Minimum Scroll Bar Value
        this.V3BarMax = Math.trunc((this.V3Max - this.V3Min) / this.dV3 + 2.1); //Maximum Scroll Bar Value
        this.NMin = 12; // number of Geophones
        this.NMax = 144;
        this.dN = 12; //Increment in Spacing allowed
        this.NBarMin = 1; // Minimum Scroll bar Value
        this.NBarMax = Math.trunc((this.NMax - this.NMin) / this.dN + 2.1); //Maximum Scroll Bar Value
        this.DxMin = 0.5; // Station Spacing in Meters
        this.DxMax = 20.0;
        this.dDx = 0.5; // Increment in Spacing Allowed
        this.DxBarMin = 1; //Minimum Scroll Bar Value
        this.DxBarMax = Math.trunc((this.DxMax - this.DxMin) / this.dDx + 2.1); //Maximum Scroll Bar Value
        this.NDataMin = 1; // Minimum number of sources to stack
        this.NDataMax = 20;
        this.dNData = 1; //increment in spacing allowed
        this.NDataBarMin = 1; //Minimum Scroll Bar Value
        this.NDataBarMax = Math.trunc((this.NDataMax - this.NDataMin) / this.dNData + 2.1); //Maximum Scroll Bar Value
        this.recMin = 1; //Minimum number for geophone spread
        this.recMax = 538; //Max number for geophone spread
        this.recx = 50.0; //Minimum receiver location
        this.drecx = 0.5; //Allow receiver movements of this
        this.recBarMin = 1; //Minimum Scroll Bar Value
        this.recBarMax = Math.trunc((this.recMax - this.recMin) / this.drecx + 2.1); //Maximum Scroll Bar Value
        this.ywall = 46;
        //Define Variables used to some initial values
        this.v1 = 500.0;
        this.v2 = 1200.0;
        this.v3 = 2000.0;
        this.m1 = 0.0; //slope of bottom of top layer
        this.b1 = 5.0; //depth intercept of bottom of top layer
        this.m2 = 0.0; //slope of bottom of middle layer
        this.b2 = 10.0; //depth intercept of bottom of middle layer
        this.sourcex = 100.0; //Source location
        this.dsourcex = 0.5; //Allow source movements of this
        this.dx = 3.0; //receiver spacing
        this.nx = 24; //number of receivers
        this.ndata = 1; //number of sources to stack
        //Define values for drawing figures in frame
        this.framex = 600; //frame sizes
        this.framey = 225;
        this.xsectx = 500; //size of xsection part of frame
        this.xsecty = 225;
        this.surfacey = 50; //y location of surface of the earth
        this.DepthMax = 20.0; //Maximum xsection depth (m)
        this.WidthMax = 500.0; //Width of plot area in meters
        this.MinThickness = 0.25;
        this.xscale = this.xsectx / this.WidthMax;
        this.yscale = (this.xsecty - this.surfacey) / this.DepthMax;
        this.xpts[4]; //Array for polygon points
        this.ypts[4]; //Array for polygon points
        //Now define the absolute coordinates of each of the four corners of
        //the plotting area. Coordinates start at the earths surface
        this.ul_cor_x = Math.trunc((this.framex - this.xsectx) / 2.0) + 50;
        this.ul_cor_y = Math.trunc(25 + this.surfacey) - 40;
        this.ur_cor_y = this.ul_cor_y - 40;
        this.ur_cor_x = this.ul_cor_x + this.xsectx + 50;
        this.ll_cor_x = this.ul_cor_x;
        this.ll_cor_y = this.ul_cor_y + this.xsecty - this.surfacey;
        this.lr_cor_x = this.ur_cor_x;
        this.lr_cor_y = this.ll_cor_y;
        this.plottraces = true;
        this.stype = "d";
        this.layer3y = this.ul_cor_y;
        this.layer3h = this.xsecty - this.surfacey;
        this.layer2max = this.layer3y + this.layer3h;
    }
    /**
     * Starts model frame
     */
    start() {
        if (this.canvas_layer.getContext) {
            this.canvas_layer.width = this.framex + 50;
            this.canvas_layer.height = this.framey;
            this.setValues();
            this.setSlideBar();
            this.paint();
        }
    }
    /**
     * Paints model frame
     */
    paint() {
        //Set background colors
        this.ctx_layer.beginPath();
        this.ctx_layer.fillStyle = "#87CEEB"; //sky blue
        this.ctx_layer.fillRect(this.ul_cor_x, this.ul_cor_x - this.surfacey - 60, this.xsectx + 50, this.surfacey);
        this.ctx_layer.strokeStyle = "#000000";
        this.ctx_layer.stroke();
        this.ctx_layer.fill();
        this.ctx_layer.closePath();
        this.ctx_layer.fillStyle = "#000000";
        this.drawLine(this.ul_cor_x, this.ul_cor_y, this.ur_cor_x, this.ul_cor_y);
        //Plot color for top layer
        this.ctx_layer.beginPath();
        this.ctx_layer.fillStyle = "#49B61A"; //green
        this.ctx_layer.fillRect(this.ul_cor_x, this.ul_cor_y, this.xsectx + 50, this.xsecty - this.surfacey);
        this.ctx_layer.fill();
        this.ctx_layer.strokeStyle = "#000000";
        this.ctx_layer.stroke();
        this.ctx_layer.fill();
        this.ctx_layer.closePath();
        //Draw layers using fillPolygon. First set bottom corner of
        //the polygons to the bottom of the xsection area
        this.xpts[2] = this.lr_cor_x;
        this.ypts[2] = this.lr_cor_y;
        this.xpts[3] = this.ll_cor_x;
        this.ypts[3] = this.ll_cor_y;
        //Now set upper two points to top of middle layer
        this.xpts[0] = this.ul_cor_x;
        this.ypts[0] = Math.trunc(this.ul_cor_y + this.b1 * this.yscale);
        this.xpts[1] = this.ur_cor_x;
        this.ypts[1] = Math.trunc(this.ul_cor_y + (this.m1 * this.WidthMax + this.b1) * this.yscale);
        this.drawPoly(this.xpts, this.ypts, "#90ee90");
        this.slopeL1 = this.ypts[1];
        this.heightL1 = this.ypts[0];
        //Now set upper two points to top of bottom layer
        this.ypts[0] = Math.trunc(this.ul_cor_y + this.b2 * this.yscale);
        this.ypts[1] = Math.trunc(this.ul_cor_y + (this.m2 * this.WidthMax + this.b2) * this.yscale);
        this.drawPoly(this.xpts, this.ypts, "#b5651d");
        this.slopeL2 = this.ypts[1];
        this.heightL2 = this.ypts[0];
        //Plot Depth Axes
        this.drawLine(this.ul_cor_x - 35, this.ul_cor_y, this.ll_cor_x - 35, this.ll_cor_y);
        let depth;
        for (depth = 0; depth <= this.DepthMax; depth += 5.0) {
            this.drawLine(this.ul_cor_x - 35, Math.trunc(this.ul_cor_y + depth * this.yscale), this.ul_cor_x - 30, Math.trunc(this.ul_cor_y + depth * this.yscale));
            this.ctx_layer.fillText("" + Math.trunc(depth * 10.0) / 10.0, this.ul_cor_x - 27, Math.trunc(this.ul_cor_y + depth * this.yscale + 5));
        }
        this.ctx_layer.fillText("Depth", this.ul_cor_x - 40, this.ul_cor_y - 25);
        this.ctx_layer.fillText("(m)", this.ul_cor_x - 33, this.ul_cor_y - 10);
        //print strings is put into the html table
        //Compute gap: distance between receiver and nearest geophone
        let gap;
        let i;
        gap = Math.abs(this.sourcex - this.recx);
        if (gap > Math.abs(this.sourcex - (this.recx + (this.nx - 1) * this.dx))) {
            gap = Math.abs(this.sourcex - (this.recx + (this.nx - 1) * this.dx));
        }
        if (this.sourcex >= this.recx &&
            this.sourcex <= this.recx + (this.nx - 1) * this.dx) {
            gap = Math.abs(this.sourcex - this.recx);
            for (i = 1; i < this.nx; i++)
                if (gap > Math.abs(this.sourcex - (this.recx + i * this.dx)))
                    gap = Math.abs(this.sourcex - (this.recx + i * this.dx));
        }
        //prints strings is put into the html table
        this.gapForTable = gap;
        // draw source
        this.ctx_layer.beginPath();
        let TunR = this.Circle(Math.trunc(this.ul_cor_x + this.sourcex * this.xscale - 4), this.ul_cor_y - 4, 8, "#ff0000");
        this.TunB = this.Circle(Math.trunc(this.ul_cor_x + this.sourcex * this.xscale - 4), this.ul_cor_y - 4, 8, "#000000");
        this.drawCir();
        this.ctx_layer.fillStyle = "#ff0000";
        this.ctx_layer.fill();
        this.ctx_layer.closePath();
        this.ctx_layer.fillText("Source", Math.trunc(this.ul_cor_x + this.sourcex * this.xscale - 16), this.ul_cor_y + 25);
        // Finally , draw geophone spread
        for (i = 0; i < this.nx; i++) {
            this.drawLine(Math.trunc(this.ul_cor_x + (this.recx + i * this.dx) * this.xscale), this.ul_cor_y, Math.trunc(this.ul_cor_x + (this.recx + i * this.dx) * this.xscale), this.ul_cor_y - 5);
        }
        this.drawLine(Math.trunc(this.ul_cor_x + this.recx * this.xscale), this.ul_cor_y - 10, Math.trunc(this.ul_cor_x + ((this.nx - 1) * this.dx + this.recx) * this.xscale), this.ul_cor_y - 10);
        this.drawLine(Math.trunc(this.ul_cor_x + this.recx * this.xscale), this.ul_cor_y - 10, Math.trunc(this.ul_cor_x + this.recx * this.xscale), this.ul_cor_y - 7);
        this.drawLine(Math.trunc(this.ul_cor_x + ((this.nx - 1) * this.dx + this.recx) * this.xscale), this.ul_cor_y - 10, Math.trunc(this.ul_cor_x + ((this.nx - 1) * this.dx + this.recx) * this.xscale), this.ul_cor_y - 7);
        this.ctx_layer.fillText("Geophone Spread", Math.trunc(this.ul_cor_x +
            ((this.nx - this.nx / 2) * this.dx + this.recx) * this.xscale -
            45), this.ul_cor_y - 15);
        //end of paint
    }
    // If the Boolean value "number_val" is set to true, then the following format
    // functions will return float values instead of a string.
    /**
     * format
     * @param value
     * @param [number_value]
     * @returns format
     */
    v1Format(value, number_value = false) {
        let v1 = (value - 1) * this.dV1 + this.V1Min;
        if (number_value)
            return v1;
        return v1.toFixed(2);
    }
    /**
     * format
     * @param value
     * @param [number_val]
     * @returns
     */
    v2Format(value, number_val = false) {
        if (number_val)
            return (value - 1) * this.dV2 + this.V2Min;
        return ((value - 1) * this.dV2 + this.V2Min).toFixed(1);
    }
    /**
     * format
     * @param value
     * @param [number_val]
     * @returns
     */
    v3Format(value, number_val = false) {
        if (number_val)
            return (value - 1) * this.dV3 + this.V3Min;
        return ((value - 1) * this.dV3 + this.V3Min).toFixed(1);
    }
    /**
     * format
     * @param value
     * @param [number_val]
     * @returns
     */
    nxFormat(value, number_val = false) {
        if (number_val)
            return (value - 1) * this.dN + this.NMin;
        return ((value - 1) * this.dN + this.NMin).toFixed(3);
    }
    /**
     * format
     * @param value
     * @param [number_val]
     * @returns
     */
    dxFormat(value, number_val = false) {
        if (number_val)
            return (value - 1) * this.dDx + this.DxMin;
        return ((value - 1) * this.dDx + this.DxMin).toFixed(1);
    }
    /**
     * Ndatas format
     * @param value
     * @param [number_val]
     * @returns
     */
    ndataFormat(value, number_val = false) {
        if (number_val)
            return (value - 1) * this.dNData + this.NDataMin;
        return ((value - 1) * this.dNData + this.NDataMin).toFixed(2);
    }
    /**
     * Geophones format
     * @param value
     * @param [number_val]
     * @returns
     */
    geophoneFormat(value, number_val = false) {
        if (number_val)
            return (value - 1) * this.drecx + this.recMin;
        return ((value - 1) * this.drecx + this.recMin).toFixed(2);
    }
    /**
     * Return whether or not user has requested seismogram plots
     * @returns
     */
    PlotTraces() {
        return this.plottraces;
    }
    /**
     * Allow controlling applet to turn off seismogram plots
     * @returns
     */
    NoTraces() {
        this.plottraces = false;
        return;
    }
    /**
     * Draws poly
     * @param xpts[] -array
     * @param ypts[] -array
     * @param color  - string
     */
    drawPoly(xpts, ypts, color) {
        this.ctx_layer.fillStyle = color;
        this.ctx_layer.beginPath();
        this.ctx_layer.moveTo(this.xpts[0], this.ypts[0]);
        this.ctx_layer.lineTo(this.xpts[1], this.ypts[1]);
        this.ctx_layer.lineTo(this.xpts[2], this.ypts[2]); //used to move slope
        this.ctx_layer.lineTo(this.xpts[3], this.ypts[3]);
        this.ctx_layer.closePath();
        this.ctx_layer.fill();
        this.ctx_layer.beginPath();
        this.ctx_layer.strokeStyle = "#000000";
        this.ctx_layer.moveTo(this.xpts[0], this.ypts[0]);
        this.ctx_layer.lineTo(this.xpts[1], this.ypts[1]);
        this.ctx_layer.lineTo(this.xpts[2], this.ypts[2]); //used to move slope
        this.ctx_layer.lineTo(this.xpts[3], this.ypts[3]);
        this.ctx_layer.stroke();
        this.ctx_layer.fillStyle = "#000000";
        this.ctx_layer.closePath();
    }
    /**
     * setSlideBar
     */
    setSlideBar() {
        let s_value;
        //Set Vel Top
        s_value = Math.trunc(((this.v1 - this.V1Min) * (this.V1BarMax - this.V1BarMin)) /
            (this.V1Max - this.V1Min) +
            this.V1BarMin +
            0.5);
        // @ts-ignore
        v1_slider.value = s_value;
        //@ts-ignore
        v1_slider.min = this.V1BarMin;
        //@ts-ignore
        v1_slider.max = this.V1BarMax;
        // //Set Vel Middle
        s_value = Math.trunc(((this.v2 - this.V2Min) * (this.V2BarMax - this.V2BarMin)) /
            (this.V2Max - this.V2Min) +
            this.V2BarMin +
            0.5);
        //@ts-ignore
        v2_slider.value = s_value;
        //@ts-ignore
        v2_slider.min = this.V2BarMin;
        //@ts-ignore
        v2_slider.max = this.V2BarMax;
        // alert(s_value);
        // // Set Vel Bottom
        s_value = Math.trunc(((this.v3 - this.V3Min) * (this.V3BarMax - this.V3BarMin)) /
            (this.V3Max - this.V3Min) +
            this.V3BarMin +
            0.5);
        //@ts-ignore
        v3_slider.value = s_value;
        //@ts-ignore
        v3_slider.min = this.V3BarMin;
        //@ts-ignore
        v3_slider.max = this.V3BarMax;
        //Set Number of Observations, N:
        s_value = Math.trunc(((this.nx - this.NMin) * (this.NBarMax - this.NBarMin)) /
            (this.NMax - this.NMin) +
            this.NBarMin +
            0.5);
        //@ts-ignore
        nx_slider.value = s_value;
        //@ts-ignore
        nx_slider.min = this.NBarMin;
        //@ts-ignore
        nx_slider.max = this.NBarMax;
        // alert(s_value);
        // alert(s_value);
        // // Set Dike Trend
        s_value = Math.trunc(((this.dx - this.DxMin) * (this.DxBarMax - this.DxBarMin)) /
            (this.DxMax - this.DxMin) +
            this.DxBarMin +
            0.5);
        //@ts-ignore
        dx_slider.value = s_value;
        //@ts-ignore
        dx_slider.min = this.DxBarMin;
        //@ts-ignore
        dx_slider.max = this.DxBarMax;
        //Set Inclination
        s_value = Math.trunc(((this.ndata - this.NDataMin) * (this.NDataBarMax - this.NDataBarMin)) /
            (this.NDataMax - this.NDataMin) +
            this.NDataBarMin +
            0.5);
        //@ts-ignore
        ndata_slider.value = s_value;
        //@ts-ignore
        ndata_slider.min = this.NDataBarMin;
        //@ts-ignore
        ndata_slider.max = this.NDataBarMax;
        //Set Geophone
        s_value = Math.trunc(((this.recx - this.recMin) * (this.recBarMax - this.recBarMin)) /
            (this.recMax - this.recMin) +
            this.recBarMin +
            0.5);
        //@ts-ignore
        geophone_slider.value = s_value;
        //@ts-ignore
        geophone_slider.min = this.recBarMin;
        //@ts-ignore
        geophone_slider.max = this.recBarMax;
    }
    /**
     * Sets values for sliders
     */
    setValues() {
        // reset range sliders
        //Set Station Spacing
        this.s_value = Math.trunc(((this.v1 - this.V1Min) * (this.V1BarMax - this.V1BarMin)) /
            (this.V1Max - this.V1Min) +
            this.V1BarMin +
            0.5);
        //@ts-ignore
        v1_slider.value = this.s_value;
        // //Set Density Contrast
        this.s_value = Math.trunc(((this.v2 - this.V2Min) * (this.V2BarMax - this.V2BarMin)) /
            (this.V2Max - this.V2Min) +
            this.V2BarMin +
            0.5);
        //@ts-ignore
        v2_slider.value = this.s_value;
        // Set Standard Deviation
        this.s_value = Math.trunc(((this.v3 - this.V3Min) * (this.V3BarMax - this.V3BarMin)) /
            (this.V3Max - this.V3Min) +
            this.V3BarMin +
            0.5);
        //@ts-ignore
        v3_slider.value = this.s_value;
        //Set Number of Observations, N:
        this.s_value = Math.trunc(((this.nx - this.NMin) * (this.NBarMax - this.NBarMin)) /
            (this.NMax - this.NMin) +
            this.NBarMin +
            0.5);
        //@ts-ignore
        nx_slider.value = this.s_value;
        //
        // Set Dike Trend
        this.s_value = Math.trunc(((this.dx - this.DxMin) * (this.DxBarMax - this.DxBarMin)) /
            (this.DxMax - this.DxMin) +
            this.DxBarMin +
            0.5);
        //@ts-ignore
        dx_slider.value = this.s_value;
        //Set Incline of Main Field
        this.s_value = Math.trunc(((this.ndata - this.NDataMin) * (this.NDataBarMax - this.NDataBarMin)) /
            (this.NDataMax - this.NDataMin) +
            this.NDataBarMin +
            0.5);
        //@ts-ignore
        ndata_slider.value = this.s_value;
        //Set geophone slider
        this.s_value = Math.trunc(((this.recx - this.recMin) * (this.recBarMax - this.recBarMin)) /
            (this.recMax - this.recMin) +
            this.recBarMin +
            0.5);
        //@ts-ignore
        geophone_slider.value = this.s_value;
    }
    /**
     * Draws line
     * @param x1 -starting x point ([x] , y) => (x , y)
     * @param y1 - starting y point (x , [y]) => (x , y)
     * @param x2 - ending x point (x , y) => ([x] , y)
     * @param y2 - ending y point (x , y) => (x , [y])
     */
    drawLine(x1, y1, x2, y2) {
        this.ctx_layer.beginPath();
        this.ctx_layer.moveTo(x1, y1);
        this.ctx_layer.lineTo(x2, y2);
        this.ctx_layer.stroke();
    }
    /**
     * circle Object
     * @param x
     * @param y
     * @param r
     * @param stroke
     */
    Circle(x, y, r, stroke) {
        this.startingAngle = 0;
        this.endAngle = 2 * Math.PI;
        this.x = x;
        this.y = y;
        this.r = r;
        this.stroke = stroke;
        this.drawCir = function () {
            this.ctx_layer.beginPath();
            // Treating r as a diameter to mimic java oval() function.
            // arc() method doesn't center to diameter, but builds out from origin.
            // I've added the radius to center the oval/circle object to grid.
            // -Jason
            this.ctx_layer.arc(this.x + this.r / 2, this.y + this.r / 2, this.r / 2, this.startingAngle, this.endAngle);
            this.ctx_layer.lineWidth = 1;
            this.ctx_layer.strokeStyle = this.stroke;
            this.ctx_layer.stroke();
        };
    }
}
v1_slider.oninput = function () {
    // @ts-ignore
    model_frame.v1 = model_frame.v1Format(this.value, true);
    repaint();
};
/**
 * v1 left button
 */
function v1_LeftButton() {
    //@ts-ignore
    v1_slider.value--;
    // @ts-ignore
    model_frame.v1 = model_frame.v1Format(v1_slider.value, true);
    repaint();
}
/**
 * v1 right button
 */
function v1_RightButton() {
    //@ts-ignore
    v1_slider.value++;
    // @ts-ignore
    model_frame.v1 = model_frame.v1Format(v1_slider.value, true);
    repaint();
}
v2_slider.oninput = function () {
    // @ts-ignore
    model_frame.v2 = model_frame.v2Format(this.value, true);
    repaint();
};
/**
 * v2 left button
 */
function v2_LeftButton() {
    //@ts-ignore
    v2_slider.value--;
    // @ts-ignore
    model_frame.v2 = model_frame.v2Format(v2_slider.value, true);
    repaint();
}
/**
 * v2 right button
 */
function v2_RightButton() {
    //@ts-ignore
    v2_slider.value++;
    // @ts-ignore
    model_frame.v2 = model_frame.v2Format(v2_slider.value, true);
    repaint();
}
v3_slider.oninput = function () {
    // @ts-ignore
    model_frame.v3 = model_frame.v3Format(this.value, true);
    repaint();
};
/**
 * v3 left button
 */
function v3_LeftButton() {
    //@ts-ignore
    v3_slider.value--;
    // @ts-ignore
    model_frame.v3 = model_frame.v3Format(v3_slider.value, true);
    repaint();
}
/**
 * v3 right button
 */
function v3_RightButton() {
    //@ts-ignore
    v3_slider.value++;
    // @ts-ignore
    model_frame.v3 = model_frame.v3Format(v3_slider.value, true);
    repaint();
}
nx_slider.oninput = function () {
    // @ts-ignore
    model_frame.nx = model_frame.nxFormat(this.value, true);
    if (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
        model_frame.WidthMax + X_OFFSET) {
        while (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
            model_frame.WidthMax + X_OFFSET) {
            model_frame.nx -= model_frame.dN;
        }
        //Reset Scroll Bar
        model_frame.s_value = Math.trunc(((model_frame.nx - model_frame.NMin) *
            (model_frame.NBarMax - model_frame.NBarMin)) /
            (model_frame.NMax - model_frame.NMin) +
            model_frame.NBarMin +
            0.5);
        model_frame.setValues();
    }
    repaint();
};
/**
 * nx left button
 */
function nx_LeftButton() {
    // @ts-ignore
    nx_slider.value--;
    // @ts-ignore
    model_frame.nx = model_frame.nxFormat(nx_slider.value, true);
    if (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
        model_frame.WidthMax + X_OFFSET) {
        while (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
            model_frame.WidthMax + X_OFFSET) {
            model_frame.nx += model_frame.dN;
        }
        //Reset Scroll Bar
        model_frame.s_value = Math.trunc(((model_frame.nx - model_frame.NMin) *
            (model_frame.NBarMax - model_frame.NBarMin)) /
            (model_frame.NMax - model_frame.NMin) +
            model_frame.NBarMin +
            0.5);
        model_frame.setValues();
    }
    repaint();
}
/**
 * nx right button
 */
function nx_RightButton() {
    // @ts-ignore
    nx_slider.value++;
    // @ts-ignore
    model_frame.nx = model_frame.nxFormat(nx_slider.value, true);
    if (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
        model_frame.WidthMax + X_OFFSET) {
        while (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
            model_frame.WidthMax + X_OFFSET) {
            model_frame.nx -= model_frame.dN;
        }
        //Reset Scroll Bar
        model_frame.s_value = Math.trunc(((model_frame.nx - model_frame.NMin) *
            (model_frame.NBarMax - model_frame.NBarMin)) /
            (model_frame.NMax - model_frame.NMin) +
            model_frame.NBarMin +
            0.5);
        model_frame.setValues();
    }
    repaint();
}
ndata_slider.oninput = function () {
    // @ts-ignore
    if (document.getElementById("hammer").checked === true) {
        // @ts-ignore
        model_frame.ndata = model_frame.ndataFormat(this.value, true);
        repaint();
    }
    else {
        model_frame.ndata = 1;
        model_frame.s_value = Math.trunc(((model_frame.ndata - model_frame.NDataMin) *
            (model_frame.NDataBarMax - model_frame.NDataBarMin)) /
            (model_frame.NDataMax - model_frame.NDataMin) +
            model_frame.NDataBarMin +
            0.5);
        model_frame.setValues();
        repaint();
    }
};
/**
 * Ndatas left button
 */
function ndata_LeftButton() {
    // @ts-ignore
    if (document.getElementById("hammer").checked === true) {
        //@ts-ignore
        ndata_slider.value--;
        // @ts-ignore
        model_frame.ndata = model_frame.ndataFormat(ndata_slider.value, true);
        repaint();
    }
    else {
        model_frame.ndata = 1;
        model_frame.s_value = Math.trunc(((model_frame.ndata - model_frame.NDataMin) *
            (model_frame.NDataBarMax - model_frame.NDataBarMin)) /
            (model_frame.NDataMax - model_frame.NDataMin) +
            model_frame.NDataBarMin +
            0.5);
        model_frame.setValues();
        repaint();
    }
}
/**
 * Ndatas right button
 */
function ndata_RightButton() {
    // @ts-ignore
    if (document.getElementById("hammer").checked === true) {
        //@ts-ignore
        ndata_slider.value++;
        // @ts-ignore
        model_frame.ndata = model_frame.ndataFormat(ndata_slider.value, true);
        repaint();
    }
    else {
        model_frame.ndata = 1;
        model_frame.s_value = Math.trunc(((model_frame.ndata - model_frame.NDataMin) *
            (model_frame.NDataBarMax - model_frame.NDataBarMin)) /
            (model_frame.NDataMax - model_frame.NDataMin) +
            model_frame.NDataBarMin +
            0.5);
        model_frame.setValues();
        repaint();
    }
}
dx_slider.oninput = function () {
    //Convert scrollbar value to radius
    // @ts-ignore
    model_frame.dx = model_frame.dxFormat(this.value, true);
    //Check to see if geophone spread exceeds plot bounds
    //if it does, reduce geophone interval
    if (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
        model_frame.WidthMax + X_OFFSET) {
        while (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
            model_frame.WidthMax + X_OFFSET) {
            model_frame.dx -= model_frame.dDx;
        }
        //reset scrollbar
        model_frame.s_value = Math.trunc(((model_frame.dx - model_frame.DxMin) *
            (model_frame.DxBarMax - model_frame.DxBarMin)) /
            (model_frame.DxMax - model_frame.DxMin) +
            model_frame.DxBarMin +
            0.5);
        model_frame.setValues();
    }
    repaint();
};
/**
 * dx left button
 */
function dx_LeftButton() {
    //Convert scrollbar value to radius
    // @ts-ignore
    dx_slider.value--;
    // @ts-ignore
    model_frame.dx = model_frame.dxFormat(dx_slider.value, true);
    //Check to see if geophone spread exceeds plot bounds
    //if it does, reduce geophone interval
    if (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
        model_frame.WidthMax + X_OFFSET) {
        while (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
            model_frame.WidthMax + X_OFFSET) {
            model_frame.dx -= model_frame.dDx;
        }
        //reset scrollbar
        model_frame.s_value = Math.trunc(((model_frame.dx - model_frame.DxMin) *
            (model_frame.DxBarMax - model_frame.DxBarMin)) /
            (model_frame.DxMax - model_frame.DxMin) +
            model_frame.DxBarMin +
            0.5);
        model_frame.setValues();
    }
    repaint();
}
/**
 * dx right button
 */
function dx_RightButton() {
    //Convert scrollbar value to radius
    // @ts-ignore
    dx_slider.value++;
    // @ts-ignore
    model_frame.dx = model_frame.dxFormat(dx_slider.value, true);
    //Check to see if geophone spread exceeds plot bounds
    //if it does, reduce geophone interval
    if (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
        model_frame.WidthMax + X_OFFSET) {
        while (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
            model_frame.WidthMax + X_OFFSET) {
            model_frame.dx -= model_frame.dDx;
        }
        //reset scrollbar
        model_frame.s_value = Math.trunc(((model_frame.dx - model_frame.DxMin) *
            (model_frame.DxBarMax - model_frame.DxBarMin)) /
            (model_frame.DxMax - model_frame.DxMin) +
            model_frame.DxBarMin +
            0.5);
        model_frame.setValues();
    }
    repaint();
}
source_slider.oninput = function () {
    //See if the source is moving. Do not allow source to move
    //beyond distance bounds
    let dist = 
    //@ts-ignore
    (source_slider.value - model_frame.ul_cor_x) / model_frame.xscale -
        model_frame.sourcex;
    if (Math.abs(dist) >= model_frame.dsourcex) {
        dist = Math.floor(dist / model_frame.dsourcex) * model_frame.dsourcex;
        model_frame.sourcex += dist;
        repaint();
        return;
    }
};
/**
 * Sources left button
 * @returns
 */
function source_LeftButton() {
    source_slider.value--;
    let dist = 
    //@ts-ignore
    (source_slider.value - model_frame.ul_cor_x) / model_frame.xscale -
        model_frame.sourcex;
    if (Math.abs(dist) >= model_frame.dsourcex) {
        dist = Math.floor(dist / model_frame.dsourcex) * model_frame.dsourcex;
        model_frame.sourcex += dist;
        repaint();
        return;
    }
}
/**
 * Sources right button
 * @returns
 */
function source_RightButton() {
    source_slider.value++;
    let dist = 
    //@ts-ignore
    (source_slider.value - model_frame.ul_cor_x) / model_frame.xscale -
        model_frame.sourcex;
    if (Math.abs(dist) >= model_frame.dsourcex) {
        dist = Math.floor(dist / model_frame.dsourcex) * model_frame.dsourcex;
        model_frame.sourcex += dist;
        repaint();
        return;
    }
}
geophone_slider.oninput = function () {
    //@ts-ignore
    model_frame.recx = model_frame.geophoneFormat(this.value, true);
    if (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
        model_frame.WidthMax + X_OFFSET) {
        while (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
            model_frame.WidthMax + X_OFFSET) {
            model_frame.recx -= model_frame.drecx;
        }
        model_frame.s_value = Math.trunc(((model_frame.recx - model_frame.recMin) *
            (model_frame.recBarMax - model_frame.recBarMin)) /
            (model_frame.recMax - model_frame.recMin) +
            model_frame.recBarMin +
            0.5);
        model_frame.setValues();
    }
    repaint();
};
/**
 * Geophones left button
 */
function geophone_LeftButton() {
    //@ts-ignore
    geophone_slider.value--;
    model_frame.recx = model_frame.geophoneFormat(geophone_slider.value, true);
    if (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
        model_frame.WidthMax + X_OFFSET) {
        while (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
            model_frame.WidthMax + X_OFFSET) {
            model_frame.recx -= model_frame.drecx;
        }
        model_frame.s_value = Math.trunc(((model_frame.recx - model_frame.recMin) *
            (model_frame.recBarMax - model_frame.recBarMin)) /
            (model_frame.recMax - model_frame.recMin) +
            model_frame.recBarMin +
            0.5);
        model_frame.setValues();
    }
    repaint();
}
/**
 * Geophones right button
 */
function geophone_RightButton() {
    //@ts-ignore
    geophone_slider.value++;
    model_frame.recx = model_frame.geophoneFormat(geophone_slider.value, true);
    if (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
        model_frame.WidthMax + X_OFFSET) {
        while (model_frame.recx + model_frame.dx * (model_frame.nx - 1) >
            model_frame.WidthMax + X_OFFSET) {
            model_frame.recx -= model_frame.drecx;
        }
        model_frame.s_value = Math.trunc(((model_frame.recx - model_frame.recMin) *
            (model_frame.recBarMax - model_frame.recBarMin)) /
            (model_frame.recMax - model_frame.recMin) +
            model_frame.recBarMin +
            0.5);
        model_frame.setValues();
    }
    repaint();
}
/**
 * boxes adjustment for Source Type
 */
function MyBoxesAdjustment() {
    // @ts-ignore
    // let button = document.getElementById("SourceType").value;
    // @ts-ignore
    if (document.getElementById("hammer").checked) {
        model_frame.stype = "h";
        model_frame.plottraces = true;
        refraction_overlay.frameChanged();
        modal_canvas.frameChanged();
        model_frame.paint();
        refraction_overlay.paint();
        modal_canvas.paint();
    }
    // @ts-ignore
    if (document.getElementById("shotgun").checked) {
        model_frame.stype = "s";
        model_frame.ndata = 1;
        model_frame.s_value = Math.trunc(((model_frame.ndata - model_frame.NDataMin) *
            (model_frame.NDataBarMax - model_frame.NDataBarMin)) /
            (model_frame.NDataMax - model_frame.NDataMin) +
            model_frame.NDataBarMin +
            0.5);
        // @ts-ignore
        ndata_slider.value = model_frame.s_value;
        model_frame.plottraces = true;
        refraction_overlay.frameChanged();
        model_frame.paint();
        refraction_overlay.paint();
        modal_canvas.frameChanged();
        modal_canvas.paint();
    }
    // @ts-ignore
    if (document.getElementById("dynamite").checked) {
        model_frame.stype = "d";
        model_frame.ndata = 1;
        model_frame.s_value = Math.trunc(((model_frame.ndata - model_frame.NDataMin) *
            (model_frame.NDataBarMax - model_frame.NDataBarMin)) /
            (model_frame.NDataMax - model_frame.NDataMin) +
            model_frame.NDataBarMin +
            0.5);
        // @ts-ignore
        ndata_slider.value = model_frame.s_value;
        model_frame.plottraces = true;
        refraction_overlay.frameChanged();
        model_frame.paint();
        refraction_overlay.paint();
        modal_canvas.frameChanged();
        modal_canvas.paint();
        PSeismsAction();
    }
}
//# sourceMappingURL=ModelFrame.js.map