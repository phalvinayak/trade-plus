// GET all the required URL params
let dt = new Date();
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const CUR_MONTH = `${MONTHS[dt.getMonth()]}${dt.getFullYear()%100}`;
const NEXT_MONTH = `${MONTHS[(dt.getMonth()+1) % 12]}${dt.getMonth() == 11 ? dt.getFullYear()%100 + 1 : dt.getFullYear()%100}`;

const OPT_EXP_DATE = getMonthlyExpDate();
const USER_NAME = $('#userName').val();
const SESSION_ID = $('#sessionID').val();
const SYMB_TYPE = $('#SymbType').val();
const STRIKE_TYPE = 'mainstrikes';
const D_TYPE = $('input[name=rdDataType]:checked').val();
const TXT_DATE = $('#defaultDate').val();
const COL_MAP = {
    'CALL_OI_CHANGE': 9,
    'CE_DELTA': 6,
    'CE_THETA': 4,
    'CALL_OI': 10,
    'STRIKE_PRICE': 17,
    'CE_VWAP': 14,
    'PE_VWAP': 20,
    'PUT_OI': 24,
    'PUT_OI_CHANGE': 25,
    'CE_LTP': 13,
    'PE_LTP': 21,
    'PE_DELTA': 28,
    'PE_THETA': 30,
    'OI_PCR': 32
};

let STOCK_PRICE_MAP = {};
let SECTOR_MAP = {}

function getMonthlyExpDate() {
    let curMonthExpires = [];
    let nextMonthExpiries = [];
    let expiry;
    $('#optExpDate option').each((i, e) => {
        let exp = $(e).attr('value').toUpperCase();
        if(exp.includes(CUR_MONTH)){
            curMonthExpires.push(exp);
        } else if(exp.includes(NEXT_MONTH)){
            nextMonthExpiries.push(exp);
        }
    });
    if(curMonthExpires.length){
        expiry = curMonthExpires.slice(-1);
    } else {
        expiry = nextMonthExpiries.slice(-1);
    }
    return expiry[0];
}


let SCREENER_STATE = 'idle';

if(location.href.endsWith("OptionChain.php")){
    let SRScanButton = USER_NAME == 'phalvinayak' ? `<button class="ichart-sr-scan mdl-button mdl-button--raised mdl-button--colored">S/R Scan</button>` : '';
    $('body').append(`
        <div id="ichart-utility-buttons">
            <button class="ichart-screener mdl-button mdl-button--raised mdl-button--colored">Stock Screener</button>
            <button class="ichart-analyse mdl-button mdl-button--raised mdl-button--colored">OI Analyse</button>
            ${SRScanButton}
        </div>
    `);
    $('body').append(`<div class="chips-hawa-oi-analysis-block"><p class="scan-time" style="font-style:italic;margin: 0px 50px"></p></div>`);

    // Render datatable if we've today's data
    try {
        let oldScanTime = localStorage.getItem('scanTime');
        if(oldScanTime){
            scanDate = new Date(oldScanTime);
            if(scanDate.getDate() == new Date().getDate() && scanDate.getMonth() == new Date().getMonth()){
                let filter =  localStorage.getItem('filter') ? JSON.parse(localStorage.getItem('filter')) : {};
                renderScreenerDataTable(JSON.parse(localStorage.getItem('scannerData')), scanDate, filter);
            }
        }
    } catch(err){
        // Incase of any error rendering with cached data ignore
        console.log(err);
    }
}



$('.ichart-screener').on('click', async e => {
    e.preventDefault();
    e.stopPropagation();
    if(SCREENER_STATE == 'idle'){
        console.log('start');
        SCREENER_STATE = 'running';
        await analyseOptionChain();
        SCREENER_STATE = 'idle';
        $('.ichart-screener').text(`Stock Screener`);
        console.log('end');
    }
});

$('.ichart-analyse').on('click', async e => {
    e.preventDefault();
    e.stopPropagation();
    if(SCREENER_STATE == 'idle'){
        console.log('start');
        SCREENER_STATE = 'running';
        await analyseSupportResistance();
        SCREENER_STATE = 'idle';
        $('.ichart-analyse').text(`OI ANALYSE`);
        console.log('end');
    }
});

$('.ichart-sr-scan').on('click', async e => {
    e.preventDefault();
    e.stopPropagation();
    if(SCREENER_STATE == 'idle'){
        console.log('start');
        SCREENER_STATE = 'running';
        await analyseSupportResistance();
        SCREENER_STATE = 'idle';
        $('.ichart-sr-scan').text(`S/R Scan`);
        console.log('end');
    }
});


