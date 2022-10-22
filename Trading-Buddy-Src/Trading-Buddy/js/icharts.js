const CALL = 'CALL';
const PUT = 'PUT';
const NO_OF_STRIKE = 10;
const SHOW_CHIPS_HAWA = false;
const SHOW_LTP = true;

// Gloabal variables available across the script
let optionChainPrice = {aggr:{CALLHawa: 0, PUTHawa: 0}};
let ticker = 'TICKER';
let strikeDiff = 0;
let priceRange = [0, 0];
let oldOIDiff = 10000000;
let oldOIDiffRange = 10000000;
let columnIndex = {};
let totalColLength = 0;
let strikePriceOrder = {};

// Get the column position based on the columns selected by user
function getColumnPosition() {
	columns = $(`#oc-table-head .rt-tr>div`).length
	if (columnIndex.length && columns == totalColLength) {
		return columnIndex;
	}
	clearChipsHawaLabels();
	totalColLength = columns;
	let cols = {};

	$('#sort_table_wrapper thead tr:nth-child(2) th').each((i,col) => {
        let title = $(col).text().replace(/\s/g, '').toLowerCase();
		if (title.includes('ltp')) {
			if (cols['callCol']) {
				cols['putCol'] = i + 1;
			} else {
				cols['callCol'] = i + 1;
			}
		}
		if (title.includes('strikeprice')) {
			cols['strikeCol'] = i + 1;
		}
		if (title.includes('oichg')) {
			if (cols['callOIChgCol']) {
				cols['putOIChgCol'] = i + 1;
			} else {
				cols['callOIChgCol'] = i + 1;
			}
		}
		if (title.includes('delta')) {
			if (cols['callDelta']) {
				cols['putDelta'] = i + 1;
			} else {
				cols['callDelta'] = i + 1;
			}
		}
		if (title.includes('volume')) {
			if (cols['callVolume']) {
				cols['putVolume'] = i + 1;
			} else {
				cols['callVolume'] = i + 1;
			}
		}
		if (title == 'oi'){
			if (cols['callOI']) {
				cols['putOI'] = i + 1;
			} else {
				cols['callOI'] = i + 1;
			}
		}
	});
	columnIndex = cols;
	return cols;
}

// Function to render the Strike PCR
function udpateStrikePCR(peStrike, ceStrike, $cell) {
	// Updating Percentage Hawa
	if(SHOW_CHIPS_HAWA){
		let pHawa = optionChainPrice[ceStrike]['percentageHawa'];
		if (pHawa == 0) {
			pHawa = optionChainPrice[peStrike]['percentageHawa'];
		}
		if ($cell.find('.chips-hawa-pcr-ratio.p-hawa').length) {
			$cell.find('.chips-hawa-pcr-ratio.p-hawa').text(`${parseFloat(pHawa).toFixed(2)}%`);
		} else {
			$cell.prepend(`<span class='chips-hawa-pcr-ratio p-hawa'>${parseFloat(pHawa).toFixed(2)}%</span>`);
		}
	}

	oiRatio = optionChainPrice[ceStrike]['oiChangeRatio'];
	if($cell.find('.chips-hawa-pcr-ratio.pcr').length){
		$cell.find('.chips-hawa-pcr-ratio.pcr').text(oiRatio);
	} else {
		$cell.append(`<div class='chips-hawa-pcr-ratio pcr'>${oiRatio}</div>`);
	}
}

// Function to get current ticket from the URL
function getTicker() {
	let ticker = $('#optSymbol').val();
	return ticker ? ticker : null;
}

function updateTableHeader(callCol, putCol, strikeCol) {
	$headerRow = $('#sort_table_wrapper thead tr:nth-child(2)');
	if ($headerRow.find('.chips-hawa-price').length == 0) {
		// Call Side Chips Hawa
		SHOW_CHIPS_HAWA && $headerRow.find(`th:nth-child(${callCol})`).prepend(`<span class='chips-hawa-price chips'>CHIPS</span>`);
		SHOW_CHIPS_HAWA && $headerRow.find(`th:nth-child(${callCol})`).append(`<span class='chips-hawa-price hawa'>HAWA</span>`);

		// PUT side Chips Hawa
		SHOW_CHIPS_HAWA && $headerRow.find(`th:nth-child(${putCol})`).prepend(`<span class='chips-hawa-price chips'>CHIPS</span>`);
		SHOW_CHIPS_HAWA && $headerRow.find(`th:nth-child(${putCol})`).append(`<span class='chips-hawa-price hawa'>HAWA</span>`);

		// Strike price column for %Hawa
		$headerRow.find(`th:nth-child(${strikeCol})`).append(`<span class='chips-hawa-price chips-hawa-pcr-ratio pcr'>COI-R</span>`);
		SHOW_CHIPS_HAWA && $headerRow.find(`th:nth-child(${strikeCol})`).prepend(`<span class='chips-hawa-price p-hawa'>%HAWA</span>`);
	}
}

