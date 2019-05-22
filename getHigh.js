function getHigh(sheetURL, timeNow, highAged) {
  var highTable = [];

  //HIGH
  for (var i=0; i<highAged[0].length; i++) {
    var parse = getAPIdata("https://airwatch.zendesk.com/api/v2/"+highAged[0][i]+".json", zdAuth);


  }
}
