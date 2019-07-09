function initSheet(sheetURL) {
  var master = SpreadsheetApp.openByUrl(sheetURL);

  var firstStart = false;
  var firstSheet = master.getActiveSheet();

  if (master.getSheetByName("Main") == null) {
    master.insertSheet("Main");
    firstStart = true;
  }

  if (master.getSheetByName("OOO") == null) {
    master.insertSheet("OOO");
    firstStart = true;
  }

  if (master.getSheetByName("Attn") == null) {
    master.insertSheet("Attn");
    firstStart = true;
  }

  if (firstStart) {
    master.deleteSheet(firstSheet);
    master.getSheetByName("Main").hideColumns(2,3);
    master.getSheetByName("OOO").hideColumns(2,3);
  }

  DriveApp.getFileById(master.getId())
    .setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
}
