# -*- coding: utf-8 -*-
import sys
import os.path
import time
import signal
from datetime import datetime
from naoqi import *

from mock_memory import MockMemory # for testing

##### ログを書き込む先のファイルの準備

argv = sys.argv
argc = len(argv)
if (argc != 2):
    print 'Usage: %s log_file_name' % argv[0]
    quit()

log_file_name = argv[1]

### ログファイルの上書きを禁止
if os.path.isfile(log_file_name):
    print 'Error: File %s already exists.' % log_file_name
    quit()

log_file = open(log_file_name, 'w')

##### Pepper と接続

tts = ALProxy("ALTextToSpeech", "Pepper.local", 9559)
tts.say("スクリプト開始")

print "ALBroker"
boroker = ALBroker("pythonBroker", "0.0.0.0", 0, "Pepper.local", 9559)

print "connecting ALMemory ..."
memory = ALProxy("ALMemory", "Pepper.local", 9559)
# memory = MockMemory()

print "connected."

##### Pepper からデータを取得します

expressionNames = ["Newtral", "Happy", "Surprised", "Angry", "Sad"]

def combineWithDistance(peopleId):
    return [peopleId, memory.getData("PeoplePerception/Person/%d/Distance" % peopleId)]

def byDistance(a, b):
    if a[1] < b[1]:
        return -1
    elif a[1] > b[1]:
        return 1
    else:
        return 0

class MyModule(ALModule):
    """ fantastic My Module document
    """
    def onMessageFromTablet(self, varName, value):
        """ awesome onMessageFromTablet document
        """
        timestr = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        msg = "JavaScript log: %s: %s %s" % (timestr, varName, value)
        print msg
        log_file.write(msg)
        log_file.write("\n")

    def onFaceDetected(self, varName, value):
        timestr = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        print "onFaceDetected: %s %s %s" % (timestr, varName, value)

myModule = MyModule("myModule")

memory.subscribeToEvent("PepperQiMessaging/fromtablet", "myModule", "onMessageFromTablet")
# memory.subscribeToEvent("FaceDetected", "myModule", "onFaceDetected")

print "データ取得開始: Ctrl-C でスクリプトを終了します。"

while True:
    time.sleep(1)

    timestr = datetime.now().strftime("%Y/%m/%d %H:%M:%S")

    print "人を探し中...", 
    peopleIds = memory.getData("EngagementZones/PeopleInZone1") + memory.getData("EngagementZones/PeopleInZone2")
    if len(peopleIds) == 0:
        print "  人を見つけられませんでした。"
        continue
    else:
        print "  見つけました。 peopleIds = ", peopleIds
    
    try:
        peopleIds = map(combineWithDistance, peopleIds)
    except RuntimeError as e:
        print "  人を見失いました。"
        continue

    peopleIds.sort(byDistance)

    peopleId = peopleIds[0][0]

    try:
        expressionData = memory.getData("PeoplePerception/Person/%d/ExpressionProperties" % peopleId)
    except RuntimeError as e:
        expressionData = None
        print "感情表現データの取得なし"
	continue

    try:
        smileData = memory.getData("PeoplePerception/Person/%d/SmileProperties" % peopleId)
    except RuntimeError as e:
        smileData = None
        print "笑顔度のデータの取得なし"
	continue

    output = ""
    if expressionData and len(expressionData) == 5 and smileData:
        annotated = zip(expressionNames + ["Smile"], expressionData + [smileData])
        output = "%s: %d: %s" % (timestr, peopleId, ', '.join(map(str, annotated)))
    elif expressionData and len(expressionData) == 5:
        annotated = zip(expressionNames, expressionData)
        output = "%s: %d: %s" % (timestr, peopleId, ', '.join(map(str, annotated)))
    else:
        output = "%s: %d: " % (timestr, peopleId)

    print output
    log_file.write(output)
    log_file.write("\n")
