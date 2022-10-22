let RESP_OBJ = JSON.parse(`{"sEcho":1,"iTotalRecords":21,"iTotalDisplayRecords":21,"aaData":[["-","-","-","0.0000","0.0000","0.0000","0.0000","-","0.00","-",null,null,"-","0.00",null,null,null,"1980","0.00","0.70","0.10","0.10","-","750","12500",0,"0.00","-","0.0000","0.0000","0.0000","0.0000","-","-","27-Jul-2022_15:27:23","-","-"],["-","-","28-Jul-2022_12:09:41","0.0000","0.0000","0.0000","0.0000","-","0.00",0,"500","250","11.15","179.85","179.85","188.15","192.40","2000","0.05","0.15","0.09","0.05","-0.10","30000","284000",-9250,"169.47","104.42","0.0000","0.0000","0.0000","0.0000","568.00","120.00","28-Jul-2022_12:06:20","Bullish","LU"],["-","-","-","0.0000","0.0000","0.0000","0.0000","-","0.00","-",null,null,"-","0.00",null,null,null,"2020","0.05","0.25","0.14","0.05","-0.05","4500","21750",-3500,"130.57","72.08","0.0000","0.0000","0.0000","0.0000","-","-","28-Jul-2022_11:28:45","Bullish","LU"],["-","-","-","0.0000","0.0000","0.0000","0.0000","-","0.00","-",null,null,"-","0.00",null,null,null,"2040","0.05","0.25","0.05","0.05","-0.10","750","33500",-500,"0.00","-","0.0000","0.0000","0.0000","0.0000","-","-","28-Jul-2022_12:08:08","Bullish","LU"],["-","-","-","0.0000","0.0000","0.0000","0.0000","-","0.00","-",null,null,"-","0.00",null,null,null,"2060","0.05","0.15","0.08","0.05","-0.15","15250","43750",-8000,"110.96","61.63","0.0000","0.0000","0.0000","0.0000","-","-","28-Jul-2022_11:46:31","Bullish","LU"],["-","-","28-Jul-2022_12:09:41","0.0000","0.0000","0.0000","0.0000","-","0.00",0,"1750","500","5.00","110.95","105.45","108.30","113.40","2080","0.10","0.30","0.15","0.30","0.15","3250","31250",-1000,"107.93","67.23","0.0000","0.0000","0.0000","0.0000","17.86","6.50","28-Jul-2022_12:06:41","Bearish","SC"],["LU","Bearish","28-Jul-2022_12:09:59","0.0000","0.0000","0.0000","1.0000","14.15","89.90",-1750,"21250","2000","-12.70","79.80","80.25","86.05","91.30","2100","0.00","0.05","0.05","0.05","-0.05","7750","204750",-4250,"72.16","42.54","0.0000","0.0000","0.0000","0.0000","9.64","3.88","28-Jul-2022_12:05:58","Bullish","LU"],["LU","Bearish","28-Jul-2022_12:09:59","0.0000","-0.0002","0.0000","1.0000","26.66","79.68",-500,"36250","1000","-3.45","66.70","63.48","65.90","71.25","2120","0.00","0.05","0.05","0.05","-0.10","4000","67000",-2250,"43.54","16.80","-0.0002","0.0001","-0.0327","0.0005","1.85","4.00","28-Jul-2022_12:08:09","Bullish","LU"],["LU","Bearish","28-Jul-2022_12:09:59","0.0002","-0.0206","0.0000","0.9999","28.75","65.86",-2500,"35250","13500","-0.85","48.50","48.10","45.90","51.20","2140","0.00","0.05","0.05","0.05","-0.15","22750","141500",-13750,"48.20","28.65","-0.0023","0.0004","-0.4452","0.0032","4.01","1.69","28-Jul-2022_12:05:12","Bullish","LU"],["SC","Bullish","28-Jul-2022_12:09:41","0.0150","-1.6810","0.0025","0.9864","-8.24","29.24",-6000,"37000","9000","0.45","32.30","23.41","28.50","31.05","2160","0.00","0.05","0.16","0.05","-0.55","46500","313500",-2500,"20.98","5.10","-0.0499","0.0071","-3.7261","0.0526","8.47","5.17","28-Jul-2022_12:09:41","Bullish","LU"],["LU","Bearish","28-Jul-2022_12:09:56","0.1359","-16.3479","0.0216","0.7533","3.20","26.50",-7000,"32500","65000","-1.60","12.70","9.18","12.00","13.95","2180","2.50","3.15","3.93","3.20","-0.40","65250","67000",-14750,"38.25","21.66","-0.2318","0.0223","-14.7613","0.1314","2.06","1.00","28-Jul-2022_12:09:41","Bullish","LU"],["LU","Bearish","28-Jul-2022_12:09:41","0.1472","-22.2326","0.0190","0.2921","19.40","46.19",-50000,"295000","244250","-3.00","4.20","3.08","3.80","4.30","2200","12.95","15.25","17.19","13.95","-2.65","22250","55000",-3750,"41.71","11.34","-0.7675","0.0224","-14.7855","0.1316","0.19","0.09","28-Jul-2022_12:09:41","Bullish","LU"],["LU","Bearish","28-Jul-2022_12:09:41","0.0172","-1.9865","0.0029","0.0160","14.86","42.69",-36000,"46500","86250","-2.60","0.30","0.60","0.25","0.30","2220","28.15","31.50","36.70","29.40","-12.60","2250","6500",-1750,"62.47","-30.42","-0.9845","0.0027","-1.6091","0.0188","0.14","0.03","28-Jul-2022_12:09:41","Bullish","LU"],["LU","Bearish","28-Jul-2022_12:09:41","0.0002","-0.0278","0.0000","0.0001","25.21","58.95",-17500,"37750","37250","-1.05","0.25","0.31","0.25","0.30","2240","24.50","54.15","51.25","48.10","-","2000","2250",0,"0.00","-","0.0000","0.0000","0.0000","0.0000","0.06","0.05","27-Jul-2022_15:29:58","-","-"],["LU","Bearish","28-Jul-2022_12:09:18","0.0000","-0.0001","0.0000","0.0000","26.37","63.78",-5750,"27500","16250","-0.40","0.20","0.23","0.15","0.35","2260","44.15","77.35","70.20","70.20","-","250","500",-250,"0.00","-","0.0000","0.0000","0.0000","0.0000","0.02","0.02","22-Jul-2022_15:29:54","-","-"],["LU","Bearish","28-Jul-2022_11:29:08","0.0000","0.0000","0.0000","0.0000","31.95","74.92",-250,"7750","2000","-0.45","0.10","0.11","0.10","2.00","2280",null,null,null,"0.00","-",null,null,"-","0.00","-","0.0000","0.0000","0.0000","0.0000","-","-","-","-","-"],["LU","Bearish","28-Jul-2022_12:09:18","0.0000","0.0000","0.0000","0.0000","60.57","109.34",-19500,"68250","24750","-0.20","0.25","0.15","0.20","0.30","2300","107.20","114.70","111.00","111.00","-","250","2250",250,"0.00","-","0.0000","0.0000","0.0000","0.0000","0.03","0.01","27-Jul-2022_15:29:58","-","-"],["LU","Bearish","28-Jul-2022_12:09:41","0.0000","0.0000","0.0000","0.0000","45.75","100.54",-3500,"20250","3750","-0.25","0.20","0.14","0.10","0.20","2320",null,null,null,"0.00","-",null,null,"-","0.00","-","0.0000","0.0000","0.0000","0.0000","-","-","-","-","-"],["LU","Bearish","28-Jul-2022_12:09:41","0.0000","0.0000","0.0000","0.0000","-","0.00",-500,"13500","1000","-0.30","0.10","0.11","0.10","0.40","2340",null,null,null,"0.00","-",null,null,"-","0.00","-","0.0000","0.0000","0.0000","0.0000","-","-","-","-","-"],["-","-","18-Jul-2022_15:29:58","0.0000","0.0000","0.0000","0.0000","-","0.00",0,"2250","1000","-","0.70","0.85","0.05","0.70","2360",null,null,null,"0.00","-",null,null,"-","0.00","-","0.0000","0.0000","0.0000","0.0000","-","-","-","-","-"],["LU","Bearish","28-Jul-2022_11:56:15","0.0000","0.0000","0.0000","0.0000","67.48","146.68",-9000,"35000","16000","-0.30","0.05","0.11","0.00","0.05","2400","183.25","215.80","221.00","221.00","-","500","250",0,"0.00","-","0.0000","0.0000","0.0000","0.0000","0.01","0.03","27-Jul-2022_15:29:58","-","-"]],"strikePriceATM":"2180.00","futuresPriceStr":"ACC-28JUL22 Futures Closing Price: <b>2,189.85<\/b> (As of 28-Jul-2022 12:09)","symbol_1":"ACC","optExpDate":"28JUL22","monthlyExpDate":"28JUL22","dt":"2022-07-28","futuresClosingPrice":"2,189.85","TimeStamp":"28-Jul-2022 12:09","futures_close_chg":"-1.15","futures_close_chg_percent":"-0.05","maxcalloi":"295000","mincalloi":"500","maxputoi":"313500","minputoi":"250","maxoichangecall":0,"minoichangecall":-50000,"maxoichangeput":250,"minoichangeput":-14750,"maxcallvol":"244250","maxputvol":"65250","total_call_oi":718250,"total_put_oi":1287250,"total_call_oi_change":-159750,"total_put_oi_change":-65250,"total_call_volume":523750,"total_put_volume":228250,"diffoichange":94500,"lot_size":"250","defaultDatedMY":"28-Jul-2022"}`);
const WEAK_THEASHOLD = 20;
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


