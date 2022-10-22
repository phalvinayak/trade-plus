// Annynomous scope for not to leaking the variables on global scope
(()=>{
const USER_NAME = $('#SymbType').next().next().next().text().match(new RegExp("userName': '" + "(.*)" + "',"))[1];
const SESSION_ID = $('#SymbType').next().next().next().text().match(new RegExp("sessionID': '" + "(.*)" + "',"))[1];
const SYMB_TYPE = $('#SymbType').val();
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const MONTH_HISTORY_LIMIT = 30;
const COL_MAP = {
    'CALL_OI_CHANGE': 9,
    'CE_THETA': 4,
    'CALL_OI': 10,
    'STRIKE_PRICE': 17,
    'CE_VWAP': 14,
    'PE_VWAP': 20,
    'PUT_OI': 24,
    'PUT_OI_CHANGE': 25,
    'CE_LTP': 13,
    'PE_LTP': 21,
    'PE_THETA': 30,
    'OI_PCR': 32
};

async function initMonthlyHistoryScan(year, month, date){
    $('#screener-title').html('<h3>Monthly Screener Chart</h3>');
    let dt = new Date(year, month, date);
    console.log(dt);

    const CUR_MONTH = `${MONTHS[dt.getMonth()]}${dt.getFullYear()%100}`;
    const NEXT_MONTH = `${MONTHS[(dt.getMonth()+1) % 12]}${dt.getMonth() == 11 ? dt.getFullYear()%100 + 1 : dt.getFullYear()%100}`;
    const NEXT_2_MONTH = `${MONTHS[(dt.getMonth()+2) % 12]}${dt.getMonth() == 11 ? dt.getFullYear()%100 + 1 : dt.getFullYear()%100}`;
    const NEXT_3_MONTH = `${MONTHS[(dt.getMonth()+3) % 12]}${dt.getMonth() == 11 ? dt.getFullYear()%100 + 1 : dt.getFullYear()%100}`;

    let curMonthExpires = [];
    let nextMonthExpiries = [];
    let next2MonthExpiries = [];
    let next3MonthExpiries = [];
    let expiries = getExpiries()
    expiries.forEach(item => {
        if(item.includes(CUR_MONTH)){
            curMonthExpires.push(item);
        } else if(item.includes(NEXT_MONTH)){
            nextMonthExpiries.push(item);
        } else if(item.includes(NEXT_2_MONTH)){
            next2MonthExpiries.push(item);
        } else if(item.includes(NEXT_3_MONTH)){
            next3MonthExpiries.push(item);
        }
    });
    const CUR_MONTH_EXPIRY = curMonthExpires.sort().slice(-1)[0];
    const NEXT_MONTH_EXPIRY = nextMonthExpiries.sort().slice(-1)[0];
    const NEXT_2_MONTH_EXPIRY =  next2MonthExpiries.sort().slice(-1)[0];
    const NEXT_3_MONTH_EXPIRY =  next3MonthExpiries.sort().slice(-1)[0];
    console.log(CUR_MONTH_EXPIRY, NEXT_MONTH_EXPIRY, NEXT_2_MONTH_EXPIRY, NEXT_3_MONTH_EXPIRY);

    // define and populate charing arrays
    let labels = [];
    let ceData = [];
    let peData = [];
    let allCeData = [];
    let allPeData = [];
    let futPrices = [];
    let csvString = 'Date,ATM-ITM-CE-LOTS,ATM-ITM-PE-LOTS,ALL-CE,ALL-PE,Fut-Price\n';
    for (let i=0; i<MONTH_HISTORY_LIMIT; dt.setDate(dt.getDate() + 1), i++) {
        $('.ichart-screener-monthly').text(`History Load ${parseFloat(i/MONTH_HISTORY_LIMIT*100).toFixed(2)}%`);
        if([0,6].includes(dt.getDay())){continue;}
        if(dt > (new Date())){break;}
        let year = dt.getFullYear();
        let month = padDate(dt.getMonth()+1);
        let date = padDate(dt.getDate())
        let targetDate = `${year}-${month}-${date}`;
        let expSubStr = `${MONTHS[dt.getMonth()]}${dt.getFullYear()%100}`;
        let dateExpFormat = `${date}${expSubStr}`;
        let exp1 = '';
        let exp2 = '';
        if(CUR_MONTH_EXPIRY.includes(expSubStr)){
            if(dateExpFormat<=CUR_MONTH_EXPIRY){
                exp1 = CUR_MONTH_EXPIRY;
                exp2 = NEXT_MONTH_EXPIRY;
            } else {
                exp1 = NEXT_MONTH_EXPIRY;
                exp2 = NEXT_2_MONTH_EXPIRY;
            }
        } else if(NEXT_MONTH_EXPIRY.includes(expSubStr)){
            if(dateExpFormat<=NEXT_MONTH_EXPIRY){
                exp1 = NEXT_MONTH_EXPIRY;
                exp2 = NEXT_2_MONTH_EXPIRY;
            } else {
                exp1 = NEXT_2_MONTH_EXPIRY;
                exp2 = NEXT_3_MONTH_EXPIRY;
            }
        } else if(NEXT_2_MONTH_EXPIRY.includes(expSubStr)){
            exp1 = NEXT_2_MONTH_EXPIRY;
            exp2 = NEXT_3_MONTH_EXPIRY;
        }
        let {ceLots, peLots, allCeLots, allPeLots, futPrice} = await fetchData(targetDate, [exp1, exp2]);
        labels.push(dateExpFormat);
        ceData.push(ceLots);
        peData.push(peLots);
        allCeData.push(allCeLots);
        allPeData.push(allPeLots);
        futPrices.push(futPrice);
        csvString += `${dateExpFormat},${ceLots},${peLots},${allCeLots},${allPeLots},${futPrice}\n`;
        //console.log(`${targetDate} with exp: ${exp1} and ${exp2}`);
    }
    console.log(`CSV Export for Google Sheet`);
    console.log(csvString);
    renderCharts(labels, ceData, peData, allCeData, allPeData, futPrices);
}

async function initWeeklyHistoryScan(year, month, date){
    $('#screener-title').html('<h3>Weekly Screener Chart</h3>');
    const DATE_RANGE = 21;
    let fromDate = new Date(year, month, date);
    let rangeDate = new Date(year, month, date);
    rangeDate.setDate(rangeDate.getDate() + DATE_RANGE);
    let expiries = getExpiries();
    let targetExpiries = [];
    for(;fromDate<rangeDate;fromDate.setDate(fromDate.getDate()+1)){
        if([0,6].includes(fromDate.getDay())){continue;}
        let dateStr = `${padDate(fromDate.getDate())}${MONTHS[fromDate.getMonth()]}${fromDate.getFullYear()%100}`;
        if(expiries.includes(dateStr)){
            targetExpiries.push(dateStr);
        }
    }
    fromDate = new Date(year, month, date);
    // define and populate charing arrays
    let labels = [];
    let ceData = [];
    let peData = [];
    let allCeData = [];
    let allPeData = [];
    let futPrices = [];
    for(let i=0;fromDate<rangeDate;fromDate.setDate(fromDate.getDate()+1), i++){
        if([0,6].includes(fromDate.getDay())){continue;}
        if(fromDate > (new Date())){break;}
        $('.ichart-screener-weekly').text(`History Load ${parseFloat(i/DATE_RANGE*100).toFixed(2)}%`);
        let targetExpiries = [];
        let startDate = new Date(fromDate.getTime());
        for(let i=0;i<DATE_RANGE;startDate.setDate(startDate.getDate()+1), i++){
            if([0,6].includes(startDate.getDay())){continue;}
            let dateStr = `${padDate(startDate.getDate())}${MONTHS[startDate.getMonth()]}${startDate.getFullYear()%100}`;
            if(expiries.includes(dateStr)){
                targetExpiries.push(dateStr);
            }
        }
        let year = fromDate.getFullYear();
        let month = padDate(fromDate.getMonth()+1);
        let date = padDate(fromDate.getDate())
        let targetDate = `${year}-${month}-${date}`;
        let {ceLots, peLots, allCeLots, allPeLots, futPrice} = await fetchData(targetDate, targetExpiries);
        labels.push(`${date}${MONTHS[month-1]}${year%100}`);
        ceData.push(ceLots);
        peData.push(peLots);
        allCeData.push(allCeLots);
        allPeData.push(allPeLots);
        futPrices.push(futPrice);
    }
    renderCharts(labels, ceData, peData, allCeData, allPeData, futPrices);
}

function getExpiries(){
    let expiries = [];
    $('#optExpDate_hist option').each((i, e) => {
        expiries.push($(e).attr('value').toUpperCase());
    });
    return expiries;
}

function renderCharts(labels, ceData, peData, allCeData, allPeData, futPrices){
    // Building up the chart data
    let chartConfig = {
        type: 'line',
        options: {
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    position: 'nearest'
                },
                title: {
                    display: true,
                    text: 'ATM-ITM CE-PE Lots'
                },
            }
        },
        data: {
            labels,
            datasets: [{
                label: 'ITM-CE-LOTS',
                data: ceData,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                yAxisID: 'y',
            },{
                label: 'ITM-PE-LOTS',
                data: peData,
                fill: false,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
                yAxisID: 'y',
            },{
                label: 'FUT-PRICE',
                data: futPrices,
                fill: false,
                backgroundColor: 'rgb(153, 102, 255)',
                borderColor: 'rgb(153, 102, 255)',
                tension: 0.1,
                yAxisID: 'y1'
            }]
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
            }
        }
    }

    let chartConfig2 = JSON.parse(JSON.stringify(chartConfig));
    chartConfig2.options.plugins.title.text = 'All CE-PE Lots';
    chartConfig2.data.datasets[0].data = allCeData;
    chartConfig2.data.datasets[1].data = allPeData;
    let chart1 = Chart.getChart("history-chart");
    if(chart1){ console.log('Chart instance detected'); chart1.destroy() }
    const myChart = new Chart(
        document.getElementById('history-chart'),
        chartConfig
    );

    let chart2 = Chart.getChart("history-chart-2");
    if(chart2){ console.log('Chart2 instance detected'); chart2.destroy() }
    const myChart2 = new Chart(
        document.getElementById('history-chart-2'),
        chartConfig2
    );
}

