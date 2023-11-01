/**
 * This applet allows users to generate synthetic gravity profiles
 * over a buried tunnel. User may vary the depth of the tunnel dynamically
 * and its radius, density contrast, and survey parameters via a control
 * panel.
 *
 * - Java Author Tom Boyd
 * - created    November 11, 2002
 * - JavaScript Author Jason Reek
 * - Revised May 28, 2020
 */


const canvas = document.querySelector('.gtCanvas');
const rad_canvas = document.querySelector('.gtRadSample');
const ctx = canvas.getContext('2d');
const  r_ctx = rad_canvas.getContext('2d');

// Constants that dictate where to start drawing the graph.
const C_WIDTH = 500;
const C_HEIGHT = 500;
const X_OFFSET = 100;

// Width of plotting Area
const P_WIDTH = C_WIDTH;
// Height of plotting Area
const P_HEIGHT = 300;
// Width of Graph within plotting Area
const G_WIDTH = (P_WIDTH - 125);
const G_HEIGHT = (P_HEIGHT - 100);



// Value for big G and a static value for the random number generator.
const G = (6.67 * Math.pow(10.0, -11.0));

let inter = null;

class GravityTunnel
{
    constructor()
    {
        canvas.width = (C_WIDTH+10);
        canvas.height = (C_HEIGHT+5);

        //Now define the absolute coordinates of each of the four corners of
        //the plotting area
        this.ulcorx = Math.trunc(((P_WIDTH - G_WIDTH) / 2.0));
        this.ulcory = Math.trunc(((P_HEIGHT - G_HEIGHT) / 2.0));
        this.urcory = this.ulcory;
        this.urcorx = this.ulcorx + G_WIDTH;
        this.llcorx = this.ulcorx;
        this.llcory = this.ulcory + G_HEIGHT;
        this.lrcorx = this.urcorx;
        this.lrcory = this.llcory;

        // Now define variables that we will need compute plot scale.
        this.xmin = -250.0;
        this.xmax = 250.0;
        this.ymin = 1000.0;
        this.ymax = -1000.0;
        this.dmax = 25.0;
        // Maximum plotting depth.
        this.xscale = null;
        this.yscale = null;
        this.dscale = null;
        // Define Variables used to Describe Model Parameters.
        this.dx = 1.0;
        this.rho = -2.67;
        this.rad = 1.0;
        this.depth = 5.0;
        this.std = 0.01;
        this.ndata = 2;
        this.last_y = null;
        this.tree = new Image();
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
        this.drawAxis();

        ctx.drawImage(this.tree, 50, 238);
    }

    drawAxis()
    {
        let xint = null;
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        // Do x axis first
        this.drawLine(this.ulcorx-1, this.ulcory, this.urcorx+1, this.urcory);

        for(xint = this.xmin; xint <= this.xmax; xint += 50)
        {
            this.drawLine(this.getDX(xint), this.ulcory, this.getDX(xint), this.ulcory-5);
            ctx.fillText(xint, this.getDX(xint)-5, this.ulcory-8);
        }
        ctx.fillText("Distance (m)", C_WIDTH/2 - 30, 25);

        // Do gravity value axis
        this.drawLine(this.urcorx+20, this.urcory-1, 20 + this.lrcorx, this.lrcory+1);

        for(xint = this.ymin; xint <= this.ymax; xint += Math.abs(this.ymax-this.ymin)/5.0)
        {
            this.drawLine(this.urcorx+20, this.getDY(xint), this.urcorx+15, this.getDY(xint));
            ctx.fillText(xint.toFixed(3), this.urcorx+22, this.getDY(xint)+5);
        }
        ctx.fillText("Gravity (mgal)", this.lrcorx-30, this.lrcory+20);

        // Finally the depth scale
        this.drawLine(this.urcorx+20, P_HEIGHT-1, this.lrcorx+20, C_HEIGHT+1);
        for(xint = 0; xint <= this.dmax; xint += this.dmax / 5.0)
        {
            this.drawLine(this.urcorx+20, Math.trunc(P_HEIGHT + xint * this.dscale), this.urcorx+15, Math.trunc(P_HEIGHT + xint * this.dscale))
            ctx.fillText(xint.toFixed(1), this.urcorx+28, Math.trunc(P_HEIGHT + xint * this.dscale)+5);
        }
        ctx.fillText("Depth (m)", this.urcorx - 50, C_HEIGHT - 10);
        ctx.closePath();
        ctx.stroke();
    }

