//BEGIN USER INPUTS
var zdUrl = "";
var itUrl = "";
var notifUrl = "";

var zdAuth = "";
var itAuth = "";
//END USER INPUTS

//LOCAL SHEETS

var hborder = 4; var vborder = 6;
var header = ["Pod","Count","ZD ID","Email","Name","Total","Open","Pending","Response","Solved","TTR","Link %","Aged 30+"];

//REMOTE SHEETS
var DB     = SpreadsheetApp.openByUrl("");
var cal    = DB.getSheetByName("Calendar");
  cal      = cal.getRange(1,1,cal.getLastRow(),cal.getLastColumn()).getValues();

//PRECONDITIONS
var timeNow = new Date();
var holiday = 0;

if (timeNow.getDay() == 6) {
  holiday = 1;
} else if (timeNow.getDay() <= 2) {
  holiday = 2;
}

for (var i=0; i<cal.length; i++) {
  var delta = (timeNow - new Date(cal[i][0]))/1000/60/60/24;

  if ((delta > 0) && (delta < 7)) {
    holiday++;
  }
}
