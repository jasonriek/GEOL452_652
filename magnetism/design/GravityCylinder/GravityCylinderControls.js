// Handles the Arrow button image tiles. 
// DON'T TINKER WITH THIS, it works just fine... ;)
class ArrowButton
{
    // First load sprite/sprite sheet 
    constructor(image_src, width, height)
    {
        this.image_src = image_src;
        this.image = new Image();
        this.image.src = this.image_src;
        this.width = width;
        this.height = height;
    }
    

    draw(image_sheet_x, image_sheet_y, x, y)
    {
        anomaly_ctx.drawImage(this.image, image_sheet_x, image_sheet_y, this.width, this.height, x, y, this.width, this.height);
    }
}

// Left canvas that contains the controls for the anomaly (radius, vertical position).
class AnomalyController
{
    constructor()
    {
        this.left_arrow = new ArrowButton("../../../images/white_arrows.png", 64, 64);
        this.left_arrow_pressed = new ArrowButton("../../../images/white_arrows_pressed.png", 64, 64);
        this.left_arrow_x = 15;
        this.left_arrow_y = 90;
        this.left_arrow_down = false;
        
        this.right_arrow = new ArrowButton("../../../images/white_arrows.png", 64, 64);
        this.right_arrow_pressed = new ArrowButton("../../../images/white_arrows_pressed.png", 64, 64);
        this.right_arrow_x = 162;
        this.right_arrow_y = this.left_arrow_y
        this.right_arrow_down = false;
        
        this.up_arrow = new ArrowButton("../../../images/white_arrows.png", 64, 64);
        this.up_arrow_pressed = new ArrowButton("../../../images/white_arrows_pressed.png", 64, 64);
        this.up_arrow_x = 88;
        this.up_arrow_y = 22;
        this.up_arrow_down = false;

        this.down_arrow = new ArrowButton("../../../images/white_arrows.png", 64, 64);
        this.down_arrow_pressed = new ArrowButton("../../../images/white_arrows_pressed.png", 64, 64);
        this.down_arrow_x = this.up_arrow_x;
        this.down_arrow_y = 154;
        this.down_arrow_down = false;
        this.arrows_down = false; 
        this.counter = 0;
    }

    activateChangeValues()
    {
        if(this.arrows_down)
        {
            this.changeValues();
            var timer = setTimeout(this.activateChangeValues.bind(this), 70);
        }
        else
            clearTimeout(timer)
    }

    startChangingValues()
    {
        
        setTimeout(this.activateChangeValues.bind(this), 700)
           
    }

