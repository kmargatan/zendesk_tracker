//USER INPUT
var sheetURL = "";
var groups = [];
var OPid   = ;
var Tid    = ;
//END USER INPUT

var master = SpreadsheetApp.openByUrl(sheetURL);
var main = master.getSheetByName('Main');

var timeNow = new Date();
var day  = timeNow.getDay();
var hour = timeNow.getHours();
var min  = timeNow.getMinutes();

function onOpen() {
  var entries = [
    { name: "Sync Now",     functionName: "getTickets"  }
    ,{ name: "Update Users", functionName: "getUsers"    }
//    ,{ name: "Send Email",   functionName: "emailButton" }
  ];
  master.addMenu("Zendesk", entries);
}

function getTime() {
  //MON-FRI 6AM to 9AM
  if (((day > 0) && (day < 6)) && ((hour > 6) && (hour < 21))) {
    //7AM - UPDATE USERS
    if ((hour == 7) && (min < 5)) {
      getUsers();
    } else {
      getTickets();
    }
  } else {
    main.getRange('A1').setValue("System is on Power Saving Mode and will resume next Business Day at 7AM  Eastern")
  }
}

function getUsers() {
  zdtrack.getUsers(sheetURL, timeNow, groups);
  getTickets();
}

function getTickets() {
  zdtrack.getTickets(sheetURL,timeNow, OPid, Tid, false, groups);
}

function getHigh() {
  var highAged = getTickets();

  zdtrack.getHigh(sheetURL, timeNow, highAged);
}

function onEdit(e) {
  var edit = e.range;
  var row = edit.getRow();
  var col = edit.getColumn();
  var val = edit.getValue();

  if ((edit.getSheet().getName() == 'OOO') && (col == day+6)) {
    var [format, note] = zdtrack.formatOOO(timeNow, val);

    main.getRange(row, 5).setBackground(format);
    main.getRange(row, 5).setNote(note);
  }
}

function sandBox() {
  Logger.log(master.getSheetByName('Attn').getRange('B26').getValue());

}
