/**
 * Draw the calendar heatmaps for each instrument's archive
 */
function drawCharts() {
    var instruments = [
        "AW02XX_001CTDXXXXR00",
        "MB01XX_001CTDXXXXR00",
        "WK01XX_001CTDXXXXR00",
        "WK02XX_001CTDXXXXR00",
        "PIMI01_001CTDXXXXR00",
        "PINM01_002CTDX008R00",
        "PIAS01_001CTDXXXXR00",
        "PIFM01_001CTDXXXXR00",
        "PIFM02_001CTDXXXXR00",
        "PIFM02_002CTDXXXXR00",
        "PIGM01_001CTDXXXXR00",
        "PIGM01_002CTDX002R00",
        "PIGM01_003CTDX002R00",
        "PIPL01_001CTDXXXXR00",
        "MU01XX_001YCTDXXXR00",
        "MU01XX_101YCTDXXXR00",
        "MU02XX_001YCTDXXXR00",
        "MU02XX_002CTDXXXXR00"
    ];
    var years = [
        "2022",
        "2021",
        "2020",
        "2019",
        "2018",
        "2017",
        "2016",
        "2015",
        "2014",
        "2013",
        "2012",
        "2011",
        "2010",
        "2009",
        "2008"
    ];
    var instrument;
    var year;
    var filename;

    // Generate calendar heatmaps for processed data
    for (var i = 0; i < instruments.length; i++) {
        for (var j = 0; j < years.length; j++) {
            instrument = instruments[i];
            year = years[j];
            filename = "processed/" + instrument + "_" + year + ".json";
            drawChart(instrument, year, filename, false);
        }
    }

    // Generate calendar heatmaps for raw data
    for (var i = 0; i < instruments.length; i++) {
        for (var j = 0; j < years.length; j++) {
            instrument = instruments[i];
            year = years[j];
            filename = "raw/" + instrument + "_" + year + ".json";
            drawChart(instrument, year, filename, true);
        }
    }
}

/**
 * Draw an individual calendar heatmap for a given instrument, year, and JSON data file name
 * @param  {string} instrument
 * @param  {string} year
 * @param  {string} filename
 */
function drawChart(instrument, year, filename, raw) {

    // Style the heatmap as a gradient for raw files, or as
    // present/absent/too many for processed files
    var level = raw ? "Raw" : "Processed"
    var legend = raw ? [0, 8, 16, 24] : [0, 1]

    this[level + instrument + year] = new CalHeatMap();
    this[level + instrument + year].init({
        // afterLoadData: parseData,
        itemSelector: "#" + level + instrument + "_" + year,
        domain: "year",
        subDomain: "day",
        data: filename,
        start: new Date(year, 0),
        cellSize: 10,
        cellPadding: 2,
        cellRadius: 1,
        range: 1,
        legend: legend,
        label: {
            position: "bottom"
        },
        weekStartOnMonday: false,
        displayLegend: false,
        itemName: ["file", "files"]
    });
}

/**
 *  Parse the JSON data - used for debugging
 * @param  {string} data
 */
var parseData = function(data) {
    console.log(data);
    return data;
}

// Draw the charts
window.onload = drawCharts;