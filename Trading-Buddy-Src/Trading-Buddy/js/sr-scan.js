const WEAK_THEASHOLD = 20;

async function getOIData(scrip) {
	// return RESP_OBJ;
	// let url = `${location.origin}/opt/OptionChainTable.php?txtDate=${TXT_DATE}&optSymbol=${encodeURIComponent(scrip)}&optExpDate=${OPT_EXP_DATE}&dType=${D_TYPE}&striketype=mainstrikes&SymbType=${SYMB_TYPE}&sessionID=${SESSION_ID}&userName=${USER_NAME}`;
	let url = `${location.origin}/opt/OptionChainTable.php?txtDate=${TXT_DATE}&optSymbol=${encodeURIComponent(scrip)}&optExpDate=25AUG22&dType=${D_TYPE}&striketype=mainstrikes&SymbType=${SYMB_TYPE}&sessionID=${SESSION_ID}&userName=${USER_NAME}`;
    let response = await axios.post(url, {});
    return response.data;
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
				index: oiChainData[callStrikeKey].index,
				strength: oiChainData[callStrikeKey].openInterest
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
				index: oiChainData[putStrikeKey].index,
				strength: oiChainData[putStrikeKey].openInterest
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
		sortByKey(supportsArr, 'oi');
		support = supportsArr[0].strike;

		// Finding Resistance 
		sortByKey(resistanceArr, 'oi');
		resistance = resistanceArr[0].strike;
		
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
	if(peOIChangeCounter > ceOIChangeCounter){
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
	if(ceOIChangeCounter > peOIChangeCounter){
		sellPoints--;
	}
	sellRating = `${sellPoints}-STAR`;
	return { resistance, support, eor, eos, supportStrength, resistanceStrength, peZeroCounter, ceZeroCounter, peOIChangeCounter, ceOIChangeCounter, buyRating, sellRating }
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

async function getSupportResistance(scrip){
    let oiChain = await getOIData(scrip);
    let strikePriceArr = oiChain.aaData.map(data => parseFloat(data[COL_MAP.STRIKE_PRICE]).toFixed(2));
    let futPrice = parseFloat(oiChain.futuresClosingPrice.replace(',', '')).toFixed(2);
    let imaginaryStrikePair = getImaginoryLinePair(strikePriceArr, futPrice);
    let oiDataObj = getOIDataObj(oiChain);
    // console.log(futPrice);
    // console.log(strikePriceArr);
    // console.log(oiDataObj);
    // console.log(imaginaryStrikePair);
    sr = getSupportResistanc(oiDataObj, imaginaryStrikePair, strikePriceArr, futPrice);
    sr.perChangeSupport = parseFloat((futPrice-sr.support)/futPrice * 100).toFixed(2);
	sr.perChangeResistance = parseFloat((futPrice-sr.resistance)/futPrice * 100).toFixed(2);
	sr.symbol = scrip;
    sr.futPrice = futPrice;
    sr.expiry = OPT_EXP_DATE;
    // console.log(sr);
    return sr;
}

async function analyseSupportResistance(){
    let scrips = ['AARTIIND','ABB','ABBOTINDIA','ABCAPITAL','ABFRL','ACC','ADANIENT','ADANIPORTS','ALKEM','AMARAJABAT','AMBUJACEM',
        'APOLLOHOSP','APOLLOTYRE','ASHOKLEY','ASIANPAINT','ASTRAL','ATUL','AUBANK','AUROPHARMA','AXISBANK','BAJAJ-AUTO','BAJAJFINSV',
        'BAJFINANCE','BALKRISIND','BALRAMCHIN','BANDHANBNK','BANKBARODA','BATAINDIA','BEL','BERGEPAINT','BHARATFORG','BHARTIARTL',
        'BHEL','BIOCON','BOSCHLTD','BPCL','BRITANNIA','BSOFT','CANBK','CANFINHOME','CHAMBLFERT','CHOLAFIN','CIPLA','COALINDIA',
        'COFORGE','COLPAL','CONCOR','COROMANDEL','CROMPTON','CUB','CUMMINSIND','DABUR','DALBHARAT','DEEPAKNTR','DELTACORP','DIVISLAB',
        'DIXON','DLF','DRREDDY','EICHERMOT','ESCORTS','EXIDEIND','FEDERALBNK','FSL','GAIL','GLENMARK','GMRINFRA','GNFC','GODREJCP',
        'GODREJPROP','GRANULES','GRASIM','GSPL','GUJGASLTD','HAL','HAVELLS','HCLTECH','HDFC','HDFCAMC','HDFCBANK','HDFCLIFE','HEROMOTOCO',
        'HINDALCO','HINDCOPPER','HINDPETRO','HINDUNILVR','HONAUT','IBULHSGFIN','ICICIBANK','ICICIGI','ICICIPRULI','IDEA','IDFC',
        'IDFCFIRSTB','IEX','IGL','INDHOTEL','INDIACEM','INDIAMART','INDIGO','INDUSINDBK','INDUSTOWER','INFY','INTELLECT','IOC','IPCALAB',
        'IRCTC','ITC','JINDALSTEL','JKCEMENT','JSWSTEEL','JUBLFOOD','KOTAKBANK','L&TFH','LALPATHLAB','LAURUSLABS','LICHSGFIN','LT','LTI',
        'LTTS','LUPIN','M&M','M&MFIN','MANAPPURAM','MARICO','MARUTI','MCDOWELL-N','MCX','METROPOLIS','MFSL','MGL','MINDTREE','MOTHERSON',
        'MOTHERSUMI','MPHASIS','MRF','MUTHOOTFIN','NAM-INDIA','NATIONALUM','NAUKRI','NAVINFLUOR','NBCC','NESTLEIND','NMDC','NTPC',
        'OBEROIRLTY','OFSS','ONGC','PAGEIND','PEL','PERSISTENT','PETRONET','PFC','PIDILITIND','PIIND','PNB','POLYCAB','POWERGRID',
        'PVR','RAIN','RAMCOCEM','RBLBANK','RECLTD','RELIANCE','SAIL','SBICARD','SBILIFE','SBIN','SHREECEM','SIEMENS','SRF','SRTRANSFIN',
        'SUNPHARMA','SUNTV','SYNGENE','TATACHEM','TATACOMM','TATACONSUM','TATAMOTORS','TATAPOWER','TATASTEEL','TCS','TECHM','TITAN',
        'TORNTPHARM','TORNTPOWER','TRENT','TVSMOTOR','UBL','ULTRACEMCO','UPL','VEDL','VOLTAS','WHIRLPOOL','WIPRO','ZEEL'];
    // let scrips1 = ['AXISBANK'];
    let outputArr = [];
    let counter = 0;
	for(scrip of scrips){
		outputArr.push(await getSupportResistance(scrip));
        $('.ichart-sr-scan').text(`Screening ${++counter} of ${scrips.length}`);
	};
    renderSRTable(outputArr);
}

function renderSRTable(outputArr){
    if(!outputArr){ return }
    if($('#option-SR-scan_wrapper').length){
        $('#option-SR-scan').DataTable().clear().destroy();
    }
    $('body').append(`<table id="option-SR-scan" class="display" width="100%"></table>`);
    // Rendering it into the table
    console.log(outputArr);
    $('#option-SR-scan').DataTable({
        data: outputArr,
        filter: true,
        searching: true,
        "iDisplayLength": 25,
        columns: [
            { 
                data: 'symbol',
                title: 'EQ Symbol',
                searchable: true
            },
            {
                data: 'futPrice',
                title: 'Future Price',
                searchable: false
            },
            {
                data: 'expiry',
                title: 'Expiry Date',
                searchable: false
            },
            { 
                data: 'buyRating',
                title: "Buy Rating",
                searchable: false
            },
            { 
                data: 'sellRating',
                title: "Sell Rating",
                searchable: false
            },
            {
                data: 'support',
                title: 'Support',
                searchable: false
            },
            {
                data: 'eos',
                title: 'EOS',
                searchable: false
            },
            { 
                data: 'supportStrength',
                title: 'Support Strength',
                searchable: false
            },
            { 
                data: 'resistance',
                title: 'Resistance',
                searchable: false
            },
            {
                data: 'eor',
                title: 'EOR',
                searchable: false
            },
            { 
                data: 'resistanceStrength',
                title: 'Resistance Strength',
                searchable: false
            },
            {
                data: 'perChangeSupport',
                title: "% Chg Support",
                searchable: false
            },
            {
                data: 'perChangeResistance',
                title: "% Chg Resistance",
                searchable: false
            },
            {
                data: 'ceZeroCounter',
                title: "CeZeros",
                searchable: false
            },
            {
                data: 'peZeroCounter',
                title: "PeZeros",
                searchable: false
            },
            { 
                data: 'ceOIChangeCounter',
                title: "Ce OI Change Cnt",
                searchable: false
            },
            {
                data: 'peOIChangeCounter',
                title: "Pe OI Change Cnt",
                searchable: false
            }
        ]
    });
}