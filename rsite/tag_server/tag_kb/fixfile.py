#!/env/bin/python3

import os
import pandas

p = os.getcwd()

foo = pandas.read_csv(p + "/rsite/api/files/lang.csv")
bar = '\n'.join(list(foo['name']))
fp = open('lang.tags', 'w')
fp.write(bar)
fp.close()
