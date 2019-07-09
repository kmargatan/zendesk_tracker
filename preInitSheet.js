function preInitSheet(groups) {
  var groupIDs = [];
  var groupJSON = [];

  for (var i=0; i<groups.length; i++) {
    groups[0] = groups[0].replace(/ /g,"+");
    var response = getAPIdata("get", zdUrl+"search/incremental.json?type=group&query=%22"+groups[i]+"%22",zdAuth,null);

    groupIDs.push(response.results[0].id);
    groupJSON.push(
      {
        "field": "group_id",
        "operator": "is",
        "value": response.results[0].id.toString()
      }
        );
  }

  var OPbody =
      {
        "view": {
          "title": "Zendesk API OP",
          "restriction": {
            "type": "User",
            "id": 770029767
          },
          "all": [
            {
              "field": "status",
              "operator": "less_than",
              "value": "solved"
            }
          ],
          "any": groupJSON,
          "output": {
            "columns": ["group","assignee","organization","created","updated_assignee","34915288","28643477"]
          }
        }
      };

  var Tbody =
      {
        "view": {
          "title": "Zendesk API T",
          "restriction": {
            "type": "User",
            "id": 770029767
          },
          "all": [
            {
              "field": "status",
              "operator": "greater_than",
              "value": "pending"
            },
            {
              "field": "SOLVED",
              "operator": "less_than",
              "value": "180"
            }
          ],
          "any": groupJSON,
          "output": {
            "columns": ["group","assignee","organization","created","solved","20280868","20282146"]
          }
        }
      };

  var OPid = getAPIdata("post", zdUrl+"views.json", zdAuth, OPbody);
  var Tid  = getAPIdata("post", zdUrl+"views.json", zdAuth, Tbody);

  Logger.log("PLEASE COPY THE FOLLOWING INPUT!");
  Logger.log("groups = "+groupIDs);
  Logger.log("OPid = "+OPid.view.id);
  Logger.log("Tid = "+Tid.view.id);
}
