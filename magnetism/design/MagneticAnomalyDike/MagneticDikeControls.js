/*
MAGNETIC DIKE CONTROLS
*/

const X_OFFSET = 100

// Dimension of arrow button: 64 X 64
const ARROW_BUTTON_SIZE = 64;

// Handles the Arrow button image tiles.
class ArrowImage extends Image
{
    constructor()
    {
        super();
        this.src = "../../../images/white_arrows.png";
    }
}
const ARROW_IMAGE = new ArrowImage();

class PressedArrowImage extends Image
 {
     constructor()
     {
         super();
         this.src = "../../../images/white_arrows_pressed.png";
     }
}
const PRESSED_ARROW_IMAGE = new PressedArrowImage();
 
class ArrowButton
{
    // First load sprite/sprite sheet 
    constructor(width, height, pressed=false)
    {
        if(pressed)
            this.image = PRESSED_ARROW_IMAGE;
        else
            this.image = ARROW_IMAGE;
        this.width = width;
        this.height = height;
    }
     
    draw(image_sheet_x, image_sheet_y, x, y)
    {
        r_ctx.drawImage(this.image, image_sheet_x, image_sheet_y, this.width, this.height, x, y, this.width, this.height);
    }
}


// Range Sliders
const dxf_slider = document.getElementById("station_spacing");
const k_slider = document.getElementById("Susceptability");
const n_of_obs_slider = document.getElementById("nOfObservations");
const std_dev_slider = document.getElementById("stdDev");
const b_slider = document.getElementById("dike_trend");
const inclination_slider = document.getElementById("incline_trend");
const LengthBar_slider = document.getElementById("profile_length");

class MagneticDikeController
{
    constructor()
    {
        this.left_arrow = new ArrowButton(64, 64);
        this.left_arrow_pressed = new ArrowButton(64, 64, true);
        this.left_arrow_x = 15;
        this.left_arrow_y = 90;
        this.left_arrow_down = false;
        
        this.right_arrow = new ArrowButton(64, 64);
        this.right_arrow_pressed = new ArrowButton(64, 64, true);
        this.right_arrow_x = 162;
        this.right_arrow_y = this.left_arrow_y
        this.right_arrow_down = false;
        
        this.up_arrow = new ArrowButton(64, 64);
        this.up_arrow_pressed = new ArrowButton(64, 64, true);
        this.up_arrow_x = 88;
        this.up_arrow_y = 22;
        this.up_arrow_down = false;

        this.down_arrow = new ArrowButton(64, 64);
        this.down_arrow_pressed = new ArrowButton(64, 64, true);
        this.down_arrow_x = this.up_arrow_x;
        this.down_arrow_y = 154;
        this.down_arrow_down = false;
        this.arrows_down = false; 
        this.counter = 0;

        this.DxMin = 0.25;   //meters
        this.DxMax = 10.0;
        this.dDx = 0.25;	//Increment in Spacing allowed
 
        this.KMin = 0.00001; 
        this.KMax = 0.1;
        this.dK = 0.00001;

        this.StdMin = 0.0;  
        this.StdMax = 50.0;
        this.dStd = 1.0;

        this.NMin = 1;
        this.NMax = 50;
        this.dN = 1;

        this.BMin = -90.0; //gm/cm^3
        this.BMax = 90.0;
        this.dB = 1.0;

        this.IncMin = -90;
        this.IncMax = 90;
        this.dInc = 1;

        // Now define user controllable plotting variables
        this.LengthMin = 50.0; //meters
        this.LengthMax = 500.0;
        this.dLength = 50.0;

        this.label_list_x_loc = X_OFFSET;
        this.label_list_y_loc  = 400;
    }

