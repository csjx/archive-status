# coding: utf-8
import sys
import os
from time import time
from datetime import datetime
from datetime import date
from pathlib import Path
import pandas as pd
import numpy as np
import json
from pprint import pprint
from concurrent.futures import ThreadPoolExecutor
import logging as log
import logging.handlers




log.basicConfig(filename='/var/log/pacioos/archive-status/archive-status.log', 
  filemode='a', format='%(asctime)s: %(levelname)s: %(message)s', level=logging.INFO)

class CalendarHeatmapReporter(object):
    """
    CalendarHeatmapReporter generates JSON data for reporting the 
    realtime instrument archive status.
    """

    def __init__(self):
        """
            Construct a CalendarHeatmapReporter
        """
        super(CalendarHeatmapReporter, self).__init__()

    def generate_heatmap_data(self, data_dir=None):
        """
            Generate heatmap data from the archive file counts.
            This gets displayed using a web page with Javascript calendar heatmaps.
        """

        # Define the input and output directories
        output_dir = "/var/www/realtime.pacioos.hawaii.edu/archive-status/src/web/"
        data_path = Path(data_dir)

        # Define a data frame to filter the file data
        columns=["instrument", "year", "month", "day", "count", "raw"]
        table = pd.DataFrame(columns=columns)
        # Define the range of years to produce calendars
        today = date.today()
        years = np.arange(2008, today.year + 1)
        raw = 0 # flag if this is a raw data file (vs processed)

        # Iterate through the instrument directories
        for instrument_dir in data_path.iterdir():
            # Append DecimalASCIISampleData for the raw paths

            if "raw" in str(instrument_dir):
                instrument_dir = instrument_dir.joinpath("DecimalASCIISampleData")
                raw = 1

            files = list(instrument_dir.glob("**/*.dat"))
            log.info(f"File count in {instrument_dir.resolve()}: {len(files)}")
            
            # Add each instrument file to the table as [instrument, date, count]
            for file in files:
                try:
                    site, instr, date_ext = file.name.split("_")
                    instrument = site + "_" + instr
                    #log.info(f"Adding to the table: {file}")
                    dt_parts = date_ext.split(".")
                    dt = dt_parts[0]

                    date_time = datetime.strptime(dt, "%Y%m%d%H%M%S")
                    date_string = date_time.strftime("%Y-%m-%d")
                    date_obj = datetime.strptime(date_string, "%Y-%m-%d")
                    # If an instrument and date exist in the table, update the row count
                    existing_row = table[
                        (table["instrument"] == instrument) & 
                        (table["year"] == date_obj.year) &
                        (table["month"] == date_obj.month) &
                        (table["day"] == date_obj.day) &
                        (table["raw"] == raw)
                    ]
                    if not existing_row.empty:
                        table.at[existing_row.index, "count"] = existing_row["count"] + 1
                    else:
                        # Append a row if none exist
                        row = pd.DataFrame(
                            {
                                "instrument": [instrument], 
                                "year": [date_obj.year], 
                                "month": [date_obj.month], 
                                "day": [date_obj.day], 
                                "count": [1],
                                "raw": [raw]
                            }
                        )
                        table = table.append(row, ignore_index=True)
                        table = table.sort_values(by=["instrument", "year", "month", "day"])
                except Exception as e:
                    log.info(f"Failed to process {file}")
                    log.info(e)
                    continue
        # log.info(table.to_csv())
        data = {}

        # Build a JSON file for each instrument and year
        for instrument_dir in data_path.iterdir():
            
            # Append DecimalASCIISampleData for the raw paths
            if "raw" in str(instrument_dir):
                instrument_dir = instrument_dir.joinpath("DecimalASCIISampleData")
                name = Path(str(instrument_dir.parent)).name
                raw = 1
            else:
                name = instrument_dir.name

            log.info(f"Processing {name}")
            for year in years:
                rows = table[
                    (table["instrument"] == name) & 
                    (table["year"] == year) &
                    (table["raw"] == raw)
                ]
                if not rows.empty:
                    for index, row in rows.iterrows():
                        instrument = row["instrument"]
                        y = row["year"] 
                        m = row["month"] 
                        d = row["day"]
                        timestamp = datetime(y, m, d).timestamp()
                        count = row["count"]
                        data[str(int(timestamp))] = count
                else:
                    log.info(f"No rows for {name}/{year}")

                # Write it to disk
                if instrument:
                    if raw:
                        output_path = Path(output_dir).joinpath("raw").joinpath(instrument + "_" + str(year) + ".json")
                    else:
                        output_path = Path(output_dir).joinpath("processed").joinpath(instrument + "_" + str(year) + ".json")

                    with open(output_path, "w+") as json_file:
                        json.dump(data, json_file)
                        log.info(f"Wrote {output_path}")
            data = {} # reset the data object on each iteration
            instrument = "" # reset the output path
            name = "" # reset the name

def main():
    '''
    The main entrypoint method of the CalendarHeatmapReporter class.

    Processes the data in the raw and processed data directories to produce JSON
    summary files of the number of files per day in each year.
    '''
    raw_data_dirs = ["/data/raw/alawai", "/data/raw/pacioos", "/data/raw/maui"]
    for raw_data_dir in raw_data_dirs:
        reporter = CalendarHeatmapReporter()
        reporter.generate_heatmap_data(raw_data_dir)

    processed_data_dirs= ["/data/processed/pacioos"]
    for processed_data_dir in processed_data_dirs:
        reporter = CalendarHeatmapReporter()
        reporter.generate_heatmap_data(processed_data_dir)
    
    
if __name__ == "__main__":
  sys.exit(main())