$.fn.dataTable.ext.errMode = 'none';
$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
        let filterValue = $('#price-filter').val() ? $('#price-filter').val() : '0-100000';
        let range = filterValue.split('-');
        let min = parseInt(range[0], 10);
        let max = parseInt(range[1], 10);
        let strikePrice = parseFloat(data[1]) || 0;
        if((isNaN(min) && isNaN(max)) ||
             (isNaN(min) && strikePrice <= max) ||
             (min <= strikePrice  && isNaN(max)) ||
             (min <= strikePrice  && strikePrice <= max ) ) {
            return true;
        }
        return false;
    }
);

async function getHeatMapData(){
    try{
        let url = `${location.origin}/opt/hcharts/stx8req/php/getDataForHeatmap_sectors.php`;
        console.log('HeatMap', url);
        let formData = new FormData();
        formData.append('rdDataType', 'latest');
        formData.append('optSymbol', 'NIFTY');
        formData.append('BoxSize', 'pricechg');
        formData.append('SelectedType', 'sectors');
        formData.append('optExpDate', OPT_EXP_DATE);
        formData.append('dt', TXT_DATE);
        formData.append('sessionID', SESSION_ID);
        formData.append('userName', USER_NAME);
        const response = await axios.post(url, formData);
        const HEAT_COL_MAP = {
            'SYMBOL': 0,
            'SECTOR': 1,
            'PRICE_CHANGE': 3,
            'PREV_CLOSE': 4,
            'PRICE': 5,
            'OPEN': 8,
            'LOW': 9,
            'HIGH': 10,
        };
        
        response.data.forEach((scrip, i) => {
            let sector = scrip[HEAT_COL_MAP.SECTOR];
            let priceChange = scrip[HEAT_COL_MAP.PRICE_CHANGE];
            if(i>1 && sector != "Sector Wise"){
                let symbol = scrip[HEAT_COL_MAP.SYMBOL].toUpperCase();
                STOCK_PRICE_MAP[symbol] = {
                    symbol,
                    sector,
                    priceChange,
                    'prevClose': scrip[HEAT_COL_MAP.PREV_CLOSE],
                    'price': scrip[HEAT_COL_MAP.PRICE],
                    'open': scrip[HEAT_COL_MAP.OPEN],
                    'low': scrip[HEAT_COL_MAP.LOW],
                    'high': scrip[HEAT_COL_MAP.HIGH],
                };
                if(!SECTOR_MAP[sector]){
                    SECTOR_MAP[sector] = {up: 0, down: 0, count: 1}
                } else {
                    SECTOR_MAP[sector].count++;
                }
                if(priceChange>=0){
                    SECTOR_MAP[sector].up++;
                } else {
                    SECTOR_MAP[sector].down++;
                }
            }
        })
    } catch(e){
        console.log(e);
    }
}