    paint()
    {
        r_ctx.clearRect(0, 0, width_canvas.width, width_canvas.height);
        r_ctx.fillStyle = "#000000";
        r_ctx.fillText("Depth: "+(magnetic_dike.depth2top).toFixed(1)+" m", 12, 12);
        r_ctx.fillText("Width: "+magnetic_dike.width.toFixed(1)+" m", 12, 24);
        r_ctx.fillText("Move to Surface ", 83, 19);
        r_ctx.fillText("Move to Deeper Depth", 70, 227);
        r_ctx.fillText("Decrease Width", 9, 87);
        r_ctx.fillText("Increase Width", 159, 87);
        
        if(this.left_arrow_down)
        {
            this.left_arrow_pressed.draw(0, 0, this.left_arrow_x, this.left_arrow_y);
            r_ctx.fillStyle = "#cc0000";
            r_ctx.fillText("Decrease Width", 9, 87);
        }
        else
            this.left_arrow.draw(0, 0, this.left_arrow_x, this.left_arrow_y);
            
        if(this.right_arrow_down)
        {
            this.right_arrow_pressed.draw(64, 0, this.right_arrow_x, this.right_arrow_y);
            r_ctx.fillStyle = "#cc0000";
            r_ctx.fillText("Increase Width", 159, 87);
        }
        else
            this.right_arrow.draw(64, 0, this.right_arrow_x, this.right_arrow_y);
            
        if(this.up_arrow_down)
        {
            this.up_arrow_pressed.draw(128, 0, this.up_arrow_x, this.up_arrow_y);
            r_ctx.fillStyle = "#cc0000";
            r_ctx.fillText("Move to Surface ", 83, 19);
        }
        else
            this.up_arrow.draw(128, 0, this.up_arrow_x, this.up_arrow_y);
            
        if(this.down_arrow_down)
        {
            this.down_arrow_pressed.draw(192, 0, this.down_arrow_x, this.down_arrow_y);
            r_ctx.fillStyle = "#cc0000";
            r_ctx.fillText("Move to Deeper Depth", 70, 227);
        }        
        else
            this.down_arrow.draw(192, 0, this.down_arrow_x, this.down_arrow_y);     
    }

    changeValues()
    {
        if(this.left_arrow_down)
        {
            if(magnetic_dike.width > -500)
                magnetic_dike.width -= 0.1;
        }
        else if(this.right_arrow_down)
        {
            if(magnetic_dike.width < 200)
                magnetic_dike.width += 0.1;
        }
        else if(this.up_arrow_down)
        {
            if(magnetic_dike.depth2top > 1)
                magnetic_dike.depth2top -= 0.1;
        }
        else if(this.down_arrow_down)
        {
            if(magnetic_dike.depth2top < 24)
                magnetic_dike.depth2top += 0.1;
        }
        this.frameChanged();
    }

    mouseInArrow(mouse_x, mouse_y, arrow_x, arrow_y)
    {
        if(mouse_x >= arrow_x && mouse_x <= arrow_x + ARROW_BUTTON_SIZE) // In the x Range 
            if(mouse_y >= arrow_y && mouse_y <= arrow_y + ARROW_BUTTON_SIZE) // In the y Range 
                return true;
        
        return false; 
    }
    leftArrowPressed()
    {
        //setTimeout(this.leftArrowUp.bind(this), 100);
        this.left_arrow_down = true;
        this.changeValues();
        //this.startChangingValues();
        this.paint();
    }
    leftArrowUp()
    {
        this.left_arrow_down = false; 
        this.paint();
    }
    rightArrowPressed()
    {
        this.right_arrow_down = true;
        this.changeValues();
        //this.startChangingValues();
        this.paint();
         
    }
    rightArrowUp()
    {
        this.right_arrow_down = false;
        this.paint();
    }
    upArrowPressed()
    {
        this.up_arrow_down = true;
        this.changeValues();
        this.paint();
    }
    upArrowUp()
    {
        this.up_arrow_down = false;
        this.paint();
    }
    downArrowPressed()
    {
        this.down_arrow_down = true;
        this.changeValues();
        this.paint();
    }
    downArrowUp()
    {
        this.down_arrow_down = false;
        this.paint();
    }

    // If the Boolean value "number_val" is set to true, then the following format
    // functions will return float values instead of a string.
    dxfFormat(val, number_val=false)
    {
        val = parseFloat(val);
        if(number_val)
            return val;
        return val.toFixed(2);
    }