async function fetchData(targetDate, expiries, isToday){
    let symbol = $('#optSymbol').val();
    let promiseArr = [];

    let today = new Date();
    let year = today.getFullYear();
    let month = padDate(today.getMonth()+1);
    let date = padDate(today.getDate())
    let D_TYPE = (targetDate == `${year}-${month}-${date}`) ? 'latest' : 'hist';
    expiries.forEach(expiry => {
        let url = `${location.origin}/opt/OptionChainTable_tc.php?txtDate=${targetDate}&optSymbol=${encodeURIComponent(symbol)}&optExpDate=${expiry}&dType=${D_TYPE}&striketype=allstrikes&SymbType=${SYMB_TYPE}&sessionID=${SESSION_ID}&userName=${USER_NAME}`;
        promiseArr.push(axios.post(url, {}),)
    })
    let dataPoints = {ceLots: 0, peLots: 0, allCeLots: 0, allPeLots: 0, futPrice: 0};
    // return dataPoints;
    try {
        const response = await Promise.all(promiseArr);
        dataPoints = processResponse(response);
    } catch(err){
        console.log(err);
    }
    return dataPoints;
}

function processResponse(responses){
    let ceLots = 0;
    let peLots = 0;
    let allCeLots = 0;
    let allPeLots = 0;
    let futPrice = 0;
    responses.forEach(response => {
        let data = response.data;
        let atmStrike = parseFloat(data.strikePriceATM).toFixed(2);
        let lotSize = parseInt(data.lot_size);
        futPrice = parseFloat(data.futuresClosingPrice.replace(',',''));
        data.aaData.forEach(row => {
            if(parseFloat(getNumber(row[COL_MAP.STRIKE_PRICE])).toFixed(2) <= atmStrike){
                ceLots += parseFloat(row[COL_MAP.CALL_OI]*getNumber(row[COL_MAP.CE_LTP]))
            }
            if(parseFloat(getNumber(row[COL_MAP.STRIKE_PRICE])).toFixed(2) >= atmStrike){
                peLots += parseFloat(row[COL_MAP.PUT_OI]*getNumber(row[COL_MAP.PE_LTP]))
            }
            allCeLots += parseFloat(row[COL_MAP.CALL_OI]*getNumber(row[COL_MAP.CE_LTP]));
            allPeLots += parseFloat(row[COL_MAP.PUT_OI]*getNumber(row[COL_MAP.PE_LTP]));
        })
    });
    return {ceLots, peLots, allCeLots, allPeLots, futPrice}
}

