/**
 * Draw the calendar heatmaps for each instrument's archive
 */
function drawCharts() {
    var instruments = {
         "AW01XX_002CTDXXXXR00": "NS01",
         "AW01XX_102CTDXXXXR00": "NS01",
         "AW02XX_001CTDXXXXR00": "NS02",
         "AW02XX_101CTDXXXXR00": "NS02",
         "WK01XX_001CTDXXXXR00": "NS03",
         "WK02XX_001CTDXXXXR00": "NS04",
         "PIAS01_001CTDXXXXR00": "NS05",
         "PIFM01_001CTDXXXXR00": "NS06",
         "PIFM01_101CTDXXXXR00": "NS06",
         "PIFM02_001CTDXXXXR00": "NS06",
         "PIMI01_001CTDXXXXR00": "NS07",
         "PIPL01_001CTDXXXXR00": "NS08",
         "PIGM01_001CTDXXXXR00": "NS09",
         "MB01XX_001CTDXXXXR00": "NS10",
         "PINM01_002CTDX008R00": "NS11",
         "MU02XX_001YCTDXXXR00": "NS12",
         "MU02XX_002CTDXXXXR00": "NS12",
         "MU01XX_001YCTDXXXR00": "NS13",
         "MU01XX_101YCTDXXXR00": "NS13",
         "PIGM01_002CTDX002R00": "NS15",
         "MB02XX_001CTDXXXXR00": "NS16",
        "CWB02XX_002CTDXXXXR00": "CWB02",
        "CWB01XX_009CTDXXXXR00": "CWB01",
        "CWB03XX_004CTDXXXXR00": "CWB03",
                  "pp2_pohnpei": "PP02",
                  "pp3_palmyra": "PP03",
              "pp4_oahu_kewalo": "PP04",
             "pp5_oahu_waialae": "PP05",
                    "pp6_palau": "PP06"
    };
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
    var processedAccordion = $("#processedAccordion");
    var rawAccordion = $("#rawAccordion");
    var thisYear = (new Date()).getFullYear();

    // Build the HTML accordion containers using Bootstrap 5
    for (var instrument in instruments) {
        var shortName = instruments[instrument];

        // Build the accordion header div
        var processedHeaderButton = $("<button></button>")
            .addClass(["accordion-button"])
            .attr({
                "type": "button",
                "data-bs-toggle": "collapse",
                "data-bs-target": "#collapseProcessed" + instrument,
                "aria-expanded": "true",
                "aria-controls": "collapseProcessed" + instrument
            })
            .text("Processed " + shortName + " / " + instrument);
        var processedAccordionHeader = $('<h4></h4>').addClass("accordion-header").attr("id", "headingProcessed" + instrument).append(processedHeaderButton);

        var rawHeaderButton = $("<button></button>")
            .addClass(["accordion-button"])
            .attr({
                "type": "button",
                "data-bs-toggle": "collapse",
                "data-bs-target": "#collapseRaw" + instrument,
                "aria-expanded": "true",
                "aria-controls": "collapseRaw" + instrument
            })
            .text("Raw " + shortName + " / " + instrument);
        var rawAccordionHeader = $('<h4></h4>').addClass("accordion-header").attr("id", "headingRaw" + instrument).append(rawHeaderButton);

        // Build the accordion body div
        var processedAccordionBody = $("<div></div>").addClass("accordion-body");
        var rawAccordionBody = $("<div></div>").addClass("accordion-body");

        for (var index = 0; index < years.length; index++) {
            var year = years[index];
            var processedCalendarDiv = $("<div></div>").attr("id", "Processed" + instrument + "_" + year);
            processedAccordionBody.append(processedCalendarDiv);
            var rawCalendarDiv = $("<div></div>").attr("id", "Raw" + instrument + "_" + year);
            rawAccordionBody.append(rawCalendarDiv);
        }

        // Build the accordion collapse div
        var processedCollapseDiv = $("<div></div>").addClass(["collapse"]).attr({
            "id": "collapseProcessed" + instrument,
            "data-parent": "#processedAccordion",
            "aria-labeledby": "headingProcessed" + instrument
        }).append(processedAccordionBody);


        var rawCollapseDiv = $("<div></div>").addClass(["collapse"]).attr({
            "id": "collapseRaw" + instrument,
            "data-parent": "#rawAccordion",
            "aria-labeledby": "headingRaw" + instrument
        }).append(rawAccordionBody)
        
        // Show the first accordion div
        if (instrument == "AW01XX_002CTDXXXXR00") {
            processedCollapseDiv.addClass("show");
            rawCollapseDiv.addClass("show");
        }

        var processedAccordionDiv = $("<div></div").addClass("accordion-item").append(processedAccordionHeader).append(processedCollapseDiv);
        var rawAccordionDiv = $("<div></div").addClass("accordion-item").append(rawAccordionHeader).append(rawCollapseDiv);

        // Add the elements to their parents
        processedAccordion.append(processedAccordionDiv);
        rawAccordion.append(rawAccordionDiv);
    }

    // Generate calendar heatmaps for processed data
    for (instrument in instruments) {
        for (var j = 0; j < years.length; j++) {
            year = years[j];
            filename = "processed/" + instrument + "_" + year + ".json";
            drawChart(instrument, year, filename, false);
        }
    }

    // Generate calendar heatmaps for raw data
    for (instrument in instruments) {
        for (var j = 0; j < years.length; j++) {
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