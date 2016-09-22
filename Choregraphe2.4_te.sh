#!/bin/bash

# NAOqi Python SDK を保存した場所
NAOQISDK="$HOME/lib/pynaoqi-python2.7-2.1.4.13-mac64"

# Choregraphe のインストールディレクトリ
CHOREGRAPHEDIR="/Applications/Aldebaran Robotics/Choregraphe Suite 2.1" 


cd "$CHOREGRAPHEDIR"

DYLD_FRAMEWORK_PATH=Choregraphe.app/Contents/Resources \
DYLD_LIBRARY_PATH=Choregraphe.app/Contents/Resources/lib \
Choregraphe.app/Contents/Resources/bin/naoqi-bin &

sleep 5

export DYLD_LIBRARY_PATH="$NAOQISDK":$DYLD_LIBRARY_PATH
export PYTHONPATH="$NAOQISDK":$PYTHONPATH 

/usr/bin/python /usr/local/bin/qimessaging-json &
/usr/bin/python /usr/local/bin/PepperTabletEmulator.py &

open --wait-apps ./Choregraphe.app --args -p 9559 
