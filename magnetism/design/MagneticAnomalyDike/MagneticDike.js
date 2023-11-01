//This applet allows the user to generate synthetic magnetic
//anomalies over a buried dike. User my alter location and size
//of the dike dynamically. They may also vary the orientation of
//the dike and the inducing field through a control panel

const canvas = document.querySelector('.gtCanvas');
const width_canvas = document.querySelector('.gtRadSample');
const ctx = canvas.getContext('2d');
const r_ctx = width_canvas.getContext('2d');

const C_WIDTH = 500;
const C_HEIGHT = 500;

//Define some  constants for the gravity data plot
// Width of plotting Area
const P_WIDTH = C_WIDTH;
const P_HEIGHT = 300; // Height of plotting Area
const G_WIDTH = P_WIDTH - 125; // Width of Graph within plotting Area
const G_HEIGHT = P_HEIGHT - 100; // Height of Graph within plotting Area

let inter = null;

//Define object to hold image of tree
let tree = new Image();
// LOAD THE TREE
tree.onload = function()
{
    ctx.drawImage(tree, 50, 238);
};
tree.src = "../../../images/tree.png";

class MagneticDike
{
    constructor()
    {
        //Now define the absolute coordinates of each of the four corners of
        //the plotting area
        this.ulcorx = Math.trunc((P_WIDTH - G_WIDTH) / 2.0);
        this.ulcory = Math.trunc((P_HEIGHT - G_HEIGHT) / 2.0);
        this.urcory = this.ulcory;
        this.urcorx = this.ulcorx + G_WIDTH;
        this.llcorx = this.ulcorx;
        this.llcory = this.ulcory + G_HEIGHT;
        this.lrcorx = this.urcorx;
        this.lrcory = this.llcory;

        //Now define variables that we will need compute plot scale
        this.xmin = -250.0; //Minimum Station location
        this.xmax = 250.0;
        this.ymin = 1000.0; //Minimum field strength value - This is computed
        this.ymax = -1000.0;
        this.dmax = 25.0; //Maximum plotting depth
        this.xscale = null;
        this.yscale = null;
        this.dscale = null;

        //Define Variables used to Describe Model Parameters - In this case,
        //magnetic anomaly is going to be computed over a vertical dike with
        //an arbitrary trend along an east-west trending survey line.
        this.dx = 1.0; //Magnetic station spacing (m)
        this.k = 0.0001; //Susceptibility contrast
        this.width = 25.0; //Width of dike (m)
        this.depth2top = 5.0; //Depth to top of dike
        this.depth2bot = 500.0; //Depth to bottom of dike
        this.std = 2.0; //Standard Deviation of individual readings (nT)
        this.ndata = 2; //Number of Readings to take at each station
        this.fe = 55000.0; //Field strength of inducing field (nT)
        this.b = -45.0; //Dike trend in degrees
        this.inc = 52.0; //Inclination of inducing field in degrees
        this.len = 500.0; // Length of profile in meters

        //Variables used to smooth image generation
        this.LastY = null;
        this.LastX = null; 

        //Number of prints made
        this.pnum = 0;
    }

    paint()
    {
        // Plot Cross section
        this.plotXSection();
        // Plot Gravity Data
        this.plotData();
        // Draw Parameter Labels on lower left side of plot
        this.labels();
        // Draw Axes
        this.drawAxes();
    }

    drawAxes()
    {
        ctx.font = "12px Arial";

        ctx.beginPath();
        ctx.strokeStyle = "#000000";

        //do x axis first
        this.drawLine(this.ulcorx-1, this.ulcory, this.urcorx+1, this.urcory);
        for (let xint = this.xmin; xint <= this.xmax; xint += (this.xmax - this.xmin) / 5.0)
        {
            this.drawLine(this.getDX(xint), this.ulcory, this.getDX(xint), this.ulcory - 5);
            ctx.fillText((xint), this.getDX(xint) - 7, this.ulcory - 8);
        }
        ctx.fillText("Distance (m)", C_WIDTH / 2 - 30 , 25);
        
        this.drawLine(this.urcorx + 10, this.urcory - 1, 10 + this.lrcorx, this.lrcory + 1);
        for (let xint = this.ymin; xint <= this.ymax; xint += Math.abs(this.ymax - this.ymin) / 5.0)
        {
            this.drawLine(10 + this.urcorx, this.getDY(xint), 5 + this.urcorx, this.getDY(xint));
            ctx.fillText(xint.toFixed(1), 18 + this.urcorx, this.getDY(xint)+5);
        }
        ctx.fillText("Field Strength (nT)", this.lrcorx - 40, this.lrcory + 20);

        this.drawLine(this.urcorx + 20, P_HEIGHT - 1, this.urcorx + 20, C_HEIGHT + 5);
        for (let xint = 0; xint < this.dmax; xint += this.dmax / 5.0)
        {
            this.drawLine(20 + this.urcorx, Math.trunc(P_HEIGHT + xint * this.dscale),
                15 + this.urcorx, Math.trunc(P_HEIGHT + xint * this.dscale)); //dscale is in setScale()
            ctx.fillText(xint.toFixed(1), this.urcorx + 28, Math.trunc(P_HEIGHT + xint* this.dscale) +5);
        }

        ctx.fillText("Depth (m)", this.urcorx - 45, C_HEIGHT - 10);
        ctx.closePath();
        ctx.stroke();
    }

