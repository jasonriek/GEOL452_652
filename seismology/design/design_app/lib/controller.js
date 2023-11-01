const depthSlope_canvas = document.getElementById("depthSlope_controller");
const depthSlope_ctx = depthSlope_canvas.getContext("2d");
// Handles the Arrow button image tiles.
// DON'T TINKER WITH THIS, it works just fine... ;)
class ArrowButton {
    /**
     * Creates an instance of arrow button.
     * @param image_src
     * @param width
     * @param height
     */
    constructor(image_src, width, height) {
        this.image_src = image_src;
        this.image = new Image();
        this.image.src = this.image_src;
        this.width = width;
        this.height = height;
    }
    /**
     * Draws arrow button
     * @param image_sheet_x
     * @param image_sheet_y
     * @param x
     * @param y
     */
    draw(image_sheet_x, image_sheet_y, x, y) {
        depthSlope_ctx.drawImage(this.image, image_sheet_x, image_sheet_y, this.width, this.height, x, y, this.width, this.height);
    }
}
/**
 * Depth slope controller
 */
class depthSlopeController {
    /**
     * Creates an instance of depth slope controller.
     */
    constructor() {
        this.DepthDown_arrow = new ArrowButton("white_arrows.png", 64, 64);
        this.DepthDown_arrow_pressed = new ArrowButton("white_arrows_pressed.png", 64, 64);
        this.DepthDown_arrow_x = 25;
        this.DepthDown_arrow_y = 105;
        this.DepthDown_arrow_down = false;
        this.SlopeDown_arrow = new ArrowButton("white_arrows.png", 64, 64);
        this.SlopeDown_arrow_pressed = new ArrowButton("white_arrows_pressed.png", 64, 64);
        this.SlopeDown_arrow_x = 120;
        this.SlopeDown_arrow_y = this.DepthDown_arrow_y;
        this.SlopeDown_arrow_down = false;
        this.SlopeUp_arrow = new ArrowButton("white_arrows.png", 64, 64);
        this.SlopeUp_arrow_pressed = new ArrowButton("white_arrows_pressed.png", 64, 64);
        this.SlopeUp_arrow_x = 120;
        this.SlopeUp_arrow_y = 35;
        this.SlopeUp_arrow_down = false;
        this.DepthUp_arrow = new ArrowButton("white_arrows.png", 64, 64);
        this.DepthUp_arrow_pressed = new ArrowButton("white_arrows_pressed.png", 64, 64);
        this.DepthUp_arrow_x = 25;
        this.DepthUp_arrow_y = 35;
        this.DepthUp_arrow_down = false;
        this.arrows_down = false;
    }
    /**
     * Activates change values
     */
    activateChangeValues() {
        if (this.arrows_down) {
            this.changeValues();
            var timer = setTimeout(this.activateChangeValues.bind(this), 70);
        }
        else
            clearTimeout(timer);
    }
    /**
     * Starts changing values
     */
    startChangingValues() {
        setTimeout(this.activateChangeValues.bind(this), 700);
    }
    /**
     * Paints depth slope controller
     */
    paint() {
        depthSlope_ctx.clearRect(0, 0, depthSlope_canvas.width, depthSlope_canvas.height);
        if (this.DepthDown_arrow_down)
            this.DepthDown_arrow_pressed.draw(192, 0, this.DepthDown_arrow_x, this.DepthDown_arrow_y);
        else
            this.DepthDown_arrow.draw(192, 0, this.DepthDown_arrow_x, this.DepthDown_arrow_y);
        if (this.SlopeDown_arrow_down)
            this.SlopeDown_arrow_pressed.draw(192, 0, this.SlopeDown_arrow_x, this.SlopeDown_arrow_y);
        else
            this.SlopeDown_arrow.draw(192, 0, this.SlopeDown_arrow_x, this.SlopeDown_arrow_y);
        if (this.SlopeUp_arrow_down)
            this.SlopeUp_arrow_pressed.draw(128, 0, this.SlopeUp_arrow_x, this.SlopeUp_arrow_y);
        else
            this.SlopeUp_arrow.draw(128, 0, this.SlopeUp_arrow_x, this.SlopeUp_arrow_y);
        if (this.DepthUp_arrow_down)
            this.DepthUp_arrow_pressed.draw(128, 0, this.DepthUp_arrow_x, this.DepthUp_arrow_y);
        else
            this.DepthUp_arrow.draw(128, 0, this.DepthUp_arrow_x, this.DepthUp_arrow_y);
        depthSlope_ctx.font = "18px Ariel";
        depthSlope_ctx.fillStyle = "#000000";
        depthSlope_ctx.fillText("Slope", 127, 19);
        depthSlope_ctx.fillText("Depth", 35, 19);
    }
    /**
     * Changes values
     */
    changeValues() {
        if (this.DepthDown_arrow_down) {
            this.LayerDepthDown();
        }
        else if (this.SlopeDown_arrow_down) {
            this.LayerSlopeDown();
        }
        else if (this.SlopeUp_arrow_down) {
            this.LayerSlopeUp();
        }
        else if (this.DepthUp_arrow_down) {
            this.LayerDepthUp();
        }
    }
    /**
     * Mouses in arrow
     * @param mouse_x
     * @param mouse_y
     * @param arrow_x
     * @param arrow_y
     * @returns
     */
    mouseInArrow(mouse_x, mouse_y, arrow_x, arrow_y) {
        if (mouse_x >= arrow_x && mouse_x <= arrow_x + ARROW_BUTTON_SIZE)
            if (mouse_y >= arrow_y && mouse_y <= arrow_y + ARROW_BUTTON_SIZE)
                // In the x Range
                // In the y Range
                return true;
        return false;
    }
    /**
     * Depths down arrow pressed
     */
    DepthDownArrowPressed() {
        //setTimeout(this.DepthDownArrowUp.bind(this), 100);
        this.DepthDown_arrow_down = true;
        this.changeValues();
        this.startChangingValues();
        this.paint();
    }
    /**
     * Depths down arrow up
     */
    DepthDownArrowUp() {
        this.DepthDown_arrow_down = false;
        this.paint();
    }
    /**
     * Slopes down arrow pressed
     */
    SlopeDownArrowPressed() {
        this.SlopeDown_arrow_down = true;
        this.changeValues();
        this.startChangingValues();
        this.paint();
    }
    /**
     * Slopes down arrow up
     */
    SlopeDownArrowUp() {
        this.SlopeDown_arrow_down = false;
        this.paint();
    }
    /**
     * Slopes up arrow pressed
     */
    SlopeUpArrowPressed() {
        this.SlopeUp_arrow_down = true;
        this.changeValues();
        this.startChangingValues();
        this.paint();
    }
    /**
     * Slopes up arrow up
     */
    SlopeUpArrowUp() {
        this.SlopeUp_arrow_down = false;
        this.paint();
    }
    /**
     * Depths up arrow pressed
     */
    DepthUpArrowPressed() {
        this.DepthUp_arrow_down = true;
        this.changeValues();
        this.startChangingValues();
        this.paint();
    }
    /**
     * Depths up arrow up
     */
    DepthUpArrowUp() {
        this.DepthUp_arrow_down = false;
        this.paint();
    }
    /**
     * Layers depth up
     */
    LayerDepthUp() {
        if (
        //@ts-ignore
        document.getElementById("Layer1").checked &&
            model_frame.heightL1 >= model_frame.layer3y &&
            model_frame.heightL1 <= model_frame.heightL2 &&
            model_frame.slopeL1 >= model_frame.layer3y &&
            model_frame.slopeL1 <= model_frame.slopeL2) {
            model_frame.b1 -= 0.1;
            repaint();
        }
        else if (
        //@ts-ignore
        document.getElementById("Layer2").checked &&
            model_frame.heightL2 > model_frame.heightL1 &&
            // model_frame.heightL2 >= model_frame.layer3h &&
            model_frame.slopeL2 > model_frame.slopeL1
        // model_frame.slopeL2 >= model_frame.layer3h
        ) {
            model_frame.b2 -= 0.1;
            repaint();
        }
    }
    /**
     * Layers depth down
     */
    LayerDepthDown() {
        if (
        //@ts-ignore
        document.getElementById("Layer1").checked &&
            model_frame.heightL1 < model_frame.heightL2 &&
            model_frame.slopeL1 < model_frame.slopeL2) {
            model_frame.b1 += 0.1;
            repaint();
        }
        else if (
        //@ts-ignore
        document.getElementById("Layer2").checked &&
            model_frame.heightL2 < model_frame.layer2max &&
            model_frame.slopeL2 < model_frame.layer2max) {
            model_frame.b2 += 0.1;
            repaint();
        }
    }
    /**
     * Layers slope up
     */
    LayerSlopeUp() {
        if (
        //@ts-ignore
        document.getElementById("Layer1").checked &&
            model_frame.heightL1 >= model_frame.layer3y - 1 &&
            model_frame.heightL1 <= model_frame.heightL2 &&
            model_frame.slopeL1 >= model_frame.layer3y &&
            model_frame.slopeL1 <= model_frame.slopeL2) {
            model_frame.m1 -= 0.0001;
            repaint();
        }
        else if (
        //@ts-ignore
        document.getElementById("Layer2").checked &&
            model_frame.slopeL2 > model_frame.slopeL1 &&
            model_frame.slopeL2 <= model_frame.layer2max) {
            model_frame.m2 -= 0.0001;
            repaint();
        }
    }
    /**
     * Layers slope down
     */
    LayerSlopeDown() {
        if (
        //@ts-ignore
        document.getElementById("Layer1").checked &&
            model_frame.heightL1 >= model_frame.layer3y - 1 &&
            model_frame.heightL1 <= model_frame.heightL2 &&
            model_frame.slopeL1 >= model_frame.layer3y - 1 &&
            model_frame.slopeL1 < model_frame.slopeL2) {
            model_frame.m1 += 0.0001;
            repaint();
        }
        else if (
        //@ts-ignore
        document.getElementById("Layer2").checked &&
            model_frame.slopeL2 >= model_frame.slopeL1 &&
            model_frame.slopeL2 < model_frame.layer2max) {
            model_frame.m2 += 0.0001;
            repaint();
        }
    }
}
let depthSlope_controller = new depthSlopeController();
// Canvas Mouse Events
depthSlope_canvas.addEventListener("mousedown", anomalyMouseDownEvents, false);
depthSlope_canvas.addEventListener("mouseup", anomalyMouseUpEvents, false);
depthSlope_canvas.addEventListener("mouseout", anomalyMouseOutsideOfCanvas, false);
depthSlope_canvas.addEventListener("touchstart", anomalyMouseDownEvents, false);
depthSlope_canvas.addEventListener("touchend", anomalyMouseUpEvents, false);
depthSlope_canvas.addEventListener("touchmove", anomalyTouchOutsideOfCanvas, false);
/**
 * Anomalys mouse down events
 * @param event
 */
