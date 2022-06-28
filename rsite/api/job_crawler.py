"""Selenium script for crawling indeed.com to gather keywords associated with job titles from jobs.txt."""

from pathlib import Path


# set root for file in the repo directory
APPLICATION_ROOT = Path(__file__).resolve().parent.parent

# source file to gather keywords
JOBS = APPLICATION_ROOT/"jobs.txt"

# output folder to save results to
MAPREDUCE_FOLDER = Path(__file__).resolve().parent/"mapreduce"/"input"