    kFormat(val, number_val=false)
    {
        val = parseFloat(val);
        if(number_val)
            return val;
        return val.toFixed(4);
    }

    stdFormat(val, number_val=false)
    {
        val = parseFloat(val);
        if(number_val)
            return val;
        return val.toFixed(3);
    }

    bFormat(val, number_val=false)
    {
        val = parseFloat(val);
        if(number_val)
            return val;
        return val.toFixed(1);
    }

    incFormat(val, number_val=false)
    {
        val = parseFloat(val);
        if(number_val)
            return val;
        return val.toFixed(2);
    }
    
    lenFormat(val, number_val=false)
    {
        val = parseInt(val);
        if(number_val)
            return val;
        return val.toFixed(2);
    }

    // Set slide-bars
    setSlideBars() 
    {
        dxf_slider.step = this.dDx
        dxf_slider.min = this.DxMin;
        dxf_slider.max = this.DxMax;
        dxf_slider.value = magnetic_dike.dx;

        // Set Susceptability
        k_slider.step = this.dK
        k_slider.min = this.KMin;
        k_slider.max = this.KMax;
        k_slider.value = magnetic_dike.k;

        //Set Number of Observations, N:
        n_of_obs_slider.step = this.dN;
        n_of_obs_slider.min = this.NMin;
        n_of_obs_slider.max = this.NMax;
        n_of_obs_slider.value = magnetic_dike.ndata;

        // // Set Standard Deviation
        std_dev_slider.step = this.dStd;
        std_dev_slider.min = this.StdMin;
        std_dev_slider.max = this.StdMax;
        std_dev_slider.value = magnetic_dike.std;

        // Set Dike Trend
        b_slider.step = this.dB;
        b_slider.min = this.BMin;
        b_slider.max = this.BMax;
        b_slider.value = magnetic_dike.b;

        //Set Inclination
        inclination_slider.step = this.dInc;
        inclination_slider.min = this.IncMin;
        inclination_slider.max = this.IncMax;
        inclination_slider.value = magnetic_dike.inc;

        LengthBar_slider.step = this.dLength;
        LengthBar_slider.min = this.LengthMin;
        LengthBar_slider.max = this.LengthMax;
        LengthBar_slider.value = magnetic_dike.len;
    }

    displaySliderValues()
    {
        document.getElementById("depth_val").innerHTML = `${magnetic_dike.depth2top.toFixed(1)} m`;
        document.getElementById("width_val").innerHTML = `${magnetic_dike.width.toFixed(1)} m`;
        document.getElementById("contrast_val").innerHTML = this.kFormat(k_slider.value);
        document.getElementById("station_spacing_val").innerHTML = `${this.dxfFormat(dxf_slider.value)} m`;
        document.getElementById("num_of_obs_value").innerHTML = `${n_of_obs_slider.value}`;
        document.getElementById("std_val").innerHTML = `${this.stdFormat(std_dev_slider.value, true).toFixed(1)} nT`;
        document.getElementById("dike_trend_value").innerHTML = `${this.bFormat(b_slider.value)} degrees`;
        document.getElementById("incline_value").innerHTML = `${this.incFormat(inclination_slider.value, true).toFixed(1)} degrees`;
    }

    frameChanged()
    {
        magnetic_dike.xmin = -1.0 * magnetic_dike.len / 2.0;
        magnetic_dike.xmax = magnetic_dike.xmin + magnetic_dike.len;
        magnetic_dike.xscale = G_WIDTH / (magnetic_dike.xmax - magnetic_dike.xmin);

        ctx.clearRect(0,0, canvas.width, canvas.height);
        r_ctx.clearRect(0,0, width_canvas.width, width_canvas.height);
        r_ctx.backgroundColor = "#e9e9e9";
        magnetic_dike.paint();
        this.paint();
        this.displaySliderValues();
    }


}
let magnetic_dike_controls = new MagneticDikeController();


