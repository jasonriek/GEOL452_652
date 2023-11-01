/*
GRAVITY VERTICAL SHAFT
*/

const canvas = document.querySelector('.gvsCanvas');
const ctx = canvas.getContext('2d');
const rad_canvas = document.querySelector('.gtRadSample');
const r_ctx = rad_canvas.getContext('2d');

// Define width and height of Applet Draw Area
// This includes portions that will be used to plot gravity
// data graphic and cross-section with tunnel
const C_WIDTH = 500;
const C_HEIGHT = 500;
const X_OFFSET = 100;
//Define some  constants for the gravity data plot
// Width of plotting Area
const P_WIDTH = C_WIDTH;
// Height of plotting Area
const P_HEIGHT = 300;
// Width of Graph within plotting Area
const G_WIDTH = P_WIDTH - 125;
// Height of Graph within plotting Area
const G_HEIGHT = P_HEIGHT - 100;

const G = (6.67 * Math.pow(10.0, -11.0));
let inter = null;

let tree = new Image();
// LOAD THE TREE
tree.onload = function()
{
    ctx.drawImage(tree, 60, 211);
};
tree.src = "../../../images/tree.png";

class GravityVerticalShaft
{
    constructor()
    {
        canvas.width = (C_WIDTH+10);
        canvas.height = (C_HEIGHT+5);
        // Now define the absolute coordinates of each of the four corners of
        // the data plotting area
        this.ulcorx = Math.trunc(((P_WIDTH - G_WIDTH) / 2.0));
        this.ulcory = Math.trunc(((P_HEIGHT - G_HEIGHT) / 2.0));
        this.urcory = this.ulcory;
        this.urcorx = this.ulcorx + G_WIDTH;
        this.llcorx = this.ulcorx;
        this.llcory = this.ulcory + G_HEIGHT;
        this.lrcorx = this.urcorx;
        this.lrcory = this.llcory;

        // Define width and height of cross-section plotting area
        this.x_width = C_WIDTH - 125;
        this.x_height = C_HEIGHT - P_HEIGHT - 50;

        // Now define the absolute coordinates of each of the four corners of
        // the plotting area
        this.xulcorx = Math.trunc(((C_WIDTH - this.x_width) / 2.0));
        this.xulcory = Math.trunc((this.llcory + 25));
        this.xurcory = this.xulcory;
        this.xurcorx = (this.xulcorx + this.x_width);
        this.xllcorx = this.xulcorx;
        this.xllcory = this.xulcory + this.x_height;
        this.xlrcorx = this.xurcorx;
        this.xlrcory = this.xllcory;

        // Now define variables that we will need compute plot scale.
        // Minimum Station location
        this.xmin = -250.0;
        this.xmax = 250.0;
        // Minimum gravity value - This is computed
        this.ymin = 1000.0;
        this.ymax = -1000.0;
        // Maximum plotting depth
        this.dmin = -25.0;
        this.xscale = null;
        this.yscale = null;
        this.dscale = null;

        // Define Variables used to Describe Model Parameters.
        // Density contrast gm/cm^3
        this.rho = -2.6;
        // Depth to top of cylinder (m)
        this.cyl_top = -5.0;
        // Depth to bottom of cylinder (m)
        this.cyl_bot = 1000.0;
        this.depthf = 5.0;
        // In line location of cylinder along line (m)
        this.xloc = 0.0;
        // Radius of cylinder (m)
        this.radius = 25;
        // Horizontal location of cylinder across line (m)
        this.yloc = 0.0;
        // Standard deviation of readings
        this.std = 0.001;
        // Number of readings to average
        this.nobs = 2;
        // Reading increment (m)
        this.dx = 0.5;

        this.width = 25.0; //Width of dike (m)
        this.depth2top = -5.0; //Depth to top of dike
        this.depth2bot = 500.0; //Depth to bottom of dike
        this.last_y = null;
    }

    paint()
    {
        // Plot Cross section
        this.plotXSection();
        // Plot Gravity Data
        this.plotTheory();
        // Draw Parameter Labels on lower left side of plot
        this.labels();
        // Draw Axes
        this.drawAxis();

        ctx.drawImage(tree, 60, 211);

    }

