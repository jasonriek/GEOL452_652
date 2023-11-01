const table_v1 = document.getElementById("v1_val");
const table_v2 = document.getElementById("v2_val");
const table_v3 = document.getElementById("v3_val");
const table_Layer1 = document.getElementById("Layer1_val");
const table_Layer2 = document.getElementById("Layer2_val");
const table_dip = document.getElementById("dip_val");
const table_dip_mid = document.getElementById("dip_mid_val");
const table_bias = document.getElementById("bias_val");
const table_sourceLoc = document.getElementById("sourceLoc_val");
// Table Values in html file
function setTableValues() {
    table_v1.innerHTML = v1Layer + " (m/s)";
    table_v2.innerHTML = v2Layer + " (m/s)";
    table_v3.innerHTML = v3_Layer + " (m/s)";
    table_Layer1.innerHTML = (m1 * dsourcex + b1).toFixed(1) + " (m)";
    table_Layer2.innerHTML = (m2 * dsourcex + b2).toFixed(1) + " (m)";
    let dip = (Math.atan(m1) * 180) / Math.PI;
    table_dip.innerHTML = dip.toFixed(2) + " (degrees)";
    dip = (Math.atan(m2) * 180) / Math.PI;
    table_dip_mid.innerHTML = dip.toFixed(2) + " (degrees)";
    table_bias.innerHTML = bias_Layer.toFixed(2) + " (ms)";
    SourcesOutput();
}
function SourcesOutput() {
    let sourcesData = "";
    for (let i = 0; i < numSources_Layer; i++) {
        if (i > 0) {
            sourcesData += ", ";
        }
        sourcesData += (sLocation[i] - 250.0).toFixed(1);
    }
    sourcesData += " (m)";
    table_sourceLoc.innerHTML = sourcesData;
}
//# sourceMappingURL=dataTable.js.map