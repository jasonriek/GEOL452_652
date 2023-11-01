/*
RESISTIVITY SOUNDINGS OVER LAYERED STRUCTURES

AUTHOR: Jason Reek (JavaScript)
DATE: 4/18/2020

"This applet allows the user to generate synethic resistivity
 soundings over a layered earth model consisting of two layers
 over a halfspace."

 -Tom Boyd (Original Java Author 2/16/97)
*/

// Canvas 
//***************************************************************************************
const graph_canvas = document.getElementById("res-graph");
const survey_canvas = document.getElementById("survey-canvas");
const layer_canvas = document.getElementById("layer-graph");
const graph_ctx = graph_canvas.getContext("2d");
const survey_ctx = survey_canvas.getContext("2d");
const layer_ctx = layer_canvas.getContext("2d");
const LAYER_W = 300;
const LAYER_H = 350;

// Define width and height of plotting area. 
const G_WIDTH = 350; 
const G_HEIGHT = 350;
//***************************************************************************************

// Survey Design Page Items
//***************************************************************************************
// Survey Design Sliders
const e_start_slider = document.getElementById("e-start-slider");
const n_dec_slider = document.getElementById("n-dec-slider");
const es_per_dec_slider = document.getElementById("es-per-dec-slider");
const max_amp_slider = document.getElementById("max-amp-slider");
const std_slider = document.getElementById("std-slider");
const n_data_slider = document.getElementById("n-data-slider");

// Survey Design Radio Buttons
const is_schlum_radio = document.getElementById("is-schlum-radio");
const is_wenner_radio = document.getElementById("is-wenner-radio");

// Survey Design Table Values 
const e_start_val = document.getElementById("e-start-val");           
const n_dec_val = document.getElementById("n-dec-val");     
const es_per_dec_val = document.getElementById("es-per-dec-val");       
const std_val = document.getElementById("std-val");   
const max_amp_val = document.getElementById("max-amp-val"); 
const n_data_val = document.getElementById("n-data-val");
//***************************************************************************************

// Earth Model Layer Page Items
//***************************************************************************************
// Layer Sliders
const res_toplayer_slider = document.getElementById("res-toplayer");
const res_midlayer_slider = document.getElementById("res-midlayer");
const res_botlayer_slider = document.getElementById("res-botlayer");

// Layer Table Values 
const res_toplayer_val = document.getElementById("res-toplayer-val");           
const thick_toplayer_val = document.getElementById("thick-toplayer-val");     
const res_midlayer_val = document.getElementById("res-midlayer-val");   
const thick_midlayer_val = document.getElementById("thick-midlayer-val");     
const res_botlayer_val = document.getElementById("res-botlayer-val");   
//***************************************************************************************
const TICK_SIZE = 7;
var inter; 

// function value to produce normal distributed values clustered around a mean.
function gaussianRand()
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

// Sets the input slider
function setSlider(slider, valf, min, max, minbar, maxbar)
{
    let s_value = Math.trunc((valf-min) * (maxbar - minbar) / (max - min) + minbar + 0.5);
    slider.value = s_value;
    slider.min = minbar;
    slider.max = maxbar;
}

// Earth Layer Model (Right Canvas on Page)
class EarthModel
{
    constructor()
    {
        layer_canvas.width = LAYER_W;
        layer_canvas.height = LAYER_H+5;

        //Now define minimum and maximum values in user space
        //and corresponding maximums and minimums for the scroll bars
        //that must be integers
        this.Rho1Min = 5.0; //meters
        this.Rho1Max = 5000.0;
        this.dRho1 = 5.0; //Increment in Spacing allowed
        this.Rho1BarMin = 1; //Minimum Scroll Bar Value
        this.Rho1BarMax = Math.trunc((this.Rho1Max - this.Rho1Min) / this.dRho1 + 2.1); //Maximum Scroll Bar Value
        this.Rho2Min = 5.0; //meters
        this.Rho2Max = 5000.0;
        this.dRho2 = 5.0; //Increment in Spacing allowed
        this.Rho2BarMin = 1; //Minimum Scroll Bar Value
        this.Rho2BarMax = Math.trunc((this.Rho2Max - this.Rho2Min) / this.dRho2 + 2.1); //Maximum Scroll Bar Value
        this.Rho3Min = 5.0; //meters
        this.Rho3Max = 5000.0;
        this.dRho3 = 5.0; //Increment in Spacing allowed
        this.Rho3BarMin = 1; //Minimum Scroll Bar Value
        this.Rho3BarMax = Math.trunc((this.Rho3Max - this.Rho3Min) / this.dRho3 + 2.1); //Maximum Scroll Bar Value
        
        // Define Variables used to some initial values
        this.rho1f = 100.0;
        this.h1f = 5.0;
        this.rho2f = 10.0;
        this.h2f = 5.0;
        this.rho3f = 1000.0;
        this.svalue = null; // variable used to construct scrollbars

        // Define values for drawing figures in frame
        this.xsectx = 300; //size of xsection part of frame
        this.xsecty = 350;
        this.surfacey = 150; //y location of surface of the earth
        this.DepthMax = 25.0; //Maximum xsection depth (m)
        this.MinThickness = 0.5; //Minimum layer thickness allowed
        this.yscale = (this.xsecty - this.surfacey) / this.DepthMax;
        layer_ctx.font = "12px Arial";

        // Set the sliders 
        this.setSliders(); 

        // Set Colors
        this.sky_color = "#8cd9e3";
        this.layer_1_color = "#6ebf8a";
        this.layer_2_color = "#a38c75";
        this.layer_3_color = "#999999";
        
        // Flags used to identify which layer is to be dragged.
        this.last_y1 = 0;
        this.last_y2 = 0;

        this.mouse_down = false;
    
    }

