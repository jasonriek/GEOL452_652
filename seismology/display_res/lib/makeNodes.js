let nTraces = 0;
let dataNodes;
const file_input = document.getElementById("file_input");
/**
 * Makes a new node object, key_name_x
 */
class newNode {
    constructor(offset) {
        this.offset = offset;
        this.nArrivals = 0;
        this.ptime = -1;
        this.farrival = 10000000.0;
        this.famp = 0.0;
        this.times = [];
        this.amps = [];
        this.picked = false;
        this.time = 0;
        this.amp = 0;
    }
    /**
     * Fills nodes with data
     * @param time
     * @param amp
     * @param key_name
     */
    fillNodes(time, amp) {
        let maxArrivals = 10;
        let maxAmp = 0;
        let earrival = 10000000.0;
        newNode.larrival = -1000000.0;
        if (this.nArrivals < maxArrivals - 1) {
            this.times[this.nArrivals] = time;
            this.amps[this.nArrivals] = amp;
            this.nArrivals++;
        }
        if (Math.abs(amp) > maxAmp) {
            maxAmp = Math.abs(amp);
        }
        if (this.farrival > time) {
            this.farrival = time;
            this.famp = amp;
        }
        if (earrival > time) {
            earrival = time;
        }
        if (newNode.larrival < time) {
            newNode.larrival = time;
        }
    }
    getTime(n) {
        if (n < this.nArrivals) {
            return this.times[n];
        }
        else {
            return -1;
        }
    }
    getAmp(n) {
        if (n < this.nArrivals) {
            return this.amps[n];
        }
        else {
            return 0.0;
        }
    }
}
/**
 * (2)Makes nodes
 * @param DataArray
 */
function makeNodes(rows) {
    let narrivals;
    let time;
    let amp;
    let i;
    let token;
    let tokenCount = 0;
    let keynameCount = 1;
    let key_name_head = "key_name";
    let DataArray = null;
    let Nodes = {};
    for (let i = 0; i < rows.length - 1; i++) {
        tokenCount = 0;
        DataArray = rows[i].split(",");
        token = DataArray[tokenCount];
        let offset = parseFloat(token);
        tokenCount++;
        let key_name = `${key_name_head}_${keynameCount}`;
        keynameCount++;
        Nodes[key_name] = new newNode(offset);
        nTraces++;
        token = DataArray[tokenCount];
        tokenCount++;
        time = parseFloat(token) / 1000.0;
        token = DataArray[tokenCount];
        tokenCount++;
        amp = parseFloat(token);
        Nodes[key_name].fillNodes(time, amp);
    }
    return Nodes;
}
let fileFlag = false;
file_input.onchange = function () {
    let file = this.files[0];
    let reader = new FileReader();
    fileFlag = true;
    reader.onload = function () {
        if (!(picked_ctx === undefined)) {
            clearAll();
            nTraces = 0;
            canvas_width = 800;
            canvas_height = 500;
            seis_height = canvas_height - 100;
            seis_width = canvas_width - 100;
            picked_ctx.clearRect(0, 0, canvas_width, canvas_height);
            ctx.clearRect(0, 0, canvas_width, canvas_height);
        }
        let rows = this.result.split("\n");
        dataNodes = makeNodes(rows);
        drawSeis();
    };
    reader.readAsText(file);
};
//# sourceMappingURL=makeNodes.js.map