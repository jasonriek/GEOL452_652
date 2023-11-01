let csv_rows_RefractBean = [];
let csv_rows_SeisData = [];
let is_new_table = true;
let table = document.getElementById("data_table");
let seis_table = document.getElementById("seis_data_table");
let file_input = document.getElementById("file");
let d_btn = document.getElementById("d_btn");
let load_btn = document.getElementById("load_btn");
let save_btn = document.getElementById("save_btn");
let my_model = null;
let v1 = 0;
let v2 = 0;
let v3 = 0;
let h1 = 0;
let h2 = 0;
let d1 = 0;
let d2 = 0;
let std = 0.0;
let nr = 72;
let dx = 1.0;
let minx = 0.0;
let sx = 1;
let csv_loaded = false;



file_input.onchange = function ()
{
    let file = this.files[0];
    let reader = new FileReader();
    reader.onload = function(progressEvent)
    {
        // By lines
        let rows = this.result.split('\n');
        let row = null;
        if(rows.length < 2 || rows.length > 2)
        {
            alert("Wrong file format, please use the files generated from here.");
            reset();
        }

        else
        {
            for(let i = 0; i<rows.length; i++)
            {
                if (is_new_table)
                    row = table.insertRow(i);
                else
                {
                    table.deleteRow(i);
                    row = table.insertRow(i);
                }
                let cells = rows[i].split(",");
                csv_rows_RefractBean.push(cells);
                for(let j = 0; j<cells.length; j++)
                {
                    let cell = row.insertCell(j);
                    cell.innerHTML = cells[j];

                }
                if(i === 1)
                {
                    // Extract model parameters from csv file
                    v1 = cells[0];
                    v2 = cells[1];
                    v3 = cells[2];
                    h1 = cells[3];
                    h2 = cells[4];
                    d1 = cells[5];
                    d2 = cells[6];
                }
            }
            if (is_new_table)
                is_new_table = false;
            csv_loaded = true;
            load_btn.style.visibility = "visible";
            d_btn.style.visibility = "hidden";
            csv_loaded = true;
        }

    };

    reader.readAsText(file);
};

function reset()
{
    file_input.value = "";
}

function GetRefractModel()
{
    this.new_table = true;
    this.my_seismic = null;


    this.doGet = function ()
    {
        // Instantiate a new seismic model
        this.my_seismic = new ComputeRefractTimes(v1, v2, v3, h1, h2, d1, d2, std, minx, dx, nr, sx);
        this.writeDataSet(this.my_seismic);

    };

    this.writeDataSet = function(myseis)
    {

        // Number of data points
        let n_data = myseis.getNData();
        // Arrays to hold station locations, times, and amplitudes
        let locations = myseis.getLocations();
        let times = myseis.getTimes();
        let amplitudes = myseis.getAmplitudes();
        let headers = ["Locations", "Times", "Amplitudes"];
        csv_rows_SeisData = [headers];
        let row = null;
        row = seis_table.insertRow(0);
        let cell_1 = row.insertCell(0);
        let cell_2 = row.insertCell(1);
        let cell_3 = row.insertCell(2);
        cell_1.innerHTML = headers[0];
        cell_2.innerHTML = headers[1];
        cell_3.innerHTML = headers[2];

        for(let i = 1; i<n_data; i++)
        {
            row = seis_table.insertRow(i);

            cell_1 = row.insertCell(0);
            cell_2 = row.insertCell(1);
            cell_3 = row.insertCell(2);
            cell_1.innerHTML = locations[i];
            cell_2.innerHTML = times[i];
            cell_3.innerHTML = amplitudes[i];
            csv_rows_SeisData.push([locations[i], times[i], amplitudes[i]]);
        }
        if (is_new_table)
            is_new_table = false;

        d_btn.style.visibility = "visible";



    };

    this.createNewDataSet = function()
    {
        my_model = new RefractBean();
        // Extract model parameters from model bean
        v1 = my_model.getV1();
        v2 = my_model.getV2();
        v3 = my_model.getV3();
        h1 = my_model.getH1();
        h2 = my_model.getH2();
        d1 = my_model.getD1();
        d2 = my_model.getD2();
        //let is_new = parseInt()
        // for new model
        csv_rows_RefractBean = my_model.getDataArray();

        let rows = csv_rows_RefractBean;
        let row = null;

        for(let i = 0; i<rows.length; i++)
        {
            if (is_new_table)
                row = table.insertRow(i);
            else
            {
                table.deleteRow(i);
                row = table.insertRow(i);
            }

            let cells = rows[i];
            for(let j = 0; j<cells.length; j++)
            {

                let cell = row.insertCell(j);
                cell.innerHTML = cells[j];
            }
        }
        if (is_new_table)
            is_new_table = false;
        reset();
        load_btn.style.visibility = "visible";
    };

    this.setNewCode = function ()
    {
        this.is_new = true;
    };


}

function exportCSV(csv_data)
{
        let csvContent = csv_data.map(e => e.join(",")).join("\n");

    //let textToSave = "";
    let csvToSaveAsBlob = new Blob([csvContent], {type:"csv"});
    let csvToSaveAsURL = window.URL.createObjectURL(csvToSaveAsBlob);


    let fileNameToSaveAs = "seis_ref_data.csv";

    let downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = csvToSaveAsURL;
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
}

function destroyClickedElement(event)
{
    document.body.removeChild(event.target);
}