async function analyseOptionChain(){
    await getHeatMapData();
    // let stocks = ["AARTIIND","ABB","ACC","ADANIENT","ADANIPORTS","APLLTD","ALKEM","AMARAJABAT","APOLLOHOSP","ASIANPAINT","ASTRAL","AUBANK","AUROPHARMA","AXISBANK","BAJAJ-AUTO","BAJFINANCE","BALKRISIND","BALRAMCHIN","BATAINDIA","BERGEPAINT","BHARATFORG","BHARTIARTL","BSOFT","BRITANNIA","CANFINHOME","CHAMBLFERT","CHOLAFIN","CIPLA","COFORGE","COLPAL","CONCOR","COROMANDEL","CUMMINSIND","DABUR","DALBHARAT","DEEPAKNTR","DIVISLAB","DIXON","LALPATHLAB","DRREDDY","EICHERMOT","ESCORTS","GLENMARK","GODREJCP","GODREJPROP","GRASIM","GUJGASLTD","GNFC","HAVELLS","HCLTECH","HDFCAMC","HDFCBANK","HDFCLIFE","HEROMOTOCO","HINDALCO","HAL","HINDUNILVR","HDFC","ICICIBANK","ICICIGI","ICICIPRULI","INDIAMART","IRCTC","INDUSINDBK","NAUKRI","INFY","INTELLECT","INDIGO","IPCALAB","JINDALSTEL","JKCEMENT","JSWSTEEL","JUBLFOOD","KOTAKBANK","LTTS","LTI","LT","LAURUSLABS","LUPIN","MGL","M&M","MARICO","MARUTI","MFSL","METROPOLIS","MINDTREE","MPHASIS","MCX","MUTHOOTFIN","NAVINFLUOR","OBEROIRLTY","OFSS","PERSISTENT","PIIND","PIDILITIND","PEL","POLYCAB","PVR","RELIANCE","SBILIFE","SBICARD","SRTRANSFIN","SIEMENS","SRF","SBIN","SUNPHARMA","SUNTV","SYNGENE","TATACHEM","TATACOMM","TCS","TATACONSUM","TATAMOTORS","TATASTEEL","TECHM","RAMCOCEM","TITAN","TORNTPHARM","TORNTPOWER","TRENT","TVSMOTOR","ULTRACEMCO","UBL","MCDOWELL-N","UPL","VOLTAS","WHIRLPOOL","WIPRO"];
    let stocks = ["ACC","ADANIENT","ADANIPORTS","APOLLOHOSP","ASIANPAINT","BAJAJ-AUTO","BAJFINANCE","BHARTIARTL","CIPLA","COFORGE","DIVISLAB","DIXON","GODREJCP","GNFC","HDFCBANK","HDFC","INDUSINDBK","INDIAMART","INFY","INDIGO","LTTS","LTI","LUPIN","M&M","NAVINFLUOR","NAUKRI","POLYCAB","RELIANCE","TATACHEM","TCS","TITAN","UPL","PEL","GODREJPROP","SRTRANSFIN","DEEPAKNTR","MINDTREE","TATACOMM","MPHASIS","SRF","AARTIIND","MFSL","AXISBANK","PIIND","VOLTAS","SBICARD","TECHM","MCDOWELL-N","GRASIM","ICICIBANK","HDFCAMC","HEROMOTOCO","BATAINDIA","HDFCLIFE","TATACONSUM","KOTAKBANK","ULTRACEMCO","HCLTECH","LT","SBILIFE","PIDILITIND","DRREDDY","HINDUNILVR","BRITANNIA","MARUTI","ESCORTS"].sort();
    // let stocks = ["AARTIIND","ABB","ACC","ADANIENT","ADANIPORTS"];

    // let csvString = `Si.No,Symbol,ATM-Strike,CE-OI-Change,PE-OI-Change,Ratio,Factor,Rating`;
    let stockData = [];
    let bachSize = 3;
    let counter = 0;
    for(let i=0; i<stocks.length; i+=bachSize){
        let promiseArr = [];
        for(let j=0; j<bachSize; j++){
            if(i+j<stocks.length){
                counter++;
                promiseArr.push(getData(stocks[i+j]))
            } else {
                break
            }
        }
        let response = await Promise.all(promiseArr);
        stockData.push(...response);
        $('.ichart-screener').text(`Screening ${counter} of ${stocks.length}`);
    }
    scannerData = {stockData, sector: SECTOR_MAP}
    let scanDateTime = new Date();
    // Saving in localstore, for rendering next time
    localStorage.setItem('scannerData', JSON.stringify(scannerData));
    localStorage.setItem('scanTime', scanDateTime);
    renderScreenerDataTable(scannerData, scanDateTime, {});
    // download(csvString, `scan${getDateTime()}.csv`, "text/plain");
}

