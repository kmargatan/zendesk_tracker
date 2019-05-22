function getAPIdata(apiURL,auth) {
  try {
    var response = UrlFetchApp.fetch(apiURL, { method: "get", headers: {"Authorization": auth} });
  }

  catch(err) {
    Logger.log("API Call Failed. Error: "+err);

    var formData =
        {
          //'value1': master.getName(),
          'value1': 'NULL',
          'value2': err.message,
          'value3': ''
        };
    var options =
        {
          'method': 'post',
          'payload': formData
        };

    UrlFetchApp.fetch(notifUrl,options);

    var apiObject = { "rows" : [], "user" : [], "results" : [] };
    return apiObject;
  }

  var apiObject = JSON.parse(response.getContentText());
  return apiObject;
}

function sendEmail(to, subject, body) {
  var formData =
      {
        'value1': to,
        'value2': subject,
        'value3': body
      };
  var options =
      {
        'method': 'post',
        'payload': formData
      };

  UrlFetchApp.fetch(notifUrl,options);
}
