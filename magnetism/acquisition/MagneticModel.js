/**
 *  Code for generating magnetic observations derived from a buried
 *  vertical slab. Included in the computation will be random reading
 *  error and a linear regional. According to the problem specifications
 *  the observations will be generated over a 500 by 500 meter square
 *  with the south east corner of the square given by x=250, y=-250.
 *  Constructor requires several parameters;
 *
 *  bx = Base station x location
 *  by = Base station y location
 *  dx = Station spacing in meters along east-west oriented lines
 *  dy = Line spacing, north-south, in meters
 *  num_readings = number of readings to make at each observation
 *  point
 *  tempData = Array containing temporal variations to add to data created
 *  nTemp = number of data points in tempData array
 *
 *  Data output can be obtained via getter methods and consists of the x, y
 *  location of each observation, the relative time in minutes each observation
 *  was taken at, the observed value of the magnetic field in nT, and the value
 *  of the magnetic field observed at the same time at the base station location
 *
 */

// Page Elements
/**************************/

const EXPORT_BUTTON = document.getElementById("export_button");
const ENTRIES = {
    "line_spacing": document.getElementById("line-spacing"),
    "station_spacing": document.getElementById("station-spacing"),
    "n_read": document.getElementById("n-read"),
    "base_x": document.getElementById("base-x"),
    "basy_y": document.getElementById("base-y")
}

function getTableData(table)
{
    let temp = []
    let rows = table.rows;
    let cells = null;
    let cell_value = null;
    for(let i = 0; i<rows.length; i++)
    {
        cells = rows.item(i).cells;
        cell_value = parseInt(cells.item(0).innerHTML);
        temp.push(cell_value)
    }
    
    return temp;
}

// Method to get data stream needed for applying Temporal 
// noise to the magnetic data set
function getTemporalNoise()
{
    // First get the number of data points in the Temporal data file
    try
    {
        data_table = document.getElementById("data");
        data = getTableData(data_table);
        return data;
    }
    catch(err)
    {
        console.log(err.message);
        alert(err.message);
    }
    return []
}