    paint()
    {
        let depth = null;
        layer_ctx.beginPath();
        // Clear Frame
        layer_ctx.clearRect(0, 0, layer_canvas.width, layer_canvas.height);
        
        // Set Sky Color
        layer_ctx.fillStyle = this.sky_color;
        layer_ctx.fillRect(5, 
                           50, 
                           this.xsectx - 50, 
                           this.surfacey);
        
        // Plot Top Layer 
        layer_ctx.fillStyle = this.layer_1_color;
        layer_ctx.fillRect(5, 
            this.surfacey, 
            this.xsectx - 50, 
            this.xsecty);

        // Plot Middle Layer
        layer_ctx.fillStyle = this.layer_2_color;
        layer_ctx.fillRect(5, 
                           this.surfacey + Math.trunc(this.h1f * this.yscale), 
                           this.xsectx - 50,
                           Math.trunc(this.h2f * this.yscale));     
        
        // Plot Bottom Layer
        layer_ctx.fillStyle = this.layer_3_color;
        layer_ctx.fillRect(5, 
                           this.surfacey + Math.trunc((this.h1f + this.h2f) * this.yscale), 
                           this.xsectx - 50, 
                           (this.xsecty - (this.surfacey + Math.trunc((this.h1f + this.h2f)*this.yscale)))+5);
        
        // Plot lines across each boundary. 
        this.drawLine(5, this.surfacey, this.xsectx - 45, this.surfacey);
        this.drawLine(5, Math.trunc(this.surfacey + this.h1f * this.yscale), this.xsectx - 45, Math.trunc(this.surfacey + this.h1f * this.yscale));
        this.drawLine(5, Math.trunc(this.surfacey + (this.h1f + this.h2f) * this.yscale), this.xsectx - 45, Math.trunc(this.surfacey + (this.h1f + this.h2f) * this.yscale));
        
        //Plot Depth Axes
        layer_ctx.fillStyle = "#000000";
        this.drawLine(this.xsectx - 45, this.surfacey, this.xsectx - 45, this.xsecty+5);
        for (depth = 0.0; depth <= this.DepthMax; depth += 5.0) {
            this.drawLine(this.xsectx - 45,
                          this.surfacey + Math.trunc(depth * this.yscale), this.xsectx - 40,
                          this.surfacey + Math.trunc(depth * this.yscale));
            layer_ctx.fillText(depth.toString()+"", this.xsectx - 35, this.surfacey + Math.trunc(depth * this.yscale) + 5);
        }
        layer_ctx.fillText("Depth", this.xsectx - 42, this.surfacey - 25);
        layer_ctx.fillText("(m)", this.xsectx - 38, this.surfacey - 10);
        this.updateTable();
    }

    //Method to test the location of the last mouse click. If it is
    //near either horizontal line representing the bottoms of layers
    //1 or 2. Flag a variable that will allow these layer boundaries
    //to be moved as the mouse is dragged.
    selectLayer(event)
    {
        this.mouse_down = true;
        // Get mouse location.
        let x = event.offsetX;
        let y = event.offsetY;

        // Current location of bottom of layer 1 in pixels/
        let cy1 = Math.trunc(this.surfacey + this.h1f * this.yscale);
        // Current location of bottom of lyaer 2 in pixels.
        let cy2 = Math.trunc(this.surfacey + (this.h1f + this.h2f) * this.yscale);
        // Acceptable error allowed in mouse click around layer boundary. 
        let diff = 5;

        // Flags used to identify which layer is to be dragged. 
        this.last_y1 = 0;
        this.last_y2 = 0;

        // First see if we are near bottom of layer 1
        if((y >= cy1 - diff) && (y <= cy1 + diff))
        {
            this.last_y1 = y;
            return;
        }
        // Now see if we are near bottom of layer 2
        if((y >= cy2 - diff) && (y <= cy2 + diff))
        {
            this.last_y2 = y;
            return;
        }
        return; 
    }

    updateTable()
    {
        thick_toplayer_val.innerHTML = this.h1f.toFixed(1)+" m";
        res_toplayer_val.innerHTML = this.rho1f.toFixed(1)+" Ohm-m";
        res_midlayer_val.innerHTML = this.rho2f.toFixed(1)+" Ohm-m";
        thick_midlayer_val.innerHTML = this.h2f.toFixed(1)+" m";
        res_botlayer_val.innerHTML = this.rho3f.toFixed(1)+" Ohm-m";
    }

