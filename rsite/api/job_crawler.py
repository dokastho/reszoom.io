"""Selenium script for crawling indeed.com to gather keywords associated with job titles from jobs.txt."""

from pathlib import Path
from threading import Lock, Thread
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
MAPREDUCE_FOLDER = Path(__file__).resolve().parent.parent/"mapreduce"/"input"

# lock for appending to descriptions
desc_append = Lock()

# lock for accessing the driver
driver_lock = Lock()

# lock for printing
print_lock = Lock()

# list of title-desc pairs
descriptions = []

# list of active threads
threads = []

# Configure Selenium
#
# Pro-tip: remove the "headless" option and set a breakpoint.  A Chrome
# browser window will open, and you can play with it using the developer
# console.
options = webdriver.chrome.options.Options()
options.add_argument("--headless")
options.add_argument("--disable-blink-features=AutomationControlled")

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

CAPTCHA = False


def print_atomic(s: str):
    print_lock.acquire()
    print(s)
    print_lock.release()

def hCaptcha_print():
    print_lock.acquire()
    global CAPTCHA
    if CAPTCHA:
        print('.', end='')
    else:
        print('hCaptcha triggered. Try again later', end='')
        CAPTCHA = True
    print_lock.release()
    

def scrape_link(job_name, link, i):

    # get desc from each job
    driver_lock.acquire()
    driver.get(link)
    try:
        desc = driver.find_element_by_xpath('//div[@id="jobDescriptionText"]').text
    except:
        driver_lock.release()
        return

    driver_lock.release()
    
    # remove commas from the description to prep csv format
    desc = desc.replace(',', '')
    job_pair = f'{job_name},{desc}'
    
    # atomic append to data structure
    desc_append.acquire()
    descriptions.append(job_pair)
    desc_append.release()


def scrape_jobs(job_name):
    driver.implicitly_wait(3)

    # route to site & search page
    driver_lock.acquire()
    driver.get("https://indeed.com")

    initial_search_button = driver.find_element_by_xpath('//form[@id="jobsearch"]')
    initial_search_button.click()

    # search data science
    search_job = driver.find_element_by_xpath('//input[@id="text-input-what"]')
    search_job.send_keys([job_name])

    # submit form
    search_job.submit()

    if driver.title == "hCaptcha solve page":
        hCaptcha_print()
        driver_lock.release()
        return

    # get job cards if the search is not empty
    try:
        job_cards = driver.find_elements_by_xpath('//a[@class="jcs-JobTitle"]')
        
    except:
        print_atomic("No search results for job " + job_name)
        driver_lock.release()
        return
    
    # list of links
    links = []

    for job in job_cards:
        # get link to each job
        links.append(job.get_attribute(name="href"))
    driver_lock.release()

    # get each description
    for i, link in enumerate(links):
        # don't spawn more than k threads
        if i >= 100:
            break
        
        # ellipsis if link is too long
        link_str = link
        if len(link_str) > 70:
            link_str = link_str[0:70] + "..."

        print_atomic("\tScraping link " + link_str + ", " + f'{i + 1} of {min(len(links), 100)}')

        t = Thread(target=scrape_link, args=(job_name, link, i, ))
        t.start()
        threads.append(t)


def main():
    # read jobs.txt
    with open(JOBS) as fp:
        lines = fp.readlines()
        job_list = [line.strip().lower() for line in lines]

    # loop through job titles
    for job_name in job_list:
        print_atomic("Searching for job " + job_name + "...")
        
        # t = Thread(target=scrape_jobs, args=(job_name, ))
        # t.start()
        # threads.append(t)
        scrape_jobs(job_name)

    # join threads
    for t in threads:
        t.join()

    if CAPTCHA:
        # print a newline
        print("")

    with open(str(MAPREDUCE_FOLDER/"input.txt"), "w") as fp:
        # write output
        lines = [x.replace('\n', ' ') for x in descriptions]
        fp.writelines('\n'.join(lines))


if __name__ == "__main__":
    main()