function rescale()
{
    ctx.clearRect(0,0, canvas.width, canvas.height);
    r_ctx.clearRect(0,0, width_canvas.width, width_canvas.height);
    magnetic_dike.setScales();
    magnetic_dike.paint();
    magnetic_dike_controls.paint();
    magnetic_dike_controls.displaySliderValues();
}

// Trigger events for the range sliders, each time the user moves the slider
// (e.g. Station Spacing) the corresponding function below will fire.

dxf_slider.oninput = function()
{
    magnetic_dike.dx = magnetic_dike_controls.dxfFormat(this.value, true);
    magnetic_dike_controls.frameChanged();
};
function dxf_LeftButton()
{
    let slider_value = parseFloat(dxf_slider.value) - magnetic_dike_controls.dDx;
    dxf_slider.value = slider_value;
    magnetic_dike.dx = magnetic_dike_controls.dxfFormat(dxf_slider.value, true);
    magnetic_dike_controls.frameChanged();
}
function dxf_RightButton()
{
    let slider_value = parseFloat(dxf_slider.value) + magnetic_dike_controls.dDx;
    dxf_slider.value = slider_value;
    magnetic_dike.dx = magnetic_dike_controls.dxfFormat(dxf_slider.value, true);
    magnetic_dike_controls.frameChanged();
}

k_slider.oninput = function ()
{
    magnetic_dike.k = magnetic_dike_controls.kFormat(this.value, true);
    magnetic_dike_controls.frameChanged();
};
function k_LeftButton()
{
    let slider_value = parseFloat(k_slider.value) - magnetic_dike_controls.dK;
    k_slider.value = slider_value;
    magnetic_dike.k = magnetic_dike_controls.kFormat(k_slider.value, true);
    magnetic_dike_controls.frameChanged();
}
function k_RightButton()
{
    let slider_value = parseFloat(k_slider.value) + magnetic_dike_controls.dK;
    k_slider.value = slider_value;
    magnetic_dike.k = magnetic_dike_controls.kFormat(k_slider.value, true);
    magnetic_dike_controls.frameChanged();
}

n_of_obs_slider.oninput = function ()
{
    magnetic_dike.ndata = parseInt(this.value);
    magnetic_dike_controls.frameChanged();
};
function n_of_obs_LeftButton()
{
    let slider_value = parseInt(n_of_obs_slider.value) - magnetic_dike_controls.dN;
    n_of_obs_slider.value = slider_value;
    magnetic_dike.ndata = parseInt(n_of_obs_slider.value);
    magnetic_dike_controls.frameChanged();
}
function n_of_obs_RightButton()
{
    let slider_value = parseInt(n_of_obs_slider.value) + magnetic_dike_controls.dN;
    n_of_obs_slider.value = slider_value;
    magnetic_dike.ndata = n_of_obs_slider.value;
    magnetic_dike_controls.frameChanged();
}

std_dev_slider.oninput = function ()
{
    magnetic_dike.std = magnetic_dike_controls.stdFormat(this.value, true);
    magnetic_dike_controls.frameChanged();
};
function std_LeftButton()
{
    let slider_value = parseFloat(std_dev_slider.value) - magnetic_dike_controls.dStd;
    std_dev_slider.value = slider_value;
    magnetic_dike.std = magnetic_dike_controls.stdFormat(std_dev_slider.value, true);
    magnetic_dike_controls.frameChanged();
}
function std_RightButton()
{
    let slider_value = parseFloat(std_dev_slider.value) + magnetic_dike_controls.dStd;
    std_dev_slider.value = slider_value;
    magnetic_dike.std = magnetic_dike_controls.stdFormat(std_dev_slider.value, true);
    magnetic_dike_controls.frameChanged();
}

b_slider.oninput = function ()
{
    magnetic_dike.b = magnetic_dike_controls.bFormat(this.value, true);
    magnetic_dike_controls.frameChanged();
};
function b_LeftButton()
{
    let slider_value = parseFloat(b_slider.value) - magnetic_dike_controls.dB;
    b_slider.value = slider_value;
    magnetic_dike.b = magnetic_dike_controls.bFormat(b_slider.value, true);
    magnetic_dike_controls.frameChanged();
}
function b_RightButton()
{
    let slider_value = parseFloat(b_slider.value) + magnetic_dike_controls.dB;
    b_slider.value = slider_value;
    magnetic_dike.b = magnetic_dike_controls.bFormat(b_slider.value, true);
    magnetic_dike_controls.frameChanged();
}

