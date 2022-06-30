#!/usr/bin/env python3
"""Receive name-word pairs, reduce by frequency of word."""
import sys
import itertools

###############################################################################
# the code below is pulled from EECS485 madoop starter code, created by       #
# awdeorio@umich.edu.                                                         #
#                                                                             #
# any other code is written by Thomas Dokas,                                  #
# dokastho@umich.ed                                                           #
###############################################################################

# group: labels with this word
def reduce_one_group(key, group):
    """Reduce one group."""
    
    # word, followed by list of labels & frequency
    label_string = '\t'.join(group)
    line = f'{key}\t{label_string}'
    print(line)


def keyfunc(line):
    """Return the key from a TAB-delimited key-value pair."""
    return line.partition("\t")[0]


def main():
    """Divide sorted lines into groups that share a key."""
    for key, group in itertools.groupby(sys.stdin, keyfunc):
        reduce_one_group(key, group)


if __name__ == "__main__":
    main()