    plotXSection()
    {


        // Draw Background
        ctx.beginPath();
        ctx.fillStyle = "#68BB59";
        ctx.rect(this.ulcorx - 20, P_HEIGHT, G_WIDTH + 40, C_HEIGHT - P_HEIGHT);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#000000";
        ctx.fillText("West", this.ulcorx-15, P_HEIGHT + 20);
        ctx.fillText("East", P_WIDTH -75, P_HEIGHT + 20);


        // Now Draw dike. Dike graphic consists of a rectangle
        // scaled to the appropriate width and depth.
        ctx.beginPath();
        ctx.fillStyle = "#777777";

        let x_1 = C_WIDTH / 2 - Math.trunc(this.width * this.xscale / 2.0);
        let y_1 = this.getTY();
        let x_2 = Math.trunc(this.width * this.xscale);
        let y_2 = C_HEIGHT - this.getTY();
        ctx.rect(x_1, y_1, x_2, y_2);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = "#000000";
        ctx.rect(x_1, y_1, x_2, y_2);
        ctx.stroke();
        ctx.fillStyle = "#000000";
        ctx.drawImage(tree, 50, 238);
    }

    labels()
    {
        ctx.fillStyle = "#000000";
        r_ctx.fillStyle = "#000000";
        ctx.font = "12px Arial";
        r_ctx.fillText("Depth: ", 5, 12);
        r_ctx.fillText("Width: ", 5, 24);
        r_ctx.fillText("Move to Surface ", 83, 24);
        r_ctx.fillText("Move to Deeper Depth", 73, 222);
        r_ctx.fillText("Decrease Radius", 2, 87);
        r_ctx.fillText("Increase Radius", 159, 87);
    }

    drawPlotPoint(x, y)
    {
        // alert("drawParticle")
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.strokeStyle = "#0000bb";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
    }

    plotData()
    {
        let temp = null;
        for (let x = this.xmin; x <= this.xmax; x += this.dx) {
            temp = this.getFieldStrength(x);
            this.drawPlotPoint(this.getDX(x), this.getDY(temp));
        }
    }

    drawLine(x1, y1, x2, y2)
    {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    getDX(x) 
    {
        return Math.trunc((x - this.xmin) * this.xscale + this.llcorx);
    }

    getDY(y) 
    {
        return Math.trunc((this.ymax - y) * this.yscale + this.ulcory);
    }

    getXY(y) 
    {
        return Math.trunc((-1 * y) * this.dscale + this.xulcory);
    }

    getTY() 
    {
        return Math.trunc(this.depth2top * this.dscale + P_HEIGHT)
    }

    setScales()
    {
        let x = null; 
        let temp = null;
        this.ymax = -1000.0; //reset variable scale pointers
        this.ymin = 1000.0;

        for (x = this.xmin; x <= this.xmax; x += this.dx)
        {
            temp = this.getFieldStrength(x);
            if (temp < this.ymin) 
                this.ymin = temp * 1.1;

            if (temp > this.ymax)
                this.ymax = temp * 1.1;
        }

        this.xscale = G_WIDTH / (this.xmax - this.xmin);
        this.yscale = G_HEIGHT / (this.ymax - this.ymin);
        this.dscale = (C_HEIGHT - P_HEIGHT) / this.dmax;
    }
    
    gaussianRand(min, max, skew) 
    {
        let u = 0, v = 0;
        while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        if (num > 1 || num < 0) num = this.gaussianRand(min, max, skew); // resample between 0 and 1 if out of range
        num = Math.pow(num, skew); // Skew
        num *= max - min; // Stretch to fill range
        num += min; // offset to min
        return num;
    }

    getFieldStrength(x)
    {
    //First Convert angles in degrees to radians and compute angle
        //between profile line and trend of dike
        let incr = this.inc * Math.PI / 180.0;
        let bn = -1.0 * this.b;
        let ang = (360.0 - bn) * Math.PI / 180.0; //Angle between profile and dike
        //let angr = ang * Math.PI / 180.0; Artifact left from Tom (unused).
        let br = bn * Math.PI / 180.0;

        //Compute constants needed for calculation. Constants are as
        //defined in Telford
        //double xs = (width / 2.0 - x);
        //double xs = x + width / 2.0;
        //double xsp = xs * Math.cos(ang);
        let xs = x * Math.cos(ang);
        let xsp = xs + this.width / 2.0;
        let r1 = Math.sqrt(this.depth2top * this.depth2top + xsp * xsp);
        let r2 = Math.sqrt(this.depth2bot * this.depth2bot + xsp * xsp);
        let r3 = Math.sqrt(this.depth2top * this.depth2top +
        (xsp - this.width) * (xsp - this.width));
        let r4 = Math.sqrt(this.depth2bot * this.depth2bot +
        (xsp - this.width) * (xsp - this.width));
        let phi1 = Math.atan2(this.depth2top, xsp);
        let phi2 = Math.atan2(this.depth2bot, xsp);
        let phi3 = Math.atan2(this.depth2top, (xsp - this.width));
        let phi4 = Math.atan2(this.depth2bot, (xsp - this.width));

        //Compute field strength at x
        let save = 2.0 * this.k * this.fe * (Math.sin(2.0 * incr) * Math.sin(br) *
        Math.log(r2 * r3 / (r4 * r1)) +
        (Math.cos(incr) * Math.cos(incr) * Math.sin(br) *
            Math.sin(br) - Math.sin(incr) * Math.sin(incr)) *
        (phi1 - phi2 - phi3 + phi4))+
            this.gaussianRand(-3, 3, 1) * this.std / Math.sqrt(this.ndata);

        return save;
    }

    start()
    {

        if (canvas.getContext)
        {
            canvas.width = (C_WIDTH+10);
            canvas.height = (C_HEIGHT+5);

            this.setScales();
            this.paint();
        }
    }
}
let magnetic_dike = new MagneticDike();











