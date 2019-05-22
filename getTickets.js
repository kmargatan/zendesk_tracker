function getTickets(sheetURL, timeNow, OPid, Tid, audit) {
  var timer = [new Date()];

  var weekStart = new Date();
  weekStart.setDate(timeNow.getDate() - timeNow.getDay());

  var OP = getAPIdata(zdUrl+"/api/v2/views/"+OPid+"/execute.json?per_page=600",zdAuth);
  var T  = getAPIdata(zdUrl+"/api/v2/views/"+ Tid+"/execute.json?per_page=500",zdAuth);
  var IT = getAPIdata(itUrl+"/api/link-report?groups=157%2C158%2C159%2C160%2C161%2C162%2C193%2C167&time_zone=America%2FNew_York&active_only=false&page=0&limit=1000&sort_by=link_creation_date&order=desc&filter_start_date="+weekStart.toISOString()+"&filter_end_date="+timeNow.toISOString()+"&active_date_range=Custom%20Range&status=DRAFT%2CINTERNAL%2CEXTERNAL",itAuth);

  timer.push(new Date());

  var main = SpreadsheetApp.openByUrl(sheetURL).getSheetByName('Main');
  var attn = SpreadsheetApp.openByUrl(sheetURL).getSheetByName('Attn');
  var notifBar = main.getRange('A1');
  var notifBarFormat = main.getRange(1,1,1,main.getLastColumn());

  var range = main.getRange(hborder,1,main.getLastRow()-hborder+1,main.getLastColumn());
  var summary = range.getValues();
  var format  = range.getBackgrounds();
  var note    = range.getNotes();

  var row = hborder;
  var parse; var orgName;

  for (var i1=0; i1<summary.length; i1++) {
    for (var i2=vborder; i2<=summary[0].length; i2++) {
      summary[i1][i2-1] = 0;
    }
  }

  var auditHeader = ['Assignee', 'Ticket #', 'Status', 'Priority', 'Customer', 'Age', 'Last Response'];
  var highAged = [[auditHeader],[auditHeader],[auditHeader]];

  var maxTicket = 0; var maxTicketLoc = []; var responseCountTotal = 0;

  for (var i1=0; i1<summary.length-1; i1++) {
    format[i1]   = ["","","","",format[i1][4],"","","","","","","",""];
    note[i1]   = ["","","","",note[i1][4],"","","","","","","",""];
    var highCount = 0; var agedCount = 0; var aged50 = 0; var responseCount = 0; var noResponseCount = 0; var ageTotal = 0;

    //PARSING TOTAL, OPEN, PENDING, RESPONSE, AGED30
    i2 = 0;
    while (i2 < OP.rows.length) {
      if (summary[i1][2] == OP.rows[i2].assignee_id) {
        parse = OP.rows[i2];
        var status = parse.ticket.status;
        var priority = parse.ticket.priority;
        var ticketAge = (timeNow - new Date(parse.created)) / (1000*60*60*24);
        ageTotal += ticketAge;
        var lastResponse = new Date(parse.assignee_updated_at);
        var lastResponseF = lastResponse.toLocaleString();
          lastResponse = (timeNow - lastResponse) / (1000*60*60*24) - holiday;

        for (var i3=0; i3<OP.organizations.length; i3++) {
          if (parse.organization_id == OP.organizations[i3].id) {
            orgName = OP.organizations[i3].name;
            break;
          }
        }

        //CHECK OPEN & PENDING COUNT
        if (status == "open" || status == "new") {
          summary[i1][5]++;
          summary[i1][6]++;
          summary[summary.length-1][5]++;
          summary[summary.length-1][6]++;
        }

        if (status == "pending") {
          summary[i1][5]++;
          summary[i1][7]++;
          summary[summary.length-1][5]++;
          summary[summary.length-1][7]++;
        }

        //CHECK TICKET PRIORITY
        if (priority == "high" || priority == "urgent") {
          if (highCount == 0) {
            note[i1][5] = summary[i1][4]+"\'s High/Urgent:";
          }

          highCount++;
          note[i1][5] += "\n"+parse.ticket.id+" ("+priority+" - "+Math.floor(ticketAge)+" days) - "+orgName;

          highAged[0].push([summary[i1][4], parse.ticket.id, status, priority, orgName, ticketAge.toFixed(0), lastResponse.toFixed(0)]);
        }

        //CHECK TICKET AGE
        if (ticketAge >= 30) {
          if (summary[i1][12] == 0) {
            note[i1][12] = summary[i1][4]+"\'s Aged 30+ Days:";
          }

          summary[i1][12]++;
          summary[summary.length-1][12]++;
          note[i1][12] += "\n"+parse.ticket.id+" ("+priority+" - "+Math.floor(ticketAge)+" days) - "+orgName;
          highAged[1].push([summary[i1][4], parse.ticket.id, status, priority, orgName, ticketAge.toFixed(0), lastResponse.toFixed(0)]);

          if (ticketAge >= 50) {
            aged50++; //Logger.log(summary[i1][4]+" has 50+ - "+parse.ticket.id+" - "+Math.floor(ticketAge));
          }
        }

        //CHECK TICKET RESPONSE
        if (lastResponse < 2) {
          responseCount++;
          responseCountTotal++;
        } else if (lastResponse >= 5) {
          if (noResponseCount == 0) {
            note[i1][8] = summary[i1][4]+"\'s No Resposne 5+ Days:";
          }

          noResponseCount++;
          note[i1][8] += "\n"+parse.ticket.id+" ("+priority+" - "+Math.floor(ticketAge)+" days) - "+orgName;

          highAged[2].push([summary[i1][4], parse.ticket.id, status, priority, orgName, ticketAge.toFixed(0), lastResponse.toFixed(0)]);
        }

        OP.rows.splice(i2,1);
      } else {
        i2++;
      }
    } //Logger.log('Remaining ticket :'+OP.rows.length);

    //PARSING SOLVED & TTR
    i2 = 0;
    while (i2 < T.rows.length) {
      if ((summary[i1][2] == T.rows[i2].assignee_id) && (new Date(T.rows[i2].solved) >= weekStart)) {
        parse = T.rows[i2]; //Logger.log("Ticket ID: "+parse.ticket.id+" for "+parse.assignee_id);

        if (summary[i1][9] == 0) {
          note[i1][10] = summary[i1][4]+"\'s Solved Tickets:";
        }

        summary[i1][9]++;
        summary[i1][10] += (new Date(parse.solved) - new Date(parse.created)) / (1000*60*60*24);
        summary[summary.length-1][9]++;
        summary[summary.length-1][10] += (new Date(parse.solved) - new Date(parse.created)) / (1000*60*60*24);

        note[i1][10] += "\n"+parse.ticket.id+" ("+priority+" - "+Math.floor((new Date(parse.solved) - new Date(parse.created)) / (1000*60*60*24))+" days)";

        T.rows.splice(i2,1);
      } else {
        i2++;
      }
    }

    //PARSING IT.com LINKS
    i2 = 0;
    while (i2 < IT.results.length) { //Logger.log(summary[i1][3]+" vs "+IT.results[i2].link_creator_email);
      if (summary[i1][3] == IT.results[i2].link_creator_email) {
        summary[i1][11]++;
        summary[summary.length-1][11]++;

        IT.results.splice(i2,1);
      } else {
        i2++;
      }
    }

    //EVALUATE GROUP CHANGE
    if (summary[i1][5] > maxTicket) {
      maxTicket = summary[i1][5];
      maxTicketLoc = [i1];
    } else if (summary[i1][5] == maxTicket) {
      maxTicketLoc.push(i1);
    }

//    counter++;
    if (((i1+1) == summary.length) || (summary[i1+1][0] != "")) { //Logger.log("True at Row "+(i1+hborder)); Logger.log("  "+i1-counter+1); //Logger.log("  Max ticket group "+(maxTicketLoc[0]+hborder));

      for (i3=0; i3<maxTicketLoc.length; i3++) {
        if (maxTicket >= 30) {
          format[maxTicketLoc[i3]][5] = "#ea9999";
        } else {
          format[maxTicketLoc[i3]][5] = "#ffe599";
        }
      }

      maxTicket = 0;
      maxTicketLoc = [];
    }

    //FORMATTING RESPONSE
    if (summary[i1][5] > 0) {
      summary[i1][8] = (responseCount / summary[i1][5] * 100).toFixed(0);
    } else {
      summary[i1][5] = "-";
      summary[i1][6] = "-";
      summary[i1][7] = "-";
      summary[i1][8] = "-";
    }

    if ((summary[i1][8] <= 20) || (noResponseCount > 0)) {
      format[i1][8] = "#ea9999";
    } else if (summary[i1][8] <= 50) {
      format[i1][8] = "#ffe599";
    } else if (summary[i1][8] >= 80) {
      format[i1][8] = "#b6d7a8";
    }

    //FORMATTING TTR & LINK %
    if (summary[i1][9] > 0) {
      summary[i1][10] = (summary[i1][10] / summary[i1][9]).toFixed(2);
      summary[i1][11] = (summary[i1][11] / summary[i1][9] * 100).toFixed(2);
    } else {
      summary[i1][ 9] = "-";
      summary[i1][10] = "-";
      summary[i1][11] = "-";
    }

    if (summary[i1][10] > 7) {
      format[i1][10] = "#ea9999";
    }

    if (summary[i1][11] >= 80) {
      format[i1][11] = "#b6d7a8";
    }

    //FORMATTING AGED 30+
    if (summary[i1][12] == 0) {
      summary[i1][12] = "";
    }

    if (aged50 > 0) {
      format[i1][12] = "#ea9999";
    }
  }

  summary[summary.length-1][ 8] = (responseCountTotal / summary[summary.length-1][5] * 100).toFixed(2);
  summary[summary.length-1][10] = (summary[summary.length-1][10] / summary[summary.length-1][9]).toFixed(2);
  summary[summary.length-1][11] = (summary[summary.length-1][11] / summary[summary.length-1][9] * 100).toFixed(2);

  range.setValues(summary);
  range.setBackgrounds(format);
  range.setNotes(note);

//  highAged[0].unshift(auditHeader);
  attn.clearContents();
  attn.getRange(1,1,highAged[1].length,highAged[1][0].length).setValues(highAged[1]);

  timer.push(new Date()); Logger.log('TOTAL OPERATION takes: '+((timer[timer.length-1]-timer[0])/1000)+' sec');
  notifBar.setValue("Last Sync On: "+timer[1].toLocaleTimeString("en-us")+" - Code Run: "+((timer[timer.length-1]-timer[timer.length-2])/1000)+" sec");
}