function renderScreenerDataTable(scannerData, scanDateTime, filter){
    if(!scannerData){ return }
    if($('#option-screener_wrapper').length){
        $('#option-screener').DataTable().clear().destroy();
    }
    $('body').append(`<table id="option-screener" class="display" width="100%"></table>`);
    // Rendering it into the table
    // console.log(scannerData.stockData);
    let $dataTable = $('#option-screener').DataTable({
        data: scannerData.stockData,
        filter: true,
        searching: true,
        "iDisplayLength": 25,
        columns: [
            { 
                data: 'symbol',
                title: 'EQ Symbol',
                render: function(data, type, row){
                    if(type === 'display') {
                        let sectorData = scannerData.sector[row.sector] || {up: 0, down: 0, count:0 };
                        return `<a href="#" class="chips-hawa-select-stock chips-hawa-tooltip">${data}</a>
                            <a href="https://www.tradingview.com/chart?symbol=NSE:${data.replace(/[\&\-]/g, '_')}&interval=5" target="_blank" class="chips-hawa-tv_link">
                                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAzNiAyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQgMjJIN1YxMUgwVjRoMTR2MTh6TTI4IDIyaC04bDcuNS0xOGg4TDI4IDIyeiIgZmlsbD0iY3VycmVudENvbG9yIj48L3BhdGg+PGNpcmNsZSBjeD0iMjAiIGN5PSI4IiByPSI0IiBmaWxsPSJjdXJyZW50Q29sb3IiPjwvY2lyY2xlPjwvc3ZnPg=="/>
                            </a>
                            <div class="chips-hawa-tooltip-content">
                                <p><strong>Sector</strong> : ${row.sector}</p>
                                <p><strong>UP</strong> : ${sectorData.up}</p>
                                <p><strong>DOWN</strong> : ${sectorData.down}</p>
                                <p><strong>Total Stocks in FnO</strong> : ${sectorData.count}</p>
                            </div>`;
                    }
                    return data;
                }
            },
            {
                className: 'chips-hawa-rating',
                data: 'spotPrice',
                title: 'Spot Price',
                render: function(data, type, row){
                    if(type === 'display') {
                        if(row.rating.toUpperCase() == 'BEARISH' && parseFloat(data) > parseFloat(row.strikePrice)){
                            return `<div class="chips-hawa-BEARISH">${data}</div>`;
                        } else if(row.rating.toUpperCase() == 'BULLISH' && parseFloat(data) < parseFloat(row.strikePrice)){
                            return `<div class="chips-hawa-BULLISH">${data}</div>`;
                        } else {
                            return `<div class="chips-hawa-NEUTRAL">${data}</div>`;
                        }
                    }
                    return data;
                },
                searchable: true
            },
            {
                data: 'futPrice',
                title: 'Fut Price(%)',
                searchable: false
            },
            {
                data: 'high',
                title: 'High',
                searchable: false
            },
            {
                data: 'low',
                title: 'Low',
                searchable: false
            },
            { 
                data: 'strikePrice',
                title: 'Strike Price',
                searchable: false
            },
            {
                data: 'CE',
                title: "CE-PI-Chg",
                searchable: false
            },
            {
                data: 'PE',
                title: "PE-OI-Chg",
                searchable: false
            },
            {
                data: 'ratio',
                title: "Ratio",
                searchable: false
            },
            { 
                data: 'factor',
                title: "Factor",
                searchable: false
            },
            { 
                data: 'oiPCR',
                title: "OI-PCR",
                searchable: false
            },
            {
                className: 'chips-hawa-rating',
                data: 'rating',
                title: "Rating",
                render: function(data, type){
                    if(type === 'display') {
                        return `<div class="chips-hawa-${data}">${data}</div>`;
                    }
                    return data;
                }
            }
        ],
        "search": filter,
        order: filter.order ? filter.order : [0,'desc']
    })

    $dataTable.on( 'order.dt', function () {
        let order = $dataTable.order();
        if(order && order[0]){
            let filter = localStorage.getItem('filter') ? JSON.parse(localStorage.getItem('filter')) : {};
            filter['order'] = order[0];
            // console.log(filter);
            localStorage.setItem('filter', JSON.stringify(filter));
        }
        // console.log( 'Ordering on column '+order[0][0]+' ('+order[0][1]+')' );
    } ).on( 'error.dt', function ( e, settings, techNote, message ) {
        console.log( 'An error has been reported by DataTables: ', message );
    } );

    $('#option-screener_filter').append(`<label>&nbsp;&nbsp; Price Range: <select name="price-filter" id="price-filter">
        <option value="0-100000">All</option>
        <option value="0-500">0-500</option>
        <option value="500-1000">500-1000</option>
        <option value="1000-2000">1000-2000</option>
        <option value="2000-100000">2000+</option>
    </select></label>`);

    $('#option-screener_length').append(`<span style="margin-left:20px; font-style:italic">Scanned at ${padDate(scanDateTime.getHours())}:${padDate(scanDateTime.getMinutes())}</span>
    <button class="chips-hawa-export-scan mdl-button mdl-button--raised mdl-button--colored" style="margin:0 0 5px 10px">Export CSV</button>`);
    $('#price-filter').on('change', e => {
        // console.log('On Change event Bindeing', e.target.value);
        $dataTable.draw();
    });

    // Script Option chain opening logic
    $('body').on('click', '.chips-hawa-select-stock', e => {
        // console.log('Changing script');
        e.preventDefault();
        e.stopPropagation();
        $('#optExpDate').append(`<option value="${OPT_EXP_DATE}" selected="selected">${OPT_EXP_DATE}</option>`);
        $(`#optSymbol option[value="${e.target.innerText.trim()}"]`).attr('selected', 'selected');
        $('button[name=btnSubmit]').trigger('click');
    });

    if(filter['price-filter']){
        setTimeout(() => {
            // console.log(filter);
            $('#price-filter').val(filter['price-filter']).trigger('change');
        }, 200);
    }
    $('#option-screener_filter').find('input, select').on('blur', e => {
        let filter = localStorage.getItem('filter') ? JSON.parse(localStorage.getItem('filter')) : {};
        filter[e.target.name||'search'] = e.target.value;
        // console.log(filter);
        localStorage.setItem('filter', JSON.stringify(filter));
    });

    $('.chips-hawa-export-scan').on('click', e => {
        e.preventDefault();
        const items = scannerData.stockData;
        const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
        const header = Object.keys(items[0]);
        const csv = [
        header.map(k => k.toUpperCase()).join(','), // header row first
        ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
        ].join('\r\n')
        download(csv, `scan-${getDateTime(scanDateTime)}.csv`, "text/plain");
        // console.log(csv)
    });

    $('body').on('mouseenter', '.chips-hawa-tooltip', e => {
        $(e.target).closest('td').find('.chips-hawa-tooltip-content').show();
    }).on('mouseleave', '.chips-hawa-tooltip', e => {
        $(e.target).closest('td').find('.chips-hawa-tooltip-content').hide();
    });
}

