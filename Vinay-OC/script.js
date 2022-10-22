const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('./option-chain-equities.json', 'utf8'));
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
			sr = getSupportResistanc(oiPerExpiry[EXP_DATE], imaginaryStrikePair, oiChain.records.strikePrices, spotPrice);
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
	return obj;
	// return $.get(`https://www.nseindia.com/api/option-chain-equities?symbol=${encodeURIComponent(scrip)}`);
	// return $.get(`https://www.nseindia.com/api/option-chain-equities?symbol=HINDCOPPER`);
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

function calculateDelta(prevStrike, currStrike, prevPrice, currPrice){
	let strikeDiff = currStrike - prevStrike;
	let premiumDiff = prevPrice - currPrice;
	let delta = premiumDiff / strikeDiff;
	// console.log(prevStrike, currStrike, prevPrice, currPrice, Math.round(delta * 10000) / 10000);
	return Math.round(delta * 10000) / 10000;
}

// Function to get support resistance from imaginary lines
function getSupportResistanc(oiChainData, imgStrikePair, strikePrices, spotPrice) {
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
				strength: oiChainData[callStrikeKey].totalTradedVolume + oiChainData[callStrikeKey].openInterest + oiChainData[callStrikeKey].changeinOpenInterest,
				delta: oiChainData[callStrikeKey].delta
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
				strength: oiChainData[putStrikeKey].totalTradedVolume + oiChainData[putStrikeKey].openInterest + oiChainData[putStrikeKey].changeinOpenInterest,
				delta: oiChainData[putStrikeKey].delta
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
	console.log('INPUT LTP calculator', type, callPrice, callDelta, putPrice, putDelta, spotPrice);
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
	let scrips1 = ['NAM-INDIA'];
	let csvString = `Si.No,Symbol,CMP,ExpDate,Support,ExtOfSupport,SupportStrength,Resistance,ExtOfResistance,ResistanceStrength,%ChangeSupport,%ChangeResistance,PeZero,PeOIChange,CeZero,CeOIChange,BuyRating,SellRating\n`;
	for(scrip of scrips1){
		let output = await writeSupportResistance(scrip, ++index);
		csvString += `${output}\n`;
	};
	console.log(csvString);
	// download(csvString, `OIAnalysis${getDateTime()}.csv`, "text/plain");
}

main();