/*
MAGNETIC BURIED DIKE
*/

//This applet allows the user to model magnetic
//anomalies over a buried dike. User my alter location and size
//of the dike dynamically. They may also vary the orientation of
//the dike and the inducing field through a control panel

//Written By;
//Tom Boyd 6/16/97

// Page Widgets 
const canvas = document.getElementById("MagneticBuriedDikeCanvas");
const ctx = canvas.getContext("2d");
const controller_canvas = document.getElementById('controller_canvas');
const controller_ctx = controller_canvas.getContext('2d');
const file_input = document.getElementById("file_input");
const k_slider = document.getElementById("k_slider");
const bias_slider = document.getElementById("bias_slider");
const y_loc_cbox = document.getElementById("y_location_cbox");

// Table Values 
const table_k = document.getElementById("k_val");
const table_width = document.getElementById("width_val");
const table_center = document.getElementById("center_val");
const table_depth = document.getElementById("depth_val");
const table_trend = document.getElementById("trend_val");
const table_bias = document.getElementById("bias_val");


const C_WIDTH = 500;
const C_HEIGHT = 500;
const TICK_SIZE = 7;

// Width of Graph within plotting Area
const G_WIDTH = C_WIDTH - 150;
// Height of Graph within plotting Area
const G_HEIGHT = C_HEIGHT - 150;

var inter; 

function alignLabel(label, x, y)
{
    y_offset = 20;
    if(label.length === 4)
        ctx.fillText(label, x-15, y+y_offset);
    else if(label.length === 3)
        ctx.fillText(label, x-12, y+y_offset);
    else if(label.length === 2)
        ctx.fillText(label, x-9, y+y_offset);
    else 
        ctx.fillText(label, x-3, y+y_offset);

}

class MagneticBuriedDike
{
    constructor()
    {
        // Define the absolute coordinates of each of the four corners of
        // the plotting area.
        this.ul_cor_x = Math.trunc((C_WIDTH - G_WIDTH) / 2.0);
        this.ul_cor_y = Math.trunc((C_HEIGHT - G_HEIGHT) / 2.0);
        this.ur_cor_x = this.ul_cor_x + G_WIDTH;
        this.ur_cor_y = this.ul_cor_y;
        this.ll_cor_x = this.ul_cor_x;
        this.ll_cor_y = this.ul_cor_y + G_WIDTH;
        this.lr_cor_x = this.ur_cor_x;
        this.lr_cor_y = this.ll_cor_y;

        // Setup variables used for plotting
        // minimum horizontal distance to plot
        this.x_min = -250.0; 
        // Maximum horizontal distance to plot
        this.x_max = 250.0; 
        // Initial y min to use
        this.y_min = -25.0;
        // Initial y max to use 
        this.y_max = 0.0; 
        // Pixels per meter variable to convert meters to pixels.
        this.x_scale = G_WIDTH / (this.x_max - this.x_min); 
        // Variable to convert gammas to pixels
        this.y_scale = 0.0; 

        //Define Variables used to Describe Model Parameters - In this case,
        //magnetic anomaly is going to be computed over a vertical dike with
        //an arbitrary trend along an east-west trending survey line.
        // Susceptability contrast
        this.k = 0.0001; 
        this.k_min = 0.00001;
        this.k_max = 0.001;
    
        // Model bias in nT
        this.bias = 0.0; 
        // Width of dike (m)
        this.width = 100.0; 
        // Width of dike (m)
        this.depth_to_top = -5.0; 
        // Line number to model
        this.line_number = 0.0;
        // Depth to bottom of dike 
        this.depth_to_bot = 1000.0;
        // Field strength of inducing field (nT)
        this.fe = 54000.0; 
        // Horizontal location of dike at y=0
        this.x_loc = 0.0; 
        // Dike trend in degrees.
        this.b = 46.0; 
        // Inclination of inducing field in degrees
        this.inc = 58.0; 
        // Set Variables to hold line coordinates
        this.n_lines = 3;
        // Variable used to collect scrollbar info
        this.s_value = null;

        //This is an array of y locations for each line. Values shown
        //here are extracted from the input data file and used by
        //MagFrame both in the drop down menu and in plotting the locations
        //of the readings.
        this.line_values = [-250.0, 0.0, 250.0];

        // Set Variables to hold magnetic readings and their locations
        this.readings = []; 
        // North South spacing of lines in meters
        this.ns_spacing = 250.0; 
        // East West spacing of readings on each line.
        this.ew_spacing = 5.0; 
        // Starting y location of lines
        this.y_start = -1000.0; 
    }

