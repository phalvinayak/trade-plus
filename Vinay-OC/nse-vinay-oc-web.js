//download.js v4.21, by dandavis; 2008-2018. [MIT] see http://danml.com/download.html for tests/usage
;(function(root,factory){typeof define=="function"&&define.amd?define([],factory):typeof exports=="object"?module.exports=factory():root.download=factory()})(this,function(){return function download(data,strFileName,strMimeType){var self=window,defaultMime="application/octet-stream",mimeType=strMimeType||defaultMime,payload=data,url=!strFileName&&!strMimeType&&payload,anchor=document.createElement("a"),toString=function(a){return String(a)},myBlob=self.Blob||self.MozBlob||self.WebKitBlob||toString,fileName=strFileName||"download",blob,reader;myBlob=myBlob.call?myBlob.bind(self):Blob,String(this)==="true"&&(payload=[payload,mimeType],mimeType=payload[0],payload=payload[1]);if(url&&url.length<2048){fileName=url.split("/").pop().split("?")[0],anchor.href=url;if(anchor.href.indexOf(url)!==-1){var ajax=new XMLHttpRequest;return ajax.open("GET",url,!0),ajax.responseType="blob",ajax.onload=function(e){download(e.target.response,fileName,defaultMime)},setTimeout(function(){ajax.send()},0),ajax}}if(/^data:([\w+-]+\/[\w+.-]+)?[,;]/.test(payload)){if(!(payload.length>2096103.424&&myBlob!==toString))return navigator.msSaveBlob?navigator.msSaveBlob(dataUrlToBlob(payload),fileName):saver(payload);payload=dataUrlToBlob(payload),mimeType=payload.type||defaultMime}else if(/([\x80-\xff])/.test(payload)){var i=0,tempUiArr=new Uint8Array(payload.length),mx=tempUiArr.length;for(i;i<mx;++i)tempUiArr[i]=payload.charCodeAt(i);payload=new myBlob([tempUiArr],{type:mimeType})}blob=payload instanceof myBlob?payload:new myBlob([payload],{type:mimeType});function dataUrlToBlob(strUrl){var parts=strUrl.split(/[:;,]/),type=parts[1],indexDecoder=strUrl.indexOf("charset")>0?3:2,decoder=parts[indexDecoder]=="base64"?atob:decodeURIComponent,binData=decoder(parts.pop()),mx=binData.length,i=0,uiArr=new Uint8Array(mx);for(i;i<mx;++i)uiArr[i]=binData.charCodeAt(i);return new myBlob([uiArr],{type:type})}function saver(url,winMode){if("download"in anchor)return anchor.href=url,anchor.setAttribute("download",fileName),anchor.className="download-js-link",anchor.innerHTML="downloading...",anchor.style.display="none",anchor.addEventListener("click",function(e){e.stopPropagation(),this.removeEventListener("click",arguments.callee)}),document.body.appendChild(anchor),setTimeout(function(){anchor.click(),document.body.removeChild(anchor),winMode===!0&&setTimeout(function(){self.URL.revokeObjectURL(anchor.href)},250)},66),!0;if(/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent))return/^data:/.test(url)&&(url="data:"+url.replace(/^data:([\w\/\-\+]+)/,defaultMime)),window.open(url)||confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")&&(location.href=url),!0;var f=document.createElement("iframe");document.body.appendChild(f),!winMode&&/^data:/.test(url)&&(url="data:"+url.replace(/^data:([\w\/\-\+]+)/,defaultMime)),f.src=url,setTimeout(function(){document.body.removeChild(f)},333)}if(navigator.msSaveBlob)return navigator.msSaveBlob(blob,fileName);if(self.URL)saver(self.URL.createObjectURL(blob),!0);else{if(typeof blob=="string"||blob.constructor===toString)try{return saver("data:"+mimeType+";base64,"+self.btoa(blob))}catch(y){return saver("data:"+mimeType+","+encodeURIComponent(blob))}reader=new FileReader,reader.onload=function(e){saver(this.result)},reader.readAsDataURL(blob)}return!0}});

// const fs = require('fs');
// const obj = JSON.parse(fs.readFileSync('./option-chain-equities.json', 'utf8'));
const EXP_DATE = '24-Feb-2022';
const WEAK_THEASHOLD = 20;

async function writeSupportResistance(symbol, index) {
	let oiChain = await getIOData(symbol);
	// console.log(oiChain);
	if(oiChain.records){
		let spotPrice = oiChain.records.underlyingValue;
		let imaginaryStrikePair = getImaginoryLinePair(oiChain.records.strikePrices, spotPrice);
		let oiPerExpiry = getOIPerExpiry(oiChain);
		let expSupportResistance = {};
		let logLine = `${index},${symbol},${spotPrice}`;
		// oiChain.records.expiryDates.forEach(date => {
			sr = getSupportResistanc(oiPerExpiry[EXP_DATE], imaginaryStrikePair, oiChain.records.strikePrices, EXP_DATE, spotPrice);
			expSupportResistance[EXP_DATE] = sr;
			let perChangeSupport = parseFloat((spotPrice-sr.support)/spotPrice * 100).toFixed(2);
			let perChangeResistance = parseFloat((spotPrice-sr.resistance)/spotPrice * 100).toFixed(2);
			logLine += `,${EXP_DATE},${sr.support},${sr.eos},${sr.supportStrength},${sr.resistance},${sr.eor},${sr.resistanceStrength},${perChangeSupport},${perChangeResistance},${sr.peZeroCounter},${sr.peOIChangeCounter},${sr.ceZeroCounter},${sr.ceOIChangeCounter},${sr.buyRating},${sr.sellRating}`;
		// });
		// console.log(expSupportResistance);
		// console.log(logLine);
		return logLine;
	}
	return ',,,,,,,,';
}

function getIOData(scrip) {
	// return obj;
	return $.get(`https://www.nseindia.com/api/option-chain-equities?symbol=${encodeURIComponent(scrip)}`);
}

function getImaginoryLinePair(strikePrices, spotPrice) {
	strikePair = [0, 0];
	strikePrices.some((strikePrice, i) => {
		if (parseFloat(spotPrice) < parseFloat(strikePrice)) {
			strikePair[0] = { index: i - 1, strike: strikePrices[i - 1] };
			strikePair[1] = { index: i, strike: strikePrices[i] };
			return true
		}
		return false;
	});
	// console.log(strikePair);
	return strikePair;
}

// Function to group the data by expiry
function getOIPerExpiry(oiData) {
	let oiFormatted = {};
	// oiData.records.expiryDates.forEach(date => {
		oiFormatted[EXP_DATE] = {};
	// });

	let prevStrike = 0;
	let prevCEPrice = 0;
	let prevPEPrice = 0;
	oiData.records.data.forEach(oiDataItem => {
		if(EXP_DATE === oiDataItem.expiryDate){
			let index = oiData.records.strikePrices.indexOf(oiDataItem.strikePrice);
			let callKey = `${oiDataItem.strikePrice}-CE`;
			if (oiDataItem.CE) {
				oiFormatted[oiDataItem.expiryDate][callKey] = {
					'strikePrice': oiDataItem.CE.strikePrice,
					'openInterest': oiDataItem.CE.openInterest,
					'changeinOpenInterest': oiDataItem.CE.changeinOpenInterest,
					'lastPrice': oiDataItem.CE.lastPrice,
					'totalTradedVolume': oiDataItem.CE.totalTradedVolume,
					'delta': calculateDelta(prevStrike, oiDataItem.strikePrice, prevCEPrice, oiDataItem.CE.lastPrice),
					index
				}
				prevCEPrice = oiDataItem.CE.lastPrice;
			} else {
				oiFormatted[oiDataItem.expiryDate][callKey] = {
					'strikePrice': oiDataItem.strikePrice,
					'openInterest': 0,
					'changeinOpenInterest': 0,
					'lastPrice': 0,
					'totalTradedVolume': 0,
					'delta': 1,
					index
				}
				prevCEPrice = 0;
			}
			let putKey = `${oiDataItem.strikePrice}-PE`;
			if (oiDataItem.PE) {
				oiFormatted[oiDataItem.expiryDate][putKey] = {
					'strikePrice': oiDataItem.PE.strikePrice,
					'openInterest': oiDataItem.PE.openInterest,
					'changeinOpenInterest': oiDataItem.PE.changeinOpenInterest,
					'lastPrice': oiDataItem.PE.lastPrice,
					'totalTradedVolume': oiDataItem.PE.totalTradedVolume,
					'delta': calculateDelta(prevStrike, oiDataItem.strikePrice, prevPEPrice, oiDataItem.PE.lastPrice),
					index
				}
				prevPEPrice = oiDataItem.PE.lastPrice;
			} else {
				oiFormatted[oiDataItem.expiryDate][putKey] = {
					'strikePrice': oiDataItem.strikePrice,
					'openInterest': 0,
					'changeinOpenInterest': 0,
					'lastPrice': 0,
					'totalTradedVolume': 0,
					'delta': 1,
					index
				}
				prevPEPrice = 0;
			}
			prevStrike = oiDataItem.strikePrice;
		}
	});
	return oiFormatted;
}

// Calculate delta for the given strike and price difference
function calculateDelta(prevStrike, currStrike, prevPrice, currPrice){
	let strikeDiff = currStrike - prevStrike;
	let premiumDiff = prevPrice - currPrice;
	let delta = premiumDiff / strikeDiff;
	// console.log(prevStrike, currStrike, prevPrice, currPrice, Math.round(delta * 10000) / 10000);
	return Math.round(delta * 10000) / 10000;
}

// Function to get support resistance from imaginary lines
function getSupportResistanc(oiChainData, imgStrikePair, strikePrices, date, spotPrice) {
	// Get Support
	let callStrikeKey = `${strikePrices[imgStrikePair[0].index]}-CE`;
	let putStrikeKey = `${strikePrices[imgStrikePair[0].index]}-PE`;
	let resistanceArr = [];
	let peZeroCounter = 0;
	let peOIChangeCounter = 0;
	let ceZeroCounter = 0;
	let ceOIChangeCounter = 0;
	let counter = 1;
	for (let i = imgStrikePair[0].index; i < strikePrices.length; i++) {
		if (oiChainData[callStrikeKey] && oiChainData[putStrikeKey]) {
			resistanceArr.push({
				strike: oiChainData[callStrikeKey].strikePrice,
				oi: oiChainData[callStrikeKey].openInterest,
				volume: oiChainData[callStrikeKey].totalTradedVolume,
				index: oiChainData[callStrikeKey].index,
				strength: oiChainData[callStrikeKey].totalTradedVolume + oiChainData[callStrikeKey].openInterest + oiChainData[callStrikeKey].changeinOpenInterest
			});
			// Count zero's for the PE side ATM strikes
			if(oiChainData[putStrikeKey].lastPrice == 0){
				peZeroCounter++;
			}
			// Count the OI change -VE strike counts
			if(oiChainData[putStrikeKey].changeinOpenInterest < 0){
				peOIChangeCounter++;
			}
			// console.log('Put Strikes checked ', putStrikeKey, peZeroCounter, peOIChangeCounter);
			callStrikeKey = `${strikePrices[i + 1]}-CE`;
			putStrikeKey = `${strikePrices[i + 1]}-PE`;
		}
		
		if (++counter == 10) { break; }
	}
	// Need to handle possible 3 scenario, both volume and OI present well and good
	// Any one of them is present still ok
	// None of the strike present simply return the ATM strike

	putStrikeKey = `${strikePrices[imgStrikePair[1].index]}-PE`;
	callStrikeKey = `${strikePrices[imgStrikePair[1].index]}-CE`;
	let supportsArr = [];
	counter = 1;
	for (let i = imgStrikePair[1].index; i >= 0; i--) {
		if (oiChainData[putStrikeKey]) {
			supportsArr.push({
				strike: oiChainData[putStrikeKey].strikePrice,
				oi: oiChainData[putStrikeKey].openInterest,
				volume: oiChainData[putStrikeKey].totalTradedVolume,
				index: oiChainData[putStrikeKey].index,
				strength: oiChainData[putStrikeKey].totalTradedVolume + oiChainData[putStrikeKey].openInterest + oiChainData[putStrikeKey].changeinOpenInterest
			});
			// Count zero's for the PE side ATM strikes
			if(oiChainData[callStrikeKey].lastPrice == 0){
				ceZeroCounter++;
			}
			// Count the OI change -VE strike counts
			if(oiChainData[callStrikeKey].changeinOpenInterest < 0){
				ceOIChangeCounter++;
			}
			// console.log('Call Strikes checked ', callStrikeKey, ceZeroCounter, ceOIChangeCounter);
			putStrikeKey = `${strikePrices[i - 1]}-PE`;
			callStrikeKey = `${strikePrices[i - 1]}-CE`;
		}
		// Count zero's for the apposite side
		if(++counter == 10) { break; }
	}

	let support = imgStrikePair[0].strike;
	let resistance = imgStrikePair[1].strike;
	let eor = 0;
	let eos = 0;
	let resistanceStrength = 'N/A';
	let supportStrength = 'N/A';
	let buyRating = '0-STAR';
	let sellRating = '0-STAR';
	if(supportsArr.length > 2 && resistanceArr.length > 2){
		// Finding Support 
		sortByKey(supportsArr, 'volume');
		let maxVol = supportsArr[0].strike;
		sortByKey(supportsArr, 'oi');
		let maxOI = supportsArr[0].strike;
		support = Math.max(maxVol, maxOI);

		// Finding Resistance 
		sortByKey(resistanceArr, 'volume');
		maxVol = resistanceArr[0].strike;
		sortByKey(resistanceArr, 'oi');
		maxOI = resistanceArr[0].strike;
		resistance = Math.min(maxVol, maxOI);
		
		callStrikeKey = `${support}-CE`;
		putStrikeKey = `${strikePrices[oiChainData[callStrikeKey].index - 1]}-PE`;
		if (oiChainData[callStrikeKey] && oiChainData[putStrikeKey]) {
			eos = ltpCalculator('Bearish', oiChainData[callStrikeKey].lastPrice, oiChainData[callStrikeKey].delta, oiChainData[putStrikeKey].lastPrice, oiChainData[putStrikeKey].delta, spotPrice);
		}

		putStrikeKey = `${resistance}-PE`;
		callStrikeKey = `${strikePrices[oiChainData[putStrikeKey].index + 1]}-CE`;
		if (oiChainData[callStrikeKey] && oiChainData[putStrikeKey]) {
			eor = ltpCalculator('Bullish', oiChainData[callStrikeKey].lastPrice, oiChainData[callStrikeKey].delta, oiChainData[putStrikeKey].lastPrice, oiChainData[putStrikeKey].delta, spotPrice);
		}

		// Checking weak support and weak resistance
		supportStrength = checkForWeakSR(supportsArr, 'support', support);
		resistanceStrength = checkForWeakSR(resistanceArr, 'resistance', resistance);
	}
	// console.log(supportsArr, resistanceArr);
	// Logic for Bullish Rating Criteria
	let buyPoints = 5;
	// 1. Support should be strong OR weak towards top
	if(supportStrength === 'S-STRONG' || supportStrength === 'S-W.T.T'){
		buyPoints--;
	}
	// 2. Less no of Zero's in ITM calls compared to ITM PUT
	if((peZeroCounter - ceZeroCounter) >= 3){
		buyPoints--;
	}
	// 3. Resistance should be strong or weak towards top
	if(resistanceStrength === 'R-STRONG' || resistanceStrength === 'R-W.T.T'){
		buyPoints--;
	}
	// 4. CE OI changes are -ve more compared to Pe OI changes
	if(ceOIChangeCounter > peOIChangeCounter){
		buyPoints--;
	}
	buyRating = `${buyPoints}-STAR`;

	// Analyze Bearish rating
	let sellPoints = 5;
	// 1. Support should be strong OR weak towards top
	if(resistanceStrength === 'R-STRONG' || resistanceStrength === 'R-W.T.B'){
		sellPoints--;
	}
	// 2. Less no of Zero's in ITM calls compared to ITM PUT
	if((ceZeroCounter - peZeroCounter) >= 3){
		sellPoints--;
	}
	// 3. Resistance should be strong or weak towards top
	if(supportStrength === 'S-STRONG' || supportStrength === 'S-W.T.B'){
		sellPoints--;
	}
	// 4. CE OI changes are -ve more compared to Pe OI changes
	if(peOIChangeCounter > ceOIChangeCounter){
		sellPoints--;
	}
	sellRating = `${sellPoints}-STAR`;
	return { resistance, support, eor, eos, supportStrength, resistanceStrength, peZeroCounter, ceZeroCounter, peOIChangeCounter, ceOIChangeCounter, buyRating, sellRating }
}

// Calculate the Extension of support/resistance 
function ltpCalculator(type, callPrice, callDelta, putPrice, putDelta, spotPrice) {
	// console.log('INPUT LTP calculator', type, callPrice, callDelta, putPrice, putDelta, spotPrice);
	let output = 0;
	if (type == 'error') {
		output = "No Pair Data";
	} else if (type == 'Bullish') {
		if (parseFloat(putPrice) < parseFloat(callPrice)) {
			output = "Breakout";
		} else {
			output = spotPrice + ((parseFloat(putPrice) - parseFloat(callPrice)) / (callDelta + Math.abs(putDelta))) + 0.05;
			output = isNumeric(parseFloat(output).toFixed(2)) ? parseFloat(output).toFixed(2) : 'Data Error';
		}
	} else {
		if (parseFloat(callPrice) < parseFloat(putPrice)) {
			output = "Breakdown";
		} else {
			output = spotPrice - ((parseFloat(callPrice) - parseFloat(putPrice)) / (callDelta + Math.abs(putDelta))) - 0.05;
			output = isNumeric(parseFloat(output).toFixed(2)) ? parseFloat(output).toFixed(2) : 'Data Error';
		}
	}
	return output;
}

function isNumeric(str) {
	if (typeof str != 'string') return false // we only process strings!  
	return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function sortByKey(array, key) {
	return array.sort((a, b) => b[key] - a[key]);
}

function checkForWeakSR(array, type, sr){
	// 1. Get the highest and second highest support and compare % wise
	// 2. Get the highest and second highest resistance and compare % wise
	srItem = array.filter(item => item.strike === sr)[0];
	let sr2Item = {};
	sortByKey(array, 'strength');
	let sr1 = srItem.strength;
	let sr2 = 0;
	if(array[0].strike == srItem.strike){
		sr2 = array[1].strength;
		sr2Item = array[1];
	} else {
		sr2 = array[0].strength;
		sr2Item = array[0];
	}
	// console.log(array);
	// console.log(srItem, sr2Item);
	if(sr2 >= sr1){
		if(type == 'support'){
			if(srItem.index > sr2Item.index){
				return 'S-W.T.B';
			} else {
				return 'S-W.T.T';
			}
		} else {
			if(srItem.index < sr2Item.index){
				return 'R-W.T.T';
			} else {
				return 'R-W.T.B';
			}
		}
	}
	let diff = Math.abs(sr1-sr2)/Math.max(sr1, sr2) * 100;
	// console.log('Strength Diff: ', sr1, sr2, diff);
	if(diff < WEAK_THEASHOLD){
		if(type == 'support'){
			if(srItem.index > sr2Item.index){
				return 'S-W.T.B';
			} else {
				return 'S-W.T.T';
			}
		} else {
			if(srItem.index < sr2Item.index){
				return 'R-W.T.T';
			} else {
				return 'R-W.T.B';
			}
		}
	} else {
		if(type == 'support'){
			return 'S-STRONG';
		} else {
			return 'R-STRONG';
		}
	}
}

function getDateTime() {
	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	var day = now.getDate();
	var hour = now.getHours();
	var minute = now.getMinutes();
	if (month.toString().length == 1) {
		month = `0${month}`;
	}
	if (day.toString().length == 1) {
		day = `0${day}`;
	}
	if (hour.toString().length == 1) {
		hour = `0${hour}`;
	}
	if (minute.toString().length == 1) {
		minute = `0${minute}`;
	}
	return `${year}-${month}-${day}@${hour}${minute}`;
}

async function main() {
	let scrips = ["AARTIIND", "ABBOTINDIA", "ABCAPITAL", "ABFRL", "ACC", "ADANIENT", "ADANIPORTS", "ALKEM", "AMARAJABAT", "AMBUJACEM", "APLLTD", "APOLLOHOSP", "APOLLOTYRE", "ASHOKLEY", "ASIANPAINT", "ASTRAL", "ATUL",
		"AUBANK", "AUROPHARMA", "AXISBANK", "BAJAJ-AUTO", "BAJAJFINSV", "BAJFINANCE", "BALKRISIND", "BALRAMCHIN", "BANDHANBNK", "BANKBARODA", "BATAINDIA", "BEL", "BERGEPAINT", "BHARATFORG",
		"BHARTIARTL", "BHEL", "BIOCON", "BOSCHLTD", "BPCL", "BRITANNIA", "BSOFT", "CADILAHC", "CANBK", "CANFINHOME", "CHAMBLFERT", "CHOLAFIN", "CIPLA", "COALINDIA", "COFORGE", "COLPAL", "CONCOR", "COROMANDEL",
		"CROMPTON", "CUB", "CUMMINSIND", "DABUR", "DALBHARAT", "DEEPAKNTR", "DELTACORP", "DIVISLAB", "DIXON", "DLF", "DRREDDY", "EICHERMOT", "ESCORTS", "EXIDEIND", "FEDERALBNK", "FSL", "GAIL", "GLENMARK",
		"GMRINFRA", "GNFC", "GODREJCP", "GODREJPROP", "GRANULES", "GRASIM", "GSPL", "GUJGASLTD", "HAL", "HAVELLS", "HCLTECH", "HDFC", "HDFCAMC", "HDFCBANK", "HDFCLIFE", "HEROMOTOCO", "HINDALCO", "HINDCOPPER",
		"HINDPETRO", "HINDUNILVR", "HONAUT", "IBULHSGFIN", "ICICIBANK", "ICICIGI", "ICICIPRULI", "IDEA", "IDFC", "IDFCFIRSTB", "IEX", "IGL", "INDHOTEL", "INDIACEM", "INDIAMART", "INDIGO", "INDUSINDBK",
		"INDUSTOWER", "INFY", "IOC", "IPCALAB", "IRCTC", "ITC", "JINDALSTEL", "JKCEMENT", "JSWSTEEL", "JUBLFOOD", "KOTAKBANK", "L&TFH", "LALPATHLAB", "LAURUSLABS", "LICHSGFIN", "LT", "LTI", "LTTS", "LUPIN",
		"M&M", "M&MFIN", "MANAPPURAM", "MARICO", "MARUTI", "MCDOWELL-N", "MCX", "METROPOLIS", "MFSL", "MGL", "MINDTREE", "MOTHERSUMI", "MPHASIS", "MRF", "MUTHOOTFIN", "NAM-INDIA", "NATIONALUM", "NAUKRI",
		"NAVINFLUOR", "NBCC", "NESTLEIND", "NMDC", "NTPC", "OBEROIRLTY", "OFSS", "ONGC", "PAGEIND", "PEL", "PERSISTENT", "PETRONET", "PFC", "PFIZER", "PIDILITIND", "PIIND", "PNB", "POLYCAB", "POWERGRID",
		"PVR", "RAIN", "RAMCOCEM", "RBLBANK", "RECLTD", "RELIANCE", "SAIL", "SBICARD", "SBILIFE", "SBIN", "SHREECEM", "SIEMENS", "SRF", "SRTRANSFIN", "STAR", "SUNPHARMA", "SUNTV", "SYNGENE", "TATACHEM",
		"TATACOMM", "TATACONSUM", "TATAMOTORS", "TATAPOWER", "TATASTEEL", "TCS", "TECHM", "TITAN", "TORNTPHARM", "TORNTPOWER", "TRENT", "TVSMOTOR", "UBL", "ULTRACEMCO", "UPL", "VEDL", "VOLTAS", "WHIRLPOOL",
		"WIPRO", "ZEEL"];
	let index = 0;
	let scrips1 = ['AXISBANK'];
	let csvString = `Si.No,Symbol,CMP,ExpDate,Support,ExtOfSupport,SupportStrength,Resistance,ExtOfResistance,ResistanceStrength,%ChangeSupport,%ChangeResistance,PeZero,PeOIChange,CeZero,CeOIChange,BuyRating,SellRating\n`;
	for(scrip of scrips){
		let output = await writeSupportResistance(scrip, ++index);
		csvString += `${output}\n`;
	};
	// console.log(csvString);
	download(csvString, `OIAnalysis${getDateTime()}.csv`, "text/plain");
}

main();