let v1_slider = document.getElementById("VelocityTop");
let v2_slider = document.getElementById("VelocityMiddle");
let v3_slider = document.getElementById("VelocityBottom");
let bias_slider = document.getElementById("Bias");
function v1_sliderMover(val) {
    //@ts-ignore
    v1Layer = v1Format(val, true);
    setValues();
    repaint();
}
/**
 * v1 left button
 */
function v1_LeftButton() {
    //@ts-ignore
    v1_slider.value--;
    //@ts-ignore
    v1Layer = v1Format(v1_slider.value, true);
    // setValues();
    repaint();
}
/**
 * v1 right button
 */
function v1_RightButton() {
    //@ts-ignore
    v1_slider.value++;
    //@ts-ignore
    v1Layer = v1Format(v1_slider.value, true);
    setValues();
    repaint();
}
/**
 * slider mover
 * @param val
 */
function v2_sliderMover(val) {
    //@ts-ignore
    v2Layer = v2Format(val, true);
    setValues();
    repaint();
}
/**
 * v2 left button
 */
function v2_LeftButton() {
    //@ts-ignore
    v2_slider.value--;
    //@ts-ignore
    v2Layer = v2Format(v2_slider.value, true);
    // setValues();
    repaint();
}
/**
 * v2 right button
 */
function v2_RightButton() {
    //@ts-ignore
    v2_slider.value++;
    //@ts-ignore
    v2Layer = v2Format(v2_slider.value, true);
    setValues();
    repaint();
}
/**
 * slider mover
 * @param val
 */
function v3_sliderMover(val) {
    //@ts-ignore
    v3_Layer = v3Format(val, true);
    setValues();
    repaint();
}
/**
 * v3 left button
 */
function v3_LeftButton() {
    //@ts-ignore
    v3_slider.value--;
    //@ts-ignore
    v3_Layer = v3Format(v3_slider.value, true);
    // setValues();
    repaint();
}
/**
 * v3 right button
 */
function v3_RightButton() {
    //@ts-ignore
    v3_slider.value++;
    //@ts-ignore
    v3_Layer = v3Format(v3_slider.value, true);
    setValues();
    repaint();
}
/**
 * Bias slider mover
 * @param val
 */
function bias_sliderMover(val) {
    //@ts-ignore
    bias_Layer = biasFormat(val, true);
    setValues();
    repaint();
}
/**
 * Bias left button
 */
function bias_LeftButton() {
    //@ts-ignore
    bias_slider.value--;
    //@ts-ignore
    bias_Layer = biasFormat(bias_slider.value, true);
    // setValues();
    repaint();
}
/**
 * bias right button
 */
function bias_RightButton() {
    //@ts-ignore
    bias_slider.value++;
    //@ts-ignore
    bias_Layer = biasFormat(bias_slider.value, true);
    setValues();
    repaint();
}
function SourcesSelectBox(val) {
    numSources_Layer = val;
    repaint();
}
function repaint() {
    frameChanged();
    ctx_trace.clearRect(0, 0, canvas_trace.width, canvas_trace.height);
    ctx_layer.clearRect(0, 0, canvas_layer.width, canvas_layer.height);
    GetParameters();
    paintLayer(); //this paints the blue canvas
    paintTraces();
    setTableValues();
    // setTableValues();
}
//# sourceMappingURL=SliderControls.js.map