class MagneticModel
{
    constructor(l_space, s_space, n_read, base_x, base_y, temp_data, n_temp)
    {
        this.n_temp = n_temp;
        this.temp_data = temp_data;
        // Set imported values 
        //this.l_space = ENTRIES["line_spacing"].value;
        //this.s_space = ENTRIES["station_spacing"].value;
        //this.n_read = ENTRIES["n_read"].value;
        //this.base_x = ENTRIES["base_x"].value;
        //this.base_y = ENTRIES["basy_y"].value;
        this.l_space = l_space;
        this.s_space = s_space;
        this.n_read = n_read;
        this.base_x = base_x;
        this.base_y = base_y;

        //Earth's Magnetic Field Strength in nT
        this.fe = 54000;
        // Inclination of the magnetic field in the survey area
        this.inc = 58.0; 
        // Minimum distance along profile (east west bound; min=west)
        this.x_min = -250;
        // Maximum distance for line position
        this.x_max = 250;
        // Minimum distance for line position (north south bound; min=south)
        this.y_min = -250;
        // Maximum distance for line position
        this.y_max = 250;
        // Time required to take single magnetic reading in minutes
        this.tsta = 0.5;
        // Maximum time survey crew will work during the day (must be an
        // integer multiple of the tbreak)
        this.t_daily = 720;
        // Maximum time survey crew will work before taking a break
        this.t_break = 360;
        // Standard deviation of the observations (nT)
        this.std = 1.0;

        // Declare difference in magnetic field intensity due to regional
	    // Values are given in nT and represent the relative difference in
	    // field intensity due to the regional at the four corners of the
        // of the survey; NW, NE, SW, SE respectively.

        // Define parameters for a line extending across the survey area
        // that approximates the location of a power line. Then use this
        // line to generate spatially varying noise levels in the survey.

        this.r_data = [0.0, 2.0, -2.0, 0.0];

        // Slope of power line
        this.p_slope = -5.0 / 4.0;
        // NS intercept of power line
        this.p_inter = 312.5;
        // Scale factor for distance scaling of noise
        this.pn_scale = 0.03;

        // Arrays to hold station location and gravity value
        this.x = [];
        this.y = [];
        this.fs = [];
        this.fsb = [];
        // Array to hold time at which reading was made
        this.obs_time = [];
        
        

        // Set geologic parameters

        // Depth to top of dyke in meters
        this.top = 2.0;
        // Width of dyke in meters
        this.width = 15.0;
        // Depth to bottom of dyke in meters
        this.bot = 10000.0;
        // Susceptability of dyke
        this.k = 0.0001;
        // Trend of dyke in meters 
        // (must be between -90 and 90; positive measured from north through east)
        this.b = -15.0;
    
        // x position of dyke in meters along y=0 profile
        this.px_0 = -142.5;

        // Absolute time since survey initiation
        this.time = 0.0;
        // Time since last break
        this.r_time = 0.0;
        // Time since start of day
        this.d_time = 0.0;

        this.n_data = Math.trunc( ((this.y_max - this.y_min) / this.l_space + 1) *
                                  ((this.x_max - this.x_min) / this.s_space + 1));
                                  
        // Now loop through stations and compute magnetic anomaly
        this.y_start = this.l_space * Math.ceil(this.y_min / this.l_space);

        // Compute geologic and regional contributions to the magnitization at the base station.
        this.ang = (180.0 - this.b) * Math.PI / 180.0;
        this.px = Math.tan(this.ang) * this.base_y + this.px_0;
        this.b_mag = this.slab(this.b, this.base_x, this.base_y, this.px, this.top, this.bot, this.width, this.k);
        this.count = 0;
        this.mag = null;
        this.inter_line = null;
        this.x_line = null;
        this.y_line = null;
        this.n_error = null;
        this.index = null;
        this.small_fact = null;

        for (let y_loc = this.y_start; y_loc <= this.y_max; y_loc += this.l_space)
        {
            this.ang = (180.0 - this.b) * Math.PI / 180.0;
            this.px = Math.tan(this.ang) * y_loc + this.px_0;

            for (let x_loc = this.x_min; x_loc <= this.x_max; x_loc += this.s_space)
            {
                // Compute magnetic anomaly due to slab at given xloc, yloc
                this.mag = this.slab(this.b, x_loc, y_loc, this.px, this.top, this.bot, this.width, this.k);
                
                // Set time values
                this.time += this.tsta;
                this.r_time += this.tsta;
                this.d_time += this.tsta;

                // crew will take a break
                if(this.r_time >= this.t_break)
                {
                    if(this.d_time >= this.t_daily)
                    {
                        // This break is the end of day also
                        this.time += 720.0;
                        this.r_time = 0.0;
                        this.d_time = 0.0;

                    }
                    else
                    {
                        this.time += 30.0;
                        this.r_time = 0.0;
                    }
                }
                // Compute reading error - this error is a function
				// of distance away from a powerline crossing the survey

				// first determine intercept of line perpendicular to
				// powerline crossing the survey point
                this.inter_line = y_loc + this.p_slope * x_loc;

                // determine x and y locations of intersection of
				// powerline and line perpendicular to the power line
                // that pass through the observation point
                
                this.x_line = (this.inter_line - this.p_inter) / (2.0 * this.p_slope);
                this.y_line = -1.0 * this.p_slope * this.x_line + this.inter_line;

                // Now compute distance between point and power line
                this.d = Math.sqrt(((this.x_line - x_loc) * (this.x_line - x_loc) + (this.y_line - y_loc) * (this.y_line - y_loc)));
                if(this.d < 5.0)
                    this.d = 5.0;
                
                // Generate reading error
                this.n_error = this.gaussianRand() * this.std / Math.sqrt(this.n_read) * Math.exp(1.0 / (this.d * this.pn_scale));

                // Add reading error and regional
                this.mag += this.n_error + this.region(x_loc, y_loc);
                
				// add a time varying term
				
                this.index = Math.trunc(this.time);
                while(this.index >= this.n_temp)
                    this.index -= this.n_temp;
                
                this.index = Math.trunc(this.index)
                
                this.small_fact = this.gaussianRand() * this.std;
                this.mag += (this.temp_data[this.index] + this.b_mag + this.small_fact);

                // Save data to arrays
                this.x.push(x_loc);
                this.y.push(y_loc);
                this.fs.push(this.mag);
                this.obs_time.push(this.time);
                this.fsb.push(this.temp_data[this.index] + this.b_mag + this.gaussianRand() * this.std);
                this.count++;
                
            }
        }
    }

