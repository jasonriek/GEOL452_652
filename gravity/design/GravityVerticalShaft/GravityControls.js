/*
GRAVITY CONTROLS
*/

 // Dimension of arrow button: 64 X 64
const ARROW_BUTTON_SIZE = 64;

// Range Sliders
const dxf_slider = document.getElementById("station_spacing");
const cross_line_loc_slider = document.getElementById("cross_line_loc");
const rho_slider = document.getElementById("densityContrast");
const n_of_obs_slider = document.getElementById("nOfObservations");
const std_dev_slider = document.getElementById("stdDev");

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

class GravityControls
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

        //Now define minimum and maximum values in user space
        //and corresponding maximums and minimums for the scroll bars
        //that must be integers
        this.DxMin=0.25;   //meters
        this.DxMax=20.0;
        this.dDx=0.5;	//Increment in Spacing allowed
        this.DxBarMin=1;	//Minimum Scroll Bar Value
        this.DxBarMax=Math.trunc((this.DxMax - this.DxMin) / this.dDx + 2.1) - 0.5; //Maximum Scroll Bar Value
        this.YMin=-100.0;   //meters
        this.YMax=100.0;
        this.dY=1.0;	//Increment in Spacing allowed
        this.YBarMin=1;	//Minimum Scroll Bar Value
        this.YBarMax = Math.trunc((this.YMax - this.YMin) / this.dY + 2.1) - 1; //Maximum Scroll Bar Value
        this.RhoMin=-3.2; //gm/cm^3
        this.RhoMax=0.0;
        this.dRho=0.05;
        this.RhoBarMin=1;
        this.RhoBarMax=Math.trunc((this.RhoMax - this.RhoMin) / this.dRho+2.1) - 0.005;
        this.StdMin=0.0;  //mgal
        this.StdMax=0.05;
        this.dStd=0.005;
        this.StdBarMin=1;
        this.StdBarMax=Math.trunc((this.StdMax - this.StdMin) / this.dStd+2.1) - 0.005;
        this.NMin=1;
        this.NMax=20;
        this.dN=1;
        this.NBarMin=1;
        this.NBarMax=Math.trunc((this.NMax - this.NMin) / this.dN+2.1)-1;
        this.s_value = null;	//variable used to collect scrollbar info
    }

    paint()
    {
        r_ctx.clearRect(0, 0, rad_canvas.width, rad_canvas.height);
        r_ctx.fillStyle = "#000000";
        r_ctx.fillText("Depth: "+(-gravity_vertical_shaft.depth2top).toFixed(1)+" m", 5, 12);
        r_ctx.fillText("Radius: "+gravity_vertical_shaft.radius.toFixed(1)+" m", 5, 24);
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
            if(gravity_vertical_shaft.radius > 2)
                gravity_vertical_shaft.radius -= 0.1;
        }
        else if(this.right_arrow_down)
        {
            if(gravity_vertical_shaft.radius < 200)
                gravity_vertical_shaft.radius += 0.1;
        }
        else if(this.up_arrow_down)
        {
            if(-gravity_vertical_shaft.depth2top > 0.1)
                gravity_vertical_shaft.depth2top += 0.1;
        }
        else if(this.down_arrow_down)
        {
            if(-gravity_vertical_shaft.depth2top < 25)
                gravity_vertical_shaft.depth2top -= 0.1;
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

    dxfFormat(val, number_val=false)
    {
        if(number_val)
            return ((val-1)*this.dDx+this.DxMin);
        return ((val-1)*this.dDx+this.DxMin).toFixed(2);
    }
    
    cross_line_locFormat(val, number_val=false)
    {
        if (number_val)
            return ((val-1)*this.dY + this.YMin);
        return ((val-1)*this.dY + this.YMin).toFixed(2);
    }
    
    rhoFormat(val, number_val=false)
    {
        if(number_val)
            return ((val-1)*this.dRho+this.RhoMin);
        return ((val-1)*this.dRho+this.RhoMin).toFixed(2);
    }
    
    stdFormat(val, number_val=false)
    {
        if(number_val)
            return ((val-1)*this.dStd+this.StdMin);
        return ((val-1)*this.dStd+this.StdMin).toFixed(3);
    }

    setValues()
    {
        // --- Reset range sliders ---

        // Set Station Spacing
        this.s_value = Math.trunc((gravity_vertical_shaft.dx - this.DxMin) * (this.DxBarMax - this.DxBarMin) / 
        (this.DxMax - this.DxMin) + this.DxBarMin + 0.5);
        dxf_slider.value = this.s_value;

        // Set Density Contrast
        this.s_value = Math.trunc((gravity_vertical_shaft.rho - this.RhoMin) * (this.RhoBarMax - this.RhoBarMin) /
        (this.RhoMax - this.RhoMin) + this.RhoBarMin + 0.5);
        rho_slider.value = this.s_value;

        // Set Number of Observations, N:
        this.s_value = Math.trunc((gravity_vertical_shaft.nobs - this.NMin) * (this.NBarMax - this.NBarMin) /
        (this.NMax - this.NMin) + this.NBarMin + 0.5);
        n_of_obs_slider.value = this.s_value;

        // Set Standard Deviation
        this.s_value = Math.trunc((gravity_vertical_shaft.std - this.StdMin) * (this.StdBarMax - this.StdBarMin) /
        (this.StdMax - this.StdMin) + this.StdBarMin + 0.5);
        std_dev_slider.value = this.s_value;
    }

    // Set slide-bars
    setSlideBars() 
    {
        //Set Station Spacing
        this.s_value = Math.trunc((gravity_vertical_shaft.dx - this.DxMin) * (this.DxBarMax - this.DxBarMin) /
            (this.DxMax - this.DxMin) + this.DxBarMin + 0.5);
        dxf_slider.value = this.s_value;
        dxf_slider.min = this.DxBarMin;
        dxf_slider.max = this.DxBarMax;

        //Set Cross Line Location
        this.s_value = Math.trunc((gravity_vertical_shaft.yloc - this.YMin) * (this.YBarMax - this.YBarMin) /
            (this.YMax - this.YMin) + this.YBarMin + 0.5);
        cross_line_loc_slider.value = this.s_value;
        cross_line_loc_slider.min = this.YBarMin;
        cross_line_loc_slider.max = this.YBarMax;

        //Set Density Contrast
        this.s_value = Math.trunc((this.rhof - this.RhoMin) * (this.RhoBarMax - this.RhoBarMin) /
            (this.RhoMax - this.RhoMin) + this.RhoBarMin + 0.5);
        rho_slider.value = this.s_value;
        rho_slider.min = this.RhoBarMin;
        rho_slider.max = this.RhoBarMax;

        //Set Number of Observations, N:
        this.s_value = Math.trunc((gravity_vertical_shaft.nobs-this.NMin) * (this.NBarMax - this.NBarMin) /
            (this.NMax - this.NMin) + this.NBarMin + 0.5);
        n_of_obs_slider.value = this.s_value;
        n_of_obs_slider.min = this.NBarMin;
        n_of_obs_slider.max = this.NBarMax;

        // Set Standard Deviation
        this.s_value = Math.trunc((gravity_vertical_shaft.std-this.StdMin) * (this.StdBarMax - this.StdBarMin) /
            (this.StdMax - this.StdMin) + this.StdBarMin + 0.5);
        std_dev_slider.value = this.s_value;
        std_dev_slider.min = this.StdBarMin;
        std_dev_slider.max = this.StdBarMax;
    }

    // Displays the current slider value
    displaySliderValues()
    {
        document.getElementById("depth_val").innerHTML = (-gravity_vertical_shaft.depth2top).toFixed(1)+" m";
        document.getElementById("radius_val").innerHTML = (gravity_vertical_shaft.radius.toFixed(1)+" m");
        document.getElementById("contrast_val").innerHTML = (this.rhoFormat(rho_slider.value)+" gm/cm^3");
        document.getElementById("y_location_val").innerHTML = (this.cross_line_locFormat(cross_line_loc_slider.value)+" m");
        document.getElementById("station_spacing_val").innerHTML = (this.dxfFormat(dxf_slider.value)+" m");
        document.getElementById("num_of_obs_value").innerHTML = n_of_obs_slider.value.toString();
        document.getElementById("std_val").innerHTML = (this.stdFormat(std_dev_slider.value)+" mgal");
    }

    frameChanged()
    {

        ctx.clearRect(0,0, canvas.width, canvas.height);
        gravity_vertical_shaft.paint();
        this.paint();
        this.displaySliderValues();
    }

    start()
    {
        gravity_vertical_shaft.setScales();
        this.setValues();
        this.setSlideBars();
    }
}
let gravity_controls = new GravityControls();
gravity_controls.start();

