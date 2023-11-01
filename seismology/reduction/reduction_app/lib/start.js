/**
 * Starts seis model
 */
function start() {
    //Set some initial values for observed data for plotting
    //These will be overridden when the user enters data in the data entry window
    for (let i = 0; i < 24; i++) {
        xData[i] = 0.0 + i * 5.0;
        sData[i] = 0.0 + i * 4.0;
    }
    nx = 24;
    setRecArray(xData, nx);
    GetParameters();
    setValues();
    setSlideBar();
    paintTraces();
    paintLayer();
    setTableValues();
}
start();
//# sourceMappingURL=start.js.map