function updateChipsHawa() {
	let currentTicker = getTicker();
	if (!currentTicker || ticker != currentTicker) {
		ticker = currentTicker;
		optionChainPrice = {aggr:{CALLHawa: 0, PUTHawa: 0}};;
		strikeDiff = 0;
		oldOIDiff = 0;
		// return;
	}

	let futPrice = getFuturePrice();
	if (!futPrice) { return; } // No future price can't do anything
	let colPosition = getColumnPosition();
	let strikePair = [0,0];
	updateTableHeader(colPosition.callCol, colPosition.putCol, colPosition.strikeCol);
	$('#sort_table_wrapper tbody tr').each((i, row) => {
		let $row = $(row);
		let $strikeCell = $row.find(`td:nth-child(${colPosition.strikeCol})`);
		let $callCell = $row.find(`td:nth-child(${colPosition.callCol})`);
		let $putCell = $row.find(`td:nth-child(${colPosition.putCol})`);
		let $callOIChgCell = $row.find(`td:nth-child(${colPosition.callOIChgCol})`);
		let $putOIChgCell = $row.find(`td:nth-child(${colPosition.putOIChgCol})`);
		let $callDeltaCell = $row.find(`td:nth-child(${colPosition.callDelta})`);
		let $putDeltaCell = $row.find(`td:nth-child(${colPosition.putDelta})`);
		let $callVolumeCell = $row.find(`td:nth-child(${colPosition.callVolume})`);
		let $putVolumeCell = $row.find(`td:nth-child(${colPosition.putVolume})`);
		let $callOICell = $row.find(`td:nth-child(${colPosition.callOI})`);
		let $putOICell = $row.find(`td:nth-child(${colPosition.putOI})`);

		let strikePrice = $strikeCell.find('a').text().trim();
		strikePrice = parseFloat(strikePrice).toFixed(2);
		let callStrike = `${strikePrice}-${CALL}`;
		let putStrike = `${strikePrice}-${PUT}`;

		strikePriceOrder[i+1] = strikePrice;
		if(parseFloat(strikePrice) < parseFloat(futPrice)){
			strikePair[0] = i+1;
			strikePair[1] = i+2;
		}

		if (!optionChainPrice[callStrike]) {
			optionChainPrice[callStrike] = {};
			optionChainPrice[putStrike] = {};
			optionChainPrice[callStrike]['strike'] = strikePrice;
			optionChainPrice[putStrike]['strike'] = strikePrice;
			optionChainPrice[callStrike]['index'] = i + 1;
			optionChainPrice[putStrike]['index'] = i + 1;
			optionChainPrice[callStrike]['chips'] = -1;
			optionChainPrice[callStrike]['hawa'] = -1;
			optionChainPrice[putStrike]['chips'] = -1;
			optionChainPrice[putStrike]['hawa'] = -1;
		}

		if(SHOW_CHIPS_HAWA && $row.find('span.chips-hawa-price').length == 0) {
			// Initial chips and hawa render
			$callCell.prepend(`<span class='chips-hawa-price chips'>${optionChainPrice[callStrike].chips}</span>`);
			$callCell.append(`<span class='chips-hawa-price hawa'>${optionChainPrice[callStrike].hawa}</span>`);
			$putCell.prepend(`<span class='chips-hawa-price chips'>${optionChainPrice[putStrike].chips}</span>`);
			$putCell.append(`<span class='chips-hawa-price hawa'>${optionChainPrice[putStrike].hawa}</span>`);
		}

		renderAndUpdateGlobalState(strikePrice, futPrice, $callCell, CALL);
		renderAndUpdateGlobalState(strikePrice, futPrice, $putCell, PUT);
		highlightChangeOI(callStrike, putStrike, $callOIChgCell, $putOIChgCell);
		setOIRatio(callStrike, putStrike, $callOICell, $putOICell);
		readColumnValues(callStrike, putStrike, $callDeltaCell, $putDeltaCell, $callVolumeCell, $putVolumeCell);
		udpateStrikePCR(putStrike, callStrike, $strikeCell);

		if(SHOW_LTP){
			$callVolumeCell.off('click').on('click', this, e => {
				e.preventDefault();
				bindVolumeEvent(CALL, strikePrice);
			});
			$putVolumeCell.off('click').on('click', this, e => {
				e.preventDefault();
				bindVolumeEvent(PUT, strikePrice);
			});
		}

		if (!$callOIChgCell.hasClass('chips-hawa-col-event')) {
			$callOIChgCell.addClass('chips-hawa-col-event');
			$putOIChgCell.addClass('chips-hawa-col-event');
		}
		let strStrikePrice = $strikeCell.find('a').text().trim();
		$callOIChgCell.off('click').on('click', this, e => {
			e.preventDefault();
			openPage(`https://options.icharts.in/opt/OptionsMonitor.php?symbol=${encodeURIComponent(ticker)}&strike=${strStrikePrice}`);
		});

		$putOIChgCell.off('click').on('click', this, e => {
			e.preventDefault();
			openPage(`https://options.icharts.in/opt/OptionsMonitor.php?symbol=${encodeURIComponent(ticker)}&strike=${strStrikePrice}`);
		});
	});
	// console.log(optionChainPrice.aggr);
	// renderHawaComparision(optionChainPrice.aggr);

	if(strikePair[1] != 0){
		// Reset the imaginary line and highlighted cells
		$('.chips-hawa-imaginary-line').removeClass('chips-hawa-imaginary-line');
		// Highlight Imaginary line
		$(`#sort_table_wrapper tbody tr:nth-child(${strikePair[1]})`).addClass('chips-hawa-imaginary-line');
	}
}