    // If mouse was initiated near a layer boundary, move that boundary
    // recompute depths, update appropriate values, and notify parent
    // to update itself. To smooth updating, only allow updates after
    // mouse has moved at least 5 pixels. Don't allow boundaries to move
    // above the surface or below DepthMax. Also don't allow layers to
    // become thinner than MinThickness. 
    moveLayer()
    {
        // Get mouse location.
        let x = event.offsetX;
        let y = event.offsetY;
        let dist = null;
        let temp = null;
        // Now see if we are moving bottom of layer 1
        // Do not allow layer one bottom to come above the surface
        // or below the bottom of layer 2. 
        if(this.mouse_down)
        {
            if ((this.last_y1 != 0) && (y >= (this.surfacey + this.MinThickness * this.yscale)) && (this.xsecty >= (y + this.h2f * this.yscale))) 
            {
                dist = Math.abs(y - this.last_y1);
                if (Math.abs(dist) >= this.yscale * this.MinThickness) 
                {
                    this.h1f = (y - this.surfacey) / this.yscale;
                    // Move h1f to the nearest MinThickness
                    temp = Math.trunc((this.h1f + this.MinThickness / 2.0) / this.MinThickness);
                    this.h1f = temp * this.MinThickness;
                    y = Math.trunc(this.h1f * this.yscale) + this.surfacey;
                    this.last_y1 = y;
                    this.paint();
                    return;
                }
            this.paint();
            return;
            }
            //Do the same for bottom of layer 2
            if ((this.last_y2 != 0) && (y >= Math.trunc(this.surfacey + (this.h1f + this.MinThickness) * this.yscale)) && (y <= Math.trunc(this.surfacey + this.DepthMax * this.yscale))) 
            {
                dist = Math.abs(y - this.last_y2);
                if (dist >= this.yscale * this.MinThickness) 
                {
                    this.h2f = (y - (this.h1f * this.yscale) - this.surfacey) / this.yscale;
                    // Move h2f to the nearest MinThickness
                    temp = Math.trunc((this.h2f + this.MinThickness / 2.0) / this.MinThickness);
                    this.h2f = temp * this.MinThickness;
                    y = Math.trunc(this.h2f * this.yscale) + this.surfacey + Math.trunc(this.h1f * this.yscale);
                    this.last_y2 = y;
                    return;
                }
                this.paint();
                return;
            }
        }
        this.paint();
        return;
    }

    mouseUp()
    {
        this.mouse_down = false;
    }
    
    setSliders()
    {
        setSlider(res_toplayer_slider, this.rho1f, this.Rho1Min, this.Rho1Max, this.Rho1BarMin, this.Rho1BarMax);
        setSlider(res_midlayer_slider, this.rho2f, this.Rho2Min, this.Rho2Max, this.Rho2BarMin, this.Rho2BarMax);
        setSlider(res_botlayer_slider, this.rho3f, this.Rho3Min, this.Rho3Max, this.Rho3BarMin, this.Rho3BarMax);
    }

    rho1Adjustment(value)
    {
        let s_value = value;
        
        // Convert slider value to radius. 
        this.rho1f = (s_value - 1) * this.dRho1 + this.Rho1Min;

        // Make sure resistivities do not exceed maximum and minimums. 
        if (this.rho1f < this.Rho1Min)
            this.rho1f = this.Rho1Min;
        if (this.rho1f > this.Rho1Max)
            this.rho1f = this.Rho1Max;
        
        // Do not allow all three resistivities to be the same
        if (this.rho1f == this.rho2f && this.rho2f == this.rho3f)
            this.rho1f += 10.0;
        if (this.rho1f > this.Rho1Max)
            this.rho1f -= 20.0;
        setSlider(res_toplayer_slider, this.rho1f, this.Rho1Min, this.Rho1Max, this.Rho1BarMin, this.Rho1BarMax);
    }

    rho2Adjustment(value)
    {
        let s_value = value;
        
        // Convert slider value to radius. 
        this.rho2f = (s_value - 1) * this.dRho2 + this.Rho2Min;

        // Make sure resistivities do not exceed maximum and minimums. 
        if (this.rho2f < this.Rho2Min)
            this.rho2f = this.Rho2Min;
        if (this.rho2f > this.Rho2Max)
            this.rho2f = this.Rho2Max;
        
        // Do not allow all three resistivities to be the same
        if (this.rho1f == this.rho2f && this.rho2f == this.rho3f)
            this.rho2f += 10.0;
        if (this.rho2f > this.Rho2Max)
            this.rho2f -= 20.0;
        setSlider(res_midlayer_slider, this.rho2f, this.Rho2Min, this.Rho2Max, this.Rho2BarMin, this.Rho2BarMax);
        
    }

    rho3Adjustment(value)
    {
        let s_value = value;
        
        // Convert slider value to radius. 
        this.rho3f = (s_value - 1) * this.dRho3 + this.Rho3Min;

        // Make sure resistivities do not exceed maximum and minimums. 
        if (this.rho3f < this.Rho3Min)
            this.rho3f = this.Rho3Min;
        if (this.rho3f > this.Rho3Max)
            this.rho3f = this.Rho3Max;
        
        // Do not allow all three resistivities to be the same
        if (this.rho1f == this.rho2f && this.rho2f == this.rho3f)
            this.rho3f += 10.0;
        if (this.rho3f > this.Rho3Max)
            this.rho3f -= 20.0;
        setSlider(res_botlayer_slider, this.rho3f, this.Rho3Min, this.Rho3Max, this.Rho3BarMin, this.Rho3BarMax);
    }

     // Draw line function
     drawLine(x1, y1, x2, y2, color="#000000")
     {
         layer_ctx.beginPath();
         layer_ctx.moveTo(x1, y1);
         layer_ctx.lineTo(x2, y2);
         layer_ctx.lineWidth = 2;
         layer_ctx.strokeStyle = color;
         layer_ctx.stroke();
     }
}
let earth_model = new EarthModel();

