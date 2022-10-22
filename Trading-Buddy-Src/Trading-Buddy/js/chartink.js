const tfValue = {
  '1': '1',
  '2': '3',
  '3': '3',
  '5': '5',
  '10': '10',
  '15': '15',
  '20': '15',
  '25': '30',
  '30': '30',
  '45': '45',
  '1H': '1H',
  '75': '1H',
  '125': '2H',
  '2H': '2H',
  '3H': '3H',
  '4H': '4H',
  'D': 'D',
  'W': 'W',
  'M': 'M'
}

const tfOrder = {
  '1': 10,
  '2': 20,
  '3': 30,
  '5': 40,
  '10': 50,
  '15': 60,
  '20': 70,
  '25': 80,
  '30': 90,
  '45': 100,
  '1H': 110,
  '75': 120,
  '2H': 130,
  '125': 140,
  '3H': 150,
  '4H': 160,
  'D': 170,
  'W': 180,
  'M': 190
}

let stocks = [];

function getInterval() {
  let availableTf = [];
  if($('span.atlas-offset').length == 0){ return 'D'; }
  let leastTF = 'M';
  $('span.atlas-offset').each((i, e) => {
    if($(e).closest('.atlas-filter-grabbable').find('.fa-toggle-off').length == 0){
      let timeFrame = $(e).text().trim().toLowerCase();
      let tfSymbol = null;
      if (timeFrame.includes('week')) {
        tfSymbol = 'W';
      }
      if (timeFrame.includes('minute')) {
        tfSymbol = timeFrame.split(' ')[0];
      }
      if (timeFrame.includes('month') || timeFrame.includes('quarter') || timeFrame.includes('year')) {
        tfSymbol = 'M';
      }
      if (timeFrame.includes('latest') || timeFrame.includes('day')) {
        tfSymbol = 'D';
      }
      if (timeFrame.includes('hour')) {
        tfSymbol = `${timeFrame.split(' ')[0]}H`;
      }
      if (!availableTf.includes(tfSymbol)) {
        availableTf.push(tfSymbol);
      }
      if (tfOrder[leastTF] > tfOrder[tfSymbol]) {
        leastTF = tfSymbol
      }
    }
  });
  // console.log(leastTF, tfValue[leastTF]);
  return tfValue[leastTF];
}

function linkify(){
  let interval = getInterval()
  $("#root a[href*='\/stocks\/'], .panel-body a[href*='\/stocks\/'], #atlas-grid-layout a[href*='\/stocks\/']").each((i, e) => {
    let $e = $(e);
    if($e.parent().find("a[href*='\/stocks\/']").length == $e.parent().find(".chips-hawa-tv_link").length){ return }
    let stock = e.href.split('/').pop().replace('.html', '');
    stock = stock.replace(/[\&\-]/g, '_');
    let nseStock = `NSE:${stock}`;
    if(!stocks.includes(nseStock)){
      stocks.push(nseStock);
    }
    $(`<a href="https://www.tradingview.com/chart?symbol=${nseStock}&interval=${interval}" target="_blank" class="chips-hawa-tv_link">
      <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAzNiAyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQgMjJIN1YxMUgwVjRoMTR2MTh6TTI4IDIyaC04bDcuNS0xOGg4TDI4IDIyeiIgZmlsbD0iY3VycmVudENvbG9yIj48L3BhdGg+PGNpcmNsZSBjeD0iMjAiIGN5PSI4IiByPSI0IiBmaWxsPSJjdXJyZW50Q29sb3IiPjwvY2lyY2xlPjwvc3ZnPg=="/>
      </a>`).insertAfter($e);
  });
}

function copyScrips(backtest = false){
  stocks = [];
  if(backtest){
    $("#backtest-table-data a[href*='\/stocks\/']").each((i, e) => {
      let stock = e.href.split('/').pop().replace('.html', '');
      stock = stock.replace(/\&/g, '_');
      let nseStock = `NSE:${stock}`;
      if(!stocks.includes(nseStock)){
        stocks.push(nseStock);
      }
    });
  } else {
    $(".scanner a[href*='\/stocks\/']").each((i, e) => {
      let stock = e.href.split('/').pop().replace('.html', '');
      stock = stock.replace(/\&/g, '_');
      let nseStock = `NSE:${stock}`;
      if(!stocks.includes(nseStock)){
        stocks.push(nseStock);
      }
    });
  }
}

let linkifyBtnMarkup = '<button class="btn btn-default btn-primary chips-hawa-linkify" type="button"><span>Linkify</span></button>';
let saveBtnMarkup = '<button class="btn btn-default btn-primary chips-hawa-copy" type="button"><span>Copy List</span></button>';
$(saveBtnMarkup).insertAfter('#view_backtest');
$(linkifyBtnMarkup).insertAfter('#view_backtest');
$(linkifyBtnMarkup).insertBefore($('.vue-grid-layout'));
$(saveBtnMarkup).insertBefore($('.vue-grid-layout'));
$('#backtest-container .inked select').after(`<button class="btn btn-default btn-primary chips-hawa-linkify chips-hawa-copy chips-hawa-backtest" style="margin-left:0 !important" type="button"><span>Copy List</span></button>`);
$('#backtest-container .inked select').after(`<button class="btn btn-default btn-primary chips-hawa-linkify chips-hawa-backtest" type="button"><span>Linkify</span></button>`);

$('.chips-hawa-linkify').on('click', e => {
  e.preventDefault();
  linkify();
  registerBindEvent();
});

$('.chips-hawa-copy').on('click', e => {
  e.preventDefault();
  if($(e.currentTarget).hasClass('chips-hawa-backtest')){
    copyScrips(true);
  } else {
    copyScrips();
  }
  copyToClipboard(stocks.join(','));
});

$('.run_scan_button').on('click', async () => {
  do {
    await sleep(500);
  } while($('#DataTables_Table_0').length != 1);
  linkify();
  registerBindEvent();
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function registerBindEvent(){
  $('#DataTables_Table_0, #backtest-table-data').bind("DOMSubtreeModified", debounce(linkify, 250));
}

const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
};
  

registerBindEvent();
linkify();