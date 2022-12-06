// Author Vinayak Phal
// How to setup script
// https://developer.chrome.com/docs/devtools/javascript/snippets/
const CALL = 'CALL';
const PUT = 'PUT';
const NO_OF_STRIKE = 10;
const HIGHLIGHT_STRIKE = 5;
const SHOW_LTP = true;

// Gloabal variables available across the script
let viewMode = "ltp";
let optionChainPrice = {};
let ticker = 'TICKER';
let strikeDiff = 0;
let priceRange = [0, 0];
let highlightStrike = [0, 0];
let oldOIDiff = 10000000;
let oldOIDiffRange = 10000000;
let columnIndex = {};
let totalColLength = 0;
let strikePriceOrder = {};

function updateChipsHawa() {
	let currentTicker = getTicker();
	if (!currentTicker || ticker != currentTicker) {
		ticker = currentTicker;
		optionChainPrice = {};
		strikeDiff = 0;
		oldOIDiff = 0;
		return;
	}

	let futPrice = getFuturePrice();
	if (!futPrice) { return; } // No future price can't do anything

	let { callCol, putCol, strikeCol, callOICol, putOICol } = getColumnPosition();
	updateTableHeader(callCol, putCol, strikeCol);
	if (strikeDiff === 0) {
		strikeDiff = getStrikeDiff(strikeCol);
		let atmStrike = $('#current-atm-row').find(`div.rt-td:nth-child(${strikeCol})`).find('span').text().trim();
		atmStrike = parseInt(atmStrike);
		priceRange[0] = atmStrike - (NO_OF_STRIKE * strikeDiff);
		priceRange[1] = atmStrike + (NO_OF_STRIKE * strikeDiff);

		highlightStrike[0] = atmStrike - (HIGHLIGHT_STRIKE * strikeDiff);
		highlightStrike[1] = atmStrike + (HIGHLIGHT_STRIKE * strikeDiff);
	}

	let ceOISum = 0;
	let peOISum = 0;
	let ceOISumRange = 0;
	let peOISumRange = 0;
	// console.log('Updating chips & hawa...');

	// Chearing the highlighted rows
	$('.chips-hawa-highlight').removeClass('chips-hawa-highlight');

	// Iterate over the rows
	$('#oc-table-body div.rt-tr-group').each((i, row) => {
		let chips = 0;
		let hawa = 0;
		let $row = $(row);
		let $strikeCell = $row.find(`.rt-tr div.rt-td:nth-child(${strikeCol})`);
		let $callCell = $row.find(`.rt-tr div.rt-td:nth-child(${callCol})`);
		let $putCell = $row.find(`.rt-tr div.rt-td:nth-child(${putCol})`);
		let $callOICell = $row.find(`.rt-tr div.rt-td:nth-child(${callOICol})`);
		let $putOICell = $row.find(`.rt-tr div.rt-td:nth-child(${putOICol})`);

		// Get Strike price from DOM
		let strikePrice = $strikeCell.find('span').text().trim();
		strikePrice = parseInt(strikePrice);
		let callStrike = `${strikePrice}-${CALL}`;
		let putStrike = `${strikePrice}-${PUT}`;
		if (!optionChainPrice[callStrike]) {
			optionChainPrice[callStrike] = {};
			optionChainPrice[putStrike] = {};
			optionChainPrice[callStrike]['chips'] = -1;
			optionChainPrice[callStrike]['hawa'] = -1;
			optionChainPrice[putStrike]['chips'] = -1;
			optionChainPrice[putStrike]['hawa'] = -1;
			optionChainPrice[callStrike]['oi'] = 0;
			optionChainPrice[putStrike]['oi'] = 0;
			optionChainPrice[callStrike]['pcr'] = '0';
			optionChainPrice[putStrike]['pcr'] = '0';
		}

		if ($row.find('div.chips-hawa-price').length == 0) {
			// Initial chips and hawa render
			$callCell.prepend(`<div class='chips-hawa-price chips'>${chips}</div>`);
			$callCell.append(`<div class='chips-hawa-price hawa'>${hawa}</div>`);
			$putCell.prepend(`<div class='chips-hawa-price chips'>${chips}</div>`);
			$putCell.append(`<div class='chips-hawa-price hawa'>${hawa}</div>`);
		}

		// Get Call Price of the same option
		let cePrice = $callCell.find('.MuiBox-root').text().split(' ')[0];
		cePrice = parseFloat(cePrice).toFixed(2);

		// Get Put Price of the same option
		let pePrice = $putCell.find('.MuiBox-root').text().split(' ')[0];
		pePrice = parseFloat(pePrice).toFixed(2);

		// Get OI values from the cell
		let ceOI = $callOICell.find(`div[class*='style__OiprogressBarValue']`).text().trim();
		let peOI = $putOICell.find(`div[class*='style__OiprogressBarValue']`).text().trim();

		// Paiting Call option chips and hawa
		renderAndUpdateGlobalState(strikePrice, futPrice, ceOI, $callCell, CALL);
		renderAndUpdateGlobalState(strikePrice, futPrice, peOI, $putCell, PUT);
		udpateStrikePCR(putStrike, callStrike, $strikeCell);

		if (strikePrice >= priceRange[0] && strikePrice <= priceRange[1]) {
			ceOISumRange += optionChainPrice[callStrike]['oi'];
			peOISumRange += optionChainPrice[putStrike]['oi'];
		}

		if (highlightStrike[0] == strikePrice || highlightStrike[1] == strikePrice) {
			highlightRow($strikeCell);
		}

		ceOISum += optionChainPrice[callStrike]['oi'];
		peOISum += optionChainPrice[putStrike]['oi'];
	});

	// Update Open Interest difference to DOM
	if (!$('.chips-hawa-cards.cards.oi').hasClass('hide')) {
		let OIDiff = peOISum - ceOISum;
		if (oldOIDiff != OIDiff) {
			renderOIChange(ceOISum, peOISum, ceOISumRange, peOISumRange);
			oldOIDiff = OIDiff;
		}
	}
}


