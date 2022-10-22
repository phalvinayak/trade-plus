// Constants
const CALL = 'CALL';
const PUT = 'PUT';
const NO_OF_STRIKE = 10;

// Global variables to use
let cols = {};
let strikePriceOrder = {};
let spotPrice = 0;

// Function to get column positions based on the header order
function getColumnPosition($callTable, $strikeTable, $putTable){
  // console.log($callTable, $strikeTable, $putTable);
  let colsPos = {};
  $callTable.find('thead th').each((i, col) => {
		let title = $(col).text().replace(/\s/g, '').toLowerCase();
    // console.log(title, i);
    if (title.includes('oi&change')) {
      colsPos.callOICol = i + 1;
		}
    if (title.includes('volume')) {
      colsPos.callVolume = i + 1;
		}
    if (title.includes('ltp&change')) {
      colsPos.callCol = i + 1;
		}
    if (title.includes('oipercent')) {
      colsPos.callOIChange = i + 1;
		}
  });
  $strikeTable.find('thead th').each((i, col) => {
		let title = $(col).text().replace(/\s/g, '').toLowerCase();
    // console.log(title, i);
    if (title.includes('strikeprice')) {
      colsPos.strikeCol = i + 1;
		}
  });
  $putTable.find('thead th').each((i, col) => {
		let title = $(col).text().replace(/\s/g, '').toLowerCase();
    // console.log(title, i);
    if (title.includes('oi&change')) {
      colsPos.putOICol = i + 1;
		}
    if (title.includes('volume')) {
      colsPos.putVolume = i + 1;
		}
    if (title.includes('ltp&change')) {
      colsPos.putCol = i + 1;
		}
    if (title.includes('oipercent')) {
      colsPos.putOIChange = i + 1;
		}
  });
  return colsPos;
}