// Survey Canvas (Left Canvas on Page)
class SurveyModel
{
    constructor()
    {
         //Define Color for Grass
        this.grass_color = "#6ebf8a";

        // Now define minimum and maximum values in user space
        // and corresponding maximums and minimums for the scroll bars
        // that must be integers
        this.EStartMin = 0.1; //meters
        this.EStartMax = 1.0;
        this.dEStart = 0.1; //Increment in Spacing allowed
        this.EStartBarMin = 1; //Minimum Scroll Bar Value
        this.EStartBarMax = Math.trunc((this.EStartMax - this.EStartMin) / this.dEStart + 2.1);
        this.SPerDecMin = 1; //Electrode spacing per decade in distance
        this.SPerDecMax = 20;
        this.dSPerDec = 1; //Increment in Spacing allowed
        this.SPerDecBarMin = 1; //Minimum Scroll Bar Value
        this.SPerDecBarMax = Math.trunc((this.SPerDecMax - this.SPerDecMin) / this.dSPerDec + 2.1);
        this.NDecMin = 1; //Decades in distance overwhich data is collected
        this.NDecMax = 5;
        this.dNDec = 1;
        this.NDecBarMin = 1; //Minimum Scroll Bar Value
        this.NDecBarMax = Math.trunc((this.NDecMax - this.NDecMin) / this.dNDec + 2.1); //Maximum Scroll Bar Value
        this.StdMin = 0.0; //Standard Deviation of reading in volts
        this.StdMax = 0.1;
        this.dStd = 0.001;
        this.StdBarMin = 1; //Minimum Scroll Bar Value
        this.StdBarMax = Math.trunc((this.StdMax - this.StdMin) / this.dStd + 2.1);
        this.MaxAmpMin = 0.1; //Maximum Current deliverable
        this.MaxAmpMax = 2.5;
        this.dMaxAmp = 0.1;
        this.MaxAmpBarMin = 1; //Minimum Scroll Bar Value
        this.MaxAmpBarMax = Math.trunc((this.MaxAmpMax - this.MaxAmpMin) / this.dMaxAmp + 2.1);
        this.NDataMin = 1;
        this.NDataMax = 50;
        this.dNData = 1;
        this.NDataBarMin = 1; //Minimum Scroll Bar Value
        this.NDataBarMax = Math.trunc((this.NDataMax - this.NDataMin) / this.dNData + 2.1);
 
        //Define Variables used to some initial values
        this.estartf = 0.25;
        this.sperdecf = 6;
        this.ndecf = 3;
        this.stdf = 0.01;
        this.maxampf = 0.5;
        this.ndataf = 5;
        this.schlum = true; //Survey type identifier
        this.svalue; //variable used to construct scrollbars
        this.x_offset = 0
        this.y_offset = 40
 
        //Define values for drawing figures in frame
        this.gminy = 100; //Establish y coordinates of plotting area
        this.gwidthy = 90;

        survey_canvas.width = 500;
        survey_canvas.height = this.gminy;
        this.setSliders(); 
    }

    paint()
    {
        let lint = null;
        let ldist = null;
        let distance = null;
        let dx = null;
        let fdist = this.estartf * Math.pow(10.0, (this.ndecf - 1));
        let maxdist = fdist + this.sperdecf * (fdist * 10.0 - fdist) / this.sperdecf;
        if (!this.schlum)
            maxdist *= 1.5;
        let xscale = survey_canvas.width / (3.0 * maxdist)
        let grass_rect = new Rectangle(survey_ctx, 0, 0, survey_canvas.width, survey_canvas.height, this.grass_color);
        let radius = (((this.gminy - 20)/2)/2);
        let circle_x = (survey_canvas.width/2)-radius/2;
        let circle_y = (survey_canvas.height/2)-radius/2;
        let sounding_center_circle = new Circle(survey_ctx, circle_x, circle_y, radius, "#CC0000", 1);

        // Clear plot
        survey_ctx.clearRect(0, 0, survey_canvas.width, survey_canvas.height);
        grass_rect.draw();
        sounding_center_circle.draw();
        
        survey_ctx.fillStyle = "#000000";
        if(this.schlum)
            survey_ctx.fillText("Schlumberg Sounding", (survey_canvas.width/2)-50, 25);
        else
            survey_ctx.fillText("Wenner Sounding", (survey_canvas.width/2)-40, 25);
        
        // Plot current electrode spacings given by survey design
        // First mark sounding center location

        // Now compute and plot locations of current electrodes.
        for (let i = 0; i < this.ndecf; i++) 
        {
            fdist = this.estartf * Math.pow(10.0, i);
            lint = 1.0 / this.sperdecf;
            for (let j = 0; j < this.sperdecf; j++) 
            {
                ldist = 0.4342944819 * Math.log(fdist) + (j * lint);
                distance = Math.pow(10.0, ldist);
                if (!this.schlum)
                    distance *= 1.5;
                dx = distance * xscale;
                this.drawSurveyPoint(Math.trunc(survey_canvas.width / 2 + dx)+this.x_offset, Math.trunc(this.gminy + this.gwidthy / 2 - 2)-this.y_offset);
                this.drawSurveyPoint(Math.trunc(survey_canvas.width / 2 - dx)-this.x_offset, Math.trunc(this.gminy + this.gwidthy / 2 - 2)-this.y_offset);
            }
        }
        distance = fdist + this.sperdecf * (fdist * 10.0 - fdist) / this.sperdecf;
        if (!this.schlum)
            distance *= 1.5;
        dx = distance * xscale;
        this.drawSurveyPoint(Math.trunc(survey_canvas.width / 2 + dx - 2)+this.x_offset, Math.trunc(this.gminy + this.gwidthy / 2 - 2)-this.y_offset);
        this.drawSurveyPoint(Math.trunc(survey_canvas.width / 2 - dx - 2)-this.x_offset, Math.trunc(this.gminy + this.gwidthy / 2 - 2)-this.y_offset);

        survey_ctx.fillStyle = "#000000";
        // Now Plot distance axes
        this.drawLine(Math.trunc(survey_canvas.width / 2 - maxdist * xscale)-1,
                        Math.trunc(this.gminy + this.gwidthy / 2 - 70),
                        Math.trunc(survey_canvas.width / 2 + maxdist * xscale)+1,
                        Math.trunc(this.gminy + this.gwidthy / 2 - 70));
        for (fdist = 0; fdist <= maxdist; fdist += (maxdist / 3.0)) 
        {
            dx = fdist * xscale;
            this.drawLine(Math.trunc(survey_canvas.width / 2 + dx),
                                Math.trunc(this.gminy + this.gwidthy / 2 - 70),
                                Math.trunc(survey_canvas.width / 2 + dx),
                                Math.trunc(this.gminy + this.gwidthy / 2 - 65));
            if (fdist != 0.0)
            {
                let fixed_width = 2;
                if(fdist > 9)
                    fixed_width = 1;

                survey_ctx.fillText(fdist.toFixed(fixed_width), Math.trunc(survey_canvas.width / 2 + dx)-5, Math.trunc(this.gminy + this.gwidthy / 2 - 55));
                survey_ctx.fillText(fdist.toFixed(fixed_width), Math.trunc(survey_canvas.width / 2 - dx)-5, Math.trunc(this.gminy + this.gwidthy / 2 - 55));
            }

            this.drawLine(Math.trunc(survey_canvas.width / 2 - dx),
                                Math.trunc(this.gminy + this.gwidthy / 2 - 70),
                                Math.trunc(survey_canvas.width / 2 - dx),
                                Math.trunc(this.gminy + this.gwidthy / 2 - 65));
        }
        survey_ctx.fillText("Distance (m)", survey_canvas.width / 2 - 45 / 2, 90);
    }