    // Method that produces normal distributed values clustered around a mean.
    gaussianRand()
    {
        let x1, x2, rad, y1;
        do {
            x1 = 2 * Math.random() - 1;
            x2 = 2 * Math.random() - 1;
            rad = x1 * x1 + x2 * x2;
        } while(rad >= 1 || rad === 0);
        let c = Math.sqrt(-2 * Math.log(rad) / rad);
        return (x1 * c);
    }

    getDX(x)
    {
        return Math.trunc((x - this.xmin) * this.xscale + this.llcorx);
    }
    // Compute y pix location in data graphic.
    getDY(y)
    {
        return Math.trunc((this.ymax - y) * this.yscale + this.ulcory);
    }
    // Compute y pixel location for cross section graphic
    getXY(y)
    {
        return Math.trunc((-1 * y) * this.dscale + this.xulcory);
    }
    // Compute gravity at a given x location
    getG(x, y)
    {
        let save, save1, fudge = null;
        let xs, r, cos_theta, p1, p2, p4, p6, t = null;
        //There are two expressions to be used one for r > radius
        //and one for r < radius. To insure that both match at
        //r = radius we'll evaluate both there and add a small
        //constant to one of the expressions.
        cos_theta = Math.abs(this.depth2top / this.radius);
        p1 = cos_theta;
        p2 = (3.0 * Math.pow(cos_theta, 2.0) - 1.0) / 2.0;
        p4 = (35.0 * Math.pow(cos_theta, 4.0) -
            30.0 * Math.pow(cos_theta, 2.0) + 3.0) / 8.0;
        p6 = (231.0 * Math.pow(cos_theta, 6.0) -
            315.0 * Math.pow(cos_theta, 4.0) +
            105.0 * Math.pow(cos_theta, 2.0) - 5.0) / 16.0;
        t = 1.0 / 2.0;
        save = 2.0 * Math.PI * G * this.rho * this.radius *
            (1.0 - 2.0 * t * p1 + 2.0 * t * t * p2 -
                2.0 * t * t * t * t * p4 + 2.0 * t * t * t * t * t * t * p6);
        save1 = 2.0 * Math.PI * G * this.rho * this.radius *
            (t - t * t * t * p2 + 2.0 * t * t * t * t * t * p4 -
                2.0 * t * t * t * t * t * t * t * p6);
        fudge = save1 - save;

        //Now do computations at correct location
        xs = Math.sqrt((this.xloc - x) * (this.xloc - x) + y * y);
        r = Math.sqrt(this.depth2top * this.depth2top + xs * xs);
        cos_theta = Math.abs(this.depth2top / r);
        p1 = cos_theta;
        p2 = (3.0 * Math.pow(cos_theta, 2.0) - 1.0) / 2.0;
        p4 = (35.0 * Math.pow(cos_theta, 4.0) -
            30.0 * Math.pow(cos_theta, 2.0) + 3.0) / 8.0;
        p6 = (231.0 * Math.pow(cos_theta, 6.0) -
            315.0 * Math.pow(cos_theta, 4.0) +
            105.0 * Math.pow(cos_theta, 2.0) - 5.0) / 16.0;
        if (this.radius > r) 
        {
            t = r / (2.0 * this.radius);
            save = 2.0 * Math.PI * G * this.rho * this.radius *
                (1.0 - 2.0 * t * p1 + 2.0 * t * t * p2 -
                    2.0 * t * t * t * t * p4 +
                    2.0 * t * t * t * t * t * t * p6) + fudge;
        } 
        else 
        {
            t = this.radius / (2.0 * r);
            save = 2.0 * Math.PI * G * this.rho * this.radius *
                (t - t * t * t * p2 + 2.0 * t * t * t * t * t * p4 -
                    2.0 * t * t * t * t * t * t * t * p6);
        }


        return save * Math.pow(10.0, 8.0) +
            this.gaussianRand() * this.std / Math.sqrt(this.nobs);
    }