inclination_slider.oninput = function () {
    magnetic_dike.inc = magnetic_dike_controls.incFormat(this.value, true);
    magnetic_dike_controls.frameChanged();
};

function inc_LeftButton()
{
    let slider_value = parseFloat(inclination_slider.value) - magnetic_dike_controls.dInc;
    inclination_slider.value = slider_value;
    magnetic_dike.inc = magnetic_dike_controls.incFormat(inclination_slider.value, true);
    magnetic_dike_controls.frameChanged();
}

function inc_RightButton()
{
    let slider_value = parseFloat(inclination_slider.value) + magnetic_dike_controls.dInc;
    inclination_slider.value = slider_value;
    magnetic_dike.inc = magnetic_dike_controls.incFormat(inclination_slider.value, true);
    magnetic_dike_controls.frameChanged();
}

LengthBar_slider.oninput = function () 
{
    magnetic_dike.len = parseInt(this.value);
    magnetic_dike_controls.frameChanged();
};

function len_LeftButton()
{
    let slider_value = parseInt(LengthBar_slider.value) - magnetic_dike_controls.dLength;
    LengthBar_slider.value = slider_value;
    magnetic_dike.len = magnetic_dike_controls.lenFormat(LengthBar_slider.value, true);
    magnetic_dike_controls.frameChanged();
}

function len_RightButton()
{
    let slider_value = parseInt(LengthBar_slider.value) + magnetic_dike_controls.dLength;
    LengthBar_slider.value = slider_value;
    magnetic_dike.len = magnetic_dike_controls.lenFormat(LengthBar_slider.value, true);
    magnetic_dike_controls.frameChanged();
}


// Canvas Mouse Events
width_canvas.addEventListener("mousedown", anomalyMouseDownEvents, false);
width_canvas.addEventListener("mouseup", anomalyMouseUpEvents, false);
width_canvas.addEventListener("mouseout", anomalyMouseOutsideOfCanvas, false);

width_canvas.addEventListener("touchstart", function(event)
{
    let touch = event.touches[0];
    let mouseEvent = new MouseEvent("mousedown", 
    {
        clientX: touch.clientX,
        clientY: touch.clientY
    })
    width_canvas.dispatchEvent(mouseEvent);
}, false);

width_canvas.addEventListener("touchend", function(event)
{
    let mouseEvent = new MouseEvent("mouseup", {});
    width_canvas.dispatchEvent(mouseEvent);
}, false);

