function getInterval() {
  return 'D';
}

function linkify(){
  console.log('Chips Hawa Active');
  $(".responsive-holder a[href*='\/company\/']").each((i, e) => {
    let $e = $(e);
    if($e.parent().find("a[href*='\/company\/']").length == $e.parent().find(".chips-hawa-tv_link").length){ return }
    let stock = e.href.split('/')[4];
    stock = stock.replace(/\&/g, '_');
    $(`<a href="https://www.tradingview.com/chart?symbol=NSE:${stock}&interval=${getInterval()}" target="_blank" class="chips-hawa-tv_link">
      <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAzNiAyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQgMjJIN1YxMUgwVjRoMTR2MTh6TTI4IDIyaC04bDcuNS0xOGg4TDI4IDIyeiIgZmlsbD0iY3VycmVudENvbG9yIj48L3BhdGg+PGNpcmNsZSBjeD0iMjAiIGN5PSI4IiByPSI0IiBmaWxsPSJjdXJyZW50Q29sb3IiPjwvY2lyY2xlPjwvc3ZnPg=="/>
      </a>`).insertAfter($e);
  });
}

let btnMarkup = '<button class="btn btn-default btn-primary chips-hawa-linkify" type="button"><span>Linkify</span></button>';
$('.btn-toolbar').append(btnMarkup);
$(btnMarkup).insertBefore($('.vue-grid-layout'));
$('#backtest-container .inked select').after(`<button class="btn btn-default btn-primary chips-hawa-linkify chips-hawa-backtest" type="button"><span>Linkify</span></button>`);
$('.chips-hawa-linkify').on('click', e => {
  e.preventDefault();
  linkify();
  registerBindEvent();
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

registerBindEvent();
linkify();