    // Routine to compute magnetic anomaly due to slab
    slab(b, x_loc, y_loc, px, top, bot, width, k) 
    {
        // angle between profile line and trend of dyke
        let ang = 360.0 - this.b;
        let r_inc = this.inc * Math.PI / 180.0;
        let br = this.b * Math.PI / 180.0;
        ang *= (Math.PI / 180.0);
        // equivalent distane to a profile point
        // perpendicular to the dyke
        let xs = (px - x_loc) * Math.cos(ang);
        // east-west distance from observation point
        // to west edge of dyke
        let xsp = width / 2.0 - xs;

        // compute some constants
        let r1 = Math.sqrt(top * top + xsp * xsp);
        let r2 = Math.sqrt(bot * bot + xsp * xsp);
        let r3 = Math.sqrt(top * top + (xsp - width) * (xsp - width));
        let r4 = Math.sqrt(bot * bot + (xsp - width) * (xsp - width));
        let phi_1 = Math.atan2(top, xsp);
        let phi_2 = Math.atan2(bot, xsp);
        let phi_3 = Math.atan2(top, (xsp - width));
        let phi_4 = Math.atan2(bot, (xsp - width));
        let mag = null;

    // compute magnetic value
    mag = 2.0 * k * this.fe * (Math.sin((2.0 * r_inc)) *
            Math.sin(br) *
            Math.log((r2 * r3 / (r4 * r1))) +
            (Math.cos(r_inc) * Math.cos(r_inc) *
            Math.sin(br) * Math.sin(br) -
            Math.sin(r_inc) * Math.sin(r_inc)) *
            (phi_1 - phi_2 - phi_3 + phi_4));

    return mag;
    }

    
	//Routine to compute regional contribution by linearly interpolating
    // between the four corner values given
    region(x, y)
    {
        let my_1 = null;
        let my_2 = null;
        let reg = null;

        my_1 = (this.r_data[3] - this.r_data[1]) / (this.y_min - this.y_max) * (y - this.y_max) + this.r_data[1];
        my_2 = (this.r_data[2] - this.r_data[0]) / (this.y_min - this.y_max) * (y - this.y_max) + this.r_data[0];
        
        reg = (my_1 - my_2) / (this.x_max - this.x_min) * (x - this.x_min) + my_2;

        return reg;
    }

    gaussianRand() {
        let x1, x2, rad, c;
        do {
            x1 = 2 * Math.random() - 1;
            x2 = 2 * Math.random() - 1;
            rad = x1 * x1 + x2 * x2;
        } while (rad >= 1 || rad === 0);
        c = Math.sqrt(-2 * Math.log(rad) / rad);
        return (x2 * c);
    }
}




/*
const ENTRIES = {
    "line_spacing": document.getElementById("line-spacing"),
    "station_spacing": document.getElementById("station-spacing"),
    "n_read": document.getElementById("n-read"),
    "base_x": document.getElementById("base-x"),
    "basy_y": document.getElementById("base-y")
}
*/
function enableData()
{
    for(let entry in ENTRIES)
    {    
        if(ENTRIES[entry].value === '')
        {
            return false;
        }
    }
    return true;
}

function exportCSV()
{
    try
    {
        if(enableData())
        {
            let l_space = Number(ENTRIES["line_spacing"].value);
            let s_space = Number(ENTRIES["station_spacing"].value);
            let n_read = Number(ENTRIES["n_read"].value);
            let base_x = Number(ENTRIES["base_x"].value);
            let base_y = Number(ENTRIES["basy_y"].value); 
            let temp_data = getTemporalNoise();
            let n_temp = temp_data.length;
            
            let magnetic_model = new MagneticModel(l_space, s_space, n_read, base_x, base_y, temp_data, n_temp);
            let csv_content = "X-Loc(m)" + ',' + "Y-Loc(m)" + ',' + "time(min)" + ',' +"Field Strength(nT)" + ',' + "Base Station(nT)" + "\r\n";
            let csv_to_blob = null;
            let csv_to_url = null;
            let download_link = null;
            let file_name = "MagneticData.csv";
            
            for(let i = 0; i < magnetic_model.n_data; i++)
            {
                csv_content += magnetic_model.x[i] + ',' + magnetic_model.y[i] + ',' + magnetic_model.obs_time[i] + ',' + magnetic_model.fs[i] + ',' + magnetic_model.fsb[i] + "\r\n";
            }

            csv_to_blob = new Blob([csv_content], {type: "csv"});
            csv_to_url = window.URL.createObjectURL(csv_to_blob);
            download_link = document.createElement("a");
            download_link.style.display = "none";
            download_link.download = file_name;
            download_link.innerHTML = "Download File";
            download_link.href = csv_to_url;
            download_link.onclick = destroyClickedElement;
            
            document.body.appendChild(download_link);

            download_link.click();
        }
    }
    catch(err)
    {
        console.log(err.message);
    }
}
function destroyClickedElement(event)
{
    document.body.removeChild(event.target);
}