width_canvas.addEventListener("touchmove", function(event)
{
    let touch = event.touches[0];
    let mouseEvent = new MouseEvent("mousemove",
    {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    width_canvas.dispatchEvent(mouseEvent)
}, false);

function anomalyMouseDownEvents(event)
{
    if(event.target == width_canvas)
        event.preventDefault();
    let mouse_x = event.offsetX;
    let mouse_y = event.offsetY;
    
    // Left arrow button clicked 
    if(magnetic_dike_controls.mouseInArrow(mouse_x, mouse_y, magnetic_dike_controls.left_arrow_x, magnetic_dike_controls.left_arrow_y))
    {
        magnetic_dike_controls.leftArrowPressed();
        magnetic_dike_controls.arrows_down = true; 
    }
         
    // Right arrow button clicked
    if(magnetic_dike_controls.mouseInArrow(mouse_x, mouse_y, magnetic_dike_controls.right_arrow_x, magnetic_dike_controls.right_arrow_y))
    {
        magnetic_dike_controls.rightArrowPressed();
        magnetic_dike_controls.arrows_down = true; 
    }
        
    // Up arrow button clicked
    if(magnetic_dike_controls.mouseInArrow(mouse_x, mouse_y, magnetic_dike_controls.up_arrow_x, magnetic_dike_controls.up_arrow_y))
    {
        magnetic_dike_controls.upArrowPressed();
        magnetic_dike_controls.arrows_down = true; 
    }

    // Down arrow button clicked
    if(magnetic_dike_controls.mouseInArrow(mouse_x, mouse_y, magnetic_dike_controls.down_arrow_x, magnetic_dike_controls.down_arrow_y))
    {
        magnetic_dike_controls.downArrowPressed();
        magnetic_dike_controls.arrows_down = true; 
    }
      
}

function anomalyMouseUpEvents(event)
{
    if(event.target == width_canvas)
        event.preventDefault();
    if(magnetic_dike_controls.left_arrow_down)
        magnetic_dike_controls.leftArrowUp();
    if(magnetic_dike_controls.right_arrow_down)
        magnetic_dike_controls.rightArrowUp();
    if(magnetic_dike_controls.up_arrow_down)
        magnetic_dike_controls.upArrowUp();
    if(magnetic_dike_controls.down_arrow_down)
        magnetic_dike_controls.downArrowUp();
    magnetic_dike_controls.arrows_down = false; 
}

function anomalyMouseOutsideOfCanvas(event)
{
    if(event.target == width_canvas)
        event.preventDefault();
    magnetic_dike_controls.left_arrow_down = false;
    magnetic_dike_controls.right_arrow_down = false;
    magnetic_dike_controls.up_arrow_down = false;
    magnetic_dike_controls.down_arrow_down = false;
    magnetic_dike_controls.arrows_down = false; 
}

function anomalyTouchOutsideOfCanvas(event)
{
    let touch_x = event.touches[0].clientX;
    let touch_y = event.touches[0].clientY;
    if(event.target == width_canvas)
        event.preventDefault();
    else
    {
        magnetic_dike_controls.left_arrow_down = false;
        magnetic_dike_controls.right_arrow_down = false;
        magnetic_dike_controls.up_arrow_down = false;
        magnetic_dike_controls.down_arrow_down = false;
    }
    magnetic_dike_controls.arrows_down = false; 
}

// Keyboard Controls
window.addEventListener('keydown', function (event) 
{
    event.preventDefault();
    if (event.key == "ArrowLeft")
    {
        magnetic_dike_controls.leftArrowPressed();
        magnetic_dike_controls.arrows_down = true;
    }
    else if (event.key == "ArrowRight")
    {
        magnetic_dike_controls.rightArrowPressed();
        magnetic_dike_controls.arrows_down = true;
    }
    else if (event.key == "ArrowUp")
    {
        magnetic_dike_controls.upArrowPressed();
        magnetic_dike_controls.arrows_down = true;
    }
    else if (event.key == "ArrowDown")
    {
        magnetic_dike_controls.downArrowPressed();
        magnetic_dike_controls.arrows_down = true;
    }
    
});

window.addEventListener('keyup', function (event) 
{
    if (event.key == "ArrowLeft")
        magnetic_dike_controls.leftArrowUp();
    else if (event.key == "ArrowRight")
        magnetic_dike_controls.rightArrowUp();
    else if (event.key == "ArrowUp")
        magnetic_dike_controls.upArrowUp();
    else if (event.key == "ArrowDown")
        magnetic_dike_controls.downArrowUp();

    magnetic_dike_controls.arrows_down = false; 
});

// Prevent scrolling when touching the canvas
document.body.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, false);
document.body.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, false);
document.body.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, false);


ARROW_IMAGE.onload = function()
{
    magnetic_dike.start();
    magnetic_dike_controls.setSlideBars();
    magnetic_dike_controls.frameChanged();
}


function loop() 
{
    // Delay before speeding up anomaly changes
    if(magnetic_dike_controls.arrows_down)
        magnetic_dike_controls.counter += 1;
    else
        magnetic_dike_controls.counter = 0;

    if(magnetic_dike_controls.counter >= 10)
    {
        magnetic_dike_controls.changeValues();
    }
  
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);


