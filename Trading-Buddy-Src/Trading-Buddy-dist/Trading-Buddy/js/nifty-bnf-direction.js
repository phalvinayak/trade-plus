const OPT_EXP_DATE=$("#optExpDate").val(),USER_NAME=$("#userName").val(),SESSION_ID=$("#sessionID").val(),TXT_DATE=$("#BoxSize").next().text().match(new RegExp('dt="(.*)";'))[1],HEAT_COL_MAP={SYMBOL:0,SECTOR:1,PRICE_CHANGE:6,PREV_CLOSE:4,PRICE:5,OPEN:8,LOW:9,HIGH:10},NIFTY50={RELIANCE:12.94,HDFCBANK:8.55,INFY:7.73,ICICIBANK:7.11,HDFC:5.68,TCS:4.89,KOTAKBANK:3.53,ITC:3.46,HINDUNILVR:2.88,LT:2.72,SBIN:2.58,AXISBANK:2.43,BHARTIARTL:2.39,BAJFINANCE:2.08,ASIANPAINT:1.76,MARUTI:1.63,"M&M":1.51,HCLTECH:1.49,SUNPHARMA:1.3,TITAN:1.17,TATAMOTORS:1.07,POWERGRID:1.05,TATASTEEL:1.01,NTPC:.98,BAJAJFINSV:.96,ULTRACEMCO:.94,TECHM:.91,NESTLEIND:.9,WIPRO:.89,ONGC:.85,JSWSTEEL:.79,DRREDDY:.77,INDUSINDBK:.75,HDFCLIFE:.74,GRASIM:.72,CIPLA:.72,HINDALCO:.71,ADANIPORTS:.7,SBILIFE:.7,"BAJAJ-AUTO":.7,DIVISLAB:.67,TATACONSUM:.61,BRITANNIA:.59,COALINDIA:.56,EICHERMOT:.56,APOLLOHOSP:.54,HEROMOTOCO:.51,UPL:.49,BPCL:.43,SHREECEM:.37},BNF={HDFCBANK:27.63,ICICIBANK:22.98,SBIN:11.73,AXISBANK:11.6,KOTAKBANK:11.4,INDUSINDBK:5.03,AUBANK:2.54,BANDHANBNK:1.78,BANKBARODA:1.76,FEDERALBNK:1.76,IDFCFIRSTB:.95,PNB:.84};async function initAnalysis(){let t=await getHeatMapData(),_={NIFTY_WEIGHT_UP:0,NIFTY_WEIGHT_DOWN:0,BNF_WEIGHT_UP:0,BNF_WEIGHT_DOWN:0,NIFTY_UP:0,NIFTY_DOWN:0,BNF_UP:0,BNF_DOWN:0,NIFTY_CNT:0,BNF_CNT:0,NIFTY_UP_PER:0,NIFTY_DOWN_PER:0,BNF_UP_PER:0,BNF_DOWN_PER:0};t.forEach((t,N)=>{var a=t[HEAT_COL_MAP.SECTOR],d=(t[HEAT_COL_MAP.PRICE]-t[HEAT_COL_MAP.OPEN])/t[HEAT_COL_MAP.OPEN]*100;1<N&&"Index Wise"!=a&&(t=t[HEAT_COL_MAP.SYMBOL].trim().toUpperCase(),"NIFTY"==a&&(_.NIFTY_CNT++,0<d?(_.NIFTY_UP++,_.NIFTY_WEIGHT_UP+=NIFTY50[t]*d):d<0&&(_.NIFTY_WEIGHT_DOWN+=NIFTY50[t]*d*-1,_.NIFTY_DOWN++)),"BANKNIFTY"==a&&(_.BNF_CNT++,0<d?(_.BNF_WEIGHT_UP+=BNF[t]*d,_.BNF_UP++):d<0&&(_.BNF_WEIGHT_DOWN+=BNF[t]*d*-1,_.BNF_DOWN++)))}),_.NIFTY_UP_PER=parseFloat(_.NIFTY_WEIGHT_UP/(_.NIFTY_WEIGHT_UP+_.NIFTY_WEIGHT_DOWN)*100).toFixed(2),_.NIFTY_DOWN_PER=parseFloat(_.NIFTY_WEIGHT_DOWN/(_.NIFTY_WEIGHT_UP+_.NIFTY_WEIGHT_DOWN)*100).toFixed(2),_.BNF_UP_PER=parseFloat(_.BNF_WEIGHT_UP/(_.BNF_WEIGHT_UP+_.BNF_WEIGHT_DOWN)*100).toFixed(2),_.BNF_DOWN_PER=parseFloat(_.BNF_WEIGHT_DOWN/(_.BNF_WEIGHT_UP+_.BNF_WEIGHT_DOWN)*100).toFixed(2),console.log(_),$("#index-analysis").empty(),$("#index-analysis").append(`<table class="chips-hawa-analysis-table">
            <thead>
            <tr>
                <td colspan="5">NIFTY50 (${_.NIFTY_CNT})</td>
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
                <td>${_.NIFTY_UP}</td>
                <td>${_.NIFTY_DOWN}</td>
                <td>${parseFloat(_.NIFTY_UP/(_.NIFTY_UP+_.NIFTY_DOWN)*100).toFixed(2)}%</td>
                <td>${parseFloat(_.NIFTY_DOWN/(_.NIFTY_UP+_.NIFTY_DOWN)*100).toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Weight</td>
                <td>${parseFloat(_.NIFTY_WEIGHT_UP).toFixed(2)}</td>
                <td>${parseFloat(_.NIFTY_WEIGHT_DOWN).toFixed(2)}</td>
                <td>${parseFloat(_.NIFTY_UP_PER).toFixed(2)}%</td>
                <td>${parseFloat(_.NIFTY_DOWN_PER).toFixed(2)}%</td>
            </tr>
            </tbody>
        </table>
        <table class="chips-hawa-analysis-table">
            <thead>
            <tr>
                <td colspan="5">BANK NIFTY (${_.BNF_CNT})</td>
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
                <td>${_.BNF_UP}</td>
                <td>${_.BNF_DOWN}</td>
                <td>${parseFloat(_.BNF_UP/(_.BNF_UP+_.BNF_DOWN)*100).toFixed(2)}%</td>
                <td>${parseFloat(_.BNF_DOWN/(_.BNF_UP+_.BNF_DOWN)*100).toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Weight</td>
                <td>${parseFloat(_.BNF_WEIGHT_UP).toFixed(2)}</td>
                <td>${parseFloat(_.BNF_WEIGHT_DOWN).toFixed(2)}</td>
                <td>${parseFloat(_.BNF_UP_PER).toFixed(2)}%</td>
                <td>${parseFloat(_.BNF_DOWN_PER).toFixed(2)}%</td>
            </tr>
            </tbody>
        </table>`)}async function getHeatMapData(){try{var N=location.origin+"/opt/hcharts/stx8req/php/getDataForHeatmap_indexes.php";console.log("HeatMap",N);let t=new FormData;return t.append("rdDataType","latest"),t.append("optSymbol","NIFTY"),t.append("BoxSize","pricechg"),t.append("SelectedType","sectors"),t.append("optExpDate",OPT_EXP_DATE),t.append("dt",TXT_DATE),t.append("sessionID",SESSION_ID),t.append("userName",USER_NAME),(await axios.post(N,t)).data}catch(t){console.log(e)}}if(location.href.endsWith("Heatmap.php")&&"phalvinayak"==USER_NAME){$("body").append(`
        <div id="ichart-utility-buttons">
            <button class="ichart-scan-index mdl-button mdl-button--raised mdl-button--colored">ANALYSE INDEX</button>
        </div>
        <div id="index-analysis"></div>
    `);let N="idle";$(".ichart-scan-index").on("click",async t=>{t.preventDefault(),t.stopPropagation(),"idle"==N&&(console.log("start"),N="running",await initAnalysis(),N="idle",$(".ichart-scan-index").text("ANALYSE INDEX"),console.log("end"))})}