// Function to highlight the row
function highlightRow($cell) {
	$cell.closest('.rt-tr').find('.rt-td').addClass('chips-hawa-highlight');
}

// Function to highlight the row
function highlightCell(rowIndex, colIndex, className = null) {
	if (!className) {
		className = 'chips-hawa-highlight-cell';
	}
	$row = $(`#oc-table-body div.rt-tr-group:nth-child(${rowIndex}) .rt-tr div.rt-td:nth-child(${colIndex})`).addClass(className);
}

// Setting up the labels
function updateTableHeader(callCol, putCol, strikeCol) {
	if ($('#oc-table-head .chips-hawa-price').length == 0) {
		// Call Side Chips Hawa
		$(`#oc-table-head .rt-tr>div:nth-child(${callCol})`).prepend(`<div class='chips-hawa-price chips'>CHIPS</div>`);
		$(`#oc-table-head .rt-tr>div:nth-child(${callCol})`).append(`<div class='chips-hawa-price hawa'>HAWA</div>`);

		// PUT side Chips Hawa
		$(`#oc-table-head .rt-tr>div:nth-child(${putCol})`).prepend(`<div class='chips-hawa-price chips'>CHIPS</div>`);
		$(`#oc-table-head .rt-tr>div:nth-child(${putCol})`).append(`<div class='chips-hawa-price hawa'>HAWA</div>`);

		// Strike Price PCR
		$(`#oc-table-head .rt-tr>div:nth-child(${strikeCol})`).append(`<div class='chips-hawa-pcr-ratio'>PCR</div>`);
		$(`#oc-table-head .rt-tr>div:nth-child(${strikeCol})`).prepend(`<div class='chips-hawa-pcr-ratio p-hawa'>%Hawa</div>`);
	}
}

// Get the column position based on the columns selected by user
// Default layout column positions are 
// Call Price=3, Put Price=6, StrikePrice=4, CallOI=2, PutOI=7
function getColumnPosition() {
	columns = $(`#oc-table-head .rt-tr>div`).length
	if (columnIndex.length && columns == totalColLength) {
		return columnIndex;
	}
	clearChipsHawaLabels();
	totalColLength = columns;
	let cols = {};

	$(`#oc-table-head .rt-tr>div`).each((i, col) => {
		let title = $(col).text().replace(/\s/g, '').toLowerCase();
		if (title.includes('oi-lakh')) {
			if (cols['callOICol']) {
				cols['putOICol'] = i + 1;
			} else {
				cols['callOICol'] = i + 1;
			}
		}
		if (title.includes('ltp(chg%)')) {
			if (cols['callCol']) {
				cols['putCol'] = i + 1;
			} else {
				cols['callCol'] = i + 1;
			}
		}
		if (title.includes('strike')) {
			cols['strikeCol'] = i + 1;
		}
		if (title.includes('volume')) {
			if (cols['callVolume']) {
				cols['putVolume'] = i + 1;
			} else {
				cols['callVolume'] = i + 1;
			}
		}
		if (title.includes('delta')) {
			if (cols['callDelta']) {
				cols['putDelta'] = i + 1;
			} else {
				cols['callDelta'] = i + 1;
			}
		}
		if (title === 'oichange') {
			if (cols['callOIChange']) {
				cols['putOIChange'] = i + 1;
			} else {
				cols['callOIChange'] = i + 1;
			}
		}

	});
	columnIndex = cols;
	return cols;
}

