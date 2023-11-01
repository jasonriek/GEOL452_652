//line location
function getYloc() {
    return Number(document.getElementById('loc').value);
}

//spacing spacing
function getDx() {
    return Number(document.getElementById('spacing').value);
}

//measurements per station
function getNread() {
    return Number(document.getElementById('nread').value);
}

//base station location
function getBloc() 
{
    return Number(document.getElementById('base').value);
}

//return to base every _ minutes
function getBfreq() 
{
    return Number(document.getElementById('bfreq').value);
}

const export_button = document.getElementById("export_button")

const entries = [document.getElementById('loc'),
                   document.getElementById('spacing'),
                   document.getElementById('nread'),
                   document.getElementById('base'),
                   document.getElementById('bfreq')];
const entry_ids = ['loc', 'spacing', 'nread', 'base', 'bfreq'];

// Big G
const G = 6.67 * Math.pow(10, -11);

/**
 *  Class file for generating and maintaining a set of gravity observations derived from a buried
 *  tunnel with various types of geologic, tidal, drift, and random noise. According to the problem
 *  specifications, gravity observations will be generated along a 500 m long profile that is oriented
 *  perpendicular to the buried tunnel. The horizontal position, size, and depth of the tunnel will be
 *  randomly varied each run. This information is stored in a separate file for later use in grading.
 *  Constructor requires the following arguments
 *
 *  station_spacing = Gravity station spacing in meters for the profile
 *  base_station_location = location of gravity base station for the profile
 *  as given by a horizontal position along the line in meters. This
 *  must be between 0 and 500 meters.
 *  base_freq = Frequency at which base station should be reoccupied in minutes
 *  num_readings = Number of readings to make at each station.
 *  y_loc = North-south location of line
 *
 *  In computing the gravity observations we will assume a tidal effect that can be approximated by a
 *  sine wave with a period of 12 hours and an amplitude of 0.15 mgals. Drift will be approximated by
 *  using a longer period (60 hr) sine with an amplitude of 0.2 mgals. Random noise will be added to each
 *  observation The noise is normally distributed with a mean of zero and standard deviation of 0.01 mgals.
 *  The signal will be represented by a 2.5D buried tunnel. In addition part of the profile will contain geologic
 *  signal produced via a buried slab.
 *
 * Java Version:
 * @author     tboyd
 * @created    November 11, 2002
 * 
 * JavaScript Version:
 * @author Jason Reek
 * @created June 26, 2020
 * 
 */

