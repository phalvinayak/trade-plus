const OPT_EXP_DATE = $('#optExpDate').val()
const USER_NAME = $('#userName').val()
const SESSION_ID = $('#sessionID').val()
const TXT_DATE = $('#BoxSize').next().text().match(new RegExp('dt="' + '(.*)' + '";'))[1]
const D_TYPE = "latest"
const SYMB_TYPE = "FNO"
const STRIKES_FROM_ATM = 4

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

const NIFTY50 = {
    "RELIANCE": " 11.36",
    "HDFCBANK": "8.53",
    "ICICIBANK": "8.00",
    "INFY": "7.21",
    "HDFC": "5.89",
    "TCS": "4.19",
    "ITC": "3.61",
    "KOTAKBANK": "3.45",
    "LT": "3.02",
    "HINDUNILVR": "2.89",
    "AXISBANK": "2.87",
    "SBIN": "2.79",
    "BHARTIARTL": "2.50",
    "BAJFINANCE": "2.16",
    "ASIANPAINT": "1.73",
    "M&M": "1.51",
    "MARUTI": "1.44",
    "HCLTECH": "1.43",
    "SUNPHARMA": "1.36",
    "TITAN": "1.33",
    "ADANIENT": "1.29",
    "BAJAJFINSV": "1.19",
    "TATASTEEL": "1.05",
    "ULTRACEMCO": "0.99",
    "NTPC": "0.99",
    "TATAMOTORS": "0.95",
    "INDUSINDBK": "0.92",
    "POWERGRID": "0.92",
    "NESTLEIND": "0.87",
    "JSWSTEEL": "0.84",
    "TECHM": "0.82",
    "GRASIM": "0.80",
    "HINDALCO": "0.79",
    "ADANIPORTS": "0.76",
    "CIPLA": "0.74",
    "WIPRO": "0.73",
    "SBILIFE": "0.70",
    "HDFCLIFE": "0.67",
    "DRREDDY": "0.66",
    "ONGC": "0.66",
    "BRITANNIA": "0.62",
    "EICHERMOT": "0.59",
    "TATACONSUM": "0.59",
    "BAJAJ-AUTO": "0.58",
    "APOLLOHOSP": "0.58",
    "COALINDIA": "0.57",
    "DIVISLAB": "0.52",
    "UPL": "0.51",
    "HEROMOTOCO": "0.45",
    "BPCL": "0.39",
}

const BNF = {
    "HDFCBANK": "26.30",
    "ICICIBANK": "24.67",
    "AXISBANK": "12.00",
    "SBIN": "11.03",
    "KOTAKBANK": "10.63",
    "INDUSINDBK": "5.44",
    "BANKBARODA": "2.21",
    "AUBANK": "2.16",
    "FEDERALBNK": "1.88",
    "IDFCFIRSTB": "1.30",
    "BANDHANBNK": "1.29",
    "PNB": "1.09",
}

async function getIOData(symbol) {
    let url = `${location.origin}/opt/OptionChainTable.php?txtDate=${TXT_DATE}&optSymbol=${encodeURIComponent(symbol)}&optExpDate=${OPT_EXP_DATE}&dType=${D_TYPE}&striketype=mainstrikes&SymbType=${SYMB_TYPE}&sessionID=${SESSION_ID}&userName=${USER_NAME}`;
    let response = await axios.post(url, {});
    return response.data;
}

async function analyseOptionChain(stox) {
    let data = await getIOData(stox)
    let optionChain = data.aaData
    let strikePrice = parseFloat(data.strikePriceATM).toFixed(2)
    let atmRowIndex = optionChain.findIndex(row => parseFloat(row[COL_MAP.STRIKE_PRICE]).toFixed(2) == strikePrice)
    // console.log("ATM Row Index", optionChain[atmRowIndex][COL_MAP.STRIKE_PRICE])
    let callOISum = 0
    let putOISum = 0
    let callOIChgSum = 0
    let putOIChgSum = 0
    // Call Side OI and OI-change Analysis
    for (let rowIndex = atmRowIndex - 1; rowIndex <= atmRowIndex + STRIKES_FROM_ATM; rowIndex++) {
        if (optionChain[rowIndex]) {
            callOISum += getNumber(optionChain[rowIndex][COL_MAP.CALL_OI])
            callOIChgSum += getNumber(optionChain[rowIndex][COL_MAP.CALL_OI_CHANGE])

        }
    }

    // Put Side OI and OI-change Analysis
    for (let rowIndex = atmRowIndex - STRIKES_FROM_ATM; rowIndex <= atmRowIndex + 1; rowIndex++) {
        if (optionChain[rowIndex]) {
            putOISum += getNumber(optionChain[rowIndex][COL_MAP.PUT_OI])
            putOIChgSum += getNumber(optionChain[rowIndex][COL_MAP.PUT_OI_CHANGE])
        }
    }
    // console.log(callOISum, putOISum, callOIChgSum, putOIChgSum)
    console.log(callOISum, putOISum, callOIChgSum, putOIChgSum)
    let positionalPCR = '∞'
    if (callOISum != 0) {
        positionalPCR = parseFloat(putOISum / callOISum).toFixed(2)
    }
    let intraDayPCR = '∞'
    if (callOIChgSum != 0) {
        intraDayPCR = parseFloat(putOIChgSum / callOIChgSum).toFixed(2)
    }
    return {
        positional: putOISum > callOISum ? 1 : -1,
        positionalPCR,
        intraDay: putOIChgSum > callOIChgSum ? 1 : -1,
        intraDayPCR,
    }
}