async function getData(symbol){
    try {
        // let OPT_EXP_DATE_1 = '28JUL22';
        let url = `${location.origin}/opt/OptionChainTable.php?txtDate=${TXT_DATE}&optSymbol=${encodeURIComponent(symbol)}&optExpDate=${OPT_EXP_DATE}&dType=${D_TYPE}&striketype=mainstrikes&SymbType=${SYMB_TYPE}&sessionID=${SESSION_ID}&userName=${USER_NAME}`;
        let impliedPrice = `${location.origin}/opt/hcharts/stx8req/php/getLatestSpotPrice_imp.php`;
        let formData = new FormData();
        formData.append('monthlyExpDate', 'undefined');
        formData.append('optSymbol', symbol);
        formData.append('optExpDate', OPT_EXP_DATE);
        const response = await Promise.all([
            axios.post(url, {}),
            axios.post(impliedPrice, formData)
        ]);
        // console.log(response);
        try{
            let data = response[0].data;
            let spotData = response[1].data;
            let optionChain = data.aaData;
            let strikePrice = parseFloat(data.strikePriceATM).toFixed(2);
            let atmRow = optionChain.find(row => parseFloat(row[COL_MAP.STRIKE_PRICE]).toFixed(2) == strikePrice);
            let ratio = getOIChangeRation(parseInt(getNumber(atmRow[COL_MAP.CALL_OI_CHANGE])), parseInt(getNumber(atmRow[COL_MAP.PUT_OI_CHANGE])));
            /* optionChain.forEach(row => {
                // thetaCE += parseFloat(getNumber(row[COL_MAP.CE_THETA]))
                // thetaPE += parseFloat(getNumber(row[COL_MAP.PE_THETA]))
            }); */
            // console.log(STOCK_PRICE_MAP[symbol.toUpperCase()]);
            let heatMapData = STOCK_PRICE_MAP[symbol.toUpperCase()];
            if(!heatMapData){
                heatMapData = {
                    symbol,
                    sector: 'unknown',
                    'priceChange': 0,
                    'prevClose': 0,
                    'price': 0,
                    'open': 0,
                    'low': 0,
                    'high': 0,
                }
            }
            return{
                symbol,
                spotPrice: spotData[1],
                futPrice: `${heatMapData.price} (${heatMapData.priceChange}%)`,
                sector: heatMapData.sector,
                high: heatMapData.high,
                low: heatMapData.low,
                strikePrice,
                CE: atmRow[COL_MAP.CALL_OI_CHANGE],
                PE: atmRow[COL_MAP.PUT_OI_CHANGE],
                ratio: ratio.OIChangeRatio,
                factor: ratio.factor,
                oiPCR: atmRow[COL_MAP.OI_PCR],
                rating: ratio.rating,
            }
        } catch(err){
            console.log(err);
            return{
                symbol,
                sector: 'unknown',
                spotPrice: 0,
                futPrice: '0 (0%)',
                high: 0,
                low: 0,
                strikePrice: 0,
                CE: 0,
                PE: 0,
                ratio: 0,
                factor: 0,
                oiPCR: 0,
                rating: 'SIDEWAYS',
            }
        }
    } catch(err) {
        console.log(err);
    }
}

function getOIChangeRation(callOIChange, putOIChange){
    let rating = 'SIDEWAYS';
    let OIChangeRatio = '∞';
    let factor = '100000';
    if(callOIChange > 0 && putOIChange > 0){
		if(callOIChange > putOIChange){
            ratio = callOIChange/putOIChange;
            if(ratio>2){ rating = 'BEARISH'; }
            factor = parseFloat(ratio).toFixed(2);
			OIChangeRatio = `${factor} :: 1`;
		} else {
            ratio = putOIChange/callOIChange;
            if(ratio>2){ rating = 'BULLISH'; }
            factor = parseFloat(ratio).toFixed(2);
			OIChangeRatio = `1 :: ${factor}`;
		}
	} else if(callOIChange < 0 && putOIChange < 0){
		if(callOIChange > putOIChange){
            ratio = (putOIChange*-1)/(callOIChange*-1);
            if(ratio>2){ rating = 'BEARISH'; }
            factor = parseFloat(ratio).toFixed(2);
			OIChangeRatio = OIChangeRatio = `1 :: ${factor}`;
		} else {
            ratio = (callOIChange*-1)/(putOIChange*-1);
            if(ratio>2){ rating = 'BULLISH'; }
            factor = parseFloat(ratio).toFixed(2);
			OIChangeRatio = `${factor} :: 1`;
		}
	} else {
        if(callOIChange > putOIChange){
            rating = 'BEARISH';
        } else if(putOIChange > callOIChange){
            rating = 'BULLISH';
        }
		OIChangeRatio = `∞`;
	}
    return {OIChangeRatio, rating, factor}
}

