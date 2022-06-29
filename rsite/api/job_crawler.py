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
# list of links
links = []

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
    job_pair = f'{job_name},{desc}'
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
        # driver.implicitly_wait(3)
        # # click captcha
        # anchor = driver.find_element_by_xpath('//div[@id="anchor"]')
        # captcha = anchor.find_element_by_xpath('//div[@id="checkbox"]')
        # captcha.click()
        
        # driver.implicitly_wait(3)
        
        # # submit
        # submit_btn = driver.find_element_by_xpath('//input[@type="submit"]')
        # submit_btn.click()
        

    # get job cards if the search is not empty
    try:
        job_cards = driver.find_element_by_xpath('//ul[contains(@class,"jobsearch-ResultsList")]')
        
    except:
        print_atomic("No search results for job " + job_name)
        driver_lock.release()
        return
    
    element_list = job_cards.find_elements_by_tag_name("li")

    for job in element_list:
        # get link to each job
        links.append(job.find_element_by_xpath('//a[@class="jcs-JobTitle"]  ').get_attribute(name="href"))
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
        
        t = Thread(target=scrape_jobs, args=(job_name, ))
        t.start()
        threads.append(t)

    # join threads
    for t in threads:
        t.join()

    with open(str(MAPREDUCE_FOLDER/"input.txt"), "w") as fp:
        # write output
        fp.writelines(descriptions)


if __name__ == "__main__":
    main()

'<html lang="en"><head>\n<title>hCaptcha solve page</title>\n<script src="https://www.hcaptcha.com/1/api.js" async="" defer=""></script>\n</head>\n<body>\n<form action="/jobs?q=data%20scientist&amp;l=Ann%20Arbor,%20MI&amp;from=searchOnHP" method="POST">\n<div class="h-captcha" data-sitekey="eb27f525-f936-43b4-91e2-95a426d4a8bd"><iframe src="https://newassets.hcaptcha.com/captcha/v1/51c8a75/static/hcaptcha.html#frame=checkbox&amp;id=06rgfaecencs&amp;host=www.indeed.com&amp;sentry=true&amp;reportapi=https%3A%2F%2Faccounts.hcaptcha.com&amp;recaptchacompat=true&amp;custom=false&amp;hl=en&amp;tplinks=on&amp;sitekey=eb27f525-f936-43b4-91e2-95a426d4a8bd&amp;theme=light" title="widget containing checkbox for hCaptcha security challenge" tabindex="0" frameborder="0" scrolling="no" data-hcaptcha-widget-id="06rgfaecencs" data-hcaptcha-response="" style="width: 303px; height: 78px; overflow: hidden;"></iframe><textarea id="g-recaptcha-response-06rgfaecencs" name="g-recaptcha-response" style="display: none;"></textarea><textarea id="h-captcha-response-06rgfaecencs" name="h-captcha-response" style="display: none;"></textarea></div>\n<br>\n<input type="submit" value="Submit">\n</form>\n\n\n<div aria-hidden="true" style="background-color: rgb(255, 255, 255); border: 1px solid rgb(215, 215, 215); box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 4px; border-radius: 4px; left: -10000px; top: -10000px; z-index: -2147483648; position: absolute; transition: opacity 0.15s ease-out 0s; opacity: 0; visibility: hidden;"><div style="position: relative; z-index: 1;"><iframe src="https://newassets.hcaptcha.com/captcha/v1/51c8a75/static/hcaptcha.html#frame=challenge&amp;id=06rgfaecencs&amp;host=www.indeed.com&amp;sentry=true&amp;reportapi=https%3A%2F%2Faccounts.hcaptcha.com&amp;recaptchacompat=true&amp;custom=false&amp;hl=en&amp;tplinks=on&amp;sitekey=eb27f525-f936-43b4-91e2-95a426d4a8bd&amp;theme=light" title="Main content of the hCaptcha challenge" frameborder="0" scrolling="no" style="border: 0px; z-index: 2000000000; position: relative;"></iframe></div><div style="width: 100%; height: 100%; position: fixed; pointer-events: none; top: 0px; left: 0px; z-index: 0; background-color: rgb(255, 255, 255); opacity: 0.05;"></div><div style="border-width: 11px; position: absolute; pointer-events: none; margin-top: -11px; z-index: 1; right: 100%;"><div style="border-width: 10px; border-style: solid; border-color: transparent rgb(255, 255, 255) transparent transparent; position: relative; top: 10px; z-index: 1;"></div><div style="border-width: 11px; border-style: solid; border-color: transparent rgb(215, 215, 215) transparent transparent; position: relative; top: -11px; z-index: 0;"></div></div></div></body></html>'