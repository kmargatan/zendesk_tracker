function getUsers(sheetURL, timeNow, groups) {
  var userDB = DB.getSheetByName('Users');
  var userList = userDB.getRange(1,1,userDB.getLastRow(),userDB.getLastColumn()).getValues();

  var main = SpreadsheetApp.openByUrl(sheetURL).getSheetByName('Main');
  main.clear();
  main.clearFormats();
  main.clearNotes();

  var row = 0; var i4 = 0; var list = []; var oooList = []; var userAdd = [];

  for (i1=0; i1<groups.length; i1++) {
    var group = getAPIdata("get", zdUrl+"groups/"+groups[i1]+".json",zdAuth,null);
    var users = getAPIdata("get", zdUrl+"groups/"+groups[i1]+"/memberships.json",zdAuth,null);

    main.getRange(row+hborder,1,1,header.length).setBorder(true, false, false, false, false, false);

    group.group.name = group.group.name.replace("Support ", "");

    for (var i2=0; i2<users.count; i2++) {
      if (i2 == 0) {
        list[row] = [group.group.name,users.count,'','','',];
      } else {
        list[row] = ['','','','',''];
      }

      for (var i3=0; i3<userList.length; i3++) {
        if (users.group_memberships[i2].user_id == userList[i3][0]) {
          list[row][2] = userList[i3][0]; //ZD ID
          list[row][3] = userList[i3][1]; //Email
          list[row][4] = userList[i3][2]; //Name

          break;
        }
      }

      if (i3 == userList.length) {
        var detail = getAPIdata("get",zdUrl+"users/"+users.group_memberships[i2].user_id+".json",zdAuth,null);
        list[row][2] = detail.user.id;
        list[row][3] = detail.user.email;
        list[row][4] = detail.user.name;

        userAdd[i4++] = [detail.user.id,detail.user.email,detail.user.name];
      }

      oooList[row] = list[row];
      list[row] = list[row].concat('','','','','','','','');

      row++;
    }
  }

  list.unshift(header);
  list[row+1] = ['SUMMARY','','','','','','','','','','','',''];

  if (userAdd.length > 0) { userDB.getRange(userList.length+1,1,userAdd.length,3).setValues(userAdd); }

  main.getRange(row+hborder,1,1,header.length).setBorder(true, false, false, false, false, false);
  main.getRange(hborder-1, 1, list.length, list[0].length).setValues(list);

  //getOOO(sheetURL, timeNow, oooList);
}
