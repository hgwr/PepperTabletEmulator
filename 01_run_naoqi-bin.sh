#!/bin/bash

script_home="$(cd -P "$(dirname "$0")" && pwd)"
. "${script_home}/sh_settings"

DYLD_FRAMEWORK_PATH=Choregraphe.app/Contents/Resources \
DYLD_LIBRARY_PATH=Choregraphe.app/Contents/Resources/lib \
Choregraphe.app/Contents/Resources/bin/naoqi-bin