function openPage(url){
	let win = window.open(url, '_blank');
	if (win) {
		win.focus();
	} else {
		alert('Please allow popups for this website');
	}
}

// Function to bind event on volume
function bindVolumeEvent(optionType, strikePrice){
	// console.log('Listining to the event', strikePrice);
	let currentStrikeKey = `${strikePrice}-${optionType}`;
	let selectedOptionData = optionChainPrice[currentStrikeKey];
	let callStrikeKey = `${selectedOptionData.strike}-CALL`;
	let putStrikeKey = `${strikePriceOrder[selectedOptionData.index - 1]}-PUT`;
	// console.log(callStrikeKey, putStrikeKey);
	let sl = parseFloat(optionChainPrice[putStrikeKey].strike) - 1;
	let type = 'Bearish';
	if(optionType == CALL){
		type = 'Bullish';
		putStrikeKey = `${selectedOptionData.strike}-PUT`;
		callStrikeKey = `${strikePriceOrder[selectedOptionData.index + 1]}-CALL`;
		sl = parseFloat(optionChainPrice[callStrikeKey].strike) + 1;
	}
	if(optionChainPrice[putStrikeKey] && optionChainPrice[callStrikeKey]){
		let callOptionData = optionChainPrice[callStrikeKey];
		let putOptionData = optionChainPrice[putStrikeKey];
		ltpCalculator(type, callOptionData.price, parseFloat(callOptionData.delta), putOptionData.price,
			parseFloat(putOptionData.delta * -1), strikePrice, parseFloat(sl).toFixed(2));
	} else {
		ltpCalculator('error', 0, 0, 0, 0, strikePrice, parseFloat(sl).toFixed(2));
	}
}

