const OPT_EXP_DATE = $('#optExpDate').val()
const USER_NAME = $('#userName').val();
const SESSION_ID = $('#sessionID').val();
const TXT_DATE = $('#BoxSize').next().text().match(new RegExp('dt="' + '(.*)' + '";'))[1];
const HEAT_COL_MAP = {
    'SYMBOL': 0,
    'SECTOR': 1,
    'PRICE_CHANGE': 3,
    'PREV_CLOSE': 4,
    'PRICE': 5,
    'PRICE_CHANGE': 6,
    'OPEN': 8,
    'LOW': 9,
    'HIGH': 10,
};

const NIFTY50 = {
    "RELIANCE": " 10.84",
    "HDFCBANK": "8.27",
    "ICICIBANK": "7.94",
    "INFY": "6.84",
    "HDFC": "5.48",
    "TCS": "4.07",
    "ITC": "3.86",
    "KOTAKBANK": "3.53",
    "HINDUNILVR": "3.18",
    "LT": "2.95",
    "SBIN": "2.69",
    "BHARTIARTL": "2.59",
    "BAJFINANCE": "2.58",
    "AXISBANK": "2.56",
    "ASIANPAINT": "1.99",
    "M&M": "1.60",
    "MARUTI": "1.55",
    "TITAN": "1.44",
    "SUNPHARMA": "1.35",
    "BAJAJFINSV": "1.34",
    "HCLTECH": "1.30",
    "ADANIENT": "1.25",
    "TATASTEEL": "1.06",
    "INDUSINDBK": "1.02",
    "NTPC": "1.00",
    "TATAMOTORS": "0.96",
    "POWERGRID": "0.96",
    "ULTRACEMCO": "0.95",
    "NESTLEIND": "0.90",
    "TECHM": "0.84",
    "GRASIM": "0.83",
    "CIPLA": "0.80",
    "JSWSTEEL": "0.79",
    "ADANIPORTS": "0.78",
    "WIPRO": "0.77",
    "HINDALCO": "0.75",
    "SBILIFE": "0.74",
    "DRREDDY": "0.70",
    "EICHERMOT": "0.68",
    "HDFCLIFE": "0.66",
    "ONGC": "0.65",
    "TATACONSUM": "0.64",
    "DIVISLAB": "0.62",
    "BAJAJ-AUTO": "0.60",
    "BRITANNIA": "0.60",
    "COALINDIA": "0.59",
    "APPOLOHOSP": "0.59",
    "UPL": "0.47",
    "HEROMOTOCO": "0.44",
    "BPCL": "0.38",
}

const BNF = {
    "HDFCBANK": "26.00",
    "ICICIBANK": "24.97",
    "KOTAKBANK": "11.11",
    "AXISBANK": "10.93",
    "SBIN": "10.87",
    "INDUSINDBK": "6.17",
    "AUBANK": "2.34",
    "BANKBARODA": "1.97",
    "FEDERALBNK": "1.90",
    "BANDHANBNK": "1.61",
    "IDFCFIRSTB": "1.24",
    "PNB": "0.87",
}

