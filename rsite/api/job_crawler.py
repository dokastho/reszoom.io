"""Selenium script for crawling indeed.com to gather keywords associated with job titles from jobs.txt."""

from pathlib import Path
from selenium.webdriver.common.by import By
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import subprocess


# set root for file in the repo directory
APPLICATION_ROOT = Path(__file__).resolve().parent.parent.parent

# source file to gather keywords
JOBS = APPLICATION_ROOT/"jobs.txt"

# output folder to save results to
MAPREDUCE_FOLDER = Path(__file__).resolve().parent/"mapreduce"/"input"


def main():
    # read jobs.txt
    with open(JOBS) as fp:
        lines = fp.readlines()
        job_list = [line.strip().lower() for line in lines]


    # Configure Selenium
    #
    # Pro-tip: remove the "headless" option and set a breakpoint.  A Chrome
    # browser window will open, and you can play with it using the developer
    # console.
    options = webdriver.chrome.options.Options()
    options.add_argument("--headless")

    # chromedriver is not in the PATH, so we need to provide selenium with
    # a full path to the executable.
    node_modules_bin = subprocess.run(
        ["npm", "bin"],
        stdout=subprocess.PIPE,
        universal_newlines=True,
        check=True
    )
    node_modules_bin_path = node_modules_bin.stdout.strip()
    chromedriver_path = Path(node_modules_bin_path) / "chromedriver"

    driver = webdriver.Chrome(
        options=options,
        executable_path=str(chromedriver_path),
    )

    # route to site & search page
    driver.get("https://indeed.com")
    pass


if __name__ == "__main__":
    main()