function ltpCalculator(type, callPrice, callDelta, putPrice, putDelta, strike, sl){
	// console.log(type, callPrice, callDelta, putPrice, putDelta, strike, sl);
	let output = 0;
	let spotPrice = getFuturePrice();
	if(type == 'error'){
		output = "No Pair Data";
	} else if(type=='Bullish') {
		$('.chips-hawa-ltp-output').addClass('bearish');
		if(parseFloat(putPrice) < parseFloat(callPrice)){
			output = "Breakout";
		} else {
			output = spotPrice + ((parseFloat(putPrice) - parseFloat(callPrice))/(callDelta + putDelta)) + 0.05;
			output = isNumeric(parseFloat(output).toFixed(2)) ? parseFloat(output).toFixed(2) : 'Data Error';
		}
	} else {
		$('.chips-hawa-ltp-output').removeClass('bearish');
		if(parseFloat(callPrice) < parseFloat(putPrice)){
			output = "Breakdown";
		} else {
			output = spotPrice - ((parseFloat(callPrice) - parseFloat(putPrice))/(callDelta + putDelta)) - 0.05;
			output = isNumeric(parseFloat(output).toFixed(2)) ? parseFloat(output).toFixed(2) : 'Data Error';
		}
	}
	$('.ltp-params-item.spot .value').text(spotPrice);
	$('.ltp-params-item.direction .value').text(type);
	$('.ltp-params-item.ce-price .value').text(callPrice);
	$('.ltp-params-item.ce-delta .value').text(callDelta);
	$('.ltp-params-item.pe-price .value').text(putPrice);
	$('.ltp-params-item.pe-delta .value').text(putDelta);
	$('.ltp-params-item.strike .value').text(strike);
	$('.chips-hawa-ltp-output .output-price').text(output);
	$('.chips-hawa-ltp-output .output-sl').text(`SL-${sl}`);
	$('.chips-hawa-overlay').removeClass('hide');
	// console.log(output);
}

// Function to read the data
function readColumnValues(callStrike, putStrike, $callDeltaCell, $putDeltaCell, $callVolumeCell, $putVolumeCell){
	let callVolume = $callVolumeCell.text().trim().replace(/\,/g, '');
	let putVolume = $putVolumeCell.text().trim().replace(/\,/g, '');
	let callDelta = $callDeltaCell.text().trim().replace(/\,/g, '');
	let putDelta = $putDeltaCell.text().trim().replace(/\,/g, '');
	optionChainPrice[callStrike]['volume'] = callVolume;
	optionChainPrice[callStrike]['delta'] = callDelta;
	optionChainPrice[putStrike]['volume'] = putVolume;
	optionChainPrice[putStrike]['delta'] = putDelta;
	if (SHOW_LTP && !$callVolumeCell.hasClass('chips-hawa-col-event')) {
		$callVolumeCell.addClass('chips-hawa-col-event');
		$putVolumeCell.addClass('chips-hawa-col-event');
	}
}

// Function to upate chips hawa state and UI
function renderAndUpdateGlobalState(strikePrice, futPrice, $cell, opType) {
	let price = $cell.find('a').text().trim().replace(/\,/g, '');
	[chips, hawa] = getChipsHawa(futPrice, strikePrice, price, opType);
	let strike = `${strikePrice}-${opType}`;
	if (SHOW_CHIPS_HAWA && (optionChainPrice[strike].chips !== chips || optionChainPrice[strike].hawa !== hawa)) {
		$cell.find('span.chips-hawa-price.chips').text(chips);
		$cell.find('span.chips-hawa-price.hawa').text(hawa);
	}
	optionChainPrice[strike]['price'] = price;
	optionChainPrice[strike]['chips'] = chips;
	optionChainPrice[strike]['hawa'] = hawa;
	if (chips != 0) {
		optionChainPrice[strike]['percentageHawa'] = (hawa / price) * 100;
	} else {
		optionChainPrice[strike]['percentageHawa'] = 0;
	}
	
	optionChainPrice.aggr[`${opType}Hawa`] += parseFloat(hawa)
}

function renderHawaComparision(aggr){
	$('#sort_table_wrapper tfoot tr:nth-child(1) th:nth-child(6)').text('CE-Hawa');
	$('#sort_table_wrapper tfoot tr:nth-child(1) th:nth-child(8)').text('PE-Hawa');
	$('#sort_table_wrapper tfoot tr:nth-child(2) th:nth-child(6)').text(parseFloat(aggr.CALLHawa).toFixed(0));
	$('#sort_table_wrapper tfoot tr:nth-child(2) th:nth-child(8)').text(parseFloat(aggr.PUTHawa).toFixed(0));
}

// Getting future price
function getFuturePrice() {
	let choice = $("input[name=chips-hawa-asset-price]:checked").val();
	if (choice == 'future') {
		if ($('#FuturesData div span>span:nth-child(1)').length) {
			return parseFloat($('#FuturesData div span>span:nth-child(1)').text().trim());
		}
	} else {
		if ($('#FuturesData div span>span:nth-child(1)').length) {
			return parseFloat($('#SpotPriceData div span:nth-child(2)').text().trim());
		}
	}
	return false;
}