// Trigger events for the range sliders, each time the user moves the slider
// (e.g. Station Spacing or dx) the corresponding function below will fire.
dxf_slider.oninput = function ()
{
    gravity_vertical_shaft.dx = gravity_controls.dxfFormat(this.value, true);
    gravity_controls.frameChanged();
};
function dxf_LeftButton()
{
    dxf_slider.value--;
    gravity_vertical_shaft.dx = gravity_controls.dxfFormat(dxf_slider.value, true);
    gravity_controls.frameChanged();
}
function dxf_RightButton()
{
    dxf_slider.value++;
    gravity_vertical_shaft.dx = gravity_controls.dxfFormat(dxf_slider.value, true);
    gravity_controls.frameChanged();
}

cross_line_loc_slider.oninput = function()
{
    gravity_vertical_shaft.yloc = gravity_controls.cross_line_locFormat(this.value, true);
    gravity_controls.frameChanged();
};
function cross_line_loc_LeftButton()
{
    cross_line_loc_slider.value--;
    gravity_vertical_shaft.yloc = gravity_controls.cross_line_locFormat(cross_line_loc_slider.value, true);
    gravity_controls.frameChanged();
}
function cross_line_loc_RightButton()
{
    cross_line_loc_slider.value++;
    gravity_vertical_shaft.yloc = gravity_controls.cross_line_locFormat(cross_line_loc_slider.value, true);
    gravity_controls.frameChanged();
}

