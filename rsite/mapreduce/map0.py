#!/bin/python3

"""Map crawler data & reduce by job title."""
import sys
import csv
import re
from variable import HADOOP_ROOT


def main():
    """Do mayne func."""
    stopwords = open(str(HADOOP_ROOT/"stopwords.txt"), 'r')
    stopwords = stopwords.readlines()
    stopwords = [word.rstrip('\n') for word in stopwords]
    
    csv.field_size_limit(sys.maxsize)

    lines = sys.stdin.readlines()
    # sys.stdin = open("/dev/tty")  # Temporary addition
    fields = ['job_name', 'job_desc']
    reader = csv.DictReader(lines, fieldnames=fields)

    for row in reader:
        # clean file data
        line = row['job_name'] + ' ' + row['job_desc']

        # tolower, remove numbers
        line = re.sub(r"[^a-zA-Z0-9 ]+", "", line)

        # remove punctuation
        line = re.sub(r'[^\w\s]', '', line)
        line = line.casefold()
        terms = line.split()

        cleaned = []
        for term in terms:
            nums = re.findall('[0-9]+', term)
            if len(nums) != 0:
                continue
            if term not in stopwords:
                cleaned.append(term)

        for term in cleaned:
            output = f'{row["job_name"]}\t{term}'
            print(output)


if __name__ == "__main__":
    main()