function isNumeric(str) {
  if (typeof str != 'string') return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function sortByKey(array, key) {
	return array.sort((a, b) => b[key] - a[key]);
}

function highlightSR(ltpData, $callTable, $putTable){
  // Handling img line, and SR reset
  $callTable.find('tr.chips-hawa-ltp-img-line').removeClass('chips-hawa-ltp-img-line');
  $callTable.find('.chips-hawa-sr-cell').removeClass('chips-hawa-sr-cell');
  $putTable.find('tr.chips-hawa-ltp-img-line').removeClass('chips-hawa-ltp-img-line');
  $putTable.find('.chips-hawa-sr-cell').removeClass('chips-hawa-sr-cell');

  // IMG line paint
  $callTable.find(`tr:nth-child(${ltpData.soptRow})`).addClass('chips-hawa-ltp-img-line');
  $putTable.find(`tr:nth-child(${ltpData.soptRow})`).addClass('chips-hawa-ltp-img-line');

  // Handling support/resistance column highlight
  // console.log($callTable.find(`tr:nth-child(${ltpData.maxResVol}) td:nth-child(${cols.callVolume})`));
  // console.log($callTable.find(`tr:nth-child(${ltpData.maxResOI}) td:nth-child(${cols.callOICol})`));
  // console.log($putTable.find(`tr:nth-child(${ltpData.maxSupVol}) td:nth-child(${cols.putVolume})`));
  // console.log($putTable.find(`tr:nth-child(${ltpData.maxSupOI}) td:nth-child(${cols.putOICol})`));

  $callTable.find(`tr:nth-child(${ltpData.maxResVol}) td:nth-child(${cols.callVolume})`).addClass('chips-hawa-sr-cell'); 
  $callTable.find(`tr:nth-child(${ltpData.maxResOI}) td:nth-child(${cols.callOICol})`).addClass('chips-hawa-sr-cell');
  $putTable.find(`tr:nth-child(${ltpData.maxSupVol}) td:nth-child(${cols.putVolume})`).addClass('chips-hawa-sr-cell'); 
  $putTable.find(`tr:nth-child(${ltpData.maxSupOI}) td:nth-child(${cols.putOICol})`).addClass('chips-hawa-sr-cell');
}

function updateLTP(){
  let [callTable, strikeTable, putTable] = $('#root section table');
  if(callTable == undefined || strikeTable == undefined || putTable == undefined){ return; }

  // Start from here ---
  let callChain = [];
  let putChain = [];
  let $callTable = $(callTable);
  let $strikeTable = $(strikeTable);
  let $putTable = $(putTable);
  if(!cols.strikeCol){
    cols = getColumnPosition($callTable, $strikeTable, $putTable);
  }
  // console.log(cols);
  // Build StrikePrice reference and row position
  // buildStrikePriceOrder($strikeTable);
  // console.log(strikePriceOrder);
  
  // Building OIChainData based on the column positions
  // Object.keys(strikePriceOrder).forEach(i => {
  let soptRow = $strikeTable.find('tr').index($("div[data-id='spotPrice']").closest('tr'));
  // console.log(soptRow);
  $strikeTable.find('tbody td div').each((i, col) => {
    let $strikeCell = $(col);
    let row = i+1;
    if($strikeCell.data('id') === 'spotPrice'){
      spotPrice = $strikeCell.text().trim().replace(/[^0-9.]/g, '');
      return; 
    } // Ignore spot price row
    strikePrice = $strikeCell.text().trim().replace(/[^0-9.]/g, '');
    strikePrice = parseFloat(strikePrice).toFixed(2);
    
    strikePriceOrder[row] = strikePrice;
		let $callCell = $callTable.find(`tr:nth-child(${row}) td:nth-child(${cols.callCol})`);
    let $putCell = $putTable.find(`tr:nth-child(${row}) td:nth-child(${cols.putCol})`);
    let $callOICell = $callTable.find(`tr:nth-child(${row}) td:nth-child(${cols.callOICol})`);
    let $putOICell = $putTable.find(`tr:nth-child(${row}) td:nth-child(${cols.putOICol})`);
    let $callVolumeCell = $callTable.find(`tr:nth-child(${row}) td:nth-child(${cols.callVolume})`);
    let $putVolumeCell = $putTable.find(`tr:nth-child(${row}) td:nth-child(${cols.putVolume})`);
    let $callOIChangeCell = $callTable.find(`tr:nth-child(${row}) td:nth-child(${cols.callOIChange})`);
    let $putOIChangeCell = $putTable.find(`tr:nth-child(${row}) td:nth-child(${cols.putOIChange})`);

    if(row >= soptRow - 1) { // Keep pushing it in call side
      // Get Call Price of the same option
      let cePrice = $callCell.find('div>div').text().trim().replace(/[^0-9.]/g, '');
      // Get OI values from the cell
      let callOI = $callOICell.find('div:nth-child(1)').text().trim().replace(/[^0-9.]/g, '');
      // Get the volume from the cell
      let callVolume = $callVolumeCell.find('div:nth-child(1)').text().trim().replace(/[^0-9.]/g, '');
      // Get the OIChange from the cell
      let callOIChangePer = $callOIChangeCell.find('div:nth-child(1)').text().trim().replace(/[^0-9.]/g, '');
      callChain.push({
        index: row,
        strike: strikePrice,
        price: parseFloat(cePrice).toFixed(2),
        oi: isNumeric(callOI) ? parseFloat(callOI) : 0,
        volume: isNumeric(callVolume) ? parseFloat(callVolume) : 0,
        oiChangePer: isNumeric(callOIChangePer) ? parseFloat(callOIChangePer) : 0
      });
    }

    if(row <= soptRow + 1) { // Keep pushing it in PUT side
      // Get Put Price of the same option
      let pePrice = $putCell.find('div>div').text().trim().replace(/[^0-9.]/g, '');
      // Get OI values from the cell
      let putOI = $putOICell.find('div:nth-child(1)').text().trim().replace(/[^0-9.]/g, '');
      // Get the volume from the cell
      let putVolume = $putVolumeCell.find('div:nth-child(1)').text().trim().replace(/[^0-9.]/g, '');
      // Get the OIChange from the cell
      let putOIChangePer = $putOIChangeCell.find('div:nth-child(1)').text().trim().replace(/[^0-9.]/g, '');

      putChain.push({
        index: row,
        strike: strikePrice,
        price: parseFloat(pePrice).toFixed(2),
        oi: isNumeric(putOI) ? parseFloat(putOI) : 0,
        volume: isNumeric(putVolume) ? parseFloat(putVolume) : 0,
        oiChangePer: isNumeric(putOIChangePer) ? parseFloat(putOIChangePer) : 0
      });
    }
  });
  // Sorting based volume and OI
  let maxSupVol = sortByKey(putChain, 'volume')[0].index;
  let maxSupOI = sortByKey(putChain, 'oi')[0].index;
  let maxResVol = sortByKey(callChain, 'volume')[0].index;
  let maxResOI = sortByKey(callChain, 'oi')[0].index;

  highlightSR({
    soptRow,
    maxSupVol,
    maxSupOI,
    maxResVol,
    maxResOI},
    $callTable, $putTable);
  // console.log(spotPrice, callChain, putChain);
  // console.log(resistance, support);
}


function main(){
  setInterval(updateLTP, 1200);
}

main();