function padDate(d){
    if (d.toString().length == 1) {
		d = `0${d}`;
	}
    return d;
}

function getNumber(value){
    return isNumeric(""+value) ? value : 0;
}

function isNumeric(str) {
	if (typeof str != 'string') return false // we only process strings!  
	return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		   !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

if(location.href.endsWith("OptionsMonitor.php") && USER_NAME=="phalvinayak"){
    $('.optionchart').remove();
    $('body').append(`
        <div id="ichart-utility-buttons">
            <button class="ichart-screener-monthly mdl-button mdl-button--raised mdl-button--colored">Monthly History Scan</button>
            <button class="ichart-screener-weekly mdl-button mdl-button--raised mdl-button--colored">Weekly History Scan</button>
        </div>
        <div id="screener-title"></div>
        <div>
            <canvas id="history-chart"></canvas>
        </div>
        <div>
            <canvas id="history-chart-2"></canvas>
        </div>
    `);
    let SCREENER_STATE = 'idle';
    $('.ichart-screener-monthly').on('click', async e => {
        e.preventDefault();
        e.stopPropagation();
        if(SCREENER_STATE == 'idle'){
            console.log('start');
            SCREENER_STATE = 'running';
            await initMonthlyHistoryScan(...getDate());
            SCREENER_STATE = 'idle';
            $('.ichart-screener-monthly').text(`Monthly History Scan`);
            console.log('end');
        }
    });
    $('.ichart-screener-weekly').on('click', async e => {
        e.preventDefault();
        e.stopPropagation();
        if(SCREENER_STATE == 'idle'){
            console.log('start');
            SCREENER_STATE = 'running';
            await initWeeklyHistoryScan(...getDate());
            SCREENER_STATE = 'idle';
            $('.ichart-screener-weekly').text(`Weekly History Scan`);
            console.log('end');
        }
    });
}

function getDate(){
    let dt = $('#txtDate').val();
    let [year, month, day] = dt.split('-').map(e => parseInt(e, 10));
    return [year, month-1, day]
}
})()