async function getIOData(scrip) {
	return RESP_OBJ;
	// let url = `${location.origin}/opt/OptionChainTable.php?txtDate=${TXT_DATE}&optSymbol=${encodeURIComponent(symbol)}&optExpDate=${OPT_EXP_DATE}&dType=${D_TYPE}&striketype=mainstrikes&SymbType=${SYMB_TYPE}&sessionID=${SESSION_ID}&userName=${USER_NAME}`;
    // let response = await axios.post(url, {});
    // return response;
}

function getImaginoryLinePair(strikePrices, futPrice) {
	strikePair = [0, 0];
	strikePrices.some((strikePrice, i) => {
		if (parseFloat(futPrice) < parseFloat(strikePrice)) {
			strikePair[0] = { index: i - 1, strike: parseFloat(strikePrices[i - 1]).toFixed(2) };
			strikePair[1] = { index: i, strike: parseFloat(strikePrices[i]).toFixed(2) };
			return true
		}
		return false;
	});
	// console.log(strikePair);
	return strikePair;
}

function getOIDataObj(oiChain){
    oiChainObj = {}
    oiChain.aaData.forEach((data, index) => {
        let strikePrice = parseFloat(data[COL_MAP.STRIKE_PRICE]).toFixed(2);
        let callKey = `${strikePrice}-CE`;
        let putKey = `${strikePrice}-PE`;
        oiChainObj[callKey] = {
            strikePrice,
            'openInterest': data[COL_MAP.CALL_OI],
            'changeinOpenInterest': data[COL_MAP.CALL_OI_CHANGE],
            'lastPrice': data[COL_MAP.CE_LTP],
            'delta': data[COL_MAP.CE_DELTA],
            index
        }
        oiChainObj[putKey] = {
            strikePrice,
            'openInterest': data[COL_MAP.PUT_OI],
            'changeinOpenInterest': data[COL_MAP.PUT_OI_CHANGE],
            'lastPrice': data[COL_MAP.PE_LTP],
            'delta': data[COL_MAP.PE_DELTA],
            index
        }
    });
    return oiChainObj;
}