    plotXSection()
    {
        // Draw grass rectangle.
        ctx.beginPath();
        ctx.fillStyle = "#68BB59";
        ctx.rect( (this.ulcorx - 20), P_HEIGHT, (G_WIDTH + 40), (C_HEIGHT - 50));
        ctx.closePath();
        ctx.fill();
        let TunR = new Circle(ctx, C_WIDTH/2 - Math.trunc(this.rad * this.dscale), this.getTY() - Math.trunc(this.rad * this.dscale)+1, Math.trunc(this.rad * this.dscale * 2), "#ff0000");
        let TunB = new Circle(ctx, C_WIDTH/2 - Math.trunc(this.rad * this.xscale), this.getTY() - Math.trunc(this.rad * this.xscale)+1, Math.trunc(this.rad * this.xscale * 2), "#000000");

        TunR.draw();
        TunB.draw();

        ctx.closePath();    
    }
   
    // Labels for the plot
    labels()
    {
        ctx.fillStyle = "#000000";
        ctx.font = "12px Arial";
    }

    // This will draw a single plot point 
    drawPlotPoint(x, y)
    {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0,2*Math.PI);
        ctx.strokeStyle = "#0000bb";
        ctx.stroke();
        ctx.closePath();
    }

    drawLine(x1, y1, x2, y2, color="#000000")
    {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    //Plots the particles on to the canvas.
    plotData()
    {
        let x = null;
        let temp = null;
        for (x = this.xmin; x <= this.xmax; x += this.dx)
        {
            temp = this.getG(x);
            this.drawPlotPoint(this.getDX(x), this.getDY(temp));
        }
    }

    // Compute gravity at a given x location
    getG(x)
    {
        let save = null;
        save = (2.0*G*Math.PI*Math.pow(this.rad, 2.0) * this.depth * this.rho /
            (x*x+this.depth*this.depth) *  Math.pow(10.0, 8.0) + this.gaussianRand() * this.std /
            Math.sqrt(this.ndata));
        return save;
    }
    
    // Compute x pixel location in data graphic
    getDX(x)
    {
        return Math.trunc((( (x-this.xmin) * this.xscale+this.llcorx )));
    }

    // Compute y pix location in data graphic
    getDY(y)
    {
        return Math.trunc((( (this.ymax-y) * this.yscale + this.ulcory )));
    }

    // Compute y pix location of tunnel graphic
    getTY()
    {
        return Math.trunc(this.depth * this.dscale + P_HEIGHT)
    }

    // Compute scales for plotting.
    setScales()
    {
        let x = null;
        let temp = null;
        // Reset variable scale pointers
        this.ymax = -1000.0;
        this.ymin = 1000.0;
        for (x = this.xmin; x <= this.xmax; x += this.dx)
        {
            temp = this.getG(x);
            if (temp < this.ymin)
            {
                this.ymin = temp * 1.1;
            }
            if (temp > this.ymax)
            {
                this.ymax = temp * 1.1;
            }
        }
        this.xscale = G_WIDTH / (this.xmax - this.xmin);
        this.yscale = G_HEIGHT / (this.ymax - this.ymin);
        this.dscale = (C_HEIGHT - P_HEIGHT) / this.dmax;
    }

    // Method to produce normal distributed values clustered around a mean.
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
}
let gravity_tunnel = new GravityTunnel();

// Load the tree image 
gravity_tunnel.tree.onload = function()
{
    if(gravity_tunnel.tree !== undefined)
        ctx.drawImage(gravity_tunnel.tree, 50, 238);
};
gravity_tunnel.tree.src = "../../../images/tree.png";
