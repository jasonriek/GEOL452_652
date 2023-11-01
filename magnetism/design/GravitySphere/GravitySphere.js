/*
Gravity Sphere
*/

//This applet allows users to generate synthetic gravity profiles
//over a buried sphere. User may vary the depth of the sphere dynamically
//and its radius, density contrast, and survey parameters via a control
//panel. This applet is identical to GravityTModel except a different
//mathematical expression is used to compute the gravity (Obviously!!)

// Define width and height of Applet Draw Area
// This includes portions that will be used to plot gravity
// data graphic and cross-section with tunnel.

const canvas = document.getElementById("GravitySphere");
const ctx = canvas.getContext("2d");
const anomaly_canvas = document.getElementById('anomaly_controller');
const anomaly_ctx = anomaly_canvas.getContext('2d');
const file_input = document.getElementById("file_input");

// Table Values in html file
const table_x_location = document.getElementById("x_location_val");
const table_depth = document.getElementById("depth_val");
const table_radius = document.getElementById("radius_val");
const table_rho = document.getElementById("contrast_val");
const table_bias = document.getElementById("bias_val");

// Sliders 
const anom_slider_left_button = document.getElementById("left_anom_slider_button");
const anom_slider_right_button = document.getElementById("right_anom_slider_button");
const anom_slider = document.getElementById("MoveAnom");

const rho_slider = document.getElementById("rho_slider");
const rho_slider_left_button = document.getElementById("left_rho_button");
const rho_slider_right_button = document.getElementById("right_rho_button");

const bias_slider = document.getElementById("bias_slider");
const bias_slider_left_button = document.getElementById("left_bias_button");
const bias_slider_right_button = document.getElementById("right_bias_button");

// Dimension of arrow button: 64 X 64
const ARROW_BUTTON_SIZE = 64;
const C_WIDTH = 500;
const C_HEIGHT = 500;

// Width of plotting Area
const P_WIDTH = C_WIDTH;
// Height of plotting Area
const P_HEIGHT = 300;
// Width of Graph within plotting Area
const G_WIDTH = P_WIDTH - 125;
// Height of Graph within plotting Area
const G_HEIGHT = P_HEIGHT - 100;
 // Value for big 
const G = 6.67 * Math.pow(10.0, -11.0);

let inter = null; 

class GravitySphere
{
    constructor()
    {
        // Private:
        this._scale_loaded = false;

        // Now define the absolute coordinates of each of the four corners of
        // the data plotting area
        this.ul_cor_x = Math.trunc(((P_WIDTH - G_WIDTH) / 2.0));
        this.ul_cor_y = Math.trunc(((P_HEIGHT - G_HEIGHT) / 2.0));
        this.ur_cor_y = this.ul_cor_y;
        this.ur_cor_x = this.ul_cor_x + G_WIDTH;
        this.ll_cor_x = this.ul_cor_x;
        this.ll_cor_y = this.ul_cor_y + G_HEIGHT;
        this.lr_cor_x = this.ur_cor_x;
        this.lr_cor_y = this.ll_cor_y;

        // Now define variables that we will need compute plot scale
        
        // Minimum Station location
        this.x_min = 1000.0;
        // Maximum Station location
        this.x_max = -1000.0;
        // Minimum gravity value - This is computed
        this.y_min = 1000.0; 
        // Maximum gravity value
        this.y_max = -1000.0;
        // Maximum plotting depth
        this.d_max = 25.0; 
        this.x_scale = null;
        this.y_scale = null;
        this.d_scale = null;

        // Define Variables used to Describe Model Parameters
        this.rho = 2.0;
        this.rad = 2.5;
        this.depth = 5.0;
        this.x_loc = -150.0;
        this.bias = 0.0;

        this.bias_min = -0.05; //mgal
        this.bias_max = 0.05;
        this.d_bias = 0.001;
        this.slider_bias_min = 1;
        this.slider_bias_max = Math.trunc((this.bias_max - this.bias_min) / this.d_bias + 2.1);
        this.bias = this.getBiasFromSlider();

        this.rho_min = -3.0; //gm/cm^3
        this.rho_max = 3.0;
        this.d_rho = 0.025;
        this.slider_rho_min = 1;
        this.slider_rho_max = Math.trunc((this.rho_max-this.rho_min)/this.d_rho+2.1);
        
        this.rad_min = 0.25;
        this.rad_max = 10.0;
        this.d_rad = 0.25;
        
        //x increment at which to plot model response.
        this.dx = 0.5; 

        // Arrays for holding data
        
         // Array containing gravity readings from dataset.
        this.g_data = [];
        // Same as gData, only for x-coordinates.
        this.x_data = [];
        // Number of data points in file 
        this.n_data = null; 
        // String Containing the Base URL of this resource
        this.base_loc = ""; 

        //Value for big G and a static value for the random number
        //generator

        this.i_set = 0;
        this.g_set = null;

        // Tree for scale
        this.tree = new Image();
        

    }
    // Public:
    setScaleLoaded(scale_loaded)
    {
        this._scale_loaded = scale_loaded;
    }

