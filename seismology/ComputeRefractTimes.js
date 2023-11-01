
function ComputeRefractTimes(v1, v2, v3, h1, h2, dd1, dd2, std, minx, dx, nr, sx)
{
    // Total number of stations computed.
    this.n_data = nr;
    // Array of computed travel times.
    this.times = [this.n_data];
    // Array of computed station locations.
    this.locations = [this.n_data];
    // Array of computed arrival amplitudes.
    this.amplitudes = [this.n_data];
    // Array of arrival time observed at some offset. 0=direct
    // 1=refraction first layer, 2=refraction second layer.
    this.types = [this.n_data];

    //Create method variables that will contain the depths to the
    //two layers beneath each seismic station
    this.h1s = [this.n_data];
    this.h2s = [this.n_data];

    // Convert dips to radians
    this.d1 = toRadians(dd1);
    this.d2 = toRadians(dd2);

    // Number of stations observing direct as first arrivals.
    this.n_direct = 0;
    // Number of stations observing refraction off of first layer.
    this.n_ref_1 = 0;
    //  Number of stations observing refraction off of second layer.
    this.n_ref_2 = 0;

    // Compute layer depths beneath each station
    let x;
    for (let i = 0; i < this.n_data; i++)
    {
        x = i * dx;
        this.h1s[i] = h1 - x * Math.tan(this.d1);
        this.h2s[i] = h1 + h2 - x * Math.tan(this.d2);
    }

    //Compute layer depths beneath source
    let h1sd = h1 - sx * Math.tan(this.d1);
    let h2sd = h1 + h2 - sx * Math.tan(this.d2);

    //Temporary variables
    let amp;
    let direct;
    let ic;
    let ref1;
    let alpha;
    let beta;
    let i1s;
    let i1r;
    let rv;
    let ref2;


    //Compute travel times of the direct, and refracted waves
    for (let i = 0; i < this.n_data; i++)
    {

        //Get Offset
        this.locations[i] = i * dx;//Station location
        x = Math.abs(this.locations[i] - sx);

        //Estimate amplitude
        if (x === 0)
        {
            x = 0.01;
        }
        amp = 1.0 / Math.sqrt(Math.abs(x));

        // now compute direct arrival time
        direct = x / v1 * 1000.0 +
        gaussianRand() * std;

        // now compute refraction from bottom of first layer
        ic = Math.asin(v1 / v2);
        ref1 = (x * Math.cos(this.d1) / v2 + h1sd * Math.cos(this.d1) * Math.cos(ic) / v1 +
        this.h1s[i] * Math.cos(this.d1) * Math.cos(ic) / v1) * 1000.0 +
        gaussianRand() * std;

        // now compute refraction from bottom of second layer
        ic = Math.asin(v2 / v3);
        alpha = Math.asin(v1 / v2 * Math.sin(ic + (this.d2 - this.d1)));
        beta = Math.asin(v1 / v2 * Math.sin(ic - (this.d2 - this.d1)));
        rv = x * Math.cos(this.d1) * Math.cos(this.d2 - this.d1) / v3;
        ref2 = (rv + (h1sd * Math.cos(this.d1) * Math.cos(alpha) +
        this.h1s[i] * Math.cos(this.d1) * Math.cos(beta)) / v1 +
        ((h2sd - h1sd) * Math.cos(this.d2) * Math.cos(ic) + (this.h2s[i] - this.h1s[i]) * Math.cos(this.d2) * Math.cos(ic)) / v2) * 1000.0 +
        gaussianRand() * std;

        // Now decide which of these is the first arrival and save
        if (direct < ref1 && direct < ref2)
        {
            this.n_direct++;
            this.times[i] = direct;
            this.amplitudes[i] = amp;
        }
        if (ref1 < direct && ref1 < ref2)
        {
            this.n_ref_1++;
            this.times[i] = ref1;
            this.amplitudes[i] = amp;
        }
        if (ref2 < direct && ref2 < ref1)
        {
            this.n_ref_2++;
            this.times[i] = ref2;
            this.amplitudes[i] = amp;
        }
    }

    this.getTimes = function() {return this.times;};
    this.getLocations = function () {return this.locations;};
    this.getAmplitudes = function () {return this.amplitudes;};
    this.getTypes = function () {return this.types;};
    this.getNData = function() {return this.n_data;};
    this.getNRef1 = function () {return this.n_ref_1;};
    this.getNRef2 = function() {return this.n_ref_2;};
    this.getNDirect = function () {return this.n_direct};
}

// Degrees to radian conversion function
function toRadians(degrees)
{
    return degrees*(Math.PI/180);
}

// function value to produce normal distributed values clustered around a mean.
function gaussianRand()
{
    let x1, x2, rad, y1;
    do {
        x1 = 2 * Math.random() - 1;
        x2 = 2 * Math.random() - 1;
        rad = x1 * x1 + x2 * x2;
    } while(rad >= 1 || rad == 0);
    let c = Math.sqrt(-2 * Math.log(rad) / rad);
    return (x1 * c);
}

// Draw line function
function drawLine(x1, y1, x2, y2)
{
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}