async function initAnalysis() {
    let OC_DIRECTION = {}
    let counter = 0
    let totalCount = new Set(Object.keys(NIFTY50).concat(Object.keys(BNF))).size
    for (stox in NIFTY50) {
        if (!OC_DIRECTION[stox]) {
            OC_DIRECTION[stox] = await analyseOptionChain(stox)
            $('.ichart-scan-index').text(`Screening ${++counter} of ${totalCount}`);
        }
    }
    for (stox in BNF) {
        if (!OC_DIRECTION[stox]) {
            OC_DIRECTION[stox] = await analyseOptionChain(stox)
            $('.ichart-scan-index').text(`Screening ${++counter} of ${totalCount}`);
        }
    }
    upDownScan = {
        data: OC_DIRECTION,
        time: new Date()
    }
    localStorage.setItem('upDownScan', JSON.stringify(upDownScan));
    renderStatsToPage(upDownScan)
}
function renderStatsToPage(upDownScan) {
    let OC_DIRECTION = upDownScan.data
    let scanDateTime = new Date(upDownScan.time)
    let niftyStat = {
        idWeight: 0,
        posWeight: 0,
        idUpCount: 0,
        idDownCount: 0,
        idSidewaysCount: 0,
        posUpCount: 0,
        posDownCount: 0,
        posSidewaysCount: 0,
    }
    let niftyTableStr = ""
    for (stox in NIFTY50) {
        let stoxWeight = getNumber(NIFTY50[stox])


        let posSign = OC_DIRECTION[stox].positional == 1 ? '🟢' : '🔴'
        if (parseFloat(OC_DIRECTION[stox].positionalPCR) >= 0.85 && parseFloat(OC_DIRECTION[stox].positionalPCR) <= 1.15) {
            posSign = '⚪️'
            niftyStat.posSidewaysCount++
        } else {
            niftyStat.posWeight += OC_DIRECTION[stox].positional * stoxWeight
            OC_DIRECTION[stox].positional == 1 ? niftyStat.posUpCount++ : niftyStat.posDownCount++

        }

        let idSign = OC_DIRECTION[stox].intraDay == 1 ? '🟢' : '🔴'
        if (parseFloat(OC_DIRECTION[stox].intraDayPCR) >= 0.85 && parseFloat(OC_DIRECTION[stox].intraDayPCR) <= 1.15) {
            idSign = '⚪️'
            niftyStat.idSidewaysCount++
        } else {
            niftyStat.idWeight += OC_DIRECTION[stox].intraDay * stoxWeight
            OC_DIRECTION[stox].intraDay == 1 ? niftyStat.idUpCount++ : niftyStat.idDownCount++
        }
        niftyTableStr += `<tr>
            <td>${stox}(${stoxWeight})</td><td>${posSign}(${OC_DIRECTION[stox].positionalPCR})</td>
            <td style="border: none;">&nbsp;</td>
            <td>${stox}(${stoxWeight})</td><td>${idSign}(${OC_DIRECTION[stox].intraDayPCR})</td>
        </tr>`
    }

    // console.log(niftyStat)
    let bnfStat = {
        idWeight: 0,
        posWeight: 0,
        idUpCount: 0,
        idDownCount: 0,
        idSidewaysCount: 0,
        posUpCount: 0,
        posDownCount: 0,
        posSidewaysCount: 0,
    }
    let bnfTableStr = ""
    for (stox in BNF) {
        let stoxWeight = getNumber(BNF[stox])
        let posSign = OC_DIRECTION[stox].positional == 1 ? '🟢' : '🔴'
        if (parseFloat(OC_DIRECTION[stox].positionalPCR) >= 0.85 && parseFloat(OC_DIRECTION[stox].positionalPCR) <= 1.15) {
            posSign = '⚪️'
            bnfStat.posSidewaysCount++
        } else {
            bnfStat.posWeight += OC_DIRECTION[stox].positional * stoxWeight
            OC_DIRECTION[stox].positional == 1 ? bnfStat.posUpCount++ : bnfStat.posDownCount++
        }

        let idSign = OC_DIRECTION[stox].intraDay == 1 ? '🟢' : '🔴'
        if (parseFloat(OC_DIRECTION[stox].intraDayPCR) >= 0.85 && parseFloat(OC_DIRECTION[stox].intraDayPCR) <= 1.15) {
            idSign = '⚪️'
            bnfStat.idSidewaysCount++
        } else {
            bnfStat.idWeight += OC_DIRECTION[stox].intraDay * stoxWeight
            OC_DIRECTION[stox].intraDay == 1 ? bnfStat.idUpCount++ : bnfStat.idDownCount++
        }
        bnfTableStr += `<tr>
            <td>${stox}(${stoxWeight})</td><td>${posSign}(${OC_DIRECTION[stox].positionalPCR})</td>
            <td style="border: none;">&nbsp;</td>
            <td>${stox}(${stoxWeight})</td><td>${idSign}(${OC_DIRECTION[stox].intraDayPCR})</td>
        </tr>`
    }
    // console.log(bnfStat)

    $('#index-analysis').empty()
    $('#index-analysis').append(`
        <div><span style="margin-left:50px; font-style:italic">Scanned at ${padDate(scanDateTime.getHours())}:${padDate(scanDateTime.getMinutes())}</span></div>
        <table class="chips-hawa-analysis-table">
            <thead>
            <tr>
                <td colspan="5"><strong>NIFTY50</strong></td>
            </tr>
            <tr>
                <td><strong>Positional</strong></td>
                <td><strong>UP / DOWN / SW's</strong></td>
                <td style="border: none;">&nbsp;</td>
                <td><strong>IntraDay</strong></td>
                <td><strong>UP / DOWN / SW's</strong></td>
            </tr>
            </thead>
            <tbody>
            <tr style="background-color:#c5eadd">
                <td>${parseFloat(niftyStat.posWeight).toFixed(2)}</td>
                <td>${niftyStat.posUpCount}/${niftyStat.posDownCount}/${niftyStat.posSidewaysCount}</td>
                <td style="border: none;">&nbsp;</td>
                <td>${parseFloat(niftyStat.idWeight).toFixed(2)}</td>
                <td>${niftyStat.idUpCount}/${niftyStat.idDownCount}/${niftyStat.idSidewaysCount}</td>
            </tr>
            <tr>
                <td><strong>Stock(wt)</strong></td>
                <td><strong>Pos Dir(PCR)</strong></td>
                <td style="border: none;">&nbsp;</td>
                <td><strong>Stock(wt)</strong></td>
                <td><strong>ID Dir(PCR)</strong></td>
            </tr>
            ${niftyTableStr}
            </tbody>
        </table>
        <table class="chips-hawa-analysis-table" style="vertical-align:top;">
            <thead>
            <tr>
                <td colspan="5"><strong>BNF</strong></td>
            </tr>
            <tr>
                <td><strong>Positional</strong></td>
                <td><strong>UP / DOWN / SW's</strong></td>
                <td style="border: none;">&nbsp;</td>
                <td><strong>IntraDay</strong></td>
                <td><strong>UP / DOWN / SW's</strong></td>
            </tr>
            </thead>
            <tbody>
            <tr style="background-color:#c5eadd">
                <td>${parseFloat(bnfStat.posWeight).toFixed(2)}</td>
                <td>${bnfStat.posUpCount}/${bnfStat.posDownCount}/${bnfStat.posSidewaysCount}</td>
                <td style="border: none;">&nbsp;</td>
                <td>${parseFloat(bnfStat.idWeight).toFixed(2)}</td>
                <td>${bnfStat.idUpCount}/${bnfStat.idDownCount}/${bnfStat.idSidewaysCount}</td>
            </tr>
            <tr>
                <td><strong>Stock(wt)</strong></td>
                <td><strong>Dir(PCR)</strong></td>
                <td style="border: none;">&nbsp;</td>
                <td><strong>Stock(wt)</strong></td>
                <td><strong>Dir(PCR)</strong></td>
            </tr>
            ${bnfTableStr}
            </tbody>
        </table>`
    );
}

function getNumber(value) {
    return isNumeric("" + value) ? Number(value) : 0;
}

function isNumeric(str) {
    if (typeof str != 'string') return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function padDate(d) {
    if (d.toString().length == 1) {
        d = `0${d}`;
    }
    return d;
}

if (location.href.endsWith("Heatmap.php")) {
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

    // Render datatable if we've today's data
    try {
        let localData = localStorage.getItem('upDownScan');
        if (localData) {
            let upDownScan = JSON.parse(localData)
            scanDate = new Date(upDownScan.time);
            if (scanDate.getDate() == new Date().getDate() && scanDate.getMonth() == new Date().getMonth()) {
                renderStatsToPage(upDownScan)
            }
        }
    } catch (err) {
        // Incase of any error rendering with cached data ignore
        console.log(err);
    }
}