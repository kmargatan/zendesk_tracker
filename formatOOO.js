function formatOOO(timeNow, today) {
  if (new Date(today).setHours(23,59,59,0) >= timeNow) {
    return [['#ea9999'],['OOO until '+today.toLocaleDateString()]];
  } else if (today == 'Sick') {
    return [['#ea9999'],['Out Sick']];
  } else if (today == 'Early') {
    return [['#b6d7a8'],['']];
  } else if (today == 'Late') {
    return [['#ead1dc'],['']];
  } else if (today == 'Normal') {
    return [[''],['']];
  } else {
    return [[''],['Missing/Incorrect Format']];
  }
}