rho_slider.oninput = function ()
{
    gravity_vertical_shaft.rho = gravity_controls.rhoFormat(this.value, true);
    gravity_controls.frameChanged();
};
function rho_LeftButton()
{
    rho_slider.value--;
    gravity_vertical_shaft.rho = gravity_controls.rhoFormat(rho_slider.value, true);
    gravity_controls.frameChanged();
}
function rho_RightButton()
{
    rho_slider.value++;
    gravity_vertical_shaft.rho = gravity_controls.rhoFormat(rho_slider.value, true);
    gravity_controls.frameChanged();
}
n_of_obs_slider.oninput = function ()
{
    gravity_vertical_shaft.nobs = this.value;
    gravity_controls.frameChanged();
};
function n_of_obs_LeftButton()
{
    n_of_obs_slider.value--;
    gravity_vertical_shaft.nobs = n_of_obs_slider.value;
    gravity_controls.frameChanged();
}
function n_of_obs_RightButton()
{
    n_of_obs_slider.value++;
    gravity_vertical_shaft.nobs = n_of_obs_slider.value;
    gravity_controls.frameChanged();
}
std_dev_slider.oninput = function ()
{
    gravity_vertical_shaft.std = gravity_controls.stdFormat(this.value, true);
    gravity_controls.frameChanged();
};
function std_LeftButton()
{
    std_dev_slider.value--;
    gravity_vertical_shaft.std= gravity_controls.stdFormat(std_dev_slider.value, true);
    gravity_controls.frameChanged();
}
function std_RightButton()
{
    std_dev_slider.value++;
    gravity_vertical_shaft.std = gravity_controls.stdFormat(std_dev_slider.value, true);
    gravity_controls.frameChanged();
}
function rescale()
{
    gravity_vertical_shaft.setScales();
    gravity_controls.displaySliderValues();
    gravity_controls.frameChanged();
}

// Canvas Mouse Events
rad_canvas.addEventListener("mousedown", anomalyMouseDownEvents, false);
rad_canvas.addEventListener("mouseup", anomalyMouseUpEvents, false);
rad_canvas.addEventListener("mouseout", anomalyMouseOutsideOfCanvas, false);

rad_canvas.addEventListener("touchstart", function(event)
{
    let touch = event.touches[0];
    let mouseEvent = new MouseEvent("mousedown", 
    {
        clientX: touch.clientX,
        clientY: touch.clientY
    })
    rad_canvas.dispatchEvent(mouseEvent);
}, false);

rad_canvas.addEventListener("touchend", function(event)
{
    let mouseEvent = new MouseEvent("mouseup", {});
    rad_canvas.dispatchEvent(mouseEvent);
}, false);

