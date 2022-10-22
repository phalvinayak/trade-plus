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
    "RELIANCE":12.94,
    "HDFCBANK":8.55,
    "INFY":7.73,
    "ICICIBANK":7.11,
    "HDFC":5.68,
    "TCS":4.89,
    "KOTAKBANK":3.53,
    "ITC":3.46,
    "HINDUNILVR":2.88,
    "LT":2.72,
    "SBIN":2.58,
    "AXISBANK":2.43,
    "BHARTIARTL":2.39,
    "BAJFINANCE":2.08,
    "ASIANPAINT":1.76,
    "MARUTI":1.63,
    "M&M":1.51,
    "HCLTECH":1.49,
    "SUNPHARMA":1.30,
    "TITAN":1.17,
    "TATAMOTORS":1.07,
    "POWERGRID":1.05,
    "TATASTEEL":1.01,
    "NTPC":0.98,
    "BAJAJFINSV":0.96,
    "ULTRACEMCO":0.94,
    "TECHM":0.91,
    "NESTLEIND":0.90,
    "WIPRO":0.89,
    "ONGC":0.85,
    "JSWSTEEL":0.79,
    "DRREDDY":0.77,
    "INDUSINDBK":0.75,
    "HDFCLIFE":0.74,
    "GRASIM":0.72,
    "CIPLA":0.72,
    "HINDALCO":0.71,
    "ADANIPORTS":0.70,
    "SBILIFE":0.70,
    "BAJAJ-AUTO":0.70,
    "DIVISLAB":0.67,
    "TATACONSUM":0.61,
    "BRITANNIA":0.59,
    "COALINDIA":0.56,
    "EICHERMOT":0.56,
    "APOLLOHOSP":0.54,
    "HEROMOTOCO":0.51,
    "UPL":0.49,
    "BPCL":0.43,
    "SHREECEM":0.37,
}

const BNF = {
    "HDFCBANK":27.63,
    "ICICIBANK":22.98,
    "SBIN":11.73,
    "AXISBANK":11.60,
    "KOTAKBANK":11.40,
    "INDUSINDBK":5.03,
    "AUBANK":2.54,
    "BANDHANBNK":1.78,
    "BANKBARODA":1.76,
    "FEDERALBNK":1.76,
    "IDFCFIRSTB":0.95,
    "PNB":0.84
}

async function initAnalysis(){
    let data = await getHeatMapData();
    let stats = {
        NIFTY_WEIGHT_UP: 0,
        NIFTY_WEIGHT_DOWN: 0,
        BNF_WEIGHT_UP: 0,
        BNF_WEIGHT_DOWN: 0,
        NIFTY_UP: 0,
        NIFTY_DOWN: 0,
        BNF_UP:0,
        BNF_DOWN:0,
        NIFTY_CNT:0,
        BNF_CNT:0,
        NIFTY_UP_PER:0,
        NIFTY_DOWN_PER:0,
        BNF_UP_PER:0,
        BNF_DOWN_PER:0,
    }
    data.forEach((scrip, i) => {
        let sector = scrip[HEAT_COL_MAP.SECTOR];
        // let priceChange = scrip[HEAT_COL_MAP.PRICE_CHANGE];
        let priceChange = (scrip[HEAT_COL_MAP.PRICE] - scrip[HEAT_COL_MAP.OPEN])/scrip[HEAT_COL_MAP.OPEN]*100;
        if(i>1 && sector != 'Index Wise'){
            let symbol = scrip[HEAT_COL_MAP.SYMBOL].trim().toUpperCase();
            if(sector=='NIFTY'){
                stats.NIFTY_CNT++;
                if(priceChange>0){
                    stats.NIFTY_UP++;
                    stats.NIFTY_WEIGHT_UP += NIFTY50[symbol] * priceChange;
                } else if(priceChange<0){
                    stats.NIFTY_WEIGHT_DOWN += NIFTY50[symbol] * priceChange * -1;
                    stats.NIFTY_DOWN++;
                }
            }
            if(sector=='BANKNIFTY'){
                stats.BNF_CNT++;
                if(priceChange>0){
                    stats.BNF_WEIGHT_UP += BNF[symbol] * priceChange;
                    stats.BNF_UP++;
                } else if(priceChange<0){
                    stats.BNF_WEIGHT_DOWN += BNF[symbol] * priceChange * -1;
                    stats.BNF_DOWN++;
                }
            }
        }
    });
    stats.NIFTY_UP_PER = parseFloat((stats.NIFTY_WEIGHT_UP/(stats.NIFTY_WEIGHT_UP+stats.NIFTY_WEIGHT_DOWN)) * 100).toFixed(2);
    stats.NIFTY_DOWN_PER = parseFloat((stats.NIFTY_WEIGHT_DOWN/(stats.NIFTY_WEIGHT_UP+stats.NIFTY_WEIGHT_DOWN)) * 100).toFixed(2);
    stats.BNF_UP_PER = parseFloat((stats.BNF_WEIGHT_UP/(stats.BNF_WEIGHT_UP+stats.BNF_WEIGHT_DOWN)) * 100).toFixed(2);
    stats.BNF_DOWN_PER = parseFloat((stats.BNF_WEIGHT_DOWN/(stats.BNF_WEIGHT_UP+stats.BNF_WEIGHT_DOWN)) * 100).toFixed(2);
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
                <td>${parseFloat((stats.NIFTY_UP/(stats.NIFTY_UP+stats.NIFTY_DOWN)) * 100).toFixed(2)}%</td>
                <td>${parseFloat((stats.NIFTY_DOWN/(stats.NIFTY_UP+stats.NIFTY_DOWN)) * 100).toFixed(2)}%</td>
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
                <td>${parseFloat((stats.BNF_UP/(stats.BNF_UP+stats.BNF_DOWN)) * 100).toFixed(2)}%</td>
                <td>${parseFloat((stats.BNF_DOWN/(stats.BNF_UP+stats.BNF_DOWN)) * 100).toFixed(2)}%</td>
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

async function getHeatMapData(){
    try{
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
    } catch(err){
        console.log(e)
    }
}

if(location.href.endsWith("Heatmap.php") && USER_NAME=="phalvinayak"){
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
        if(SCREENER_STATE == 'idle'){
            console.log('start');
            SCREENER_STATE = 'running';
            await initAnalysis();
            SCREENER_STATE = 'idle';
            $('.ichart-scan-index').text(`ANALYSE INDEX`);
            console.log('end');
        }
    });
}