async function initAnalysis() {
    let data = await getHeatMapData();
    let stats = {
        NIFTY_WEIGHT_UP: 0,
        NIFTY_WEIGHT_DOWN: 0,
        BNF_WEIGHT_UP: 0,
        BNF_WEIGHT_DOWN: 0,
        NIFTY_UP: 0,
        NIFTY_DOWN: 0,
        BNF_UP: 0,
        BNF_DOWN: 0,
        NIFTY_CNT: 0,
        BNF_CNT: 0,
        NIFTY_UP_PER: 0,
        NIFTY_DOWN_PER: 0,
        BNF_UP_PER: 0,
        BNF_DOWN_PER: 0,
    }
    data.forEach((scrip, i) => {
        let sector = scrip[HEAT_COL_MAP.SECTOR];
        // let priceChange = scrip[HEAT_COL_MAP.PRICE_CHANGE];
        let priceChange = (scrip[HEAT_COL_MAP.PRICE] - scrip[HEAT_COL_MAP.OPEN]) / scrip[HEAT_COL_MAP.OPEN] * 100;
        if (i > 1 && sector != 'Index Wise') {
            let symbol = scrip[HEAT_COL_MAP.SYMBOL].trim().toUpperCase();
            if (sector == 'NIFTY') {
                stats.NIFTY_CNT++;
                if (priceChange > 0) {
                    stats.NIFTY_UP++;
                    stats.NIFTY_WEIGHT_UP += NIFTY50[symbol] * priceChange;
                } else if (priceChange < 0) {
                    stats.NIFTY_WEIGHT_DOWN += NIFTY50[symbol] * priceChange * -1;
                    stats.NIFTY_DOWN++;
                }
            }
            if (sector == 'BANKNIFTY') {
                stats.BNF_CNT++;
                if (priceChange > 0) {
                    stats.BNF_WEIGHT_UP += BNF[symbol] * priceChange;
                    stats.BNF_UP++;
                } else if (priceChange < 0) {
                    stats.BNF_WEIGHT_DOWN += BNF[symbol] * priceChange * -1;
                    stats.BNF_DOWN++;
                }
            }
        }
    });
    stats.NIFTY_UP_PER = parseFloat((stats.NIFTY_WEIGHT_UP / (stats.NIFTY_WEIGHT_UP + stats.NIFTY_WEIGHT_DOWN)) * 100).toFixed(2);
    stats.NIFTY_DOWN_PER = parseFloat((stats.NIFTY_WEIGHT_DOWN / (stats.NIFTY_WEIGHT_UP + stats.NIFTY_WEIGHT_DOWN)) * 100).toFixed(2);
    stats.BNF_UP_PER = parseFloat((stats.BNF_WEIGHT_UP / (stats.BNF_WEIGHT_UP + stats.BNF_WEIGHT_DOWN)) * 100).toFixed(2);
    stats.BNF_DOWN_PER = parseFloat((stats.BNF_WEIGHT_DOWN / (stats.BNF_WEIGHT_UP + stats.BNF_WEIGHT_DOWN)) * 100).toFixed(2);
    console.log(stats);
    $('#index-analysis').empty()
    $('#index-analysis').append(`<table class="chips-hawa-analysis-table">
            <thead>
            <tr>
                <td colspan="5">NIFTY50 (${stats.NIFTY_CNT})</td>
            </tr>
            <tr>
                <td>Stat</td>
                <td>UP</td>
                <td>Down</td>
                <td>UP(%)</td>
                <td>Down(%)</td>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>Count</td>
                <td>${stats.NIFTY_UP}</td>
                <td>${stats.NIFTY_DOWN}</td>
                <td>${parseFloat((stats.NIFTY_UP / (stats.NIFTY_UP + stats.NIFTY_DOWN)) * 100).toFixed(2)}%</td>
                <td>${parseFloat((stats.NIFTY_DOWN / (stats.NIFTY_UP + stats.NIFTY_DOWN)) * 100).toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Weight</td>
                <td>${parseFloat(stats.NIFTY_WEIGHT_UP).toFixed(2)}</td>
                <td>${parseFloat(stats.NIFTY_WEIGHT_DOWN).toFixed(2)}</td>
                <td>${parseFloat(stats.NIFTY_UP_PER).toFixed(2)}%</td>
                <td>${parseFloat(stats.NIFTY_DOWN_PER).toFixed(2)}%</td>
            </tr>
            </tbody>
        </table>
        <table class="chips-hawa-analysis-table">
            <thead>
            <tr>
                <td colspan="5">BANK NIFTY (${stats.BNF_CNT})</td>
            </tr>
            <tr>
                <td>Stat</td>
                <td>UP</td>
                <td>Down</td>
                <td>UP(%)</td>
                <td>Down(%)</td>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>Count</td>
                <td>${stats.BNF_UP}</td>
                <td>${stats.BNF_DOWN}</td>
                <td>${parseFloat((stats.BNF_UP / (stats.BNF_UP + stats.BNF_DOWN)) * 100).toFixed(2)}%</td>
                <td>${parseFloat((stats.BNF_DOWN / (stats.BNF_UP + stats.BNF_DOWN)) * 100).toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Weight</td>
                <td>${parseFloat(stats.BNF_WEIGHT_UP).toFixed(2)}</td>
                <td>${parseFloat(stats.BNF_WEIGHT_DOWN).toFixed(2)}</td>
                <td>${parseFloat(stats.BNF_UP_PER).toFixed(2)}%</td>
                <td>${parseFloat(stats.BNF_DOWN_PER).toFixed(2)}%</td>
            </tr>
            </tbody>
        </table>`
    );

}

async function getHeatMapData() {
    try {
        let url = `${location.origin}/opt/hcharts/stx8req/php/getDataForHeatmap_indexes.php`;
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
        return response.data;
    } catch (err) {
        console.log(e)
    }
}

if (location.href.endsWith("Heatmap.php") && USER_NAME == "akabhijeet") {
    $('body').append(`
        <div id="ichart-utility-buttons">
            <button class="ichart-scan-index mdl-button mdl-button--raised mdl-button--colored">ANALYSE INDEX</button>
        </div>
        <div id="index-analysis"></div>
    `);
    let SCREENER_STATE = 'idle';
    $('.ichart-scan-index').on('click', async e => {
        e.preventDefault();
        e.stopPropagation();
        if (SCREENER_STATE == 'idle') {
            console.log('start');
            SCREENER_STATE = 'running';
            await initAnalysis();
            SCREENER_STATE = 'idle';
            $('.ichart-scan-index').text(`ANALYSE INDEX`);
            console.log('end');
        }
    });
}