    start()
    {
        canvas.width = (C_WIDTH+10);
        canvas.height = (C_HEIGHT);
        canvas.backgroundColor = "#FFFFFF"
        // Set up an initial null data set 
        this.ns_spacing = 250.0;
        this.ew_spacing = 5.0;
        this.n_lines = 3;
        this.line_values[0] = -250.0;
        this.line_values[1] = 0.0;
        this.line_values[2] = 250.0;
        let n_data = Math.trunc((500.0/this.ew_spacing +1) * 3);
        for(let i = 0; i < n_data; i++) 
        {
            this.readings.push(0.0);
        }
        ctx.font = "14px Ariel";
        this.paint()
    }

    setScales()
    { 
        let test = null;
        let ndpl = null;

        // First check model values
        this.y_min = 100000.0;
        this.y_max = -100000.0;

        for(let x = this.x_min; x <= this.x_max; x += 1.0) 
        {
            test = this.getFieldStrength(x);
            if(test < this.y_min)
                this.y_min = test;
            if (test > this.y_max)
                this.y_max = test;
        }

        // Now check observed values
        
        // Data points per line 
        ndpl = Math.trunc((this.x_max - this.x_min) / this.ew_spacing + 1);        
        for (let i = 0; i < ndpl; i++) 
        {
            if (this.readings[this.line_number * ndpl + i] < this.y_min)
                this.y_min = this.readings[this.line_number * ndpl + i];
            if (this.readings[this.line_number * ndpl + i] > this.y_max)
                this.y_max = this.readings[this.line_number * ndpl + i];
        }

        this.y_min *= 1.1;
        this.y_max *= 1.1;
        this.y_scale = G_HEIGHT / (this.y_max - this.y_min);
    }

    paint()
    {
        
        let y = null; 
        let temp = null;
        let px = null;
        let py = null;

        this.setScales();

        // First color in plot area
        ctx.beginPath();
        ctx.fillStyle = "#FFFFFF";
        ctx.rect(0, 0, C_WIDTH, C_HEIGHT);
        ctx.fill();
        this.drawAxis();
        this.plotModel();
        this.plotData();
        
    }

    drawAxis()
    {
        let px = null;
        let py = null;
        let label = "";
        ctx.beginPath();
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#FFFFFF";
        ctx.rect(this.ul_cor_x, this.ul_cor_y, G_WIDTH, G_HEIGHT);
        ctx.fill();

        
        ctx.fillStyle = "#000000";
        // Top Horizontal Axis Line
        this.drawLine(this.ul_cor_x-1, this.ul_cor_y, this.ur_cor_x+1, this.ur_cor_y);
        // Bottom Horizontal Axis Line
        this.drawLine(this.ll_cor_x, this.ll_cor_y, this.lr_cor_x, this.lr_cor_y);
        // Left Vertical Axis Line
        this.drawLine(this.ul_cor_x, this.ul_cor_y, this.ll_cor_x, this.ll_cor_y+1);
        // Right Vertical Axis Line
        this.drawLine(this.ur_cor_x, this.ur_cor_y, this.lr_cor_x, this.lr_cor_y+1);
        
        // Draw x axis
        for(let x = this.x_min; x <= this.x_max; x+= 50.0)
        {
            py = this.getDY(this.y_max);
            px = this.getDX(x);
            this.drawLine(px, py, px, py + TICK_SIZE);
            py = this.getDY(this.y_min);
            this.drawLine(px, py, px, py - TICK_SIZE);
            label = x.toString();
            alignLabel(label, px, py);
        }
        ctx.fillText("X Location (m)", (C_WIDTH-65)/2, this.getDY(this.y_min)+40);
        
        // Draw y axis
        
        for (let y = this.y_min; y <= this.y_max; y += Math.abs(this.y_max - this.y_min) / 5.0) 
        {
            px = this.getDX(this.x_max);
            py = this.getDY(y);
            this.drawLine(px, py, px - TICK_SIZE, py);
            ctx.fillText(y.toFixed(3), px + 5, py + 5);
            px = this.getDX(this.x_min);
            this.drawLine(px, py, px + TICK_SIZE, py);
            
        }

        
        
        ctx.stroke();

    }