class GravityModel
 {
    constructor(dx, bloc, bfreq, nread, yloc)
    {
        // Minimum distance along profile, western limit
        this.xmin = -250;
        // Maximum distance along profile, eastern limit
        this.xmax = 250;
        // Standard deviation of the observations in mgal
        this.std = 0.02;
        // Time required to take single gravity reading in minutes
        this.tsta = 5;
        // Maximum time survey crew will work during the day (must be an
        // integer multiple of the tbreak)
        this.tdaily = 480;
        // Maximum time survey crew will work before taking a break
        this.tbreak = 240;
        // Probability of crew generating a mistie
        this.mistie = 0.005;
        
        // Number of data points
        this.ndata = this.setNData(dx, bfreq, nread);

        // Arrays to hold station location, gravity value, and the time at which reading was made.
       this.location = new Array(this.ndata).fill(null); 
       this.gravity = new Array(this.ndata).fill(null);
       this.obtime = new Array(this.ndata).fill(null);

        this.rand = null;

        // set geologic parameters 
        // These are the parameters for the tunnel at y = 0
        this.tradius = 2.5;
        this.tdrho = -2.67;
        this.tdepth = 8.0;
        this.tposition = -10.0;
        this.trend = -15.0 * Math.PI / 180.0;
        /*
         *  Trend of all linear features
         */
        // set geologic parameters for buried slab
        // set geologic parameters for buried slab
        this.swidth = 15.0;
        this.stop = 2.0;
        this.sbot = 1000.0;
        this.sposition = -142.5;
        this.sdrho = 0.15;
        
        // Set parameters of shaft
        this.cxloc = 44.0;
        this.cyloc = -200.0;
        this.cradius = 5.0;
        this.cdrho = -1.67;
        this.ctop = 4.0;

        
        this.grav = null;

        let i = 0;

        // The tunnel has limited spatial extent
        // We will limit the length of the tunnel by varying tdrho
        if (yloc < this.cyloc) 
            this.tdrho = 0.0;
        
        if (yloc > 50.0) 
            this.tdrho = this.tdrho + (yloc - 50.0) * 0.05;
        
        if (this.tdrho > 0.0) 
            this.tdrho = 0.0;

        // Absolute time since survey initiation
        this.time = 0;
        // Time since last base station occupation
        this.btime = 0;
        // Time since last break
        this.rtime = 0;
        // Time since start of day
        this.dtime = 0;
        // Size of mistie
        this.mtsize = 0.0;

        /*
         *  Compute time needed to complete each gravity station and base station
         *  nominally these are 5 and 15 minutes respectively. This assumes 3 readings
         *  at each gravity station, and the base station takes 3 times as long as the
         *  gravity stations to complete. If more are requested, change
         *  these time estimates accordingly
         */
        this.time_sta = Math.trunc(nread * 5 / 3);
        if (this.time_sta < 5) {
            this.time_sta = 5;
        }
        this.time_base = 3 * this.time_sta;

        //Array increment
        for (let station = this.xmin; station <= this.xmax; station += dx) 
        {
            this.rand = Math.random();
            if (this.rand < this.mistie) 
            {
                // See if there is a Mistie in data set
                this.mtsize += this.gaussianRand() * this.std;
            }

            if (this.time == 0 || this.btime >= bfreq || this.rtime >= this.tbreak || this.dtime >= this.tdaily) 
            {
                // Need to do base station
                this.grav = this.cyl(this.tradius, this.tdrho, this.tdepth, this.tposition, bloc, yloc, this.trend) + 
                            this.tides(this.time) +
                            this.regional(bloc, yloc) +
                            this.gaussianRand() * this.std /
                            Math.sqrt(nread) +
                            this.slab(this.swidth, this.sdrho, this.stop, this.sbot, this.sposition, bloc, yloc, this.trend) + 
                            this.vcyl(this.cxloc, this.cyloc, this.cradius, this.ctop, this.cdrho, bloc, yloc) + 
                            this.mtsize;
                this.gravity[i] = this.grav;
                this.location[i] = bloc;
                this.obtime[i] = this.time;
                i++;

                this.time += this.time_base;
                this.rtime += this.time_base;
                this.dtime += this.time_base;
                this.btime = this.time_base;

                // Now that we have a base station reading check to see if the
                // crew is going to take a break or finish for the day

                if (this.rtime >= this.tbreak || this.dtime >= this.tdaily) 
                {
                    /*
                     *  crew will take a break and reoccupy base after break
                     */
                    if (this.dtime >= this.tdaily) 
                    {
                        /*
                         *  this break is the end of day also
                         */
                        this.time += 720;
                        this.rtime = 0;
                        this.dtime = 0;
                    } 
                    else 
                    {
                        this.time += 30;
                        this.rtime = 0;
                        this.dtime += 30;
                    }
                    this.grav = this.cyl(this.tradius, this.tdrho, this.tdepth, this.tposition, bloc, yloc, this.trend) +
                    this.tides(this.time) +
                    this.regional(bloc, yloc) +
                    this.gaussianRand() *
                    this.std / Math.sqrt(nread) + 
                    this.slab(this.swidth, this.sdrho, this.stop, this.sbot, this.sposition, bloc, yloc, this.trend) +
                    this.vcyl(this.cxloc, this.cyloc, this.cradius, this.ctop, this.cdrho, bloc, yloc) + 
                    this.mtsize;
                    this.gravity[i] = this.grav;
                    this.location[i] = bloc;
                    this.obtime[i] = this.time;
                    i++;

                    this.time += this.time_base;
                    this.rtime += this.time_base;
                    this.dtime += this.time_base;
                    this.btime = this.time_base;
                }
            }
            this.grav = this.cyl(this.tradius, this.tdrho, this.tdepth, this.tposition, station, yloc, this.trend) + 
            this.tides(this.time) +
            this.regional(station, yloc) +
            this.gaussianRand() * this.std /
            Math.sqrt(nread) +
            this.slab(this.swidth, this.sdrho, this.stop, this.sbot, this.sposition, station, yloc, this.trend) +
            this.vcyl(this.cxloc, this.cyloc, this.cradius, this.ctop, this.cdrho, station, yloc) + 
            this.mtsize;
            this.gravity[i] = this.grav;
            this.location[i] = station;
            this.obtime[i] = this.time;
            i++;

            this.time += this.time_sta;
            this. btime += this.time_sta;
            this.rtime += this.time_sta;
            this.dtime += this.time_sta;
        }
        /*
         *  finish up by returning to the base station
         */
        this.grav = this.cyl(this.tradius, this.tdrho, this.tdepth, this.tposition, bloc, yloc, this.trend) + 
        this.tides(this.time) + 
        this.regional(bloc, yloc) +
        this.gaussianRand() * this.std / 
        Math.sqrt(nread) +
        this.slab(this.swidth, this.sdrho, this.stop, this.sbot, this.sposition, bloc, yloc, this.trend) +
        this.vcyl(this.cxloc, this.cyloc, this.cradius, this.ctop, this.cdrho, bloc, yloc) + 
        this.mtsize;
        this.gravity[i] = this.grav;
        this.location[i] = bloc;
        this.obtime[i] = this.time;
    }

    // Method to compute gravity anomaly over buried vertical slab
    slab(swidth, sdrho, stop, sbot, sposition, x, y, t) 
    {
        let xs = null;
        let r1 = null;
        let r2 = null;
        let r3 = null;
        let r4 = null;
        let phi1 = null;
        let phi2 = null;
        let phi3 = null;
        let phi4 = null;
        let g = null;

        xs = (x - y * Math.tan(t)) - sposition + swidth / 2.0;
        r1 = Math.sqrt(stop * stop + xs * xs);
        r2 = Math.sqrt(sbot * sbot + xs * xs);
        r3 = Math.sqrt(stop * stop + (xs - swidth) * (xs - swidth));
        r4 = Math.sqrt(sbot * sbot + (xs - swidth) * (xs - swidth));
        phi1 = Math.atan2(stop, xs);
        phi2 = Math.atan2(sbot, xs);
        phi3 = Math.atan2(stop, (xs - swidth));
        phi4 = Math.atan2(sbot, (xs - swidth));
        g = 2.0 * G * sdrho * 1000.0 *
        (sbot * (phi2 - phi4) - stop * (phi1 - phi3) +
            xs * Math.log(r2 * r3 / (r4 * r1)) +
            swidth * Math.log(r4 / r3)) * 100000.0;

        return (g); //NOT SURE ABOUT THIS
    }

    // Function to generate gravity over a buried vertical cylinder
    vcyl(xloc, yloc, radius, top, rho, x, y) 
    {
        let save = null;
        let save1 = null;
        let fudge = null;
        let xs = null;
        let r = null;
        let cos_theta = null;
        let p1 = null;
        let p2 = null;
        let p4 = null;
        let p6 = null;
        let t = null;

        cos_theta = Math.abs(top / radius);
        p1 = cos_theta;
        p2 = (3.0 * Math.pow(cos_theta, 2.0) - 1.0) / 2.0;
        p4 = (35.0 * Math.pow(cos_theta, 4.0) -
        30.0 * Math.pow(cos_theta, 2.0) + 3.0) / 8.0;
        p6 = (231.0 * Math.pow(cos_theta, 6.0) -
        315.0 * Math.pow(cos_theta, 4.0) +
        105.0 * Math.pow(cos_theta, 2.0) - 5.0) / 16.0;
        t = 1.0 / 2.0;
        save = 2.0 * Math.PI * G * rho * radius *
        (1.0 - 2.0 * t * p1 + 2.0 * t * t * p2 -
            2.0 * t * t * t * t * p4 +
            2.0 * t * t * t * t * t * t * p6);
        save1 = 2.0 * Math.PI * G * rho * radius *
        (t - t * t * t * p2 + 2.0 * t * t * t * t * t * p4 -
            2.0 * t * t * t * t * t * t * t * p6);
        fudge = save1 - save;

        xs = Math.sqrt((xloc - x) * (xloc - x) +
        (yloc - y) * (yloc - y));
        r = Math.sqrt(top * top + xs * xs);
        cos_theta = Math.abs(top / r);
        p1 = cos_theta;
        p2 = (3.0 * Math.pow(cos_theta, 2.0) - 1.0) / 2.0;
        p4 = (35.0 * Math.pow(cos_theta, 4.0) -
        30.0 * Math.pow(cos_theta, 2.0) + 3.0) / 8.0;
        p6 = (231.0 * Math.pow(cos_theta, 6.0) -
        315.0 * Math.pow(cos_theta, 4.0) +
        105.0 * Math.pow(cos_theta, 2.0) - 5.0) / 16.0;
        if (radius > r) 
        {
        t = r / (2.0 * radius);
        save = 2.0 * Math.PI * G * rho * radius *
            (1.0 - 2.0 * t * p1 + 2.0 * t * t * p2 -
                2.0 * t * t * t * t * p4 +
                2.0 * t * t * t * t * t * t * p6) + fudge;
        } 
        else 
        {
        t = radius / (2.0 * r);
        save = 2.0 * Math.PI * G * rho * radius *
            (t - t * t * t * p2 +
                2.0 * t * t * t * t * t * p4 -
                2.0 * t * t * t * t * t * t * t * p6);
        }

        return (save * Math.pow(10.0, 8.0));
    }


    // Compute the number of data points to be returned. This is done by running through the same loop structure as
    // the computational loop, but not doing any of the computations. We'll simply count how many readings we have
    // to make and return this count.
    setNData(dx, bfreq, nread)
    {

        // Absolute time since survey initiation
        let time = 0;
         // Time since last base station occupation
        let btime = 0;
        // Time since last break
        let rtime = 0;
         // Time since start of day
        let dtime = 0;
        let time_sta = Math.trunc(nread * 5 / 3);
        let time_base = null;
        let i = 0;
        /*
         *  Compute time needed to complete each gravity station and base station
         *  nominally these are 5 and 15 minutes respectively. This assumes 3 readings
         *  at each gravity station, and the base station takes 3 times as long as the
         *  gravity stations to complete. If more are requested, change
         *  these time estimates accordingly
         */
        if (time_sta < 5)
            time_sta = 5;
        time_base = 3 * time_sta;
        
        for (let station = this.xmin; station <= this.xmax; station += dx)
        {
            if (time == 0 || btime >= bfreq || rtime >= this.tbreak || dtime >= this.tdaily)
            {
                // Need to do base station
                i++;

                time += time_base;
                rtime += time_base;
                dtime += time_base;
                btime += time_base;

                // Now that we have a base station reading check to see if the
                // crew is going to take a break or finish for the day. 

                if (rtime >= this.tbreak || dtime >= this.tdaily)
                {
                    // Crew will take a break and reoccupy base after break.
                    if (dtime >= this.tdaily)
                    {
                        // This break is the end of the day as well. 
                        time += 720;
                        rtime = 0;
                        dtime = 0; 
                    }
                    else
                    {
                        time += 30;
                        rtime = 0;
                        dtime += 30;
                    }
                    i++;
                    
                    time += time_base;
                    rtime += time_base;
                    dtime += time_base;
                    btime += time_base;
                }
            }
            i++;

            time += time_sta;
            btime += time_sta;
            rtime += time_sta;
            dtime += time_sta;
        }
        //  finish up by returning to the base station
        i++;

        return i;    
    }


    // Methods to compute various gravity contributions
    // Cylinder first
    cyl(r, dho, z, p, x, y, t) 
    {
        // alert(x);
        // alert(y);
        return 2.0 * G * Math.PI * r * r * dho * 100.0 *
            100.0 * 100.0 * z / ((z * z +
                (x - (p + y * Math.tan(t))) *
                (x - (p + y * Math.tan(t)))) * 1000.0) * 100000.0;
    }


    //Tidal contribution
    tides(t) 
    {
        return 0.15 * Math.sin((2.0 * Math.PI * t / 720.0)) +
            0.20 * Math.sin((2.0 * Math.PI * t / 5000.0));
    }

    regional(x, y) 
    {
        return 0.0000012 * (-x - 1.3 * x * x + 0.003 * x * x * x +
            0.3 * y - 0.15 * y * y - 0.75 * x * y) + 3.8;
    }

    // Method to produce normal distributed values clustered around a mean.
    gaussianRand()
    {
        return 1
        /*
        let x1, x2, rad;
        do 
        {
            x1 = 2 * Math.random() - 1;
            x2 = 2 * Math.random() - 1;
            rad = x1 * x1 + x2 * x2;
        }
        while(rad >= 1 || rad === 0);
        let c = Math.sqrt(-2 * Math.log(rad) / rad);
        return (x1 * c);
        */
    }

}

