//This js app allows users to generate synthetic gravity profiles
//over a buried tunnel. User may vary the depth of the tunnel dynamically
//and its radius, density contrast, and survey parameters via a control
//panel.


//Written By;
//Tom Boyd 3/28/97
//Updated and rewritten in JavaScript by Jason Reek 12/8/2019

const canvas = document.querySelector('.gtCanvas');
const rad_canvas = document.querySelector('.gtRadSample');
const ctx = canvas.getContext('2d');
const  r_ctx = rad_canvas.getContext('2d');

// Value for big G and a static value for the random number generator.
const G = (6.67 * Math.pow(10.0, -11.0));

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

const file_input = document.getElementById("file_input");
const anom_slider = document.getElementById("MoveAnom");

const tree = new Image();
// LOAD THE TREE
tree.onload = function()
{
    ctx.drawImage(tree, 50, 238);
};
tree.src = "../../../images/tree.png";

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

        //Define Variables used to Describe Model Parameters.
        this.dx = 0.5;
        this.rho = -2.67;
        this.rad = 1.0;
        this.depth = 5.0;
        this.x_loc = 0.0;
        this.bias = 0.0;
        this.last_y = null;

        // Arrays for holding data
        this.g_data = [];
        this.x_data = [];
        this.ndata = 0;
        this.base_loc = "";
        this.scale_loaded = false;

    }

    paint()
    {
        // Plot Cross section
        this.plotXSection();

        if(this.scale_loaded)
        {
            // Plot Gravity Data
            this.plotData();
        
            // Plot theorectical gravity curve
            this.plotTheory();
        
            // Draw Parameter Labels on lower left side of plot
            this.labels();
        
            // Draw Axis
            this.drawAxis();
        }
        ctx.drawImage(tree, 50, 238);
    }

    drawAxis()
    {
        let xint = null;
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        // Do x axis first
        this.drawLine(this.ulcorx-1, this.ulcory, this.urcorx+1, this.urcory, '#000000');

        for(xint = this.xmin; xint <= this.xmax; xint += 50)
        {
            this.drawLine(this.getDX(xint), this.ulcory, this.getDX(xint), this.ulcory-5, '#000000');
            ctx.fillText(xint, this.getDX(xint)-5, this.ulcory-8);
        }
        ctx.fillText("Distance (m)", C_WIDTH/2 - 30, 25);

        // Do gravity value axis
        this.drawLine(this.urcorx+20, this.urcory-1, 20 + this.lrcorx, this.lrcory+1, '#000000');

        for(xint = this.ymin; xint <= this.ymax; xint += Math.abs(this.ymax-this.ymin)/5.0)
        {
            this.drawLine(this.urcorx+20, this.getDY(xint), this.urcorx+15, this.getDY(xint), '#000000');
            ctx.fillText(xint.toFixed(3), this.urcorx+22, this.getDY(xint)+5);
        }
        ctx.fillText("Gravity (mgal)", this.lrcorx-30, this.lrcory+20);

        // Finally the depth scale
        this.drawLine(this.urcorx+20, P_HEIGHT-1, this.lrcorx+20, C_HEIGHT+1, '#000000');
        for(xint = 0; xint <= this.dmax; xint += this.dmax / 5.0)
        {
            this.drawLine(this.urcorx+20, Math.trunc(P_HEIGHT + xint * this.dscale), this.urcorx+15, Math.trunc(P_HEIGHT + xint * this.dscale), '#000000')
            ctx.fillText(xint.toFixed(1), this.urcorx+28, Math.trunc(P_HEIGHT + xint * this.dscale)+5);
        }
        ctx.fillText("Depth (m)", this.urcorx - 50, C_HEIGHT - 10);
        ctx.closePath();
        ctx.stroke();
    }
    
    // Plot Theoretical Gravity values
    plotTheory()
    { 
        let temp_1 = null; 
        let temp_2 = null;
        for(let x = this.xmin; x <= (this.xmax - this.dx); x += this.dx)
        {
            temp_1 = this.getG(x);
            temp_2 = this.getG(x + this.dx);
            this.drawLine(this.getDX(x), this.getDY(temp_1), this.getDX(x + this.dx), this.getDY(temp_2));
        }
    }

    plotXSection()
    {
        // Draw grass rectangle.
        ctx.beginPath();
        ctx.fillStyle = "#68BB59";
        ctx.rect( (this.ulcorx - 20), P_HEIGHT, (G_WIDTH + 40), (C_HEIGHT - 50));
        ctx.closePath();
        ctx.fill();
        let TunR = new Circle(ctx, this.getDX(this.x_loc) - Math.trunc(this.rad * this.dscale), (this.getTY() - Math.trunc(this.rad * this.dscale)+1), Math.trunc(this.rad * this.dscale * 2), "#ff0000");
        let TunB = new Circle(ctx, this.getDX(this.x_loc) - Math.trunc(this.rad * this.xscale), (this.getTY() - Math.trunc(this.rad * this.xscale)+1), Math.trunc(this.rad * this.xscale * 2), "#000000");

        TunR.draw();
        TunB.draw();

        ctx.closePath();    
    }

    // Labels for the plot
    labels()
    {
        ctx.fillStyle = "#000000";
        r_ctx.fillStyle = "#000000";
        ctx.font = "12px Arial";
        r_ctx.fillText("Depth: ", 5, 12);
        r_ctx.fillText("Radius: ", 5, 24);
        r_ctx.fillText("Move to Surface ", 83, 24);
        r_ctx.fillText("Move to Deeper Depth", 73, 222);
        r_ctx.fillText("Decrease Radius", 2, 87);
        r_ctx.fillText("Increase Radius", 159, 87);
    }
    
    // This will draw the plot point.
    drawPlotPoint(x, y)
    {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2*Math.PI);
        ctx.strokeStyle = "#0000bb";
        ctx.stroke();
        ctx.closePath();
    }

    plotData()
    {
        let test_1 = null;
        let test_2 = null;
        for (let i = 0; i < this.ndata; i++)
        {
            test_1 = this.getDX(this.x_data[i])-3;
            test_2 = this.getDY(this.g_data[i])-3;
            this.drawPlotPoint(this.getDX(this.x_data[i]-3), this.getDY(this.g_data[i])-3);
        }
    }

    // Compute gravity at a given x location
    getG(x)
    {
        let save = null;
        save = (2.0 * G * Math.PI * Math.pow(this.rad, 2.0) * this.depth * this.rho /
            ( (x - this.x_loc) * (x - this.x_loc) + this.depth * this.depth) * Math.pow(10.0, 8.0) + this.bias)
        return save;
    }

    // Compute x pixel location in data graphic
    getDX(x)
    {
        return Math.trunc((x - this.xmin) * this.xscale + this.llcorx);
    }

    // Compute y pix location in data graphic
    getDY(y)
    {
        return Math.trunc((this.ymax - y) * this.yscale + this.ulcory);
    }

    // Compute y pix location of tunnel graphic
    getTY()
    {
        return Math.trunc(this.depth * this.dscale + P_HEIGHT)
    }

    // Compute scales for plotting.
    setScales()
    {
        // First set xmax and xmin values from data file values
        // As a first pass set ymax and ymin from data file values
        let x = null; 
        let temp = null;
        this.xmax = -1000.0;
        this.xmin = 1000.0;
        this.ymax = -1000.0;
        this.ymin = 1000.0;
        
        for (let i = 0; i < this.ndata; i++)
        {
            if(this.x_data[i] !== "" && this.g_data[i] !== "")
            {
                if(this.x_data[i] < this.xmin)
                    this.xmin = this.x_data[i];
                if(this.x_data[i] > this.xmax)
                    this.xmax = this.x_data[i];
                if(this.g_data[i] < this.ymin)
                    this.ymin = this.g_data[i];
                if(this.g_data[i] > this.ymax)
                    this.ymax = this.g_data[i];
            }
        }
        anom_slider.max = this.xmax;
        anom_slider.min = this.xmin;

        // Now check to see if theoretical values will reset ymax and ymin
        for (x = this.xmin; x <= this.xmax; x += this.dx) 
        {
            temp = this.getG(x);
            if (temp < this.ymin)
                this.ymin = temp;
            if (temp > this.ymax)
                this.ymax = temp;
        }
        //Add buffer to ymin and ymax
        this.ymin -= 0.001;
        this.ymax += 0.001;

        //Compute scales
        this.xscale = G_WIDTH / (this.xmax - this.xmin);
        this.yscale = G_HEIGHT / (this.ymax - this.ymin);
        this.dscale = (C_HEIGHT - P_HEIGHT) / this.dmax;
    }
    
    // function value to produce normal distributed values clustered around a mean.
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

    // Draw line function
    drawLine(x1, y1, x2, y2, stroke="#CC0000")
    {
        this.stroke = stroke
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.stroke;
        ctx.stroke();
    }
}
let gravity_tunnel = new GravityTunnel();


