#!/bin/bash

script_home="$(cd -P "$(dirname "$0")" && pwd)"
. "${script_home}/sh_settings"

export DYLD_LIBRARY_PATH="$NAOQISDK":$DYLD_LIBRARY_PATH
export PYTHONPATH="$NAOQISDK":$PYTHONPATH 

there_is_naoqi_bin=`ps -aef | grep Choregraphe.app/Contents/Resources/bin/naoqi-bin | grep -v grep | wc -l`
if [ "$there_is_naoqi_bin" != "1" ]; then
    echo "Error: There are no naoqi-bin process."
    exit 1
fi

/usr/bin/python /usr/local/bin/PepperTabletEmulator.py