    paint()
    {
        if(gravity_cylinder._scale_loaded)
        {
            let anomaly_outside_rad = new Circle(anomaly_ctx, 
                                                    (anomaly_canvas.width/2) - Math.trunc(gravity_cylinder.rad * gravity_cylinder.d_scale), 
                                                    (anomaly_canvas.height/2) - Math.trunc(gravity_cylinder.rad * gravity_cylinder.d_scale), 
                                                    Math.trunc(gravity_cylinder.rad * gravity_cylinder.d_scale * 2),
                                                    "#FF0000");

            let anomaly_inside_rad = new Circle(anomaly_ctx, 
                                                    (anomaly_canvas.width/2) - Math.trunc(gravity_cylinder.rad * gravity_cylinder.x_scale), 
                                                    (anomaly_canvas.height/2) - Math.trunc(gravity_cylinder.rad * gravity_cylinder.x_scale), 
                                                    Math.trunc(gravity_cylinder.rad * gravity_cylinder.x_scale * 2),
                                                    "#000000");

            anomaly_ctx.clearRect(0, 0, anomaly_canvas.width, anomaly_canvas.height);
            anomaly_outside_rad.draw();
            anomaly_inside_rad.draw();

            anomaly_ctx.fillStyle = "#000000";
            anomaly_ctx.fillText("Depth: "+gravity_cylinder.depth.toFixed(1)+" m", 5, 12);
            anomaly_ctx.fillText("Radius: "+gravity_cylinder.rad.toFixed(1)+" m", 5, 24);
            anomaly_ctx.fillText("Move to Surface ", 83, 19);
            anomaly_ctx.fillText("Move to Deeper Depth", 70, 227);
            anomaly_ctx.fillText("Decrease Radius", 2, 87);
            anomaly_ctx.fillText("Increase Radius", 159, 87);
            
            if(this.left_arrow_down)
            {
                this.left_arrow_pressed.draw(0, 0, this.left_arrow_x, this.left_arrow_y);
                anomaly_ctx.fillStyle = "#cc0000";
                anomaly_ctx.fillText("Decrease Radius", 2, 87);
            }
            else
                this.left_arrow.draw(0, 0, this.left_arrow_x, this.left_arrow_y);
            
            if(this.right_arrow_down)
            {
                this.right_arrow_pressed.draw(64, 0, this.right_arrow_x, this.right_arrow_y);
                anomaly_ctx.fillStyle = "#cc0000";
                anomaly_ctx.fillText("Increase Radius", 159, 87);
            }
            else
                this.right_arrow.draw(64, 0, this.right_arrow_x, this.right_arrow_y);
            
            if(this.up_arrow_down)
            {
                this.up_arrow_pressed.draw(128, 0, this.up_arrow_x, this.up_arrow_y);
                anomaly_ctx.fillStyle = "#cc0000";
                anomaly_ctx.fillText("Move to Surface ", 83, 19);
            }
            else
                this.up_arrow.draw(128, 0, this.up_arrow_x, this.up_arrow_y);
            
            if(this.down_arrow_down)
            {
                this.down_arrow_pressed.draw(192, 0, this.down_arrow_x, this.down_arrow_y);
                anomaly_ctx.fillStyle = "#cc0000";
                anomaly_ctx.fillText("Move to Deeper Depth", 70, 227);
            }
                
            else
                this.down_arrow.draw(192, 0, this.down_arrow_x, this.down_arrow_y);
            
            
        }
    }
    
    changeValues()
    {
        if(this.left_arrow_down)
        {
            if(gravity_cylinder.rad > 0.6)
                gravity_cylinder.rad -= 0.1;
        }
        else if(this.right_arrow_down)
        {
            if(gravity_cylinder.rad < gravity_cylinder.depth)
                gravity_cylinder.rad += 0.1;
        }
        else if(this.up_arrow_down)
        {
            if(gravity_cylinder.rad < gravity_cylinder.depth-0.1)
                gravity_cylinder.depth -= 0.1;
        }
        else if(this.down_arrow_down)
        {
            if(gravity_cylinder.depth < 24)
                gravity_cylinder.depth += 0.1;
        }
        gravity_cylinder.paint();
        gravity_cylinder.setTableValues();
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
        this.startChangingValues();
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
        this.startChangingValues();
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
        this.startChangingValues();
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
        this.startChangingValues();
        this.paint();
    }
    downArrowUp()
    {
        this.down_arrow_down = false;
        this.paint();
    }

}
anomaly_controller = new AnomalyController();

// Moves the x position of the anomaly 
anom_slider.oninput = function ()
{
    gravity_cylinder.x_loc = parseFloat(this.value);
    gravity_cylinder.paint();
    gravity_cylinder.setTableValues();
};
function moveAnomLeft()
{
    if(gravity_cylinder.x_loc > gravity_cylinder.x_min)
    {
        anom_slider.value--;
        gravity_cylinder.x_loc -= 1
        gravity_cylinder.paint();
        gravity_cylinder.setTableValues();
    }
}
function moveAnomRight()
{
    if(gravity_cylinder.x_loc < gravity_cylinder.x_max)
    {
        anom_slider.value++;
        gravity_cylinder.x_loc += 1
        gravity_cylinder.paint();
        gravity_cylinder.setTableValues();
    }
}
// Density Contrast Slider Functions
rho_slider.oninput = function()
{
    gravity_cylinder.rho = gravity_cylinder.rhoFormat(this.value, true)
    gravity_cylinder.paint();
    gravity_cylinder.setTableValues();
};
function rho_LeftButton()
{
    rho_slider.value--;
    gravity_cylinder.rho = gravity_cylinder.rhoFormat(rho_slider.value, true);
    gravity_cylinder.paint();
    gravity_cylinder.setTableValues();
}
function rho_RightButton()
{
    rho_slider.value++;
    gravity_cylinder.rho = gravity_cylinder.rhoFormat(rho_slider.value, true);
    gravity_cylinder.paint();
    gravity_cylinder.setTableValues();
}

