function linkify() {
    $('[id="in.stockedge.app:id/scans-content"] app-load-scan .small-font.grey').each((i, e) => {
        let $e = $(e);
        let stockName = $e.text().trim();
        if(/^([A-Z&-]+)$/.test(stockName) && $e.parent().find('.chips-hawa-tv_link').length == 0) {
            $e.append(`<a href="https://www.tradingview.com/chart?symbol=${stockName.replace(/[\&\-]/g, '_')}&interval=D" target="_blank" class="chips-hawa-tv_link">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAzNiAyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQgMjJIN1YxMUgwVjRoMTR2MTh6TTI4IDIyaC04bDcuNS0xOGg4TDI4IDIyeiIgZmlsbD0iY3VycmVudENvbG9yIj48L3BhdGg+PGNpcmNsZSBjeD0iMjAiIGN5PSI4IiByPSI0IiBmaWxsPSJjdXJyZW50Q29sb3IiPjwvY2lyY2xlPjwvc3ZnPg=="/>
            </a>`);
        }
    });
}

$(() => {
    setInterval(linkify, 1000);
    
    $('body').on('click', '.chips-hawa-tv_link', e => {
        e.preventDefault();
        e.stopPropagation();
        $a = $(e.target).closest('div').find('a');
        window.open($a.attr('href'), '_blank');
    });
})