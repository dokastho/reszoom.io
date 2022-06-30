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


def reduce_one_group(key, group):
    """Reduce one group."""
    words = {}
    
    for line in group:
        word = line.split('\t')[1].strip()
        # print label-word for each word in desc
        if word not in words.keys():
            words[word] = 0
        words[word]+=1

    for word in words.keys():
        # print word-job title-frequency
        print(f'{word}\t{key}\t{words[word]}')


def keyfunc(line):
    """Return the key from a TAB-delimited key-value pair."""
    return line.partition("\t")[0]


def main():
    """Divide sorted lines into groups that share a key."""
    for key, group in itertools.groupby(sys.stdin, keyfunc):
        reduce_one_group(key, group)


if __name__ == "__main__":
    main()