    start()
    {
        if(canvas.getContext)
        {
            canvas.width = (C_WIDTH+8);
            canvas.height = (C_HEIGHT+5);
            canvas.backgroundColor = "#FFFFFF"
            this.setValues();
            this.setSliders();
            this.paint();
        }
    }

    paint()
    {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        
        if(this._scale_loaded)
        {    
            // Set Plot Scales if data is loaded.
            this.setScales();
        
            // Plot Theorectical Gravity Curve
            this.plotTheory();
            
            // Plot cross section.
            this.plotXSection();

            // Plot Survey Data
            this.plotData();

            // Draw Axis
            this.drawAxis();

            // Draw the left controller canvas with labels
            anomaly_controller.paint();
        }
        else
            this.plotXSection();
        
        
    }

    // Compute scales for plotting data graphic.
    setScales()
    {
        // First set xmax and xmin values from data file values
        // As a first pass set ymax and ymin from data file values
        let temp = null;

        this.x_max = -1000.0;
        this.x_min = 1000.0;
        this.y_max = -1000.0;
        this.y_min = 1000.0;

        for(let i = 0; i < this.n_data; i++)
        {
            if(this.x_data[i] < this.x_min)
                this.x_min = this.x_data[i];
            if(this.x_data[i] > this.x_max)
                this.x_max = this.x_data[i];
            if(this.g_data[i] < this.y_min)
                this.y_min = this.g_data[i];
            if(this.g_data[i] > this.y_max)
                this.y_max = this.g_data[i];
        }

        // Now check to see if theoretical values will reset ymax and ymin
        for(let x = this.x_min; x <= this.x_max; x += this.dx)
        {
            temp = this.getG(x);
            if(temp < this.y_min)
                this.y_min = temp;
            if(temp > this.y_max)
                this.y_max = temp;
        }
        // Add buffer to ymin and ymax
        this.y_min -= 0.001;
        this.y_max += 0.001;

        // Compute scales
        this.x_scale = G_WIDTH / (this.x_max - this.x_min);
        this.y_scale = G_HEIGHT / (this.y_max - this.y_min);
        this.d_scale = (C_HEIGHT - P_HEIGHT) / this.d_max;
    }

    // Plot Theoretical Gravity values.
    plotTheory()
    {
        let temp_1, temp_2;
        for(let x = this.x_min; x <= this.x_max-this.dx; x += this.dx)
        {
            temp_1 = this.getG(x);
            temp_2 = this.getG(x + this.dx);
            this.drawLine(this.getDX(x), this.getDY(temp_1), this.getDX(x + this.dx), this.getDY(temp_2));
        }
    }

    // Plot Observed Gravity Values.
    plotData()
    {
        for(let i = 0; i < this.n_data; i++)
            this.drawSurveyPoint(this.getDX(this.x_data[i])-3, this.getDY(this.g_data[i])-3);
    }

    plotXSection()
    {
        // Anomaly Object's Outside Radius
        let anomaly_outside_radius = new Circle(ctx, this.getDX(this.x_loc) - Math.trunc(this.rad * this.d_scale), 
                                                this.getTY() - Math.trunc(this.rad * this.d_scale)+1, 
                                                Math.trunc(this.rad * this.d_scale * 2), 
                                                "#FF0000");
        
        let anomaly_inside_radius = new Circle(ctx, this.getDX(this.x_loc) - Math.trunc(this.rad * this.x_scale), 
                                                this.getTY() - Math.trunc(this.rad * this.x_scale)+1, 
                                                Math.trunc(this.rad * this.x_scale * 2), 
                                                "#000000");

        
        

        // Draw grass rectangle.
        ctx.beginPath();
        ctx.fillStyle = "#68BB59";
        ctx.rect(this.ul_cor_x - 20, P_HEIGHT, G_WIDTH + 40, C_HEIGHT - 50);
        ctx.fill();
       
        ctx.drawImage(this.tree, 50, 238);
        
        anomaly_outside_radius.draw();
        anomaly_inside_radius.draw();
        
        ctx.beginPath();
        ctx.fillStyle = "#FFFFFF";
        ctx.rect(this.ul_cor_x - 65, this.ul_cor_y-50, 45, C_HEIGHT+20);
        ctx.rect(this.ur_cor_x + 20, this.ur_cor_y-50, 52, C_HEIGHT+20);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
       
        ctx.fill();


        ctx.closePath();

    }

