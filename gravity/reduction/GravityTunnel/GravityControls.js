/*
GRAVITY CONTROLS
 */
let inter = null;

 // Dimension of arrow button: 64 X 64
 const ARROW_BUTTON_SIZE = 64;

 
// Range Sliders
const rho_slider = document.getElementById("densityContrast"); 
const bias_slider = document.getElementById("bias");
 


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
        
        this.RhoMin = -3.2;  // gm/cm^3    
        this.RhoMax = 0.0;
        this.dRho = 0.025;
        this.RhoBarMin= 1;
        this.RhoBarMax = Math.trunc((this.RhoMax - this.RhoMin) / this.dRho + 2.1);
        this.RadMin = 0.25; //meters
        this.RadMax = 10.0;
        this.dRad = 0.25;
        this.BiasMin = -0.05;
        this.BiasMax = 0.05;
        this.dBias = 0.001;
        this.BiasBarMin = 1;
        this.BiasBarMax = Math.trunc((this.BiasMax - this.BiasMin) / this.dBias + 2.1);


        this.label_list_x_loc = X_OFFSET;
        this.label_list_y_loc  = 400;
    }

    paint()
    {
        r_ctx.clearRect(0, 0, rad_canvas.width, rad_canvas.height);
        r_ctx.fillStyle = "#000000";
        r_ctx.fillText("Depth: "+(gravity_tunnel.depth).toFixed(1)+" m", 5, 12);
        r_ctx.fillText("Radius: "+gravity_tunnel.rad.toFixed(1)+" m", 5, 24);
        r_ctx.fillText("Move to Surface ", 83, 19);
        r_ctx.fillText("Move to Deeper Depth", 70, 227);
        r_ctx.fillText("Decrease Width", 9, 87);
        r_ctx.fillText("Increase Width", 159, 87);

        let s_TunR = new JSCircle(r_ctx, rad_canvas.width/2, rad_canvas.height/2, Math.trunc(gravity_tunnel.rad * gravity_tunnel.dscale * 2), "#ff0000");
        let s_TunB = new JSCircle(r_ctx, rad_canvas.width/2, rad_canvas.height/2, Math.trunc(gravity_tunnel.rad * gravity_tunnel.xscale * 2), "#000000");
        s_TunR.draw();
        s_TunB.draw(); 
        
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
            if(gravity_tunnel.rad > 0.6)
                gravity_tunnel.rad -= 0.1;
        }
        else if(this.right_arrow_down)
        {
            if(gravity_tunnel.rad < gravity_tunnel.depth)
                gravity_tunnel.rad += 0.1;
        }
        else if(this.up_arrow_down)
        {
            if(gravity_tunnel.rad < gravity_tunnel.depth-0.1)
                gravity_tunnel.depth -= 0.1;
        }
        else if(this.down_arrow_down)
        {
            if(gravity_tunnel.depth < 24)
                gravity_tunnel.depth += 0.1;
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
    rhoFormat(val, number_val=false)
    {
        if(number_val)
            return ((val-1) * this.dRho + this.RhoMin);
        return ((val-1) * this.dRho + this.RhoMin).toFixed(2);
    }

    biasFormat(val, number_val=false)
    {
        if(number_val)
            return ((val - 1) * this.dBias + this.BiasMin);
        return ((val - 1) * this.dBias + this.BiasMin).toFixed(3);
    }

    //Set slide-bars
    setSlideBars() 
    {
        let s_value = null;
        // Set Density Contrast
        s_value = Math.trunc((gravity_tunnel.rho - this.RhoMin) * (this.RhoBarMax - this.RhoBarMin) /
            (this.RhoMax - this.RhoMin) + this.RhoBarMin + 0.5);
        rho_slider.value = s_value;
        rho_slider.min = this.RhoBarMin;
        rho_slider.max = this.RhoBarMax;

        // Set Bias
        s_value = Math.trunc((gravity_tunnel.bias - this.BiasMin) * (this.BiasBarMax - this.BiasBarMin) /
        (this.BiasBarMax - this.BiasMin) + this.BiasBarMin + 0.5);
        bias_slider.value = s_value;
        bias_slider.min = this.BiasBarMin;
        bias_slider.max = this.BiasBarMax;
    }

    displaySliderValues()
    {
        let x_val = parseFloat(document.getElementById("MoveAnom").value);
        document.getElementById("x_val").innerHTML = (x_val.toFixed(1)+" m");
        document.getElementById("radius_val").innerHTML = (gravity_tunnel.rad.toFixed(1)+" m");
        document.getElementById("contrast_val").innerHTML = (this.rhoFormat(rho_slider.value)+" gm/cm^3");
        document.getElementById("depth_val").innerHTML = (gravity_tunnel.depth.toFixed(1)+" m");
        document.getElementById("bias_val").innerHTML = (this.biasFormat(bias_slider.value)+" mgal");
    }

    frameChanged()
    {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        gravity_tunnel.paint();
        this.paint();
        this.displaySliderValues(); 
    }
}
let gravity_controls = new GravityControls();    

