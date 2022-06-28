#!/bin/python3

import sys
import itertools

###############################################################################
# the code below is pulled from EECS485 madoop starter code, created by       #
# awdeorio@umich.edu.                                                         #
#                                                                             #
# any other code is written by Thomas Dokas,                                  #
# dokastho@umich.ed                                                           #
###############################################################################


def reduce_one_group(key, group):
    """Reduce one group."""

    # pipe output
    # print()


def keyfunc(line):
    """Return the key from a TAB-delimited key-value pair."""
    return line.partition("\t")[0]


def main():
    """Divide sorted lines into groups that share a key."""
    for key, group in itertools.groupby(sys.stdin, keyfunc):
        reduce_one_group(key, group)


if __name__ == "__main__":
    main()