// Function to calculate Chips and Hawa
// Returns [Chips, HAWA] in array format
function getChipsHawa(futPrice, strikePrice, optionPrice, optionType) {
	let hawa = 0;
	let chips = 0;
	if (optionPrice == 0 || optionPrice === 'NaN') {
		return [chips, hawa];
	}

	if (optionType === CALL) {
		if (strikePrice < futPrice) {
			chips = futPrice - strikePrice;
			hawa = optionPrice - chips;
		} else {
			hawa = optionPrice;
		}
	} else if (optionType === PUT) {
		if (strikePrice > futPrice) {
			chips = strikePrice - futPrice;
			hawa = optionPrice - chips;
		} else {
			hawa = optionPrice;
		}
	}
	chips = parseFloat(chips).toFixed(2);
	hawa = parseFloat(hawa).toFixed(2);
	return [chips, hawa];
}

// Function to remove the chips hawa from the page.
function clearChipsHawaLabels() {
	$('#oc-table-body span.chips-hawa-price').remove();
	$('#oc-table-body span.chips-hawa-pcr-ratio').remove();
	optionChainPrice = {aggr:{CALLHawa: 0, PUTHawa: 0}};
}

function isNumeric(str) {
	if (typeof str != 'string') return false // we only process strings!  
	return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		   !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

// Highlight Open OI columns
function highlightChangeOI(callStrike, putStrike, $callOIChgCell, $putOIChgCell) {
	let callOIChange = $callOIChgCell.text().trim().replace(/\,/g, '');
	let putOIChange = $putOIChgCell.text().trim().replace(/\,/g, '');
	callOIChange = isNumeric(callOIChange) ? parseInt(callOIChange, 10) : 0;
	putOIChange = isNumeric(putOIChange) ? parseInt(putOIChange, 10) : 0;
	optionChainPrice[callStrike]['oiChange'] = callOIChange;
	optionChainPrice[putStrike]['oiChange'] = putOIChange;
	let OIChangeRatio = '';

	if(callOIChange > 0 && putOIChange > 0){
		if(callOIChange > putOIChange){
			OIChangeRatio = `${getRatio(callOIChange, putOIChange)} :: 1`;
		} else {
			OIChangeRatio = `1 :: ${getRatio(putOIChange, callOIChange)}`;
		}
	} else if(callOIChange < 0 && putOIChange < 0){
		if(callOIChange > putOIChange){
			OIChangeRatio = OIChangeRatio = `1 :: ${getRatio(putOIChange*-1, callOIChange*-1)}`;
		} else {
			OIChangeRatio = `${getRatio(callOIChange*-1, putOIChange*-1)} :: 1`;
		}
	} else {
		OIChangeRatio = `∞`;
	}
	optionChainPrice[callStrike]['oiChangeRatio'] = OIChangeRatio;
	optionChainPrice[putStrike]['oiChangeRatio'] = OIChangeRatio;

	if (!$callOIChgCell.hasClass('chips-hawa-OI-change')) {
		$callOIChgCell.addClass('chips-hawa-OI-change');
		$putOIChgCell.addClass('chips-hawa-OI-change');
	}
}

function setOIRatio(callStrike, putStrike, $callOICell, $putOICell) {
	let callOI = $callOICell.find('div').text().trim().replace(/\,/g, '');
	let putOI = $putOICell.find('div').text().trim().replace(/\,/g, '');
	callOI = isNumeric(callOI) ? parseInt(callOI, 10) : 0;
	putOI = isNumeric(putOI) ? parseInt(putOI, 10) : 0;
	optionChainPrice[callStrike]['oi'] = callOI;
	optionChainPrice[putStrike]['oi'] = putOI;
	let OIRatio = '';
	if(callOI > 0 && putOI > 0){
		if(callOI > putOI){
			OIRatio = `${getRatio(callOI, putOI)} :: 1`;
		} else {
			OIRatio = `1 :: ${getRatio(putOI, callOI)}`;
		}
	} else {
		OIRatio = `∞`;
	}
	$callOICell.addClass('chips-hawa-tooltip');
	$putOICell.addClass('chips-hawa-tooltip');
	if($callOICell.find('.chips-hawa-tooltip-content').length){
		$callOICell.find('.chips-hawa-tooltip-content').text(`OI Ratio: ${OIRatio}`);
		$putOICell.find('.chips-hawa-tooltip-content').text(`OI Ratio: ${OIRatio}`);
	} else {
		$callOICell.append(`<p class="chips-hawa-tooltip-content oi-ratio">OI Ratio: ${OIRatio}</p>`);	
		$putOICell.append(`<p class="chips-hawa-tooltip-content oi-ratio">OI Ratio: ${OIRatio}</p>`);	
	}
	optionChainPrice[callStrike]['oiRatio'] = OIRatio;
	optionChainPrice[putStrike]['oiRatio'] = OIRatio;
}

function getRatio(num1, num2){
	let ratio = parseFloat(num1/num2).toFixed(1);
	return parseInt(ratio) == ratio ? parseInt(ratio) : ratio;
}

function initUI() {
	if(location.href.endsWith("OptionChain.php")){
		if ($('li.chips-hawa-asset-price-option').length == 0) {
			$('#main-menu').append(
				`<li class="telegramclass chips-hawa-asset-price-option">
					<div>Asset Price Option</div>
					<label><input type="radio" name="chips-hawa-asset-price" id="chips-hawa-fut" value="future" checked>Future</label>
					<label><input type="radio" name="chips-hawa-asset-price" id="chips-hawa-spot" value="spot">Spot</label>
				</li>`
			);
		}
	}

	$('body').append(`
		<div class="chips-hawa-overlay ichart hide">
			<div class="chips-hawa-ltp-content">
				<h4>LTP Calculator</h4>
				<div class="chips-hawa-ltp-body chips-hawa-clearfix">
					<div class="chips-hawa-ltp-params">
						<div class="ltp-params-item spot">
							<span class="key">Spot : </span>
							<span class="value"></span>
						</div>
						<div class="ltp-params-item direction">
							<span class="key">Direction : </span>
							<span class="value"></span>
						</div>
						<div class="ltp-params-item ce-price">
							<span class="key">CE Ltp : </span>
							<span class="value"></span>
						</div>
						<div class="ltp-params-item ce-delta">
							<span class="key">CE Delta : </span>
							<span class="value"></span>
						</div>
						<div class="ltp-params-item pe-price">
							<span class="key">PE Ltp : </span>
							<span class="value"></span>
						</div>
						<div class="ltp-params-item pe-delta">
							<span class="key">PE Delta : </span>
							<span class="value"></span>
						</div>
						<div class="ltp-params-item strike">
							<span class="key">Strike : </span>
							<span class="value"></span>
						</div>
					</div>
					<div class="chips-hawa-ltp-output">
						<span class="output-price">--</span>
						<span class="output-sl">--</span>
					</div>
				</div>
			</div>
		</div>
	`);

	$('.chips-hawa-overlay').on('click', e => {
		e.preventDefault();
		e.stopPropagation();
		$('.chips-hawa-overlay').addClass('hide');
	});

	$('.chips-hawa-ltp-content').on('click', e => {
		e.preventDefault();
		e.stopPropagation(); // Do nothing on clicking on the content box
	});
}

function main() {
	initUI();
	updateChipsHawa();

	// Dom event change trigger to re-render the calculations
	$('#diffoichange').bind("DOMSubtreeModified", updateChipsHawa);
	// setInterval(() => {
	// 	updateChipsHawa();
	// }, 1000);
}

if(location.href.endsWith("OptionChain.php")){
	main();
}

// iCharts updating OI selection based on the strike price in URL
function updateOIStrike(){
	const address = window.location.href;
	const url = new URL(address);
	if(address.includes('OptionsMonitor.php')){
		const strike = url.searchParams.get("strike");
		const symbol = url.searchParams.get("symbol");
		if(strike){
			$('#optSymbol').val(symbol).change();
			$('#optCallStrike, #optPutStrike').append(`<option value="${strike}">${strike}</option>`);
			$('#optCallStrike').val(strike).change();
			$('#optPutStrike').val(strike).change();
			history.pushState({}, null, url.pathname);
			$('button[name=btnSubmit]').trigger('click');
		}
	}
}

$(() => {
	updateOIStrike();

	// Global events
	$('body').on('mouseenter', '.chips-hawa-tooltip', e => {
        $(e.target).closest('td').find('.chips-hawa-tooltip-content').show();
    }).on('mouseleave', '.chips-hawa-tooltip', e => {
        $(e.target).closest('td').find('.chips-hawa-tooltip-content').hide();
    });
});