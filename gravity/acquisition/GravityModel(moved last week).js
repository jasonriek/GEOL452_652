// Define  constants
    let G = 6.67 * Math.pow(10, -11);
// Big G
    let xmin = -250;
// Minimum distance along profile, western limit
    let xmax = 250;
// Maximum distance along profile, eastern limit
    let std = 0.02;
// Standard deviation of the observations in mgal
    let tsta = 5;
// Time required to take single gravity reading in minutes
    let tdaily = 480;
// Maximum time survey crew will work during the day (must be an
// integer multiple of the tbreak)
    let tbreak = 240;
// Maximum time survey crew will work before taking a break
    let mistie = 0.005;
// Probability of crew generating a mistie
    let rand;
//Arrays to hold station location and gravity value
    let gravity = [];
    let obtime = [];

//Array to hold time at which reading was made
    let ndata = 0;

//Export Buttton
let export_button = document.getElementById("export_button")

let entries = [document.getElementById('loc'),
                   document.getElementById('spacing'),
                   document.getElementById('nread'),
                   document.getElementById('base'),
                   document.getElementById('bfreq')];
let entry_ids = ['loc', 'spacing', 'nread', 'base', 'bfreq'];
for(let i = 0; i<entries.length; i++)
{
    if(typeof(Storage) !== "undefined")
        entries[i].value = sessionStorage.getItem(entry_ids[i]);
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

    function exportCSV()
    {
        try 
        {
            if(enableData())
            {
                GravityModel(getDx(), getBloc(), getBfreq(), getNread(), getYloc());
                let csvContent = "Station(M)" + ',' + "Time(min)" + ',' + "Gravity(mgal)" + "\r\n";
                for (let i = 0; i < ndata; i++)
                {
                    csvContent += parseInt(location[i]) + ',' + parseInt(obtime[i]) + ',' + parseFloat(gravity[i]).toPrecision(4) + "\r\n";
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

    function GravityModel(dx, bloc, bfreq, nread, yloc) 
    { //parameters being read in from saveFormasText function
        try
        { 
            let tradius;
            let tdrho;
            let tdepth;
            let tposition;
            let swidth;
            let sdrho;
            let stop;
            let sbot;
            let sposition;
            let station;
            let grav;
            let mtsize;
            let trend;
            let cxloc;
            let cyloc;
            let cradius;
            let cdrho;
            let ctop;
            let time;
            let btime;
            let rtime;
            let dtime;
            let seed;
            let time_sta;
            let time_base;
            let i;

            //Determine how many readings we will make
            ndata = setNdata(dx, bfreq, nread);

            //Initialize Random number generator
            seed = parseInt(dx * bloc * yloc) / bfreq;
            if (seed > 30000) {
                seed = parseInt(30000 / (dx + yloc));
            }
            rand = Math.random() * seed;

            //Define array bounds
            location = []
            gravity = []
            obtime = []

            // set geologic parameters
            // These are the parameters for the tunnel at y=0
            tradius = 2.5;
            tdrho = -2.67;
            tdepth = 8.0;
            tposition = -10.0;
            trend = -15.0 * Math.PI / 180.0;
            /*
            *  Trend of all linear features
            */
            // set geologic parameters for buried slab
            swidth = 15.0;
            stop = 2.0;
            sbot = 1000.0;
            sposition = -142.5;
            sdrho = 0.15;

            // Set parameters of shaft
            cxloc = 44.0;
            cyloc = -10.0;
            cradius = 5.0;
            cdrho = -1.67;
            ctop = 4.0;

            if (yloc < cyloc) {
                tdrho = 0.0;
            }
            if (yloc > 50.0) {
                tdrho = tdrho + (yloc - 50.0) * 0.05;
            }
            if (tdrho > 0.0) {
                tdrho = 0.0;
            }

            //  Now loop through stations and compute gravity
            time = 0;
            // Absolute time since survey initiation
            btime = 0;
            // Time since last base station occupation
            rtime = 0;
            // Time since last break
            dtime = 0;
            // Time since start of day
            mtsize = 0.0;
            // Size of mistie

            let min = 99;
            let max =101;
            /*
            *  Compute time needed to complete each gravity station and base station
            *  nominally these are 5 and 15 minutes respectively. This assumes 3 readings
            *  at each gravity station, and the base station takes 3 times as long as the
            *  gravity stations to complete. If more are requested, change
            *  these time estimates accordingly
            */

            time_sta = parseInt(nread * 5 / 3);
            if (time_sta < 5) {
                time_sta = 5;
            }
            time_base = 3 * time_sta;

            i = 0;

            for (station = xmin; station <= xmax; station += dx) {

                if (Math.floor(rand * (max - min)) + min < mistie) { //Took our the .next() could be an error later on
                    mtsize += gaussianRand() * std;
                }

                if (time === 0 || btime >= bfreq || rtime >= tbreak || dtime >= tdaily) {
                    // alert(dx);
                    // alert(bloc);
                    // alert(bfreq);
                    // alert(nread);
                    // alert(yloc);
                    grav = cyl(tradius, tdrho, tdepth,
                        tposition, bloc, yloc,
                        trend) + tides(time) + regional(bloc, yloc) +
                        gaussianRand() * std / Math.sqrt(nread) + slab(swidth,
                            sdrho, stop, sbot, sposition, bloc, yloc, trend) +
                        vcyl(cxloc, cyloc, cradius, ctop, cdrho, bloc, yloc) + mtsize;

                    gravity[i] = grav;
                    location[i] = bloc;
                    obtime[i] = time;
                    i++;

                    time += time_base;
                    rtime += time_base;
                    dtime += time_base;
                    btime = time_base;

                    // Now that we have a base station reading check to see if the
                    // crew is going to take a break or finish for the day

                    if (rtime >= tbreak || dtime >= tdaily) {
                        /*
                        *  crew will take a break and reoccupy base after break
                        */
                        if (dtime >= tdaily) {
                            /*
                            *  this break is the end of day also
                            */
                            time += 720;
                            rtime = 0;
                            dtime = 0;
                        } else {
                            time += 30;
                            rtime = 0;
                            dtime += 30;
                        }
                        grav = cyl(tradius, tdrho, tdepth, tposition, bloc, yloc, trend) +
                            tides(time) + regional(bloc, yloc) + gaussianRand() * std / Math.sqrt(nread)
                            + slab(swidth, sdrho, stop, sbot, sposition, bloc, yloc, trend) +
                            vcyl(cxloc, cyloc, cradius, ctop, cdrho, bloc, yloc) + mtsize;

                        gravity[i] = grav;
                        location[i] = bloc;
                        obtime[i] = time;
                        i++;

                        time += time_base;
                        btime += time_base;
                        rtime += time_base;
                        dtime += time_base;
                    }
                }

                grav = cyl(tradius, tdrho, tdepth, tposition, station, yloc, trend) + tides(time) +
                    regional(station, yloc) + gaussianRand() * std / Math.sqrt(nread) +
                    slab(swidth, sdrho, stop, sbot, sposition, station, yloc, trend) +
                    vcyl(cxloc, cyloc, cradius, ctop, cdrho, station, yloc) + mtsize;

                gravity[i] = grav;
                location[i] = station;
                obtime[i] = time;
                i++;

                time += time_sta;
                btime += time_sta;
                rtime += time_sta;
                dtime += time_sta;
            }

            grav = cyl(tradius, tdrho, tdepth, tposition, bloc, yloc, trend) +
                tides(time) + regional(bloc, yloc) + gaussianRand() * std / Math.sqrt(nread) +
                slab(swidth, sdrho, stop, sbot, sposition, bloc, yloc, trend) +
                vcyl(cxloc, cyloc, cradius, ctop, cdrho, bloc, yloc) + mtsize;

            gravity[i] = grav;
            location[i] = bloc;
            obtime[i] = time;
        }
        catch(err)
        {
            alert(err.message);
        }
    }

    function slab(swidth, sdrho, stop,
                  sbot, sposition, x, y, t) {
        let xs;
        let r1;
        let r2;
        let r3;
        let r4;
        let phi1;
        let phi2;
        let phi3;
        let phi4;
        let g;

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

    function vcyl(xloc, yloc, radius,
                  top, rho, x, y) {
        let save;
        let save1;
        let fudge;
        let xs;
        let r;
        let cos_theta;
        let p1;
        let p2;
        let p4;
        let p6;
        let t;

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
        if (radius > r) {
            t = r / (2.0 * radius);
            save = 2.0 * Math.PI * G * rho * radius *
                (1.0 - 2.0 * t * p1 + 2.0 * t * t * p2 -
                    2.0 * t * t * t * t * p4 +
                    2.0 * t * t * t * t * t * t * p6) + fudge;
        } else {
            t = radius / (2.0 * r);
            save = 2.0 * Math.PI * G * rho * radius *
                (t - t * t * t * p2 +
                    2.0 * t * t * t * t * t * p4 -
                    2.0 * t * t * t * t * t * t * t * p6);
        }

        return (save * Math.pow(10.0, 8.0));
    }

    function setNdata(dx, bfreq, nread) {
        let i = 0;
        //Array increment
        let station;
        let time;
        let btime;
        let rtime;
        let dtime;
        let time_sta;
        let time_base;

        //  Now loop through stations and compute gravity
        time = 0;
        // Absolute time since survey initiation
        btime = 0;
        // Time since last base station occupation
        rtime = 0;
        // Time since last break
        dtime = 0;
        // Time since start of day

        /*
         *  Compute time needed to complete each gravity station and base station
         *  nominally these are 5 and 15 minutes respectively. This assumes 3 readings
         *  at each gravity station, and the base station takes 3 times as long as the
         *  gravity stations to complete. If more are requested, change
         *  these time estimates accordingly
         */
        time_sta = parseInt(nread * 5 / 3);
        if (time_sta < 5) {
            time_sta = 5;
        }
        time_base = 3 * time_sta;
        for (station = xmin; station <= xmax; station += dx) {
            if (time === 0 || btime >= bfreq ||
                rtime >= tbreak || dtime >= tdaily) {
                // Need to do base station

                i++;

                time += time_base;
                rtime += time_base;
                dtime += time_base;
                btime = time_base;

                // Now that we have a base station reading check to see if the
                // crew is going to take a break or finish for the day

                if (rtime >= tbreak ||
                    dtime >= tdaily) {
                    // crew will take a break and reoccupy base after break

                    if (dtime >= tdaily) {
                        // this break is the end of day also

                        time += 720;
                        rtime = 0;
                        dtime = 0;
                    } else {
                        time += 30;
                        rtime = 0;
                        dtime += 30;
                    }
                    i++;

                    time += time_base;
                    rtime += time_base;
                    dtime += time_base;
                    btime = time_base;
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

    function cyl(r, dho, z, p, x, y, t) {
        // alert(x);
        // alert(y);
        return 2.0 * G * Math.PI * r * r * dho * 100.0 *
            100.0 * 100.0 * z / ((z * z +
                (x - (p + y * Math.tan(t))) *
                (x - (p + y * Math.tan(t)))) * 1000.0) * 100000.0;
    }

    function tides(t) {
        return 0.15 * Math.sin((2.0 * Math.PI * t / 720.0)) +
            0.20 * Math.sin((2.0 * Math.PI * t / 5000.0));
    }

    function regional(x, y) {
        // alert(x);
        // alert(y);
        return 0.0000012 * (-x - 1.3 * x * x + 0.003 * x * x * x +
            0.3 * y - 0.15 * y * y - 0.75 * x * y) + 3.8;
    }

    //original:
	//function gaussianRand() {
    //    let x1, x2, rad, y1;
   //     do {
   //         x1 = 2 * Math.random() - 1;
    //        x2 = 2 * Math.random() - 1;
    //        rad = x1 * x1 + x2 * x2;
   //     } while (rad >= 1 || rad === 0);
    //    let c = Math.sqrt(-2 * Math.log(rad) / rad);
    //    return (x2 * c);
    //}
function gaussianRand() {
        let x1, x2, rad, y1;
        do {
            x1 = 2 * Math.random() - 1;
            x2 = 2 * Math.random() - 1;
            rad = x1 * x1 + x2 * x2;
        } while (rad >= 1 || rad === 0);
        let c = Math.sqrt(-2 * Math.log(rad) / rad);
        return (10 * Math.random());
    }