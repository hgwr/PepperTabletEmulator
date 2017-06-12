# -*- coding: utf-8 -*-
import sys
import os.path
import time
import signal
from datetime import datetime
from naoqi import ALProxy

from mock_memory import MockMemory # for testing


tts = ALProxy("ALTextToSpeech", "127.0.0.1", 9559)
tts.say("Cconnection from fc_logger.py. It's " + datetime.now().strftime("%Y/%m/%d %H:%M:%S"))

# memory = ALProxy("ALMemory", "127.0.0.1", 9559)
memory = MockMemory()

#####

argv = sys.argv
argc = len(argv)
if (argc != 2):
    print 'Usage: %s log_file_name' % argv[0]
    quit()

log_file_name = argv[1]
if os.path.isfile(log_file_name):
    print 'Error: File %s already exists.' % log_file_name
    quit()

f = open(log_file_name, 'w')

####

def combineWithDistance(peopleId):
    return [peopleId, memory.getData("PeoplePerception/Person/%d/Distance" % peopleId)]

def byDistance(a, b):
    if a[1] < b[1]:
        return -1
    elif a[1] > b[1]:
        return 1
    else:
        return 0

while True:
    time.sleep(1)

    timestr = datetime.now().strftime("%Y/%m/%d %H:%M:%S")

    peopleIds = memory.getData("EngagementZones/PeopleInZone1") + memory.getData("EngagementZones/PeopleInZone2")
    if len(peopleIds) == 0:
        continue
    
    peopleIds = map(combineWithDistance, peopleIds)
    peopleIds.sort(byDistance)

    peopleId = peopleIds[0][0]
    expressionData = memory.getData("PeoplePerception/Person/%d/ExpressionProperties" % peopleId)
    output = ""
    if expressionData and len(expressionData) == 5:
        output = "%s: %d: %s" % (timestr, peopleId, ', '.join(map(str, expressionData)))
    else:
        output = "%s: %d: " % (timestr, peopleId)

    print output
    f.write(output)
    f.write("\n")