    drawAxis()
    {
        ctx.beginPath();
        ctx.fillStyle = "#000000"
        ctx.strokeStyle = "#000000";
        ctx.font = "12px Arial";

        //Draw x axis first
        this.drawLine(this.ul_cor_x, this.ul_cor_y, this.ur_cor_x, this.ur_cor_y, "#000000");
        for(let x_interval = this.x_min; x_interval <= this.x_max; x_interval += 50)
        {
            this.drawLine(this.getDX(x_interval), this.ul_cor_y, this.getDX(x_interval), this.ul_cor_y-5, "#000000");
            ctx.fillText(x_interval, this.getDX(x_interval)-5, this.ul_cor_y-8);
        }
        ctx.fillText("Distance (m)", C_WIDTH/2 - 30, 25);

        this.drawLine(this.ur_cor_x+20, this.ur_cor_y, this.lr_cor_x+20, this.lr_cor_y, "#000000");
        for(let y_interval = this.y_min; y_interval <= this.y_max; y_interval += Math.abs(this.y_max-this.y_min)/5.0)
        {
            this.drawLine(this.ur_cor_x+20, this.getDY(y_interval), this.ur_cor_x+15, this.getDY(y_interval), "#000000");
            ctx.fillText(y_interval.toFixed(3), 22 + this.ur_cor_x, this.getDY(y_interval)+5);
        }
        ctx.fillText("Gravity (mgal)", this.lr_cor_x - 30, this.lr_cor_y + 20);

        // Depth scale
        this.drawLine(this.ur_cor_x+20, P_HEIGHT, this.lr_cor_x+20, C_HEIGHT, "#000000");
        for(let y_interval = 0; y_interval <= this.d_max; y_interval += this.d_max / 5.0)
        {
            this.drawLine(this.ur_cor_x+20, Math.trunc(P_HEIGHT + y_interval * this.d_scale), this.ur_cor_x+15, Math.trunc(P_HEIGHT + y_interval * this.d_scale), "#000000");
            ctx.fillText(y_interval.toFixed(1), this.ur_cor_x+28, Math.trunc(P_HEIGHT + y_interval * this.d_scale)+5);
        }
        ctx.fillText("Depth (m)", this.ur_cor_x - 50, C_HEIGHT - 10);
        ctx.stroke();
  
    }

    drawLine(x1, y1, x2, y2, color="#CC0000")
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
    
    // Compute x pixel location in data graphic
    getDX(x)
    {
        return Math.trunc((( (x-this.x_min) * this.x_scale+this.ll_cor_x )));
    }

     // Compute y pix location in data graphic 
    getDY(y)
    {
        return Math.trunc((( (this.y_max-y) * this.y_scale + this.ul_cor_y )));
    }

    // Compute y pix location of tunnel graphic
    getTY()
    {
        return Math.trunc(this.depth * this.d_scale + P_HEIGHT);
    }

    // Compute gravity at a given x location
    getG(x)
    {
        let save = null;
        save = ( 4.0 * G * Math.PI * Math.pow(this.rad, 3.0) * this.depth * this.rho / 
        (3.0 * Math.pow(((x - this.x_loc) * (x - this.x_loc) + (this.depth * this.depth)), 1.5)) 
        * Math.pow(10.0, 8.0) + this.bias );

        return save;
    }

    // Sets the the sliders 
    setSliders()
    {
        let s_value = null;

        // Set Density Contrast
        s_value = Math.trunc( (this.rho - this.rho_min) * (this.slider_rho_max - this.slider_rho_min) /
        (this.rho_max - this.rho_min) + this.slider_rho_min + 0.5 );
        rho_slider.value = s_value;
        rho_slider.min = this.slider_rho_min;
        rho_slider.max = this.slider_rho_max;

        // Set Bias
        s_value = Math.trunc( (this.bias - this.bias_min) * (this.slider_bias_max - this.slider_bias_min) /
        (this.bias_max - this.bias_min) + this.slider_bias_min + 0.5 );
        bias_slider.value = s_value;
        bias_slider.min = this.slider_bias_min;
        bias_slider.max = this.slider_bias_max;
    }

    setValues()
    {
        this.bias = this.getBiasFromSlider();
        this.rho = this.getRhoFromSlider();
    }

    rhoFormat(value, number_value=false)
    {
        let rho = ((value - 1) * this.d_rho + this.rho_min)
        if(number_value)
            return rho;
        return rho.toFixed(2);
    }

    biasFormat(value, number_value=false)
    {
        let bias = ((value - 1) * this.d_bias + this.bias_min)
        if(number_value)
            return bias;
        return bias.toFixed(2);
    }

    getBiasFromSlider()
    {
        let bias = this.biasFormat(bias_slider.value, true);
        return bias; 
    }

    getRhoFromSlider()
    {
        let rho = this.rhoFormat(rho_slider.value, true)
        return rho;
    }
    // Sets the table values
    setTableValues()
    {
        table_x_location.innerHTML = this.x_loc+" m";
        table_depth.innerHTML = this.depth.toFixed(1)+" m";
        table_radius.innerHTML = this.rad.toFixed(1)+" m";
        table_rho.innerHTML = this.rho.toFixed(3)+" gm/cm^3";
        table_bias.innerHTML = this.bias.toFixed(3)+" mgal";
    }

}
let gravity_sphere = new GravitySphere();
gravity_sphere.start();

// LOAD THE TREE
gravity_sphere.tree.onload = function()
{
    ctx.drawImage(gravity_sphere.tree, 50, 238);
};
gravity_sphere.tree.src = "../../../images/tree.png";



