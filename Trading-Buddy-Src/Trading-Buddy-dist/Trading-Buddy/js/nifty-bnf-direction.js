const OPT_EXP_DATE=$("#optExpDate").val(),USER_NAME=$("#userName").val(),SESSION_ID=$("#sessionID").val(),TXT_DATE=$("#BoxSize").next().text().match(new RegExp('dt="(.*)";'))[1],HEAT_COL_MAP={SYMBOL:0,SECTOR:1,PRICE_CHANGE:6,PREV_CLOSE:4,PRICE:5,OPEN:8,LOW:9,HIGH:10},NIFTY50={RELIANCE:" 10.84",HDFCBANK:"8.27",ICICIBANK:"7.94",INFY:"6.84",HDFC:"5.48",TCS:"4.07",ITC:"3.86",KOTAKBANK:"3.53",HINDUNILVR:"3.18",LT:"2.95",SBIN:"2.69",BHARTIARTL:"2.59",BAJFINANCE:"2.58",AXISBANK:"2.56",ASIANPAINT:"1.99","M&M":"1.60",MARUTI:"1.55",TITAN:"1.44",SUNPHARMA:"1.35",BAJAJFINSV:"1.34",HCLTECH:"1.30",ADANIENT:"1.25",TATASTEEL:"1.06",INDUSINDBK:"1.02",NTPC:"1.00",TATAMOTORS:"0.96",POWERGRID:"0.96",ULTRACEMCO:"0.95",NESTLEIND:"0.90",TECHM:"0.84",GRASIM:"0.83",CIPLA:"0.80",JSWSTEEL:"0.79",ADANIPORTS:"0.78",WIPRO:"0.77",HINDALCO:"0.75",SBILIFE:"0.74",DRREDDY:"0.70",EICHERMOT:"0.68",HDFCLIFE:"0.66",ONGC:"0.65",TATACONSUM:"0.64",DIVISLAB:"0.62","BAJAJ-AUTO":"0.60",BRITANNIA:"0.60",COALINDIA:"0.59",APPOLOHOSP:"0.59",UPL:"0.47",HEROMOTOCO:"0.44",BPCL:"0.38"},BNF={HDFCBANK:"26.00",ICICIBANK:"24.97",KOTAKBANK:"11.11",AXISBANK:"10.93",SBIN:"10.87",INDUSINDBK:"6.17",AUBANK:"2.34",BANKBARODA:"1.97",FEDERALBNK:"1.90",BANDHANBNK:"1.61",IDFCFIRSTB:"1.24",PNB:"0.87"};async function initAnalysis(){let t=await getHeatMapData(),_={NIFTY_WEIGHT_UP:0,NIFTY_WEIGHT_DOWN:0,BNF_WEIGHT_UP:0,BNF_WEIGHT_DOWN:0,NIFTY_UP:0,NIFTY_DOWN:0,BNF_UP:0,BNF_DOWN:0,NIFTY_CNT:0,BNF_CNT:0,NIFTY_UP_PER:0,NIFTY_DOWN_PER:0,BNF_UP_PER:0,BNF_DOWN_PER:0};t.forEach((t,N)=>{var a=t[HEAT_COL_MAP.SECTOR],d=(t[HEAT_COL_MAP.PRICE]-t[HEAT_COL_MAP.OPEN])/t[HEAT_COL_MAP.OPEN]*100;1<N&&"Index Wise"!=a&&(t=t[HEAT_COL_MAP.SYMBOL].trim().toUpperCase(),"NIFTY"==a&&(_.NIFTY_CNT++,0<d?(_.NIFTY_UP++,_.NIFTY_WEIGHT_UP+=NIFTY50[t]*d):d<0&&(_.NIFTY_WEIGHT_DOWN+=NIFTY50[t]*d*-1,_.NIFTY_DOWN++)),"BANKNIFTY"==a&&(_.BNF_CNT++,0<d?(_.BNF_WEIGHT_UP+=BNF[t]*d,_.BNF_UP++):d<0&&(_.BNF_WEIGHT_DOWN+=BNF[t]*d*-1,_.BNF_DOWN++)))}),_.NIFTY_UP_PER=parseFloat(_.NIFTY_WEIGHT_UP/(_.NIFTY_WEIGHT_UP+_.NIFTY_WEIGHT_DOWN)*100).toFixed(2),_.NIFTY_DOWN_PER=parseFloat(_.NIFTY_WEIGHT_DOWN/(_.NIFTY_WEIGHT_UP+_.NIFTY_WEIGHT_DOWN)*100).toFixed(2),_.BNF_UP_PER=parseFloat(_.BNF_WEIGHT_UP/(_.BNF_WEIGHT_UP+_.BNF_WEIGHT_DOWN)*100).toFixed(2),_.BNF_DOWN_PER=parseFloat(_.BNF_WEIGHT_DOWN/(_.BNF_WEIGHT_UP+_.BNF_WEIGHT_DOWN)*100).toFixed(2),console.log(_),$("#index-analysis").empty(),$("#index-analysis").append(`<table class="chips-hawa-analysis-table">
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
        </table>`)}async function getHeatMapData(){try{var N=location.origin+"/opt/hcharts/stx8req/php/getDataForHeatmap_indexes.php";console.log("HeatMap",N);let t=new FormData;return t.append("rdDataType","latest"),t.append("optSymbol","NIFTY"),t.append("BoxSize","pricechg"),t.append("SelectedType","sectors"),t.append("optExpDate",OPT_EXP_DATE),t.append("dt",TXT_DATE),t.append("sessionID",SESSION_ID),t.append("userName",USER_NAME),(await axios.post(N,t)).data}catch(t){console.log(e)}}if(location.href.endsWith("Heatmap.php")&&"akabhijeet"==USER_NAME){$("body").append(`
        <div id="ichart-utility-buttons">
            <button class="ichart-scan-index mdl-button mdl-button--raised mdl-button--colored">ANALYSE INDEX</button>
        </div>
        <div id="index-analysis"></div>
    `);let N="idle";$(".ichart-scan-index").on("click",async t=>{t.preventDefault(),t.stopPropagation(),"idle"==N&&(console.log("start"),N="running",await initAnalysis(),N="idle",$(".ichart-scan-index").text("ANALYSE INDEX"),console.log("end"))})}