// Function to get current ticket from the URL
function getTicker() {
	let urlParams = new URLSearchParams(window.location.search);
	if (urlParams.has('tradingsymbol')) {
		return urlParams.get('tradingsymbol');
	}
	return null;
}

// Function to render the Strike PCR
function udpateStrikePCR(peStrike, ceStrike, $cell) {
	// Updating Percentage Hawa
	let pHawa = optionChainPrice[ceStrike]['percentageHawa'];
	if (pHawa == 0) {
		pHawa = optionChainPrice[peStrike]['percentageHawa'];
	}
	if ($cell.find('.chips-hawa-pcr-ratio.p-hawa').length) {
		$cell.find('.chips-hawa-pcr-ratio.p-hawa').text(`${parseFloat(pHawa).toFixed(2)}%`);
	} else {
		$cell.prepend(`<div class='chips-hawa-pcr-ratio p-hawa'>${parseFloat(pHawa).toFixed(2)}%</div>`);
	}

	let pcr = '-n/a-';
	if (optionChainPrice[peStrike]['oi'] != 0 && optionChainPrice[ceStrike]['oi'] != 0) {
		pcr = parseFloat(optionChainPrice[peStrike]['oi'] / optionChainPrice[ceStrike]['oi']).toFixed(2);
	}

	if (pcr === optionChainPrice[peStrike]['pcr']) {
		return;
	}
	optionChainPrice[peStrike]['pcr'] = pcr;
	optionChainPrice[ceStrike]['pcr'] = pcr;
	if ($cell.find('.chips-hawa-pcr-ratio.pcr').length) {
		$cell.find('.chips-hawa-pcr-ratio.pcr').text(pcr);
	} else {
		$cell.append(`<div class='chips-hawa-pcr-ratio pcr'>${pcr}</div>`);
	}

}

// Function to render Open Interest on the page
function renderOIChange(ceOISum, peOISum, ceOISumRange, peOISumRange) {
	$OICard = $('.chips-hawa-cards.cards.oi');
	let OIDiff = peOISumRange - ceOISumRange;
	$OICard.find('.diff_item').text(`${parseFloat(peOISumRange).toFixed(2)} - ${parseFloat(ceOISumRange).toFixed(2)}
	= ${parseFloat(OIDiff).toFixed(2)}L (PCR: ${parseFloat(peOISumRange / ceOISumRange).toFixed(2)})`);
	if (OIDiff < 0) {
		$OICard.find('.card').removeClass('card-4').addClass('card-5');
		$OICard.find('.card .sentiments').text('Bearish Sentiments');
	} else {
		$OICard.find('.card').removeClass('card-5').addClass('card-4');
		$OICard.find('.card .sentiments').text('Bullish Sentiments');
	}
	$OICard.find('.all-oi').text(`Over all OI diff: ${parseFloat(peOISum).toFixed(2)} - ${parseFloat(ceOISum).toFixed(2)} 
	= ${parseFloat(peOISum - ceOISum).toFixed(2)}L (PCR: ${parseFloat(peOISum / ceOISum).toFixed(2)})`);
}

