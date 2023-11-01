const EXPORT_BUTTON = document.getElementById("export_button");
const ENTRIES = {
  input_mx: document.getElementById("xCoordinateOfSoundingMidPoint"),
  input_my: document.getElementById("yCoordinateOfSoundingMidPoint"),
  input_smin: document.getElementById("minimumElectrodeSpacing"),
  input_nperd: document.getElementById("numberOfDecadesinDistance"),
  input_ndec: document.getElementById("numberOfElectrodeSpacing"),
  input_ndata: document.getElementById("measurementsPerElectrode"),
};

//strings to hold users input
let type = "Schulumberger";
let trend = "North-South";

let mx: number;
let my: number;
let smin: number;
let nperd: number;
let ndec: number;
let ndata: number;
let res1: ResistivityModel;
//Arrays to hold electrode spacing and resistivity
let spacing: number[];
let res: number[];

//Number of data points
let numData: number;

// let res1: ResistivityModel; //!do resModel

let fileNum = 1;

function surveyChange(value) {
  type = value;
}

function trendChange(value) {
  trend = value;
}

function enableData() {
  for (let entry in ENTRIES) {
    if (ENTRIES[entry].value === "") {
      return false;
    }
  }
  return true;
}

function exportCSV() {
  try {
    if (enableData()) {
      mx = Number(ENTRIES["input_mx"].value);
      my = Number(ENTRIES["input_my"].value);
      smin = Number(ENTRIES["input_smin"].value);
      nperd = Number(ENTRIES["input_nperd"].value);
      ndec = Number(ENTRIES["input_ndec"].value);
      ndata = Number(ENTRIES["input_ndata"].value);

      let nValues = 0;
      let water: number[] = new Array(nValues);
      let basement: number[] = new Array(nValues);
      getModel();

      res1 = new ResistivityModel(
        mx,
        my,
        type,
        trend,
        smin,
        nperd,
        ndec,
        ndata,
        water,
        basement,
        nValues
      );

      //get data generated from model
      numData = res1.getNData();
      spacing = new Array(numData);
      res = new Array(numData);
      res = res1.getResistivity();
      spacing = res1.getSpacing();

      let csv_content = "Spacing" + "," + "Res" + "\r\n";
      let csv_to_blob = null;
      let csv_to_url = null;
      let download_link = null;
      let file_name = "SeismicData.csv";

      for (let i = 0; i < ndata; i++) {
        csv_content += res[i] + "," + spacing[i] + "\r\n";
      }

      csv_to_blob = new Blob([csv_content], { type: "csv" });
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
  } catch (err) {
    console.log(err.message);
  }
}

function destroyClickedElement(event) {
  document.body.removeChild(event.target);
}