function getDateTime(scanTime) {
	var time = scanTime ? scanTime : new Date();
	return `${time.getFullYear()}-${time.getMonth() + 1}-${padDate(time.getDate())}@${padDate(time.getHours())}${padDate(time.getMinutes())}${padDate(time.getSeconds())}`;
}

function getNumber(value){
    return isNumeric(""+value) ? value : 0;
}

function isNumeric(str) {
	if (typeof str != 'string') return false // we only process strings!  
	return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		   !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

async function analyseOptions(){
    let symbol = $('#optSymbol').val();
    let exp_date = $('#optExpDate').val();
    let strikeType = 'allstrikes';
    let txtDate = TXT_DATE;
    if(D_TYPE == 'hist'){
        exp_date = $('#optExpDate_hist').val();
        txtDate = $('#txtDate').val();
    }
    let url = `${location.origin}/opt/OptionChainTable.php?txtDate=${txtDate}&optSymbol=${encodeURIComponent(symbol)}&optExpDate=${exp_date}&dType=${D_TYPE}&striketype=${strikeType}&SymbType=${SYMB_TYPE}&sessionID=${SESSION_ID}&userName=${USER_NAME}`;
    // console.log(url);
    const res = await axios.post(url, {});
    let response = res.data;
    let futureClosingPrice = parseFloat(response.futuresClosingPrice.replace(/\,/, ''));
    let strikePrice = parseFloat(response.strikePriceATM).toFixed(2);
    let atmRowIndex = response.aaData.findIndex(row => parseFloat(row[COL_MAP.STRIKE_PRICE]).toFixed(2) == strikePrice);
    let stats1 = getOIDataStats(response.aaData, futureClosingPrice, atmRowIndex);
    let startIndex = Math.max(atmRowIndex-10, 0);
    let endIndex = Math.min(atmRowIndex+10, response.aaData.length);
    let nearATMData = response.aaData.slice(startIndex, endIndex);
    let stats2 = getOIDataStats(nearATMData, futureClosingPrice, strikePrice);
    // console.log(stats1, stats2, response.aaData.length);
    $('.chips-hawa-oi-analysis-block .chips-hawa-analysis-table').remove();
    $('.chips-hawa-oi-analysis-block .theta-analysis').remove();
    let scanDateTime = new Date();
    $('.chips-hawa-oi-analysis-block .scan-time').text(`${symbol.toUpperCase()}, Scanned at ${padDate(scanDateTime.getHours())}:${padDate(scanDateTime.getMinutes())}`);
    // $('.chips-hawa-oi-analysis-block').append(`<p class="theta-analysis" style="margin-left:50px;margin-bottom:0"><span>Theta Analysis: <strong>${stats1.PE_THETA > stats1.CE_THETA ? 'BULLISH' : 'BEARISH'}</strong> | Theta CE: ${parseFloat(stats1.CE_THETA).toFixed(2)} | Theta PE: ${parseFloat(stats1.PE_THETA).toFixed(2)}</span></p>`);
    renderOIDataStats(stats1, "All Strikes");
    renderOIDataStats(stats2, "Near ATM Strikes");
    // console.log(stats2);
}

function getOIDataStats(data, futureClosingPrice, atmStrikePrice){
    let stats = {
        CE_TOTAL_OI: 0,
        CE_TOTAL_OI_CNT: 0,
        CE_OI_ITM: 0,
        CE_OI_ITM_CNT: 0,
        CE_TOTAL_OI_CHANGE: 0,
        CE_TOTAL_OI_CHANGE_CNT: 0,
        CE_OI_CHANGE_ITM: 0,
        CE_OI_CHANGE_ITM_CNT: 0,
        CE_THETA: 0,
        CE_ITM_ATM_OI: 0,
        CE_ITM_ATM_OI_CHG: 0,
        PE_TOTAL_OI: 0,
        PE_TOTAL_OI_CNT: 0,
        PE_OI_ITM: 0,
        PE_OI_ITM_CNT: 0,
        PE_TOTAL_OI_CHANGE: 0,
        PE_TOTAL_OI_CHANGE_CNT: 0,
        PE_OI_CHANGE_ITM: 0,
        PE_OI_CHANGE_ITM_CNT: 0,
        PE_THETA: 0,
        PE_ITM_ATM_OI: 0,
        PE_ITM_ATM_OI_CHG: 0,
    }
    data.forEach((row, index) => {
        // Future Price is grater than strike price ITM for CE
        if(futureClosingPrice > parseFloat(row[COL_MAP.STRIKE_PRICE])){
            // console.log(`ITM CE: ${row[COL_MAP.STRIKE_PRICE]} OI: ${row[COL_MAP.CALL_OI]} OI-Change ${row[COL_MAP.CALL_OI_CHANGE]} LTP: ${row[COL_MAP.CE_VWAP]}`);
            stats.CE_OI_ITM += getNumber(row[COL_MAP.CALL_OI]) * getNumber(row[COL_MAP.CE_LTP]);
            stats.CE_OI_ITM_CNT += getNumber(row[COL_MAP.CALL_OI]) * 1;
            stats.CE_OI_CHANGE_ITM += getNumber(row[COL_MAP.CALL_OI_CHANGE]) * getNumber(row[COL_MAP.CE_LTP]);
            stats.CE_OI_CHANGE_ITM_CNT += getNumber(row[COL_MAP.CALL_OI_CHANGE]) * 1;
        }

        // Future Price is less than strike price ITM for PE
        if(futureClosingPrice <= parseFloat(row[COL_MAP.STRIKE_PRICE])){
            // console.log(`ITM PE: ${row[COL_MAP.STRIKE_PRICE]} ATM Strike ${futureClosingPrice}`);
            stats.PE_OI_ITM += getNumber(row[COL_MAP.PUT_OI]) * getNumber(row[COL_MAP.PE_LTP]);
            stats.PE_OI_ITM_CNT += getNumber(row[COL_MAP.PUT_OI]) * 1;
            stats.PE_OI_CHANGE_ITM += getNumber(row[COL_MAP.PUT_OI_CHANGE]) * getNumber(row[COL_MAP.PE_LTP]);
            stats.PE_OI_CHANGE_ITM_CNT += getNumber(row[COL_MAP.PUT_OI_CHANGE]) * 1;
        }
        stats.CE_TOTAL_OI += getNumber(row[COL_MAP.CALL_OI]) * getNumber(row[COL_MAP.CE_LTP]);
        stats.CE_TOTAL_OI_CNT += getNumber(row[COL_MAP.CALL_OI]) * 1;
        stats.CE_TOTAL_OI_CHANGE += getNumber(row[COL_MAP.CALL_OI_CHANGE]) * getNumber(row[COL_MAP.CE_LTP]);
        stats.CE_TOTAL_OI_CHANGE_CNT += getNumber(row[COL_MAP.CALL_OI_CHANGE]) * 1;
        stats.CE_THETA += getNumber(row[COL_MAP.CE_THETA]) * 1;
        stats.PE_TOTAL_OI += getNumber(row[COL_MAP.PUT_OI]) * getNumber(row[COL_MAP.PE_LTP]);
        stats.PE_TOTAL_OI_CNT += getNumber(row[COL_MAP.PUT_OI]) * 1;
        stats.PE_TOTAL_OI_CHANGE += getNumber(row[COL_MAP.PUT_OI_CHANGE]) * getNumber(row[COL_MAP.PE_LTP]);
        stats.PE_TOTAL_OI_CHANGE_CNT += getNumber(row[COL_MAP.PUT_OI_CHANGE]) * 1;
        stats.PE_THETA += getNumber(row[COL_MAP.PE_THETA]) * 1;

        //Calculate ITM + ATM OI and OI-Change sum
        if(row[COL_MAP.STRIKE_PRICE] <= atmStrikePrice){ // Call side ITM + ATM
            stats.CE_ITM_ATM_OI += getNumber(row[COL_MAP.CALL_OI]) * 1;
            stats.CE_ITM_ATM_OI_CHG += getNumber(row[COL_MAP.CALL_OI_CHANGE]) * 1;
        }

        if(row[COL_MAP.STRIKE_PRICE] <= atmStrikePrice){ // Put side ITM + ATM
            stats.PE_ITM_ATM_OI += getNumber(row[COL_MAP.PUT_OI]) * 1;
            stats.PE_ITM_ATM_OI_CHG += getNumber(row[COL_MAP.PUT_OI_CHANGE]) * 1;
        }
        // console.log(stats);
    });
    return stats;
}

function renderOIDataStats(stats, title){
    $('.chips-hawa-oi-analysis-block').append(`<table class="chips-hawa-analysis-table">
      <tr>
        <td colspan="8">${title}</td>
      </tr>  
      <tr>
        <td colspan="4">OI (EOD)</td>
        <td colspan="4">OI Change (Intraday)</td>
      </tr>
      <tr>
        <td>CE</td>
        <td>ITM CE</td>
        <td>PE</td>
        <td>ITM PE</td>
        <td>CE</td>
        <td>ITM CE</td>
        <td>PE</td>
        <td>ITM PE</td>
      </tr>
      <tr>
        <td>
            <span>${parseInt(stats.CE_TOTAL_OI, 10).toLocaleString('en-IN')}</span>
            <span class="cnt">(${parseInt((stats.CE_TOTAL_OI_CNT), 10).toLocaleString('en-IN')})</span>
        </td>
        <td>
            <span>${parseInt(stats.CE_OI_ITM, 10).toLocaleString('en-IN')}</span>
            <span class="cnt">(${parseInt(stats.CE_OI_ITM_CNT, 10).toLocaleString('en-IN')})</span>
        </td>
        <td>
            <span>${parseInt(stats.PE_TOTAL_OI, 10).toLocaleString('en-IN')}</span>
            <span class="cnt">(${parseInt(stats.PE_TOTAL_OI_CNT, 10).toLocaleString('en-IN')})</span>
        </td>
        <td>
            <span>${parseInt(stats.PE_OI_ITM, 10).toLocaleString('en-IN')}</span>
            <span class="cnt">(${parseInt(stats.PE_OI_ITM_CNT, 10).toLocaleString('en-IN')})</span>
        </td>
        <td>
            <span>${parseInt(stats.CE_TOTAL_OI_CHANGE, 10).toLocaleString('en-IN')}</span>
            <span class="cnt">(${parseInt(stats.CE_TOTAL_OI_CHANGE_CNT, 10).toLocaleString('en-IN')})</span>
        </td>
        <td>
            <span>${parseInt(stats.CE_OI_CHANGE_ITM, 10).toLocaleString('en-IN')}</span>
            <span class="cnt">(${parseInt(stats.CE_OI_CHANGE_ITM_CNT, 10).toLocaleString('en-IN')})</span>
        </td>
        <td>
            <span>${parseInt(stats.PE_TOTAL_OI_CHANGE, 10).toLocaleString('en-IN')}</span>
            <span class="cnt">(${parseInt(stats.PE_TOTAL_OI_CHANGE_CNT, 10).toLocaleString('en-IN')})</span>
        </td>
        <td>
            <span>${parseInt(stats.PE_OI_CHANGE_ITM, 10).toLocaleString('en-IN')}</span>
            <span class="cnt">(${parseInt(stats.PE_OI_CHANGE_ITM_CNT, 10).toLocaleString('en-IN')})</span>
        </td>
      </tr>
      <tr>
        <td colspan="2" class="right-align-text">
            ${parseFloat((stats.CE_OI_ITM/stats.CE_TOTAL_OI) * 100).toFixed(2)}%
            (${parseFloat((stats.CE_OI_ITM_CNT/stats.CE_TOTAL_OI_CNT) * 100).toFixed(2)}%)
        </td>
        <td colspan="2" class="right-align-text">
            ${parseFloat((stats.PE_OI_ITM/stats.PE_TOTAL_OI) * 100).toFixed(2)}%
            (${parseFloat((stats.PE_OI_ITM_CNT/stats.PE_TOTAL_OI_CNT) * 100).toFixed(2)}%)
        </td>
        <td colspan="2" class="right-align-text">
            ${parseFloat((stats.CE_OI_CHANGE_ITM/stats.CE_TOTAL_OI_CHANGE) * 100).toFixed(2)}%
            (${parseFloat((stats.CE_OI_CHANGE_ITM_CNT/stats.CE_TOTAL_OI_CHANGE_CNT) * 100).toFixed(2)}%)
        </td>
        <td colspan="2" class="right-align-text">
            ${parseFloat((stats.PE_OI_CHANGE_ITM/stats.PE_TOTAL_OI_CHANGE) * 100).toFixed(2)}%
            (${parseFloat((stats.PE_OI_CHANGE_ITM_CNT/stats.PE_TOTAL_OI_CHANGE_CNT) * 100).toFixed(2)}%)
        </td>
      </tr>
    </table>`);
}

function nth(d) {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
}

function padDate(d){
    if (d.toString().length == 1) {
		d = `0${d}`;
	}
    return d;
}