    // Draw line function
    drawLine(x1, y1, x2, y2)
    {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Compute scales for plotting data graphic
    setScales()
    {
        // First set xmax and xmin values from data file values
        // Now check to see if theoretical values will reset ymax and ymin
        let x = null;
        let temp = null;
        this.ymax = -1000.0;
        this.ymin = 1000.0;

        for (x = this.xmin; x <= this.xmax; x += this.dx)
        {
            temp = this.getG(x, this.yloc);
            if (temp < this.ymin)
            {
                this.ymin = temp;
            }
            if (temp > this.ymax)
            {
                this.ymax = temp;
            }
        }
        // Add buffer to ymin and ymax
        this.ymin *= 1.1;
        this.ymax *= 1.1;

        // Compute scales
        this.xscale = G_WIDTH / (this.xmax - this.xmin);
        this.yscale = G_HEIGHT / (this.ymax - this.ymin);
        this.dscale = (this.x_height / (0.0 - this.dmin));
    }

    // Plot Theoretical Gravity values
    plotTheory()
    {
        let x = null; 
        let temp = null; 

        for(x = this.xmin; x <= this.xmax; x += this.dx)
        {
            temp = this.getG(x, this.yloc);
            let circle = new Circle(ctx, this.getDX(x)-3, this.getDY(temp)-3, 6, "#FF0000");
            circle.draw();
        }
    }

    plotXSection()
    {
        // Draw grass rectangle.
        ctx.beginPath();
        ctx.fillStyle = "#68BB59";
        ctx.rect(this.xulcorx, this.xulcory-2, this.x_width, this.x_height+3);
        ctx.fill();
        ctx.strokeStyle = "#000000";
        //ctx.rect(xulcorx, xulcory, x_width, x_height);

        let depth = null;
        let px = null; 
        let py = null; 
        let px1 = null; 
        let py1 = null;

        ctx.fillStyle = "#000000";
        ctx.font = "12px Arial";

        // Draw tick marks and labels
        this.drawLine(this.ulcorx, P_HEIGHT-27, this.ulcorx, C_HEIGHT-74);
        for(depth = 0.0; depth > this.dmin; depth -= 5.0)
        {
            px = this.getDX(this.xmin);
            py = this.getXY(depth);
            if(depth != 0.0)
                this.drawLine(px, py, (px+5), py);
            ctx.fillText((-1.0*depth).toFixed(1), (px-25-2), (py+5));
        }
        ctx.fillText("Depth (m)", (this.xulcorx/3 - 50/2+69), (this.xulcory + this.xllcory)/2-60);


        // Draw Xsection of cylinder
        let x1 = this.xloc - this.radius;
        let x2 = this.xloc + this.radius;
        if(x1 < this.xmin)
            x1 = this.xmin;
        if(x2 > this.xmax)
            x2 = this.xmax;
        px = this.getDX(x1);
        py = this.getXY(this.depth2top);
        px1 = this.getDX(x2)-px;
        py1 = this.getXY(this.dmin) - py;

        ctx.beginPath();
        ctx.fillStyle = "#777777";
        ctx.rect(px, py, px1, py1);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = "#000000";
        ctx.rect(px, py, px1, py1);
        ctx.stroke();
        ctx.fillStyle = "#000000";

    }

    labels()
    {
        ctx.font = "12px Arial";
    }
    // Draw Axes and Labels for x, gravity value, and depth. test
    drawAxis()
    {
        let xint = null;
        ctx.font = "12px Arial";
        // Get Font information so that we can center text when needed
        ctx.beginPath();
        ctx.strokeStyle = "#000000";
        // Do x axis first
        this.drawLine(this.ulcorx, this.ulcory, this.urcorx, this.urcory);
        for (xint = this.xmin; xint <= this.xmax; xint += 50.0)
        {
            this.drawLine(this.getDX(xint), this.ulcory, this.getDX(xint), this.ulcory - 5);
            ctx.fillText((xint), this.getDX(xint) - 7, this.ulcory - 8);
        }
        ctx.fillText("Distance (m)", C_WIDTH / 2 -  30, 25);

        // Do Gravity value axis
        this.drawLine(this.urcorx + 20, this.urcory, this.lrcorx + 20, this.lrcory);
        for (xint = this.ymin; xint <= this.ymax; xint += Math.abs((this.ymax - this.ymin) / 5.0))
        {
            this.drawLine(this.urcorx+20, this.getDY(xint), this.urcorx+15, this.getDY(xint));
            ctx.fillText(xint.toFixed(1), this.urcorx+20, this.getDY(xint) + 5);
        }
        ctx.fillText("Gravity (mgal)", this.lrcorx - 30, this.lrcory + 20);
        ctx.stroke();
    }
}
let gravity_vertical_shaft = new GravityVerticalShaft();
