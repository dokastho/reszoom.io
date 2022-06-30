#!/usr/bin/env python3
"""Print the input to pipe to final reduce stage"""
import sys


def main():
    """Do mayne func."""
    for line in sys.stdin:
        doc_id = 0
        print(f'{doc_id % 3}\t{line.strip()}')


if __name__ == "__main__":
    main()