function anomalyMouseDownEvents(event) {
    if (event.target == depthSlope_canvas)
        event.preventDefault();
    //@ts-ignore
    let mouse_x = event.layerX;
    let mouse_y = event.layerY;
    // DepthDown arrow button clicked
    if (depthSlope_controller.mouseInArrow(mouse_x, mouse_y, depthSlope_controller.DepthDown_arrow_x, depthSlope_controller.DepthDown_arrow_y)) {
        depthSlope_controller.DepthDownArrowPressed();
        depthSlope_controller.arrows_down = true;
    }
    // SlopeDown arrow button clicked
    if (depthSlope_controller.mouseInArrow(mouse_x, mouse_y, depthSlope_controller.SlopeDown_arrow_x, depthSlope_controller.SlopeDown_arrow_y)) {
        depthSlope_controller.SlopeDownArrowPressed();
        depthSlope_controller.arrows_down = true;
    }
    // Up arrow button clicked
    if (depthSlope_controller.mouseInArrow(mouse_x, mouse_y, depthSlope_controller.SlopeUp_arrow_x, depthSlope_controller.SlopeUp_arrow_y)) {
        depthSlope_controller.SlopeUpArrowPressed();
        depthSlope_controller.arrows_down = true;
    }
    // Down arrow button clicked
    if (depthSlope_controller.mouseInArrow(mouse_x, mouse_y, depthSlope_controller.DepthUp_arrow_x, depthSlope_controller.DepthUp_arrow_y)) {
        depthSlope_controller.DepthUpArrowPressed();
        depthSlope_controller.arrows_down = true;
    }
}
/**
 * Anomalys mouse up events
 * @param event
 */
