function CSVoutput() {
    if (fileFlag) {
        let csvArray = [];
        let key_name_head = "key_name";
        let keynameCount = 1;
        let key_name = `${key_name_head}_${keynameCount}`;
        let inputData = [];
        let count = 0;
        csvArray[count] = ["Location", "Time"];
        for (let i = 0; i < nTraces; i++) {
            if (dataNodes[key_name].ptime > 0) {
                ++count;
                csvArray[count] = [dataNodes[key_name].offset, dataNodes[key_name].ptimeOutput];
                console.log(csvArray);
            }
            ++keynameCount;
            key_name = `${key_name_head}_${keynameCount}`;
        }
        let csvContent = "data:text/csv;charset=utf-8,"
            + csvArray.map(e => e.join(",")).join("\n");
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "seismic_data.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
    }
}
//# sourceMappingURL=CSVoutput.js.map