// Function to get support resistance from imaginary lines
function getSupportResistanc(oiChainData, imgStrikePair, strikePrices, futPrice) {
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
		support = parseFloat(Math.max(maxVol, maxOI)).toFixed(2);

		// Finding Resistance 
		sortByKey(resistanceArr, 'volume');
		maxVol = resistanceArr[0].strike;
		sortByKey(resistanceArr, 'oi');
		maxOI = resistanceArr[0].strike;
		resistance = parseFloat(Math.min(maxVol, maxOI)).toFixed(2);
		
		callStrikeKey = `${support}-CE`;
		putStrikeKey = `${strikePrices[oiChainData[callStrikeKey].index - 1]}-PE`;
		if (oiChainData[callStrikeKey] && oiChainData[putStrikeKey]) {
			eos = ltpCalculator('Bearish', oiChainData[callStrikeKey].lastPrice, oiChainData[callStrikeKey].delta, oiChainData[putStrikeKey].lastPrice, oiChainData[putStrikeKey].delta, futPrice);
		}

		putStrikeKey = `${resistance}-PE`;
		callStrikeKey = `${strikePrices[oiChainData[putStrikeKey].index + 1]}-CE`;
		if (oiChainData[callStrikeKey] && oiChainData[putStrikeKey]) {
			eor = ltpCalculator('Bullish', oiChainData[callStrikeKey].lastPrice, oiChainData[callStrikeKey].delta, oiChainData[putStrikeKey].lastPrice, oiChainData[putStrikeKey].delta, futPrice);
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
function ltpCalculator(type, callPrice, callDelta, putPrice, putDelta, futPrice) {
	// console.log('INPUT LTP calculator', type, callPrice, callDelta, putPrice, putDelta, spotPrice);
	let output = 0;
	if (type == 'error') {
		output = "No Pair Data";
	} else if (type == 'Bullish') {
		if (parseFloat(putPrice) < parseFloat(callPrice)) {
			output = "Breakout";
		} else {
			output = futPrice + ((parseFloat(putPrice) - parseFloat(callPrice)) / (callDelta + Math.abs(putDelta))) + 0.05;
			output = isNumeric(parseFloat(output).toFixed(2)) ? parseFloat(output).toFixed(2) : 'Data Error';
		}
	} else {
		if (parseFloat(callPrice) < parseFloat(putPrice)) {
			output = "Breakdown";
		} else {
			output = futPrice - ((parseFloat(callPrice) - parseFloat(putPrice)) / (callDelta + Math.abs(putDelta))) - 0.05;
			output = isNumeric(parseFloat(output).toFixed(2)) ? parseFloat(output).toFixed(2) : 'Data Error';
		}
	}
	return output;
}

function sortByKey(array, key) {
	return array.sort((a, b) => b[key] - a[key]);
}

function isNumeric(str) {
	if (typeof str != 'string') return false // we only process strings!  
	return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
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

async function getSupportResistance(scrip){
    let oiChain = await getIOData(scrip);
    let strikePriceArr = oiChain.aaData.map(data => parseFloat(data[COL_MAP.STRIKE_PRICE]).toFixed(2));
    let futPrice = parseFloat(oiChain.futuresClosingPrice.replace(',', '')).toFixed(2);
    let imaginaryStrikePair = getImaginoryLinePair(strikePriceArr, futPrice);
    let oiDataObj = getOIDataObj(oiChain);
    // console.log(futPrice);
    // console.log(strikePriceArr);
    // console.log(oiDataObj);
    // console.log(imaginaryStrikePair);
    sr = getSupportResistanc(oiDataObj, imaginaryStrikePair, strikePriceArr, futPrice);
	sr.symbol = scrip;
    sr.futPrice = futPrice;
    // sr.expiry = OPT_EXP_DATE;
    // console.log(sr);
    return sr;
}
async function main(){
    let scrips1 = ['AXISBANK'];
    let outputArr = [];
	for(scrip of scrips1){
		outputArr.push(await getSupportResistance(scrip));
	};
    console.log(outputArr);
};

main();