rad_canvas.addEventListener("touchmove", function(event)
{
    let touch = event.touches[0];
    let mouseEvent = new MouseEvent("mousemove",
    {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    rad_canvas.dispatchEvent(mouseEvent)
}, false);

function anomalyMouseDownEvents(event)
{
    if(event.target == rad_canvas)
        event.preventDefault();
    let mouse_x = event.offsetX;
    let mouse_y = event.offsetY;
    
    // Left arrow button clicked 
    if(gravity_controls.mouseInArrow(mouse_x, mouse_y, gravity_controls.left_arrow_x, gravity_controls.left_arrow_y))
    {
        gravity_controls.leftArrowPressed();
        gravity_controls.arrows_down = true; 
    }
         
    // Right arrow button clicked
    if(gravity_controls.mouseInArrow(mouse_x, mouse_y, gravity_controls.right_arrow_x, gravity_controls.right_arrow_y))
    {
        gravity_controls.rightArrowPressed();
        gravity_controls.arrows_down = true; 
    }
        
    // Up arrow button clicked
    if(gravity_controls.mouseInArrow(mouse_x, mouse_y, gravity_controls.up_arrow_x, gravity_controls.up_arrow_y))
    {
        gravity_controls.upArrowPressed();
        gravity_controls.arrows_down = true; 
    }

    // Down arrow button clicked
    if(gravity_controls.mouseInArrow(mouse_x, mouse_y, gravity_controls.down_arrow_x, gravity_controls.down_arrow_y))
    {
        gravity_controls.downArrowPressed();
        gravity_controls.arrows_down = true; 
    }
      
}

function anomalyMouseUpEvents(event)
{
    if(event.target == rad_canvas)
        event.preventDefault();
    if(gravity_controls.left_arrow_down)
        gravity_controls.leftArrowUp();
    if(gravity_controls.right_arrow_down)
        gravity_controls.rightArrowUp();
    if(gravity_controls.up_arrow_down)
        gravity_controls.upArrowUp();
    if(gravity_controls.down_arrow_down)
        gravity_controls.downArrowUp();
    gravity_controls.arrows_down = false; 
}

function anomalyMouseOutsideOfCanvas(event)
{
    if(event.target == rad_canvas)
        event.preventDefault();
    gravity_controls.left_arrow_down = false;
    gravity_controls.right_arrow_down = false;
    gravity_controls.up_arrow_down = false;
    gravity_controls.down_arrow_down = false;
    gravity_controls.arrows_down = false; 
}

function anomalyTouchOutsideOfCanvas(event)
{
    let touch_x = event.touches[0].clientX;
    let touch_y = event.touches[0].clientY;
    if(event.target == rad_canvas)
        event.preventDefault();
    else
    {
        gravity_controls.left_arrow_down = false;
        gravity_controls.right_arrow_down = false;
        gravity_controls.up_arrow_down = false;
        gravity_controls.down_arrow_down = false;
    }
    gravity_controls.arrows_down = false; 
}

// Keyboard Controls
window.addEventListener('keydown', function (event) 
{
    event.preventDefault();
    if (event.key == "ArrowLeft")
    {
        gravity_controls.leftArrowPressed();
        gravity_controls.arrows_down = true;
    }
    else if (event.key == "ArrowRight")
    {
        gravity_controls.rightArrowPressed();
        gravity_controls.arrows_down = true;
    }
    else if (event.key == "ArrowUp")
    {
        gravity_controls.upArrowPressed();
        gravity_controls.arrows_down = true;
    }
    else if (event.key == "ArrowDown")
    {
        gravity_controls.downArrowPressed();
        gravity_controls.arrows_down = true;
    }
    
});

window.addEventListener('keyup', function (event) 
{
    if (event.key == "ArrowLeft")
        gravity_controls.leftArrowUp();
    else if (event.key == "ArrowRight")
        gravity_controls.rightArrowUp();
    else if (event.key == "ArrowUp")
        gravity_controls.upArrowUp();
    else if (event.key == "ArrowDown")
        gravity_controls.downArrowUp();

    gravity_controls.arrows_down = false; 
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
    gravity_controls.frameChanged();
}


function loop() 
{
    // Delay before speeding up anomaly changes
    if(gravity_controls.arrows_down)
        gravity_controls.counter += 1;
    else
        gravity_controls.counter = 0;

    if(gravity_controls.counter >= 10)
    {
        gravity_controls.changeValues();
    }
  
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);




