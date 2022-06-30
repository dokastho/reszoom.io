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
    group = list(group)
    
    words = {}
    
    for line in group:
        [_, word, label, freq] = line.split('\t')
        
        if word not in words.keys():
            words[word] = []
        
        words[word].append(f'{label}\t{freq}'.strip())
    
    for word in words.keys():
        # word, followed by list of labels & frequency
        label_string = '\t'.join(words[word])
        print(f'{word}\t{label_string}')


def keyfunc(line):
    """Return the key from a TAB-delimited key-value pair."""
    return line.partition("\t")[0]


def main():
    """Divide sorted lines into groups that share a key."""

    # lines = sys.stdin.readlines()  # Temporary addition
    # sys.stdin = open("/dev/tty")  # Temporary addition
    # breakpoint()

    # for key,group in itertools.groupby(lines, keyfunc):
    for key, group in itertools.groupby(sys.stdin, keyfunc):
        reduce_one_group(key, group)


if __name__ == "__main__":
    main()
