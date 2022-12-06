const OPT_EXP_DATE=$("#optExpDate").val(),USER_NAME=$("#userName").val(),SESSION_ID=$("#sessionID").val(),TXT_DATE=$("#BoxSize").next().text().match(new RegExp('dt="(.*)";'))[1],D_TYPE="latest",SYMB_TYPE="FNO",STRIKES_FROM_ATM=4,COL_MAP={CALL_OI_CHANGE:9,CE_DELTA:6,CE_THETA:4,CALL_OI:10,STRIKE_PRICE:17,CE_VWAP:14,PE_VWAP:20,PUT_OI:24,PUT_OI_CHANGE:25,CE_LTP:13,PE_LTP:21,PE_DELTA:28,PE_THETA:30,OI_PCR:32},NIFTY50={RELIANCE:" 11.36",HDFCBANK:"8.53",ICICIBANK:"8.00",INFY:"7.21",HDFC:"5.89",TCS:"4.19",ITC:"3.61",KOTAKBANK:"3.45",LT:"3.02",HINDUNILVR:"2.89",AXISBANK:"2.87",SBIN:"2.79",BHARTIARTL:"2.50",BAJFINANCE:"2.16",ASIANPAINT:"1.73","M&M":"1.51",MARUTI:"1.44",HCLTECH:"1.43",SUNPHARMA:"1.36",TITAN:"1.33",ADANIENT:"1.29",BAJAJFINSV:"1.19",TATASTEEL:"1.05",ULTRACEMCO:"0.99",NTPC:"0.99",TATAMOTORS:"0.95",INDUSINDBK:"0.92",POWERGRID:"0.92",NESTLEIND:"0.87",JSWSTEEL:"0.84",TECHM:"0.82",GRASIM:"0.80",HINDALCO:"0.79",ADANIPORTS:"0.76",CIPLA:"0.74",WIPRO:"0.73",SBILIFE:"0.70",HDFCLIFE:"0.67",DRREDDY:"0.66",ONGC:"0.66",BRITANNIA:"0.62",EICHERMOT:"0.59",TATACONSUM:"0.59","BAJAJ-AUTO":"0.58",APOLLOHOSP:"0.58",COALINDIA:"0.57",DIVISLAB:"0.52",UPL:"0.51",HEROMOTOCO:"0.45",BPCL:"0.39"},BNF={HDFCBANK:"26.30",ICICIBANK:"24.67",AXISBANK:"12.00",SBIN:"11.03",KOTAKBANK:"10.63",INDUSINDBK:"5.44",BANKBARODA:"2.21",AUBANK:"2.16",FEDERALBNK:"1.88",IDFCFIRSTB:"1.30",BANDHANBNK:"1.29",PNB:"1.09"};async function getIOData(t){t=`${location.origin}/opt/OptionChainTable.php?txtDate=${TXT_DATE}&optSymbol=${encodeURIComponent(t)}&optExpDate=${OPT_EXP_DATE}&dType=${D_TYPE}&striketype=mainstrikes&SymbType=${SYMB_TYPE}&sessionID=${SESSION_ID}&userName=`+USER_NAME;return(await axios.post(t,{})).data}async function analyseOptionChain(t){t=await getIOData(t);let o=t.aaData,n=parseFloat(t.strikePriceATM).toFixed(2);var a=o.findIndex(t=>parseFloat(t[COL_MAP.STRIKE_PRICE]).toFixed(2)==n);let s=0,e=0,i=0,d=0;for(let t=a-1;t<=a+STRIKES_FROM_ATM;t++)o[t]&&(s+=getNumber(o[t][COL_MAP.CALL_OI]),i+=getNumber(o[t][COL_MAP.CALL_OI_CHANGE]));for(let t=a-STRIKES_FROM_ATM;t<=a+1;t++)o[t]&&(e+=getNumber(o[t][COL_MAP.PUT_OI]),d+=getNumber(o[t][COL_MAP.PUT_OI_CHANGE]));console.log(s,e,i,d);let r="∞";0!=s&&(r=parseFloat(e/s).toFixed(2));let p="∞";return 0!=i&&(p=parseFloat(d/i).toFixed(2)),{positional:e>s?1:-1,positionalPCR:r,intraDay:d>i?1:-1,intraDayPCR:p}}async function initAnalysis(){let t={},o=0;var n=new Set(Object.keys(NIFTY50).concat(Object.keys(BNF))).size;for(stox in NIFTY50)t[stox]||(t[stox]=await analyseOptionChain(stox),$(".ichart-scan-index").text(`Screening ${++o} of `+n));for(stox in BNF)t[stox]||(t[stox]=await analyseOptionChain(stox),$(".ichart-scan-index").text(`Screening ${++o} of `+n));upDownScan={data:t,time:new Date},localStorage.setItem("upDownScan",JSON.stringify(upDownScan)),renderStatsToPage(upDownScan)}function renderStatsToPage(t){var n=t.data;let o=new Date(t.time),a={idWeight:0,posWeight:0,idUpCount:0,idDownCount:0,idSidewaysCount:0,posUpCount:0,posDownCount:0,posSidewaysCount:0},s="";for(stox in NIFTY50){var e=getNumber(NIFTY50[stox]);let t=1==n[stox].positional?"🟢":"🔴";.85<=parseFloat(n[stox].positionalPCR)&&parseFloat(n[stox].positionalPCR)<=1.15?(t="⚪️",a.posSidewaysCount++):(a.posWeight+=n[stox].positional*e,1==n[stox].positional?a.posUpCount++:a.posDownCount++);let o=1==n[stox].intraDay?"🟢":"🔴";.85<=parseFloat(n[stox].intraDayPCR)&&parseFloat(n[stox].intraDayPCR)<=1.15?(o="⚪️",a.idSidewaysCount++):(a.idWeight+=n[stox].intraDay*e,1==n[stox].intraDay?a.idUpCount++:a.idDownCount++),s+=`<tr>
            <td>${stox}(${e})</td><td>${t}(${n[stox].positionalPCR})</td>
            <td style="border: none;">&nbsp;</td>
            <td>${stox}(${e})</td><td>${o}(${n[stox].intraDayPCR})</td>
        </tr>`}let i={idWeight:0,posWeight:0,idUpCount:0,idDownCount:0,idSidewaysCount:0,posUpCount:0,posDownCount:0,posSidewaysCount:0},d="";for(stox in BNF){var r=getNumber(BNF[stox]);let t=1==n[stox].positional?"🟢":"🔴";.85<=parseFloat(n[stox].positionalPCR)&&parseFloat(n[stox].positionalPCR)<=1.15?(t="⚪️",i.posSidewaysCount++):(i.posWeight+=n[stox].positional*r,1==n[stox].positional?i.posUpCount++:i.posDownCount++);let o=1==n[stox].intraDay?"🟢":"🔴";.85<=parseFloat(n[stox].intraDayPCR)&&parseFloat(n[stox].intraDayPCR)<=1.15?(o="⚪️",i.idSidewaysCount++):(i.idWeight+=n[stox].intraDay*r,1==n[stox].intraDay?i.idUpCount++:i.idDownCount++),d+=`<tr>
            <td>${stox}(${r})</td><td>${t}(${n[stox].positionalPCR})</td>
            <td style="border: none;">&nbsp;</td>
            <td>${stox}(${r})</td><td>${o}(${n[stox].intraDayPCR})</td>
        </tr>`}$("#index-analysis").empty(),$("#index-analysis").append(`
        <div><span style="margin-left:50px; font-style:italic">Scanned at ${padDate(o.getHours())}:${padDate(o.getMinutes())}</span></div>
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
                <td>${parseFloat(a.posWeight).toFixed(2)}</td>
                <td>${a.posUpCount}/${a.posDownCount}/${a.posSidewaysCount}</td>
                <td style="border: none;">&nbsp;</td>
                <td>${parseFloat(a.idWeight).toFixed(2)}</td>
                <td>${a.idUpCount}/${a.idDownCount}/${a.idSidewaysCount}</td>
            </tr>
            <tr>
                <td><strong>Stock(wt)</strong></td>
                <td><strong>Pos Dir(PCR)</strong></td>
                <td style="border: none;">&nbsp;</td>
                <td><strong>Stock(wt)</strong></td>
                <td><strong>ID Dir(PCR)</strong></td>
            </tr>
            ${s}
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
                <td>${parseFloat(i.posWeight).toFixed(2)}</td>
                <td>${i.posUpCount}/${i.posDownCount}/${i.posSidewaysCount}</td>
                <td style="border: none;">&nbsp;</td>
                <td>${parseFloat(i.idWeight).toFixed(2)}</td>
                <td>${i.idUpCount}/${i.idDownCount}/${i.idSidewaysCount}</td>
            </tr>
            <tr>
                <td><strong>Stock(wt)</strong></td>
                <td><strong>Dir(PCR)</strong></td>
                <td style="border: none;">&nbsp;</td>
                <td><strong>Stock(wt)</strong></td>
                <td><strong>Dir(PCR)</strong></td>
            </tr>
            ${d}
            </tbody>
        </table>`)}function getNumber(t){return isNumeric(""+t)?Number(t):0}function isNumeric(t){return"string"==typeof t&&(!isNaN(t)&&!isNaN(parseFloat(t)))}function padDate(t){return t=1==t.toString().length?"0"+t:t}if(location.href.endsWith("Heatmap.php")){$("body").append(`
        <div id="ichart-utility-buttons">
            <button class="ichart-scan-index mdl-button mdl-button--raised mdl-button--colored">ANALYSE INDEX</button>
        </div>
        <div id="index-analysis"></div>
    `);let o="idle";$(".ichart-scan-index").on("click",async t=>{t.preventDefault(),t.stopPropagation(),"idle"==o&&(console.log("start"),o="running",await initAnalysis(),o="idle",$(".ichart-scan-index").text("ANALYSE INDEX"),console.log("end"))});try{let o=localStorage.getItem("upDownScan");if(o){let t=JSON.parse(o);scanDate=new Date(t.time),scanDate.getDate()==(new Date).getDate()&&scanDate.getMonth()==(new Date).getMonth()&&renderStatsToPage(t)}}catch(t){console.log(t)}}