// Bias Slider Functions 
bias_slider.oninput = function()
{
    gravity_cylinder.bias = gravity_cylinder.biasFormat(this.value, true);
    gravity_cylinder.paint();
    gravity_cylinder.setTableValues();
}
function bias_LeftButton()
{
    bias_slider.value--;
    gravity_cylinder.bias = gravity_cylinder.biasFormat(bias_slider.value, true);
    gravity_cylinder.paint();
    gravity_cylinder.setTableValues();

}
function bias_RightButton()
{
    bias_slider.value++;
    gravity_cylinder.bias = gravity_cylinder.biasFormat(bias_slider.value, true);
    gravity_cylinder.paint();
    gravity_cylinder.setTableValues();
}

function disableWidgets()
{
    // By default disable all the widgets
    anom_slider.disabled = true;
    anom_slider_left_button.disabled = true;
    anom_slider_right_button.disabled = true;

    rho_slider.disabled = true;
    rho_slider_left_button.disabled = true;
    rho_slider_right_button.disabled = true;

    bias_slider.disabled = true;
    bias_slider_left_button.disabled = true;
    bias_slider_right_button.disabled = true;
}

function enableWidgets()
{
    // By default disable all the widgets
    anom_slider.disabled = false;
    anom_slider_left_button.disabled = false;
    anom_slider_right_button.disabled = false;

    rho_slider.disabled = false;
    rho_slider_left_button.disabled = false;
    rho_slider_right_button.disabled = false;

    bias_slider.disabled = false;
    bias_slider_left_button.disabled = false;
    bias_slider_right_button.disabled = false;
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
            gravity_cylinder.x_data.push(parseInt(row[0]));
            gravity_cylinder.g_data.push(parseFloat(row[1]));
        }
        gravity_cylinder.n_data = gravity_cylinder.x_data.length;
        gravity_cylinder.setScaleLoaded(true);
        enableWidgets();
        anomaly_ctx.clearRect(0,0, anomaly_canvas.width, anomaly_canvas.height);
        ctx.clearRect(0,0, canvas.width, canvas.height);
        gravity_cylinder.paint();
        gravity_cylinder.setTableValues();
        
    };
    reader.readAsText(file);
};

// Canvas Mouse Events
anomaly_canvas.addEventListener("mousedown", anomalyMouseDownEvents, false);
anomaly_canvas.addEventListener("mouseup", anomalyMouseUpEvents, false);
anomaly_canvas.addEventListener("mouseout", anomalyMouseOutsideOfCanvas, false);
anomaly_canvas.addEventListener("touchstart", anomalyMouseDownEvents, false);
anomaly_canvas.addEventListener("touchend", anomalyMouseUpEvents, false);
anomaly_canvas.addEventListener("touchmove", anomalyTouchOutsideOfCanvas, false);

anomaly_canvas.addEventListener("touchstart", function(event)
{
    let touch = event.touches[0];
    let mouseEvent = new MouseEvent("mousedown", 
    {
        clientX: touch.clientX,
        clientY: touch.clientY
    })
    anomaly_canvas.dispatchEvent(mouseEvent);
}, false);

anomaly_canvas.addEventListener("touchend", function(event)
{
    let mouseEvent = new MouseEvent("mouseup", {});
    anomaly_canvas.dispatchEvent(mouseEvent);
}, false);