    // Plot Magnetic values
    plotModel()
    {
        let temp;
        let sx;
        let sy;
        let nx;
        let ny;
        sx = this.getDX(this.x_min);
        temp = this.getFieldStrength(this.x_min);
        sy = this.getDY(temp);

        for(let x = this.x_min; x <= this.x_max; x += 1.0)
        {
            temp = this.getFieldStrength(x);
            ny = this.getDY(temp);
            nx = this.getDX(x);
            this.drawLine(sx, sy, nx, ny, "#CC0000");
            sx = nx;
            sy = ny;
        }
    }

    // Plot Observed Data
    plotData()
    {
        // data points per line
        let ndpl = Math.trunc((this.x_max - this.x_min) / this.ew_spacing + 1);
        let px;
        let py;

        for(let i = 0; i < ndpl; i++)
        {
            py = this.getDY(this.readings[this.line_number * ndpl + i]);
            px = this.getDX(this.x_min + this.ew_spacing * i);
            this.drawSurveyPoint(px-2, py-2);
        }

    }

    getDX(x)
    {
        return Math.trunc((x - this.x_min) * this.x_scale + this.ll_cor_x);
    }

    getDY(y)
    {
        return Math.trunc((this.y_max - y) * this.y_scale + this.ul_cor_y);
    }

    // Draw line function
    drawLine(x1, y1, x2, y2, color="#000000")
    {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    // Draws a survey point on to the plot. 
    drawSurveyPoint(x, y, color="#0000bb")
    {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, 2, 0, 2*Math.PI);
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }

    // Compute Field Strength at a given x location
    getFieldStrength(x) 
    {
        //First Convert angles in degrees to radians and compute angle
        //between profile line and trend of dike
        let incr = this.inc * Math.PI / 180.0;
        let bn = -1.0 * this.b;
        // Angle between profile and dike
        let ang = (360.0 - bn) * Math.PI / 180.0; 
        let ang1 = (180.0 - bn) * Math.PI / 180.0;
        let br = bn * Math.PI / 180.0;
        let yloc = this.y_start + this.line_number * this.ns_spacing;
        let px = Math.tan(ang1) * yloc + this.x_loc; 

        //Compute constants needed for calculation. Constants are as
        //defined in Telford
        let xs = (px - x) * Math.cos(ang);
        let xsp = xs + this.width / 2.0;
        let r1 = Math.sqrt(this.depth_to_top * this.depth_to_top + xsp * xsp);
        let r2 = Math.sqrt(this.depth_to_bot * this.depth_to_bot + xsp * xsp);
        let r3 = Math.sqrt(this.depth_to_top * this.depth_to_top +
                (xsp - this.width) * (xsp - this.width));
        let r4 = Math.sqrt(this.depth_to_bot * this.depth_to_bot +
                (xsp - this.width) * (xsp - this.width));
        let phi1 = Math.atan2(this.depth_to_top, xsp);
        let phi2 = Math.atan2(this.depth_to_bot, xsp);
        let phi3 = Math.atan2(this.depth_to_top, (xsp - this.width));
        let phi4 = Math.atan2(this.depth_to_bot, (xsp - this.width));

        //Compute field strength at x
        let save = -2.0 * this.k * this.fe * (Math.sin(2.0 * incr) * Math.sin(br) *
                Math.log(r2 * r3 / (r4 * r1)) +
                (Math.cos(incr) * Math.cos(incr) * Math.sin(br) *
                Math.sin(br) - Math.sin(incr) * Math.sin(incr)) *
                (phi1 - phi2 - phi3 + phi4)) + this.bias;

        return save;
    }

    setTableValues()
    {
        try
        {
            table_k.innerHTML = this.k.toFixed(6);
            table_width.innerHTML = this.width.toFixed(1)+ " m";
            table_center.innerHTML = this.x_loc.toFixed(1)+ " m";
            table_trend.innerHTML = this.b.toFixed(1)+" deg";
            table_depth.innerHTML = (-1*this.depth_to_top).toFixed(1)+ " m";
            table_bias.innerHTML = this.bias.toFixed(1)+" nT";
        }
        catch(err)
        {
            console.log(err.message);
        }
    }

}
let mag_buried_dike = new MagneticBuriedDike();
mag_buried_dike.start();