function rescale()
{
    if(gravity_tunnel.scale_loaded)
    {
        gravity_tunnel.setScales();
        gravity_controls.displaySliderValues();
        gravity_controls.frameChanged();
    }
}

// Trigger events for the range sliders, each time the user moves the slider
// (e.g. Station Spacing) the corresponding function below will fire.

anom_slider.oninput = function ()
{
    gravity_tunnel.x_loc = parseFloat(this.value);
    gravity_controls.frameChanged();
};

function moveAnomLeft()
{
    if(gravity_tunnel.x_loc > gravity_tunnel.xmin)
    {
        anom_slider.value--;
        gravity_tunnel.x_loc -= 1
        gravity_controls.frameChanged();
    }
}
function moveAnomRight()
{
    if(gravity_tunnel.x_loc < gravity_tunnel.xmax)
    {
        anom_slider.value++;
        gravity_tunnel.x_loc += 1
        gravity_controls.frameChanged();
    }
}

file_input.onchange = function ()
{
    let file = this.files[0];
    let reader = new FileReader();
    reader.onload = function(progressEvent)
    {
        // By lines
        let rows = this.result.split('\n');
        for(let i = 0; i<rows.length; i++)
        {
            row = rows[i].split(",");
            gravity_tunnel.x_data.push(parseInt(row[0]));
            gravity_tunnel.g_data.push(parseFloat(row[1]));
        }
        gravity_tunnel.ndata = gravity_tunnel.x_data.length;
        gravity_tunnel.setScales();
        r_ctx.clearRect(0,0, rad_canvas.width, rad_canvas.height);
        ctx.clearRect(0,0, canvas.width, canvas.height);
        gravity_tunnel.scale_loaded = true;
        gravity_controls.setSlideBars();
        gravity_tunnel.paint();
        gravity_controls.paint();

    };
    reader.readAsText(file);
};

rho_slider.oninput = function ()
{
    gravity_tunnel.rho = gravity_controls.rhoFormat(this.value, true);
    gravity_controls.frameChanged();
};
function rho_LeftButton()
{
    rho_slider.value--;
    gravity_tunnel.rho = gravity_controls.rhoFormat(rho_slider.value, true);
    gravity_controls.frameChanged();
}
function rho_RightButton()
{
    rho_slider.value++;
    gravity_tunnel.rho = gravity_controls.rhoFormat(rho_slider.value, true);
    gravity_controls.frameChanged();
}

bias_slider.oninput = function ()
{
    gravity_tunnel.bias = gravity_controls.biasFormat(this.value, true);
    gravity_controls.frameChanged();
};
function bias_LeftButton()
{
    bias_slider.value--;
    gravity_tunnel.bias = gravity_controls.biasFormat(bias_slider.value, true);
    gravity_controls.frameChanged();
}
function bias_RightButton()
{
    bias_slider.value++;
    gravity_tunnel.bias = gravity_controls.biasFormat(bias_slider.value, true);
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