function anomalyMouseUpEvents(event) {
    if (event.target == depthSlope_canvas)
        event.preventDefault();
    if (depthSlope_controller.DepthDown_arrow_down)
        depthSlope_controller.DepthDownArrowUp();
    if (depthSlope_controller.SlopeDown_arrow_down)
        depthSlope_controller.SlopeDownArrowUp();
    if (depthSlope_controller.SlopeUp_arrow_down)
        depthSlope_controller.SlopeUpArrowUp();
    if (depthSlope_controller.DepthUp_arrow_down)
        depthSlope_controller.DepthUpArrowUp();
    depthSlope_controller.arrows_down = false;
}
/**
 * Anomalys mouse outside of canvas
 * @param event
 */
function anomalyMouseOutsideOfCanvas(event) {
    if (event.target == depthSlope_canvas)
        event.preventDefault();
    depthSlope_controller.DepthDown_arrow_down = false;
    depthSlope_controller.SlopeDown_arrow_down = false;
    depthSlope_controller.SlopeUp_arrow_down = false;
    depthSlope_controller.DepthUp_arrow_down = false;
    depthSlope_controller.paint();
    depthSlope_controller.arrows_down = false;
}
/**
 * Anomalys touch outside of canvas
 * @param event
 */
function anomalyTouchOutsideOfCanvas(event) {
    let touch_x = event.touches[0].clientX;
    let touch_y = event.touches[0].clientY;
    if (event.target == depthSlope_canvas)
        event.preventDefault();
    else {
        depthSlope_controller.DepthDown_arrow_down = false;
        depthSlope_controller.SlopeDown_arrow_down = false;
        depthSlope_controller.SlopeUp_arrow_down = false;
        depthSlope_controller.DepthUp_arrow_down = false;
        depthSlope_controller.paint();
    }
    depthSlope_controller.arrows_down = false;
}
// Keyboard Controls
window.addEventListener("keydown", function (event) {
    event.preventDefault();
    if (event.key == "ArrowLeft") {
        depthSlope_controller.DepthDownArrowPressed();
        depthSlope_controller.arrows_down = true;
    }
    else if (event.key == "ArrowRight") {
        depthSlope_controller.DepthUpArrowPressed();
        depthSlope_controller.arrows_down = true;
    }
    else if (event.key == "ArrowUp") {
        depthSlope_controller.SlopeUpArrowPressed();
        depthSlope_controller.arrows_down = true;
    }
    else if (event.key == "ArrowDown") {
        depthSlope_controller.SlopeDownArrowPressed();
        depthSlope_controller.arrows_down = true;
    }
});
window.addEventListener("keyup", function (event) {
    if (event.key == "ArrowLeft")
        depthSlope_controller.DepthDownArrowUp();
    else if (event.key == "ArrowRight")
        depthSlope_controller.DepthUpArrowUp();
    else if (event.key == "ArrowUp")
        depthSlope_controller.SlopeUpArrowUp();
    else if (event.key == "ArrowDown")
        depthSlope_controller.SlopeDownArrowUp();
    depthSlope_controller.arrows_down = false;
});
function loop() {
    depthSlope_controller.paint();
    refraction_overlay.paint();
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);