    setSliders()
    {
        setSlider(e_start_slider, this.estartf, this.EStartMin, this.EStartMax, this.EStartBarMin, this.EStartBarMax);
        setSlider(es_per_dec_slider, this.sperdecf, this.SPerDecMin, this.SPerDecMax, this.SPerDecBarMin, this.SPerDecBarMax);
        setSlider(n_dec_slider, this.ndecf, this.NDecMin, this.NDecMax, this.NDecBarMin, this.NDecBarMax);
        setSlider(std_slider, this.stdf, this.StdMin, this.StdMax, this.StdBarMin, this.StdBarMax);
        setSlider(max_amp_slider, this.maxampf, this.MaxAmpMin, this.MaxAmpMax, this.MaxAmpBarMin, this.MaxAmpBarMax);
        setSlider(n_data_slider, this.ndataf, this.NDataMin, this.NDataMax, this.NDataBarMin, this.NDataBarMax);
    }

    eStartAdjustment(value)
    {
        let svalue = value;

        // Convert to radius
        this.estartf = (svalue - 1) * this.dEStart + this.EStartMin;

        // Make sure spacing does not exceed maximum and minimums.
        //Make sure spacing does not exceed maximum and minimums
        if (this.estartf < this.EStartMin)
            this.estartf = this.EStartMin;
        if (this.estartf > this.EStartMax)
            this.estartf = this.EStartMax;
    }

    sPerDecAdjustment(value)
    {
        let svalue = value;

        // Convert value to radius
        this.sperdecf = Math.trunc((svalue - 1) * this.dSPerDec + this.SPerDecMin);

        // Make sure spacing does not exceed maximum and minimums
        if (this.sperdecf < this.SPerDecMin)
            this.sperdecf = this.SPerDecMin;
        if (this.sperdecf > this.SPerDecMax)
            this.sperdecf = this.SPerDecMax;
    }

    nDecAdjustment(value)
    {
        let svalue = value;

        // Convert value to radius
        this.ndecf = Math.trunc((svalue - 1) * this.dNDec + this.NDecMin);

        //Make sure number of decades does not exceed maximum and minimums
        if (this.ndecf < this.NDecMin)
            this.ndecf = this.NDecMin;
        if (this.ndecf > this.NDecMax)
            this.ndecf = this.NDecMax;
    }

    stdAdjustment(value)
    {
        let svalue = value;

        //Convert scrollbar value to radius
        this.stdf = ((svalue - 1) * this.dStd + this.StdMin);

        //Make sure standard deviation does not exceed maximum and minimums
        if (this.stdf < this.StdMin)
            this.stdf = this.StdMin;
        if (this.stdf > this.StdMax)
            this.stdf = this.StdMax;
    }

    maxAmpAdjustment(value)
    {
        let svalue = value;

        // Convert value to radius
        this.maxampf = ((svalue - 1) * this.dMaxAmp + this.MaxAmpMin);

        // Make sure amperage does not exceed maximum and minimums. 
        if (this.maxampf < this.MaxAmpMin)
            this.maxampf = this.MaxAmpMin;
        if (this.maxampf > this.MaxAmpMax)
            this.maxampf = this.MaxAmpMax;
    }

    nDataAdjustment(value)
    {
        let svalue = value;
        //Convert scrollbar value to radius
        this.ndataf = Math.trunc((svalue - 1) * this.dNData + this.NDataMin);

        //Make sure ndata does not exceed maximum and minimums
        if (this.ndataf < this.NDataMin)
                this.ndataf = this.NDataMin;
        if (this.ndataf > this.NDataMax)
                this.ndataf = this.NDataMax;
    }
    // Draw line function
    drawLine(x1, y1, x2, y2, color="#000000")
    {
        survey_ctx.beginPath();
        survey_ctx.moveTo(x1, y1);
        survey_ctx.lineTo(x2, y2);
        survey_ctx.lineWidth = 2;
        survey_ctx.strokeStyle = color;
        survey_ctx.stroke();
    }

    // Draws a survey point on to the plot. 
    drawSurveyPoint(x, y, color="#0000bb")
    {
        let adj_y = Math.trunc(y/2); 
        survey_ctx.beginPath();
        survey_ctx.moveTo(x, adj_y);
        survey_ctx.arc(x, adj_y, 3, 0, 2*Math.PI);
        survey_ctx.lineWidth = 1;
        survey_ctx.fillStyle = color;
        survey_ctx.fill();
        survey_ctx.closePath();
    }
}
let survey_model = new SurveyModel();