anomaly_canvas.addEventListener("touchmove", function(event)
{
    let touch = event.touches[0];
    let mouseEvent = new MouseEvent("mousemove",
    {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    anomaly_canvas.dispatchEvent(mouseEvent)
}, false);

function anomalyMouseDownEvents(event)
{
    if(event.target == anomaly_canvas)
        event.preventDefault();
    let mouse_x = event.layerX;
    let mouse_y = event.layerY;
    
    // Left arrow button clicked 
    if(anomaly_controller.mouseInArrow(mouse_x, mouse_y, anomaly_controller.left_arrow_x, anomaly_controller.left_arrow_y))
    {
        anomaly_controller.leftArrowPressed();
        anomaly_controller.arrows_down = true; 
    }
         
    // Right arrow button clicked
    if(anomaly_controller.mouseInArrow(mouse_x, mouse_y, anomaly_controller.right_arrow_x, anomaly_controller.right_arrow_y))
    {
        anomaly_controller.rightArrowPressed();
        anomaly_controller.arrows_down = true; 
    }
        
    // Up arrow button clicked
    if(anomaly_controller.mouseInArrow(mouse_x, mouse_y, anomaly_controller.up_arrow_x, anomaly_controller.up_arrow_y))
    {
        anomaly_controller.upArrowPressed();
        anomaly_controller.arrows_down = true; 
    }

    // Down arrow button clicked
    if(anomaly_controller.mouseInArrow(mouse_x, mouse_y, anomaly_controller.down_arrow_x, anomaly_controller.down_arrow_y))
    {
        anomaly_controller.downArrowPressed();
        anomaly_controller.arrows_down = true; 
    }
      
}

function anomalyMouseUpEvents(event)
{
    if(event.target == anomaly_canvas)
        event.preventDefault();
    if(anomaly_controller.left_arrow_down)
        anomaly_controller.leftArrowUp();
    if(anomaly_controller.right_arrow_down)
        anomaly_controller.rightArrowUp();
    if(anomaly_controller.up_arrow_down)
        anomaly_controller.upArrowUp();
    if(anomaly_controller.down_arrow_down)
        anomaly_controller.downArrowUp();
    anomaly_controller.arrows_down = false; 
}

function anomalyMouseOutsideOfCanvas(event)
{
    if(event.target == anomaly_canvas)
        event.preventDefault();
    anomaly_controller.left_arrow_down = false;
    anomaly_controller.right_arrow_down = false;
    anomaly_controller.up_arrow_down = false;
    anomaly_controller.down_arrow_down = false;
    anomaly_controller.paint();
    anomaly_controller.arrows_down = false; 
}

function anomalyTouchOutsideOfCanvas(event)
{
    let touch_x = event.touches[0].clientX;
    let touch_y = event.touches[0].clientY;
    if(event.target == anomaly_canvas)
        event.preventDefault();
    else
    {
        anomaly_controller.left_arrow_down = false;
        anomaly_controller.right_arrow_down = false;
        anomaly_controller.up_arrow_down = false;
        anomaly_controller.down_arrow_down = false;
        anomaly_controller.paint();
    }
    anomaly_controller.arrows_down = false; 
}

// Keyboard Controls
window.addEventListener('keydown', function (event) 
{
    event.preventDefault();
    if (event.key == "ArrowLeft")
    {
        anomaly_controller.leftArrowPressed();
        anomaly_controller.arrows_down = true;
    }
    else if (event.key == "ArrowRight")
    {
        anomaly_controller.rightArrowPressed();
        anomaly_controller.arrows_down = true;
    }
    else if (event.key == "ArrowUp")
    {
        anomaly_controller.upArrowPressed();
        anomaly_controller.arrows_down = true;
    }
    else if (event.key == "ArrowDown")
    {
        anomaly_controller.downArrowPressed();
        anomaly_controller.arrows_down = true;
    }
    
});

window.addEventListener('keyup', function (event) 
{
    if (event.key == "ArrowLeft")
        anomaly_controller.leftArrowUp();
    else if (event.key == "ArrowRight")
        anomaly_controller.rightArrowUp();
    else if (event.key == "ArrowUp")
        anomaly_controller.upArrowUp();
    else if (event.key == "ArrowDown")
        anomaly_controller.downArrowUp();

    anomaly_controller.arrows_down = false; 
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

disableWidgets();

function loop(time_stamp) 
{
    // Delay before speeding up anomaly changes
    if(anomaly_controller.arrows_down)
        anomaly_controller.counter += 1;
    else
        anomaly_controller.counter = 0;
    
    if(anomaly_controller.counter >= 10)
        anomaly_controller.changeValues();

    gravity_cylinder.paint();
  
    window.requestAnimationFrame(loop);
  }
  window.requestAnimationFrame(loop);