// Function to upate chips hawa state and UI
function renderAndUpdateGlobalState(strikePrice, futPrice, oi, $cell, opType) {
	let price = $cell.find('.MuiBox-root').text().split(' ')[0].replace(/\,/g, '');
	price = parseFloat(price).toFixed(2);
	[chips, hawa] = getChipsHawa(futPrice, strikePrice, price, opType);
	let strike = `${strikePrice}-${opType}`
	oi = oi.split('\n')[0];
	if (!isNumeric(oi)) { oi = 0 }
	optionChainPrice[strike]['oi'] = parseFloat(oi);
	if (optionChainPrice[strike].chips !== chips || optionChainPrice[strike].hawa !== hawa) {
		$cell.find('div.chips-hawa-price.chips').text(chips);
		$cell.find('div.chips-hawa-price.hawa').text(hawa);
	}
	optionChainPrice[strike]['chips'] = chips;
	optionChainPrice[strike]['hawa'] = hawa;
	if (chips != 0) {
		optionChainPrice[strike]['percentageHawa'] = (hawa / price) * 100;
	} else {
		optionChainPrice[strike]['percentageHawa'] = 0;
	}
}

// Function to remove the chips hawa from the page.
function clearChipsHawaLabels() {
	$('#oc-table-body div.chips-hawa-price').remove();
	$('#oc-table-body div.chips-hawa-pcr-ratio').remove();
	optionChainPrice = {};
}

