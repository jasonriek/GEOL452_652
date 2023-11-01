let orderCount = 0;
function outputData() {
    let table = document.getElementById("stats");
    removeTable();
    let key_name_head = "key_name";
    let keynameCount = 1;
    let key_name = `${key_name_head}_${keynameCount}`;
    for (let i = 0; i < nTraces; i++) {
        if (dataNodes[key_name].ptime != -1) {
            //@ts-ignore
            dataNodes[key_name].outputOrder = orderCount;
            orderCount++;
            let row = table.insertRow(0);
            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            let cell3 = row.insertCell(2);
            let timeOutput = `Time = ${dataNodes[key_name].ptimeOutput}`;
            let offsetOutput = `Location = ${dataNodes[key_name].offset}`;
            cell1.innerHTML = `<td ><label class=${key_name}  style="border: none; width: 110px;
      padding: 10px 20px;
      display: inline-block;
      " onmouseover="changeBlue(this)" onmouseout="changeRed(this)">${timeOutput}</label></td>`;
            cell2.innerHTML = `<td ><label class=${key_name}  style="border: none; width: 110px;
      padding: 10px 20px;
      display: inline-block;
      " onmouseover="changeBlue(this)" onmouseout="changeRed(this)">${offsetOutput}</label></td>`;
            ;
            cell3.innerHTML = `<td ><input type="button" id=${key_name} value="remove"  style="background-color: #5097ab;
      border: none;
      color: white;
      padding: 10px 20px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;" class=${key_name} onclick="deleteRow(this, ${dataNodes[key_name].outputOrder})" onmouseover="changeBlue(this)" onmouseout="changeRed(this)"></td>`;
        }
        keynameCount++;
        key_name = `${key_name_head}_${keynameCount}`;
    }
}
function changeBlue(obj) {
    let p_time;
    let x_base;
    let y_loc;
    let i = parseInt(obj.className.slice(9, 11));
    i = i - 1;
    picked_ctx.fillStyle = "#00FF00";
    p_time = dataNodes[obj.className].ptime;
    // console.log("ptime for " + key_name + " = " + p_time);
    x_base = Math.trunc(ul_cor_x + first_gap + gap * i);
    y_loc = ul_cor_y + Math.trunc(p_time / dt);
    picked_ctx.fillRect(x_base - 5, y_loc - 1, 10, 2);
}
function changeRed(obj) {
    let p_time;
    let x_base;
    let y_loc;
    let i = parseInt(obj.className.slice(9, 11));
    i = i - 1;
    picked_ctx.fillStyle = "#CC0000";
    p_time = dataNodes[obj.className].ptime;
    // console.log("ptime for " + key_name + " = " + p_time);
    x_base = Math.trunc(ul_cor_x + first_gap + gap * i);
    y_loc = ul_cor_y + Math.trunc(p_time / dt);
    picked_ctx.fillRect(x_base - 5, y_loc - 1, 10, 2);
}
//# sourceMappingURL=outputData.js.map