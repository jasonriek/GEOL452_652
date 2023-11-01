let maxsize = 3000;
let ndata;
let gData = new Array(3000);
for (let i = 0; i < 3000; i++) {
    gData[i] = 0.0;
}
/**
 * Files input func
 * @param rows
 * @returns
 */
function fileInputFunc() {
    for (let i = 0; i < 3000; i++) {
        xData[i] = 0.0;
    }
    var DataArray = document.getElementById("textarea").value.split(/[ , \n]+/);
    if (DataArray != "" && !(DataArray.length % 2) && DataArray.length >= 4) {
        let i;
        let token;
        let tokenCount = 0;
        let nelements = DataArray.length;
        if (nelements >= maxsize * 2)
            nelements = maxsize * 2;
        ndata = nelements / 2;
        for (let i = 0; i < nelements / 2; i++) {
            token = DataArray[tokenCount];
            xData[i] = parseFloat(token);
            tokenCount++;
            token = DataArray[tokenCount];
            gData[i] = parseFloat(token);
            tokenCount++;
        }
        inputFrameChanged();
    }
}
function getxData() {
    return xData;
}
function getgData() {
    return gData;
}
function getndata() {
    return ndata;
}
function inputFrameChanged() {
    //Get the data
    xData = getxData();
    sData = getgData();
    nx = getndata();
    //Signal the ModelFrame that we have changed the number/location
    //of the receivers
    setRecArray(xData, nx);
    //repaint applet (All fields and bounds get recomputed)
    repaint();
}
function clearTextArea() {
    document.getElementById("textarea").value = "";
}
/**
 * 45 25 32 12 85 45 32 49 35 12 85 12 35 45 45 35 85 35
*/ 
//# sourceMappingURL=InputFrame.js.map