// Getting future price
function getFuturePrice() {
	if ($('[class^=style__TickerButtonText]').length) {
		let futPrice = $('[class^=style__TickerButtonText]').contents().filter(function () { return this.nodeType === 3; })[2].textContent;
		return parseFloat(futPrice);
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

// Getting Strike Price difference
function getStrikeDiff(strikeCol) {
	let $strikeCell1 = $(`#oc-table-body div.rt-tr-group:nth-child(1) .rt-tr div.rt-td:nth-child(${strikeCol})`);
	let strikePrice1 = $strikeCell1.find('span').text().trim();

	let $strikeCell2 = $(`#oc-table-body div.rt-tr-group:nth-child(2) .rt-tr div.rt-td:nth-child(${strikeCol})`);
	let strikePrice2 = $strikeCell2.find('span').text().trim();
	// console.log(strikeCol, parseInt(strikePrice2, 10) - parseInt(strikePrice1, 10));
	return parseFloat(strikePrice2) - parseFloat(strikePrice1);
}

// Function to set OI markup in the dom
function initMenuBar() {
	$('body').append(`
		<div class="chips-hawa-cards cards hide oi">
			<div class="card">
				<button type="button"></button>
				<h2 class="card__title">Difference between OI PE-CE</h2>
				<p class="card__title diff_item">-</p>
				<small><sup>*</sup>10 strike above and below ATM (OI in Lakh)</small>
				<p class="sentiments">-</p>
				<small class="all-oi">-</small>
			</div>
		</div>
		<div class="chips-hawa-cards cards hide settings">
			<div class="card">
				<button type="button"></button>
				<h3>Display Settings</h3>
				<label><input type="radio" name="view" value="chips"/>Chips Hawa</label>
				<label><input type="radio" name="view" value="ltp" checked/>Dad's View</label>
			</div>
		</div>
		<div class="chips-hawa-menu">
			<a class="active oi" href="#chips-hawa-oi"><span>OI</span></a>
			<a class="active settings" href="#chips-hawa-setting"><span>⚙</span></a>
		</div>
		<div class="chips-hawa-overlay hide">
			<div class="chips-hawa-ltp-content">
				<h4>LTP Calculator</h4>
				<div class="chips-hawa-ltp-body chips-hawa-clearfix">
					<div class="chips-hawa-ltp-params">
						<div class="ltp-params-item spot">
							<span	class="key">Spot : </span>
							<span	class="value"></span>
						</div>
						<div class="ltp-params-item direction">
							<span	class="key">Direction : </span>
							<span	class="value"></span>
						</div>
						<div class="ltp-params-item ce-price">
							<span	class="key">CE Ltp : </span>
							<span	class="value"></span>
						</div>
						<div class="ltp-params-item ce-delta">
							<span	class="key">CE Delta : </span>
							<span	class="value"></span>
						</div>
						<div class="ltp-params-item pe-price">
							<span	class="key">PE Ltp : </span>
							<span	class="value"></span>
						</div>
						<div class="ltp-params-item pe-delta">
							<span	class="key">PE Delta : </span>
							<span	class="value"></span>
						</div>
						<div class="ltp-params-item strike">
							<span	class="key">Strike : </span>
							<span	class="value"></span>
						</div>
					</div>
					<div class="chips-hawa-ltp-output">
						<span	class="output-price">--</span>
						<span	class="output-sl">--</span>
					</div>
				</div>
			</div>
		</div>
		<div class="chips-hawa-buttons-call"></div>
		<div class="chips-hawa-buttons-put"></div>
	`);

	$('.chips-hawa-cards.cards.oi button, .chips-hawa-menu a.oi').on('click', e => {
		e.preventDefault();
		e.stopPropagation();
		$('.chips-hawa-cards.cards.oi').toggleClass('hide');
	});

	$('.chips-hawa-cards.cards.settings button, .chips-hawa-menu a.settings').on('click', e => {
		e.preventDefault();
		e.stopPropagation();
		$('.chips-hawa-cards.cards.settings').toggleClass('hide');
	});

	$('input[name=view]').on('change', e => {
		let newView = $('input[name=view]:checked').val();
		if (viewMode != newView) {
			resetView(viewMode);
		}
		viewMode = newView;
	});

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

// To register LTP calculator events
function registerLtpEvents() {
	// console.log('Registering Event');
	$('#oc-table-body').on('click', 'button.chips-hawa-ltp-trigger', e => {
		e.preventDefault();
		e.stopPropagation();
		// console.log('Firing click Event');
		$('.chips-hawa-overlay').removeClass('hide');
	});
}

function ltpCalculator(type, callPrice, callDelta, putPrice, putDelta, strike, sl) {
	let output = 0;
	let spotPrice = getFuturePrice();
	if (type == 'error') {
		output = "No Pair Data";
	} else if (type == 'Bullish') {
		$('.chips-hawa-ltp-output').addClass('bearish');
		if (parseFloat(putPrice) < parseFloat(callPrice)) {
			output = "Breakout";
		} else {
			output = spotPrice + ((parseFloat(putPrice) - parseFloat(callPrice)) / (callDelta + putDelta)) + 0.05;
			output = isNumeric(parseFloat(output).toFixed(2)) ? parseFloat(output).toFixed(2) : 'Data Error';
		}
	} else {
		$('.chips-hawa-ltp-output').removeClass('bearish');
		if (parseFloat(callPrice) < parseFloat(putPrice)) {
			output = "Breakdown";
		} else {
			output = spotPrice - ((parseFloat(callPrice) - parseFloat(putPrice)) / (callDelta + putDelta)) - 0.05;
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
	showLTPOverlay();
	// console.log(output);
}

function ltpCalculatorUI(e) {
	e.preventDefault();
	e.stopPropagation();
	let $e = $(e.target);
	let strikeCol = $e.data('strikecol');
	let optionType = $e.data('type');
	let $strikeCell = $e.closest('.rt-tr').find(`div.rt-td:nth-child(${strikeCol})`);
	let strikePrice = parseFloat($strikeCell.find('span').text().trim()).toFixed(2);
	let currentStrikeKey = `${strikePrice}-${optionType}`;
	let selectedOptionData = optionChainPrice[currentStrikeKey];
	let callStrikeKey = `${selectedOptionData.strike}-CALL`;
	let putStrikeKey = `${strikePriceOrder[selectedOptionData.index - 1]}-PUT`;
	let sl = parseInt(optionChainPrice[putStrikeKey].strike, 10) - 1;
	let type = 'Bearish';
	if (optionType == 'CALL') {
		putStrikeKey = `${selectedOptionData.strike}-PUT`;
		callStrikeKey = `${strikePriceOrder[selectedOptionData.index + 1]}-CALL`;
		sl = parseInt(optionChainPrice[callStrikeKey].strike, 10) + 1;
		type = 'Bullish';
	}

	if (optionChainPrice[putStrikeKey] && optionChainPrice[callStrikeKey]) { // Pairing put strike present
		callOptionData = optionChainPrice[callStrikeKey];
		putOptionData = optionChainPrice[putStrikeKey];
		ltpCalculator(type, callOptionData.price, callOptionData.delta, putOptionData.price, putOptionData.delta, selectedOptionData.strike, sl);
	} else {
		ltpCalculator('error', 0, 0, 0, 0, selectedOptionData.strike, sl);
	}
}

function showLTPOverlay() {
	$('.chips-hawa-overlay').removeClass('hide');
}

function resetView(view) {
	$container = $('#tableContainer');
	if (view == 'chips') {
		$('body').removeClass('chips-hawa-nk');
		$('body').addClass('chips-hawa-ltp');
		$container.find('div.chips-hawa-price').remove();
		$container.find('div.chips-hawa-pcr-ratio').remove();
		$container.find('.rt-td.chips-hawa-highlight').removeClass('chips-hawa-highlight');
		optionChainPrice = {};
		registerLtpEvents();
	} else if (view == 'ltp') {
		$('body').removeClass('chips-hawa-ltp');
		$('body').addClass('chips-hawa-nk');
		$container.find('.chips-hawa-highlight-cell').removeClass('chips-hawa-highlight-cell');
		$container.find('.chips-hawa-imaginary-line').removeClass('chips-hawa-imaginary-line');
		$container.find('.chips-hawa-highlight-int-cell').removeClass('chips-hawa-highlight-int-cell');
		$container.find('div.chips-hawa-oi-ratio').remove();
		$('.chips-hawa-ltp-trigger').remove();
		$('.chips-hawa-error').remove();
		optionChainPrice = {};
		strikePriceOrder = {};
	}
}

function isNumeric(str) {
	if (typeof str != 'string') return false // we only process strings!  
	return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

/******************LTP CALCULATOR BEGIN*************************/
function updateLTP() {
	let currentTicker = getTicker();
	if (!currentTicker || ticker != currentTicker) {
		ticker = currentTicker;
		optionChainPrice = {};
		strikeDiff = 0;
		oldOIDiff = 0;
		resetView('ltp');
		return;
	}

	let futPrice = getFuturePrice();
	if (!futPrice) { return; } // No future price can't do anything

	let colPos = getColumnPosition();
	if (!colPos.callVolume || !colPos.putVolume || !colPos.callDelta || !colPos.putDelta || !colPos.callOIChange || !colPos.putOIChange) {
		if ($('.chips-hawa-error').length == 0) {
			$('body').append(`
				<div class="chips-hawa-error">
					<p>Please enable Volume,OI-Change and Delta column from the settings</p>
				</div>`);
		}
		return;
	} else {
		$('.chips-hawa-error').remove();
	}

	if (strikeDiff === 0) {
		strikeDiff = getStrikeDiff(colPos.strikeCol);
	}
	let strikePair = [0, 0];

	$('#oc-table-body div.rt-tr-group').each((i, row) => {
		let $row = $(row);
		let $strikeCell = $row.find(`.rt-tr div.rt-td:nth-child(${colPos.strikeCol})`);
		let $callCell = $row.find(`.rt-tr div.rt-td:nth-child(${colPos.callCol})`);
		let $putCell = $row.find(`.rt-tr div.rt-td:nth-child(${colPos.putCol})`);
		let $callOICell = $row.find(`.rt-tr div.rt-td:nth-child(${colPos.callOICol})`);
		let $putOICell = $row.find(`.rt-tr div.rt-td:nth-child(${colPos.putOICol})`);
		let $putVolumeCell = $row.find(`.rt-tr div.rt-td:nth-child(${colPos.putVolume})`);
		let $callVolumeCell = $row.find(`.rt-tr div.rt-td:nth-child(${colPos.callVolume})`);
		let $callDeltaCell = $row.find(`.rt-tr div.rt-td:nth-child(${colPos.callDelta})`);
		let $putDeltaCell = $row.find(`.rt-tr div.rt-td:nth-child(${colPos.putDelta})`);
		let $callOIChangeCell = $row.find(`.rt-tr div.rt-td:nth-child(${colPos.callOIChange})`);
		let $putOIChangeCell = $row.find(`.rt-tr div.rt-td:nth-child(${colPos.putOIChange})`);

		// Get Strike price from DOM
		let strikePrice = $strikeCell.find('span').text().trim();
		strikePrice = parseFloat(strikePrice).toFixed(2);
		strikePriceOrder[i + 1] = strikePrice;
		let callStrike = `${strikePrice}-${CALL}`;
		let putStrike = `${strikePrice}-${PUT}`;
		if (!optionChainPrice[callStrike]) {
			optionChainPrice[callStrike] = {};
			optionChainPrice[putStrike] = {};
			optionChainPrice[callStrike]['index'] = i + 1;
			optionChainPrice[putStrike]['index'] = i + 1;
			optionChainPrice[callStrike]['strike'] = strikePrice;
			optionChainPrice[putStrike]['strike'] = strikePrice;
		}
		// Get Call Price of the same option
		let cePrice = $callCell.find('.MuiBox-root').text().split(' ')[0];
		cePrice = parseFloat(cePrice).toFixed(2);
		optionChainPrice[callStrike]['price'] = cePrice;

		// Get Put Price of the same option
		let pePrice = $putCell.find('.MuiBox-root').text().split(' ')[0];
		pePrice = parseFloat(pePrice).toFixed(2);
		optionChainPrice[putStrike]['price'] = pePrice;

		// Get OI values from the cell
		let callOI = $callOICell.find(`div[class*='style__OiprogressBarValue']`).text().trim();
		optionChainPrice[callStrike]['oi'] = isNumeric(callOI) ? parseFloat(callOI) : 0;
		let putOI = $putOICell.find(`div[class*='style__OiprogressBarValue']`).text().trim();
		optionChainPrice[putStrike]['oi'] = isNumeric(putOI) ? parseFloat(putOI) : 0;

		// Get the volume from the cell
		let callVolume = $callVolumeCell.text().trim();
		optionChainPrice[callStrike]['volume'] = isNumeric(callVolume) ? parseFloat(callVolume) : 0;
		let putVolume = $putVolumeCell.text().trim();
		optionChainPrice[putStrike]['volume'] = isNumeric(putVolume) ? parseFloat(putVolume) : 0;

		// Get the delta from the cell
		let callDelta = $callDeltaCell.text().trim();
		optionChainPrice[callStrike]['delta'] = isNumeric(callDelta) ? parseFloat(callDelta) : 0;
		let putDelta = $putDeltaCell.text().trim();
		optionChainPrice[putStrike]['delta'] = isNumeric(putDelta) ? parseFloat(putDelta) * -1 : 0;

		// Get the OIChange from the cell
		let callOIChangePer = $callOIChangeCell.text().trim().replace('%', '');
		optionChainPrice[callStrike]['oiChange'] = isNumeric(callOIChangePer) ? parseFloat(callOIChangePer) : 0;
		let putOIChangePer = $putOIChangeCell.text().trim().replace('%', '');
		optionChainPrice[putStrike]['oiChange'] = isNumeric(putOIChangePer) ? parseFloat(putOIChangePer) : 0;

		// Calculate the OIChange in number
		let callOIChange = optionChainPrice[callStrike]['oiChange'];
		let putOIChange = optionChainPrice[putStrike]['oiChange'];
		let OIChangeRatio = '';
		if (callOIChange > 0 && putOIChange > 0) {
			if (callOIChange > putOIChange) {
				OIChangeRatio = `${parseFloat(callOIChange / putOIChange).toFixed(2)}:1`;
			} else {
				OIChangeRatio = `1:${parseFloat(putOIChange / callOIChange).toFixed(2)}`;
			}
		} else if (callOIChange < 0 && putOIChange < 0) {
			if (callOIChange > putOIChange) {
				OIChangeRatio = OIChangeRatio = `1:${parseFloat((putOIChange * -1) / (callOIChange * -1)).toFixed(2)}`;
			} else {
				OIChangeRatio = `${parseFloat((callOIChange * -1) / (putOIChange * -1)).toFixed(2)}:1`;
			}
		} else {
			OIChangeRatio = `∞`;
		}

		if ($strikeCell.find('.chips-hawa-oi-ratio').length) {
			$strikeCell.find('.chips-hawa-oi-ratio').text(OIChangeRatio);
		} else {
			$strikeCell.append(`<div class='chips-hawa-oi-ratio'>${OIChangeRatio}</div>`);
		}

		if (parseFloat(strikePrice) < parseFloat(futPrice)) {
			strikePair[0] = i + 1;
			strikePair[1] = i + 2;
		}

		if (SHOW_LTP && $callCell.find('button').length == 0) {
			let $btn = $("<button>", {
				"class": "chips-hawa-ltp-trigger",
				text: "LTP",
				'data-strikeCol': colPos.strikeCol,
				'data-type': 'CALL'
			}).on('click', ltpCalculatorUI);
			$callCell.append($btn);
		}

		if (SHOW_LTP && $putCell.find('button').length == 0) {
			let $btn = $("<button>", {
				"class": "chips-hawa-ltp-trigger",
				text: "LTP",
				'data-strikecol': colPos.strikeCol,
				'data-type': 'PUT'
			}).on('click', ltpCalculatorUI);;
			$putCell.append($btn);
		}
	});

	strikePair[0] = strikePriceOrder[strikePair[0]];
	strikePair[1] = strikePriceOrder[strikePair[1]];

	// Reset the imaginary line and highlighted cells
	$('.chips-hawa-highlight-cell').removeClass('chips-hawa-highlight-cell');
	$('.chips-hawa-highlight-int-cell').removeClass('chips-hawa-highlight-int-cell');
	$('.chips-hawa-imaginary-line').removeClass('chips-hawa-imaginary-line');

	// Highlight Imaginary line
	let iLineindex2 = optionChainPrice[`${strikePair[1]}-CALL`].index;
	$(`#oc-table-body div.rt-tr-group:nth-child(${iLineindex2})`).addClass('chips-hawa-imaginary-line');


	// Find the max OI/Volume/IOChangePer for CALL side
	let callStrikePrice = strikePair[0];
	let callStrikeKey = `${callStrikePrice}-CALL`;
	let maxCallVolumeStrike = callStrikeKey;
	let maxCallOIStrike = callStrikeKey;
	let maxCallOIChangeStrike = callStrikeKey;

	do {
		if (optionChainPrice[maxCallVolumeStrike].volume < optionChainPrice[callStrikeKey].volume) {
			maxCallVolumeStrike = callStrikeKey;
		}
		if (optionChainPrice[maxCallOIStrike].oi < optionChainPrice[callStrikeKey].oi) {
			maxCallOIStrike = callStrikeKey;
		}
		if (optionChainPrice[maxCallOIChangeStrike].oiChange < optionChainPrice[callStrikeKey].oiChange) {
			maxCallOIChangeStrike = callStrikeKey;
		}
		callStrikePrice = strikePriceOrder[optionChainPrice[callStrikeKey].index + 1];
		callStrikeKey = `${callStrikePrice}-CALL`;
	} while (optionChainPrice[callStrikeKey]);
	highlightCell(optionChainPrice[maxCallVolumeStrike].index, colPos.callVolume);
	highlightCell(optionChainPrice[maxCallOIStrike].index, colPos.callOICol);
	highlightCell(optionChainPrice[maxCallOIChangeStrike].index, colPos.callOIChange, 'chips-hawa-highlight-int-cell');

	// Find the max OI/Volume/IOChangePer for PUT side
	let putStrikePrice = strikePair[1];
	let putStrikeKey = `${putStrikePrice}-PUT`;
	let maxPutVolumeStrike = putStrikeKey;
	let maxPutOIStrike = putStrikeKey;
	let maxPutOIChangeStrike = putStrikeKey;
	do {
		if (optionChainPrice[maxPutVolumeStrike].volume < optionChainPrice[putStrikeKey].volume) {
			maxPutVolumeStrike = putStrikeKey;
		}
		if (optionChainPrice[maxPutOIStrike].oi < optionChainPrice[putStrikeKey].oi) {
			maxPutOIStrike = putStrikeKey;
		}
		if (optionChainPrice[maxPutOIChangeStrike].oiChange < optionChainPrice[putStrikeKey].oiChange) {
			maxPutOIChangeStrike = putStrikeKey;
		}
		putStrikePrice = strikePriceOrder[optionChainPrice[putStrikeKey].index - 1];
		putStrikeKey = `${putStrikePrice}-PUT`;
	} while (optionChainPrice[putStrikeKey]);
	highlightCell(optionChainPrice[maxPutVolumeStrike].index, colPos.putVolume);
	highlightCell(optionChainPrice[maxPutOIStrike].index, colPos.putOICol);
	highlightCell(optionChainPrice[maxPutOIChangeStrike].index, colPos.putOIChange, 'chips-hawa-highlight-int-cell');
}
/******************LTP CALCULATOR ENDS*************************/

function getElementPosition($element) {
	let leftPos = $element[0].getBoundingClientRect().left + $(window)['scrollLeft']();
	let rightPos = $element[0].getBoundingClientRect().right + $(window)['scrollLeft']();
	let topPos = $element[0].getBoundingClientRect().top + $(window)['scrollTop']();
	let bottomPos = $element[0].getBoundingClientRect().bottom + $(window)['scrollTop']();
	return [leftPos, topPos, rightPos, bottomPos];
}

function main() {
	initMenuBar();
	setInterval(() => {
		try {
			if (viewMode === "chips") {
				updateChipsHawa();
			} else if (viewMode === "ltp") {
				updateLTP();
			}
		} catch (e) {
			console.error(e) // Move on
		}
	}, 1200);
}

main();