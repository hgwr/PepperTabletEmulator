import re

class MockMemory:
    def getData(self, item):
        if item == "EngagementZones/PeopleInZone1":
            return [1]
        elif item == "EngagementZones/PeopleInZone2":
            return [0]
        else:
            result = re.match("^PeoplePerception/Person/([0-9])/Distance", item)
            if result:
                personId = int(result.group(1))
                if personId == 1:
                    return 0.75
                else:
                    return 2.5

            result = re.match("^PeoplePerception/Person/([0-9])/ExpressionProperties", item)
            if result:
                personId = int(result.group(1))
                if personId == 1:
                    return [0.1, 0.6, 0.1, 0.1, 0.1]
                else:
                    return [0.6, 0.1, 0.1, 0.1, 0.1]
