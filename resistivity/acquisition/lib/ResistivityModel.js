// /**  Minimum x coordinate allowed */
// let xmin = -250.0;
// /** Maximum x coordinate allowed  */
// let xmax = 250.0;
// /**  Minimum y coordinate allowed */
// let ymin = -250;
// /**   Maximum y coordinate allowed */
// let ymax = 250;
// /**  Resistivity of first layer (unsaturated sediment) */
// let r1 = 500.0;
// /** Resistivity of second layer (unsaturated bedrock)  */
// let r2 = 5000.0;
// /**  Resistivity of half space (saturated bedrock) */
// let r3 = 50.0;
// /**  Standard deviation of the observations in volts */
// let std = 0.01;
// /** Maximum current deliverable by the system in amps  */
// let maxcur = 0.5;
// /**  Scale length used in computing depths and distances */
// let eo = 0.5;
// /**  Maximum acceptable error in Ohm-m allowed in computing sum */
// let conver = 5.0;
// /**  Maximum number of terms to compute in Q(N)  */
// let maxsum = 1000;
// /**  Conversion from natural to common logs */
// let ln2log = 1.0 / Math.log(10.0);
// /**Arrays to hold electorde spacing and resistivity */
// let distance: number[];
// let spacing: number[];
// let res: number[];
// let basement: number[];
// let water: number[];
// let ndist: number;
// let ndata: number;
// let k1: number;
// let k2: number;
// let n1: number;
// let n2: number;
// let n3: number;
// let n4: number;
class ResistivityModel {
    constructor(mx, my, type, trend, smin, nperd, ndec, nread, water, basement, ndepths) {
        /**  Minimum x coordinate allowed */
        this.xmin = -250.0;
        /** Maximum x coordinate allowed  */
        this.xmax = 250.0;
        /**  Minimum y coordinate allowed */
        this.ymin = -250;
        /**   Maximum y coordinate allowed */
        this.ymax = 250;
        /**  Resistivity of first layer (unsaturated sediment) */
        this.r1 = 500.0;
        /** Resistivity of second layer (unsaturated bedrock)  */
        this.r2 = 5000.0;
        /**  Resistivity of half space (saturated bedrock) */
        this.r3 = 50.0;
        /**  Standard deviation of the observations in volts */
        this.std = 0.01;
        /** Maximum current deliverable by the system in amps  */
        this.maxcur = 0.5;
        /**  Scale length used in computing depths and distances */
        this.eo = 0.5;
        /**  Maximum acceptable error in Ohm-m allowed in computing sum */
        this.conver = 5.0;
        /**  Maximum number of terms to compute in Q(N)  */
        this.maxsum = 1000;
        /**  Conversion from natural to common logs */
        this.ln2log = 1.0 / Math.log(10.0);
        let q = new Array(this.maxsum);
        let seed = Math.trunc(mx * nperd * nread) / nread;
        if (seed > 3000) {
            seed = 3000 / ndec;
        }
        this.ndist = nperd * ndec;
        this.distance = [this.ndist];
        this.spacing = [this.ndist];
        this.res = [this.ndist];
        this.basement = basement;
        this.water = water;
        ndata = 0;
        if (type === "Schulumberger") {
            //compute electrode spacing and fill distance array
            this.c = 0;
            this.fdist = smin;
            for (this.i = 0; this.i < ndec; this.i++) {
                this.fdist = smin * Math.pow(10, this.i);
                this.lint = 1.0 / nperd;
                for (this.j = 0; this.j < nperd; this.j++) {
                    this.ldist = this.ln2log * Math.log(this.fdist) + this.j * this.lint;
                    this.distance[this.c] = Math.pow(10, this.ldist);
                    this.c++;
                }
            }
            // Now loop over distances to compute apparent resistivity
            for (this.i = 0; this.i < this.ndist; this.i++) {
                this.l = this.distance[this.i];
                /** Now compute the average layered
                 * model under the array First determine the location of the
                 * current electrodes and make sure they are within the array bounds */
                this.clx1 = this.clx2 = mx;
                this.cly1 = this.cly2 = my;
                if (trend === "East-West") {
                    this.clx1 -= 1;
                    this.clx2 += 1;
                }
                else {
                    this.cly1 -= 1;
                    this.cly2 += 1;
                }
                if (this.clx1 >= this.xmin &&
                    this.clx2 <= this.xmax &&
                    this.cly1 >= this.ymin &&
                    this.cly2 <= this.ymax) {
                    this.n1 = Math.trunc(Math.floor(this.l / 10.0));
                    ndata++; //?could be without this.
                    this.dw = this.db = 0.0;
                    //Now loop from survey midpoint to electrode positions and compute average depths
                    for (this.j = 0; this.j <= this.nl; this.j++) {
                        if (trend === "East-West") {
                            this.dw += this.depth_to_water(mx + 10.0 * this.j, my);
                            this.dw += this.depth_to_water(mx - 10.0 * this.j, my);
                            this.db += this.depth_to_basement(mx + 10.0 * this.j, my);
                            this.db += this.depth_to_basement(mx - 10.0 * this.j, my);
                        }
                        else {
                            this.dw += this.depth_to_water(mx, my + 10.0 * this.j);
                            this.dw += this.depth_to_water(mx, my - 10.0 * this.j);
                            this.db += this.depth_to_basement(mx, my + 10.0 * this.j);
                            this.db += this.depth_to_basement(mx, my - 10.0 * this.j);
                        }
                    }
                    this.dw /= 2.0 * (this.nl + 1);
                    this.db /= 2.0 * (this.nl + 1);
                    // set depths to a multiple of the scale length
                    if (this.dw < 1.0) {
                        this.dw = 1.0;
                    }
                    this.e2 = Math.floor((this.dw / this.eo) * this.eo + 0.5);
                    this.e1 = Math.floor((this.db / this.eo) * this.eo + 0.5);
                    //Compute reflection coefficients and constants
                    // at which Q(N) is non zero
                    this.k1 = (this.r2 - this.r1) / (this.r2 + this.r1);
                    this.k2 = (this.r3 - this.r2) / (this.r3 + this.r2);
                    this.n1 = 0;
                    this.n2 = Math.floor(this.e1 / this.eo);
                    this.n3 = Math.floor(this.e2 / this.eo);
                    this.n4 = Math.floor((this.e1 + this.e2) / this.eo);
                    // Now compute Q(N)
                    this.nterms = Math.floor(Math.sqrt(Math.pow(this.distance[this.ndist - 1], 3) / (8.0 * this.conver)));
                    if (this.nterms < this.n4 * 2)
                        this.nterms = this.n4 * 2;
                    if (this.nterms > this.maxsum)
                        this.nterms = this.maxsum;
                    q[1] = 0.0;
                    for (this.m = 2; this.m <= this.nterms; this.m++) {
                        q[this.m] = this.p(this.m);
                        if (this.m == 0) {
                            q[this.m] += 1.0;
                        }
                        else {
                            this.test = this.n4;
                            if (this.m - 1 < this.test)
                                this.test = this.m - 1;
                            for (this.j = 1; this.j <= this.test; this.j++)
                                q[this.m] +=
                                    (this.p(this.j) - this.h(this.j)) * q[this.m - this.j];
                        }
                    }
                    // Now comput apparent resistivity
                    this.voltage = 0.0;
                    for (this.m = 1; this.m <= this.nterms; this.m++) {
                        this.temp = Math.pow(1.0 +
                            (4.0 * this.m * this.m) /
                                ((this.l * this.l) / (this.eo * this.eo)), -1.5);
                        this.voltage += q[this.m] * this.temp;
                    }
                    this.voltage *= 2.0;
                    this.voltage += 1.0;
                    this.voltage *=
                        (this.r1 * this.maxcur) / ((2.0 * Math.PI * this.l) / this.eo);
                    this.voltage +=
                        (this.gaussianRand() * this.std) / Math.sqrt(nread);
                    this.voltage = Math.abs(this.voltage);
                    this.res[this.i] =
                        (2.0 * Math.PI * this.l * this.voltage) / (this.eo * this.maxcur);
                    this.spacing[this.i] = this.l;
                }
            }
        } // Survey is a Wenner survey
        else {
            this.c = 0;
            this.fdist = smin;
            for (this.i = 0; this.i < ndec; this.i++) {
                this.fdist = smin * Math.pow(10, this.i);
                this.lint = 1.0 / nperd;
                for (this.j = 0; this.j < nperd; this.j++) {
                    this.ldist = this.ln2log * Math.log(this.fdist) + this.j * this.lint;
                    this.distance[this.c] = Math.pow(10, this.ldist);
                    this.c++;
                }
            }
            // Now loop over distances to compute apparent resistivity
            for (this.i = 0; this.i < this.ndist; this.i++) {
                this.l = (3.0 * this.distance[this.i]) / 2.0; // distance from sounding midpoint to current electrode
                // Now compute the average layered  model under the array
                // First determine the location of the current electrodes
                // and make sure they are within the array bounds
                this.clx1 = this.clx2 = mx;
                this.cly1 = this.cly2 = my;
                if (trend === "East-West") {
                    this.clx1 -= this.l;
                    this.clx2 += this.l;
                }
                else {
                    this.cly1 -= this.l;
                    this.cly2 += this.l;
                }
                if (this.clx1 >= this.xmin &&
                    this.clx2 <= this.xmax &&
                    this.cly1 >= this.ymin &&
                    this.cly2 <= this.ymax) {
                    ndata++;
                    this.nl = Math.floor(this.l / 10.0); // get the increment of the electrode spacing
                    // in units at which the model is computed
                    this.dw = this.db = 0.0;
                    // now loop from survey midpoint to electrode positions
                    //and compute average depths
                    for (this.j = 0; this.j <= this.nl; this.j++) {
                        if (trend === "South-East") {
                            this.dw += this.depth_to_water(mx + 10.0 * this.j, my);
                            this.dw += this.depth_to_water(mx - 10.0 * this.j, my);
                            this.db += this.depth_to_basement(mx + 10.0 * this.j, my);
                            this.db += this.depth_to_basement(mx - 10.0 * this.j, my);
                        }
                        else {
                            this.dw += this.depth_to_water(mx, my + 10.0 * this.j);
                            this.dw += this.depth_to_water(mx, my - 10.0 * this.j);
                            this.db += this.depth_to_basement(mx, my + 10.0 * this.j);
                            this.db += this.depth_to_basement(mx, my - 10.0 * this.j);
                        }
                    }
                    this.dw /= 2.0 * (this.nl + 1);
                    this.db /= 2.0 * (this.nl + 1);
                    // set depths to a multiple of the scale length
                    if (this.dw < 1.0)
                        this.dw = 1.0;
                    this.e2 = Math.floor((this.dw / this.eo) * this.eo + 0.5);
                    this.e1 = Math.floor((this.db / this.eo) * this.eo + 0.5);
                    // Compute reflection coefficients and constants
                    // at which Q(N) is non zero
                    this.k1 = (this.r2 - this.r1) / (this.r2 + this.r1);
                    this.k2 = (this.r3 - this.r2) / (this.r3 + this.r2);
                    this.n1 = 0;
                    this.n2 = Math.floor(this.e1 / this.eo);
                    this.n3 = Math.floor(this.e2 / this.eo);
                    this.n4 = Math.floor((this.e1 + this.e2) / this.eo);
                    // Now compute Q(N)
                    this.nterms = Math.floor(Math.sqrt(Math.pow(this.distance[this.ndist - 1], 3) / (8.0 * this.conver)));
                    if (this.nterms < this.n4 * 2)
                        this.nterms = this.n4 * 2;
                    if (this.nterms > this.maxsum)
                        this.nterms = this.maxsum;
                    q[1] = 0.0;
                    for (this.m = 2; this.m <= this.nterms; this.m++) {
                        q[this.m] = this.p(this.m);
                        if (this.m == 0) {
                            q[this.m] += 1.0;
                        }
                        else {
                            this.test = this.n4;
                            if (this.m - 1 < this.test)
                                this.test = this.m - 1;
                            for (this.j = 1; this.j <= this.test; this.j++)
                                q[this.m] +=
                                    (this.p(this.j) - this.h(this.j)) * q[this.m - this.j];
                        }
                    }
                    // reset l to the electrode spacing
                    this.l = this.distance[this.i];
                    // Now compute apparent resistivity
                    this.voltage = 0.0;
                    for (this.m = 1; this.m <= this.nterms; this.m++) {
                        this.temp =
                            2.0 *
                                Math.pow(1.0 +
                                    (4.0 * this.m * this.m) /
                                        ((this.l * this.l) / (this.eo * this.eo)), -0.5) -
                                Math.pow(1.0 +
                                    (this.m * this.m) / ((this.l * this.l) / (this.eo * this.eo)), -0.5);
                        this.voltage += q[this.m] * this.temp;
                    }
                    this.voltage *= 2.0;
                    this.voltage += 1.0;
                    this.voltage *=
                        (this.r1 * this.maxcur) / ((2.0 * Math.PI * this.l) / this.eo);
                    this.voltage +=
                        (this.gaussianRand() * this.std) / Math.sqrt(nread);
                    this.voltage = Math.abs(this.voltage);
                    this.res[this.i] =
                        (2.0 * Math.PI * this.l * this.voltage) / (this.eo * this.maxcur);
                    this.spacing[this.i] = this.l;
                }
            }
        }
    }
    /**
     * p
     */
    p(n) {
        if (n === this.n2)
            return this.k1;
        else {
            if (n === this.n4)
                return this.k2;
            else
                return 0.0;
        }
    }
    /**
     * h
     */
    h(n) {
        if (n == 0)
            return 1.0;
        else {
            if (n == this.n3)
                return this.k1 * this.k2;
            else
                return 0.0;
        }
    }
    /**
     * depth_to_water
     */
    depth_to_water(x, y) {
        let xindex, yindex, i;
        xindex = (x - this.xmin) / 10.0;
        yindex = (y - this.ymin) / 10.0;
        i = xindex * 51 + yindex;
        return this.water[i];
    }
    /**
     * depth_to_basement
     */
    depth_to_basement(x, y) {
        let xindex, yindex, i;
        xindex = (x - this.xmin) / 10.0;
        yindex = (y - this.ymin) / 10.0;
        i = xindex * 51 + yindex;
        return this.basement[i];
    }
    /**
     * getResistivity
     */
    getResistivity() {
        res = new Array(ndata);
        for (this.i = 0; this.i < ndata; this.i++)
            res[this.i] = this.res[this.i];
        return res;
    }
    /**
     * getSpacing
     */
    getSpacing() {
        spacing = new Array(ndata);
        for (this.i = 0; this.i < ndata; this.i++)
            spacing[this.i] = this.spacing[this.i];
        return spacing;
    }
    /**
     * getNData
     */
    getNData() {
        return ndata;
    }
    /**
  * Gaussians rand
  * @returns
  */
    gaussianRand() {
        let x1, x2, rad, c;
        do {
            x1 = 2 * Math.random() - 1;
            x2 = 2 * Math.random() - 1;
            rad = x1 * x1 + x2 * x2;
        } while (rad >= 1 || rad === 0);
        c = Math.sqrt(-2 * Math.log(rad) / rad);
        return x2 * c;
    }
}
//# sourceMappingURL=ResistivityModel.js.map