function enableData()
{
    for(let i = 0; i<entries.length; i++)
    {    
        if(entries[i].value === '')
        {
            return false;
        }
        else
        {
            if(typeof(Storage) !== "undefined")
                sessionStorage.setItem(entry_ids[i], entries[i].value);
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
                let gravity_model = new GravityModel(getDx(), getBloc(), getBfreq(), getNread(), getYloc());
                let csvContent = "Station(M)" + ',' + "Time(min)" + ',' + "Gravity(mgal)" + "\r\n";
                for (let i = 0; i < gravity_model.ndata; i++)
                {
                    csvContent += parseFloat(gravity_model.location[i])+ ',' + parseInt(gravity_model.obtime[i]) + ',' + parseFloat(gravity_model.gravity[i]).toPrecision(4) + "\r\n";
                }
            
                //let textToSave = "";
                let csvToSaveAsBlob = new Blob([csvContent], {type:"csv"});
                let csvToSaveAsURL = window.URL.createObjectURL(csvToSaveAsBlob);
            
                let fileNameToSaveAs = "GravityData.csv";
            
                let downloadLink = document.createElement("a");
                downloadLink.download = fileNameToSaveAs;
                downloadLink.innerHTML = "Download File";
                downloadLink.href = csvToSaveAsURL;
                downloadLink.onclick = destroyClickedElement;
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
            
                downloadLink.click();
            }
        }
        catch(err)
        {
            alert(err.message);
        }
}

function destroyClickedElement(event)
{
    document.body.removeChild(event.target);
}