class ResistivitySoundings
{
    constructor()
    {
        // Plot Title
        this.plot_title = document.getElementById("plot-title");
         //----Establish variables for survey design parameters----

        // Minimum electrode spacing (m).
        this.e_start = null;
        // Electrode spacings per decade in distance. 
        this.s_per_dec = null;
        // Number of decades in distance. 
        this.n_dec = null;
        // Standard deviation of observations (V). 
        this.std = null; 
        // Maximum amperage deliverable (A).
        this.max_amp = null;
        // Number of readings to make at each location. 
        this.n_data = null;
        // Sounding type is Schlumberger, [else Wenner]. 
        this.schlum = true;

        //----Establish variables for earth model----
        
        // Resistivity (Ohm-m) of top layer.
        this.rho_1 = null;
        // Resistivity of middle layer.
        this.rho_2 = null;
        // Resistivity of bottom layer (halfspace). 
        this.rho_3 = null;
        // Thickness of top layer (m). 
        this.h1 = null;
        // Thickness of middle layer. 
        this.h2 = null;

        //----Establish variables for generating applet graphics----

        // Now define the absolute coordinates of each of the four corners of
        // the plotting area.
        this.ul_cor_x = 0;
        this.ul_cor_y = 0;
        this.ur_cor_x = this.ul_cor_x + G_WIDTH;
        this.ur_cor_y = this.ul_cor_y;
        this.ll_cor_x = this.ul_cor_x;
        this.ll_cor_y = this.ul_cor_y + G_WIDTH;
        this.lr_cor_x = this.ur_cor_x;
        this.lr_cor_y = this.ll_cor_y;

        // Establish variables used for plot scaling
        this.d_min = null; 
        this.d_max = null; 
        this.r_min = null; 
        this.r_max = null; 
        this.d_scale = null; 
        this.r_scale = null;

        // Establish arrays for resistivity transfer function as defined
        // in Ghosh 1971. 
        this.bs = [0.0225, -0.0499, 0.1064, 0.1854, 1.9720, -1.5716, 0.4018, -0.0814, 0.0148];
        this.bw = [0.0284, 0.4582, 1.5662, -1.3341, 0.3473, -0.0935, 0.0416, -0.0253, 0.0179, -0.0067];

        // Establich arrays to hold raw resistivities computed at 1/3ln spacings
        // and the distances associated with each resistivity.
        this.res = new Array(500).fill(null);
        this.ldist = new Array(500).fill(null);
        this.temp = new Array(250).fill(null);
        
        // Number of data points before interpolation 3 data points per decade in electrode
        // spacing.
        this.ns_data = [];

        // Reflection coefficients
        this.k1 =  null;
        this.k2 = null;

        this.sky_color = "#8cd9e3";
    }

