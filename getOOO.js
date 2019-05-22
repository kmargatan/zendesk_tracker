function getOOO(sheetURL, timeNow, oooList) {
  var main = SpreadsheetApp.openByUrl(sheetURL).getSheetByName('Main');
  var ooo  = SpreadsheetApp.openByUrl(sheetURL).getSheetByName('OOO');

  if (ooo.getLastRow() < (hborder+1)) {
    var oldList = null;
  } else {
    var oldList = ooo.getRange(hborder, 1, (ooo.getLastRow()-hborder+1), 11).getValues();
  }

  var week = ['','','','','',''];

  for (var i=1; i<6; i++) {
    var dateOOO = new Date();

    if (i<timeNow.getDay()) {
      dateOOO.setDate(dateOOO.getDate() + (i-timeNow.getDay()+7));
    } else {
      dateOOO.setDate(dateOOO.getDate() + (i-timeNow.getDay()));
    }

    week.push((dateOOO.getMonth()+1)+'/'+dateOOO.getDate());
  }

  if (oldList != null) {
    Logger.log('OOO not NULL');
    var format = []; var note = [];

    for (var i2=0; i2<oooList.length; i2++) {
      var notfound = true;

      var i3=0;
      while (i3<oldList.length) {

        if (oldList[i3][4] == oooList[i2][4]) {
          oldList[i3].splice(0,5);
          oooList[i2] = oooList[i2].concat(oldList[i3]);

          oldList.splice(i3,1);
          notfound = false;

          var today = oooList[i2][5+timeNow.getDay()];
          Logger.log(oooList[i2][4]+' is '+today);
          [format[i2], note[i2]] = formatOOO(timeNow, today);
//          Logger.log(oooList[i2][4]+' is '+note[i2]);
          break;
        }

        i3++;
      }

      if (notfound) {
        oooList[i2] = oooList[i2].concat('','','','','','');
        format.push(['']);
        note.push(['']);
      }
    }
  } else {
    Logger.log('OOO NULL');
    for (i2=0; i2<oooList.length; i2++) {
      oooList[i2].push('','','','','','');
    }
  }

  oooList.unshift(week);
  oooList.unshift(['','','','','','','Mon','Tue','Wed','Thu','Fri']);

  ooo.clear();
  ooo.getRange(hborder-2, 1, oooList.length, 11).setValues(oooList);

  var range = main.getRange(hborder,5,main.getLastRow()-hborder,1);
  range.setBackgrounds(format);
  range.setNotes(note);
}
