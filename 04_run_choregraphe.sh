#!/bin/bash

script_home="$(cd -P "$(dirname "$0")" && pwd)"
. "${script_home}/sh_settings"

cd "$CHOREGRAPHEDIR"
open --wait-apps ./Choregraphe.app --args -p 9559 
