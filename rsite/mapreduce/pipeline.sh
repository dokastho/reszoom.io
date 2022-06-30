#!/bin/bash
#
# Example of how to chain MapReduce jobs together.  The output of one
# job is the input to the next.
#
# Hadoop (or Madoop) options
# jar index/hadoop/hadoop-streaming-2.7.2.jar   # Hadoop configuration
# -input <directory>                            # Input directory
# -output <directory>                           # Output directory
# -mapper <exec_name>                           # Mapper executable
# -reducer <exec_name>                          # Reducer executable
# -numReduceTasks 3                             # Number of reducers

# Stop on errors
# See https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
set -Eeuo pipefail

# Optional input directory argument
PIPELINE_INPUT=input
if [ -n "${1-}" ]; then
  PIPELINE_INPUT="$1"
fi

# Print commands
set -x

# Remove output directories
rm -rf output output[0-9]

# Job 0
madoop \
  -input ${PIPELINE_INPUT} \
  -output output1 \
  -mapper ./map0.py \
  -reducer ./reduce0.py

# Job 1
madoop \
  -input output1 \
  -output output \
  -mapper ./map1.py \
  -reducer ./reduce1.py