    start()
    { 
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

    // Set Minimum and Maximum values of plot and scales. Allow 10% on either
    // side of plot.
    setScales()
    { 
        // Initalize Variables
        // ---------------------------------------------------------------------
        
        // Distances
        this.d_min = this.e_start * 0.9;
        let fdist = this.e_start * Math.pow(10.0, (this.n_dec - 1));
        // Max Distance
        this.d_max = fdist + (this.sperdecf * (fdist * 10.0 - fdist) / this.sperdecf)
        this.d_max *= 1.1;
        // Resistivities
        this.r_min = this.rho_1 * 0.9;
        if (this.rho_2 < this.r_min)
            this.r_min = this.rho_2 * 0.9; 
        if (this.rho_3 < this.r_min)
            this.r_min = this.rho_3 * 0.9;
        this.r_max = this.rho_1 * 1.1;
        if (this.rho_2 > this.r_max)
            this.r_max = this.rho_2 * 1.1;
        if (this.rho_3 > this.r_max)
            this.r_max = this.rho_3 * 1.1;
        
        // Convert min and max values to log base 10 values. 
        this.d_min = 0.4342944819 * Math.log(this.d_min);
        this.d_max = 0.4342944819 * Math.log(this.d_max);
        this.r_min = 0.4342944819 * Math.log(this.r_min);
        this.r_max = 0.4342944819 * Math.log(this.r_max);

        // Set Scales
        this.d_scale = G_WIDTH / (this.d_max - this.d_min);
        this.r_scale = G_HEIGHT / (this.r_max - this.r_min);
    }

    paint()
    {
        graph_ctx.clearRect(0, 0, graph_canvas.width, graph_canvas.height);
        // Set Plot Scales
        this.setScales();

        // Generate plot - First put in some background colors
        let plot_rect = new Rectangle(graph_ctx, 1, 1, G_WIDTH-1, G_HEIGHT-1, this.sky_color);
        plot_rect.draw();

        // Write Plot Title
        if(this.schlum)
            this.plot_title.innerHTML = "Apparent Resistivity (Ohm-m) vs Electrode Spacing (AB/2)";
        else
            this.plot_title.innerHTML = "Apparent Resistivity (Ohm-m) vs Electrode Spacing (A)";
        
            
        //Put tick marks around plotting area
        //First the distance tick marks
        let xp = null; 
        let yp = null;
        let inc = null;
        for (let d = 0; d < this.n_dec; d++) 
        {
            // Tick Mark increment - Constant in Linear Space
            inc = (Math.pow(10.0, (this.d_min + d + 1)) - Math.pow(10.0, (this.d_min + d))) / 10.0;
            for (let t = 0; t < 10; t++) 
            {
                xp = this.XLoc(0.4342944819 * Math.log(Math.pow(10.0, (this.d_min + d)) + inc * t));
                yp = this.YLoc(this.r_min);
                this.drawLine(xp, G_HEIGHT, xp, G_HEIGHT-4);
                yp = this.YLoc(this.r_max);
                this.drawLine(xp, yp, xp, yp + 5);
            }
        }

            //Now put on resistivity tick marks
            let rt = null;
            for (let d = 0; d < Math.trunc(this.r_max - this.r_min) + 1; d++) 
            {
                // Tick Mark increment - Constant in Linear Space
                inc = (Math.pow(10.0, (this.r_min + d + 1)) - Math.pow(10.0, (this.r_min + d))) / 10.0;
                for (let t = 0; t < 10; t++) 
                {
                    rt = 0.4342944819 * Math.log(Math.pow(10.0, (this.r_min + d)) + inc * t);
                    if (rt <= this.r_max) 
                    {
                        yp = this.YLoc(rt);
                        xp = this.XLoc(this.d_min);
                        this.drawLine(xp, yp, xp + 5, yp);
                        xp = this.XLoc(this.d_max);
                        this.drawLine(G_WIDTH, yp, G_WIDTH - 4, yp);
                    }
                }
            }

            // Now Label Plot - Distances first
            graph_ctx.fillStyle = "#000000";
            for (inc = this.d_min; inc <= this.d_max; inc += 1.0) 
            {
                rt = Math.pow(10.0, inc);
                xp = this.XLoc(inc);
                yp = this.YLoc(this.r_min);
                graph_ctx.fillText(rt.toFixed(1), xp, yp + 16);
            }
            let label = "Electrode Spacing (m)";
            graph_ctx.fillText(label, graph_canvas.width/2 - (label.length*3), graph_canvas.height-20);

            // Now Resistivities
            for (inc = this.r_min; inc <= this.r_max; inc += 1.0) 
            {
                rt = Math.pow(10.0, inc);
                xp = this.XLoc(this.d_max);
                yp = this.YLoc(inc);
                graph_ctx.fillText(rt.toFixed(1), xp+9, yp);
            }
            
            // Compute resistivities over a given structure using the
            // method of Ghosh. These values are computed at 1/3ln spacings
            // and must be interpolated before general use.
            this.GetGhoshRes();

            let lint = null; 
            let ldist = null; 
            let lres = null;
            let fdist = null; 
            let resistivity = null;
            

            for (let i = 0; i < this.n_dec; i++) 
            {
                fdist = this.e_start * Math.pow(10.0, i);
                lint = 1.0 / this.sperdecf * Math.log(10.0);
                for (let j = 0; j < this.sperdecf; j++) 
                {
                    ldist = Math.log(fdist) + (j * lint);
                    resistivity = this.GetRes(ldist);
                    ldist *= 0.4342944819;
                    xp = this.XLoc(ldist);
                    lres = 0.4342944819 * Math.log(resistivity);
                    if (lres <= this.r_max && lres >= this.r_min) 
                    {
                        yp = this.YLoc(0.4342944819 * Math.log(resistivity));
                        this.drawSurveyPoint(xp - 4, yp - 4);
                    }
                }
            }


    }

    //Compute Reflection Coefficient arrays
    GetGhoshRes() 
    {
        
        this.k1 = (this.rho_2 - this.rho_1) / (this.rho_2 + this.rho_1);
        this.k2 = (this.rho_3 - this.rho_2) / (this.rho_3 + this.rho_2);
        
        //setup some need variables for computations
        let lambda = null;
        let lstart = Math.log(this.e_start);
        let dl = 1.0 / 3.0 * Math.log(10.0);
        this.ns_data = 3 * this.n_dec + 1;
                
        if (this.schlum)//compute values for a Schlumberger sounding
        {
            for (let i = 0; i < this.ns_data; i++) 
            {
                for (let j = -3; j <= 5; j++) 
                {
                    lambda = 1.0 / Math.exp(((i - j) * dl + lstart));
                    this.temp[i * 9 + j + 4] = this.rho_1 * (((1.0 + this.k1 * this.k2 * Math.exp(-2.0 * this.h2 * lambda)) + 
                    (this.k1 * Math.exp(- 2.0 * this.h1 * lambda) + 
                    this.k2 * Math.exp(-2.0 * lambda * (this.h1 + this.h2)))) / ((1.0 +
                    this.k1 * this.k2 * Math.exp(-2.0 * this.h2 * lambda)) - (this.k1 * Math.exp(- 2.0 * this.h1 * lambda) +
                    this.k2 * Math.exp(-2.0 * lambda * (this.h1 + this.h2)))));
                    
                }
            }
            
            for (let i = 0; i < this.ns_data; i++) 
            {
                this.res[i] = 0.0;
                for (let j = -3; j <= 5; j++)
                    this.res[i] += (this.bs[j + 3] * this.temp[i * 9 + j + 4]);
                this.ldist[i] = 1.05 * (i * dl + lstart);
            }
        } 
        else //compute values for a Wenner sounding
        {
            for (let i = 0; i < this.ns_data; i++) 
            {
                for (let j = -1; j <= 8; j++) 
                {
                    lambda = 1.0 / Math.exp(((i - j) * dl + lstart));
                    this.temp[i * 10 + j + 1] = this.rho_1 * (((1.0 + this.k1 * this.k2 *
                    Math.exp(-2.0 * this.h2 * lambda)) +
                    (this.k1 * Math.exp(- 2.0 * this.h1 * lambda) +
                    this.k2 * Math.exp(-2.0 * lambda * (this.h1 + this.h2)))) / ((1.0 +
                    this.k1 * this.k2 * Math.exp(-2.0 * this.h2 * lambda)) -
                    (this.k1 * Math.exp(- 2.0 * this.h1 * lambda) +
                    this.k2 * Math.exp(-2.0 * lambda * (this.h1 + this.h2)))));
                }
            }
            for (let i = 0; i < this.ns_data; i++) 
            {
                this.res[i] = 0.0;
                for (let j = -1; j <= 8; j++)
                    this.res[i] += (this.bw[j + 1] * this.temp[i * 10 + j + 1]);
                this.ldist[i] = 1.36 * (i * dl + lstart);
            }
        }       
    }


    // Compute resistivity at a desired distance by interpolating the
    // values computed in GetGhoshRes. Method used is that of Wiggins
    GetRes(lab02) 
    {
        let epsi = 0.0001;
        let a = -100.0;
        let denom = null;
        let j = 0;

        for (j; j < this.ns_data && a <= 0.0; j++)
            a = this.ldist[j] - lab02;
        j -= 2;
        this.dxj = lab02 - this.ldist[j];
        if (this.dxj == 0)
            return this.res[j];
            
        this.h = this.ldist[j + 1] - this.ldist[j];
        this.dxj1 = lab02 - this.ldist[j + 1];
        this.hs = this.h * this.h;
        this.hc = this.hs * this.h;
        this.dxjs = this.dxj * this.dxj;
        this.dxj1s = this.dxj1 * this.dxj1;
        this.dy = this.res[j + 1] - this.res[j];
        let am = this.dy / this.h;
        let amd = am;
        let amu = am;

        if (j != 0) 
        {
            let dxd = this.ldist[j] - this.ldist[j - 1];
            let dyd = this.res[j] - this.res[j - 1];
            amd = dyd / dxd;
        }
        let n1 = j + 1;
        if (n1 != this.ns_data - 1) 
        {
            this.dxu = this.ldist[j + 2] - this.ldist[j + 1];
            let dyu = this.res[j + 2] - this.res[j + 1];
            amu = dyu / this.dxu;
        }
        if (Math.abs(amd) > epsi)
            denom = Math.abs(amd);
        else
            denom = epsi;
        let wd = 1.0 / denom;
        if (Math.abs(am) > epsi)
            denom = Math.abs(am);
        else
            denom = epsi;
        let w = 1.0 / denom;
        if (Math.abs(amu) > epsi)
            denom = Math.abs(amu);
        else
            denom = epsi;
        let wu = 1.0 / denom;
        let sp = (wd * amd + w * am) / (wd + w);
        let sp1 = (w * am + wu * amu) / (w + wu);
        let t1 = this.res[j] * (this.dxj1s / this.hs + 2.0 * this.dxj * this.dxj1s / this.hc);
        let t2 = this.res[j + 1] * (this.dxjs / this.hs - 2.0 * this.dxj1 * this.dxjs / this.hc);
        let t3 = sp * this.dxj * this.dxj1s / this.hs;
        let t4 = sp1 * this.dxjs * this.dxj1 / this.hs;

        let res = t1 + t2 + t3 + t4;

        // Add random noise to potential measurement. First convert
        // apparent resistivity to voltage.
        let dist = Math.exp(lab02);
        let geofact = null;
        if (this.schlum)//Assume MN=2dist/5
            geofact = (2.0 / (dist * 4.0 / 5.0) - 2.0 / (dist * 6.0 / 5.0));
        else
            geofact = 1.0 / dist;
        //Convert resistivity into potential difference  
        res *= (this.max_amp * geofact / (2.0 * Math.PI));

        //Add noise
        res += (gaussianRand() * this.std / Math.sqrt(this.n_data));

        //Convert back to resistivity
        res *= (2.0 * Math.PI / (this.max_amp * geofact));

        return Math.abs(res);
    }


    getParameters()
    {
        // Get Earth Model Parameters 
        this.rho_1 = earth_model.rho1f;
        this.rho_2 = earth_model.rho2f;
        this.rho_3 = earth_model.rho3f;
        this.h1 = earth_model.h1f;
        this.h2 = earth_model.h2f;

        // Get Survey Model Parameters
        this.e_start = survey_model.estartf;
        this.sperdecf = survey_model.sperdecf;
        this.n_dec = survey_model.ndecf;
        this.std = survey_model.stdf;
        this.max_amp = survey_model.maxampf;
        this.n_data = survey_model.ndataf;
    }

    getDX(x){return Math.trunc((x - this.x_min) * this.x_scale + this.ll_cor_x);}

    getDY(y){return Math.trunc((this.y_max - y) * this.y_scale + this.ul_cor_y);}

    // Return pixel value give log of a distance
    XLoc(logd) {return(Math.trunc((logd - this.d_min) * this.d_scale + this.ll_cor_x));}

    // Return pixel value give log of the resistivity
    YLoc(logr){return(Math.trunc((this.r_max - logr) * this.r_scale + this.ul_cor_y));}

    drawLine(x1, y1, x2, y2, color="#000000")
    {
        graph_ctx.beginPath();
        graph_ctx.moveTo(x1, y1);
        graph_ctx.lineTo(x2, y2);
        graph_ctx.lineWidth = 2;
        graph_ctx.strokeStyle = color;
        graph_ctx.stroke();
    }

    // Draws a survey point on to the plot. 
    drawSurveyPoint(x, y, color="#0000bb")
    {
        graph_ctx.beginPath();
        graph_ctx.moveTo(x, y);
        graph_ctx.arc(x, y, 4, 0, 2*Math.PI);
        graph_ctx.lineWidth = 1;
        graph_ctx.fillStyle = color;
        graph_ctx.fill();
        graph_ctx.closePath();
    }

    setTableValues()
    {
        /*
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
        */
    }

}
let res_sound_model = new ResistivitySoundings();


