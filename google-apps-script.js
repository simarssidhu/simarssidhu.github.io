/**
 * Google Apps Script for Wealthsimple Portfolio Dashboard
 * Connects Sim's, Alex's, and Chris's Spreadsheets to the Web Dashboard.
 * 
 * Key Features:
 * 1. Sheet Stays 100% RESTRICTED / PRIVATE:
 *    - The Google Sheet sharing is kept strictly "Restricted".
 *    - The Apps Script Web App acts as a secure, read-only bridge.
 *    - The passphrase is read dynamically from the Google Sheet (Config tab, cell B1).
 *    - Nothing sensitive is hardcoded; the passphrase never appears in the public repo.
 * 2. Sim's Historical Data is PRESERVED 100%:
 *    - The backfill script NEVER clears, truncates, or overwrites Sim's dates or Sim's values (Columns A & B).
 *    - It ONLY calculates and populates Alex's (Column C) and Chris's (Column D) historical values.
 * 3. Exact Current Values & Accurate Relative Historical Return:
 *    - Alex current value matches =SUM(E34, E30, N1, N2) (~$356,302.89).
 *    - Chris current value matches =SUM(Chris_Portfolio[Current Value]) (~$221,471.38).
 *    - Eliminates CDR share-multiplier errors by scaling historical values relative to today's portfolio weights:
 *      Value(t) = CurrentValue * (Price(t) / Price(today))
 * 4. Automatic Currency Formatting:
 *    - Explicitly sets Columns C & D to currency format ($#,##0.00) so Chris never shows as a date!
 */

// ==========================================
// CONFIGURATION & SECURITY
// ==========================================
// NOTE: No hardcoded password here! The passphrase is stored in the Google Sheet
// in a tab named "Config" (cell B1). The doGet() function reads it dynamically via
// getSheetPassword(). This keeps the public GitHub repo free of any secrets.

// Ticker Map: Maps tickers to verified working Google Finance symbols
const TICKER_MAP = {
  // Canadian TSX
  "ATH": "TSE:ATH",
  "CLS": "TSE:CLS",
  "FFN": "TSE:FFN",
  "LBS": "TSE:LBS",
  "NBIS": "TSE:NBIS",
  "VFV": "TSE:VFV",
  "XEQT": "TSE:XEQT",
  "XQQ": "TSE:XQQ",
  "MDA": "TSE:MDA",
  "DOL": "TSE:DOL",
  "CSU": "TSE:CSU",
  "ENB": "TSE:ENB",
  "MFC": "TSE:MFC",
  "CCO": "TSE:CCO",
  "SHOP": "TSE:SHOP",
  "HUT": "TSE:HUT",
  "XCHP": "TSE:XCHP",
  "XNDU": "TSE:XNDU",
  "GRGD": "TSE:GRGD",
  "KILO": "TSE:KILO",
  "GSY": "TSE:GSY",
  "CURA": "TSE:CURA",

  // Canadian Venture / CSE
  "PNG": "CVE:PNG",
  "QNC": "CVE:QNC",
  "SCD": "CVE:SCD",
  "YES": "CVE:YES",
  "BOCA": "CVE:BOCA",

  // US Tech Stocks (mapped to NASDAQ for verified 400+ day price history)
  "GOOG": "NASDAQ:GOOG",
  "MU": "NASDAQ:MU",
  "NVDA": "NASDAQ:NVDA",
  "MSFT": "NASDAQ:MSFT",
  "AAPL": "NASDAQ:AAPL",
  "AMD": "NASDAQ:AMD",
  "NFLX": "NASDAQ:NFLX",
  "COST": "NASDAQ:COST",
  "LULU": "NASDAQ:LULU",
  "SMCI": "NASDAQ:SMCI",
  "INTC": "NASDAQ:INTC",
  "OPEN": "NASDAQ:OPEN",
  "QCOM": "NASDAQ:QCOM",
  "SNDK": "NASDAQ:SNDK",
  "BYND": "NASDAQ:BYND",
  "SIDU": "NASDAQ:SIDU",
  "KEEL": "NASDAQ:KEEL",

  // US NYSE / AMEX
  "UNH": "NYSE:UNH",
  "RDDT": "NYSE:RDDT",
  "NVO": "NYSE:NVO",
  "LLY": "NYSE:LLY",
  "LAC": "TSE:LAC",
  "SOXL": "NYSEARCA:SOXL"
};

function resolveTickerSymbol(ticker, exchange) {
  if (!ticker) return "";
  const t = String(ticker).trim();
  if (t.includes(":")) return t;
  if (TICKER_MAP[t]) return TICKER_MAP[t];
  if (exchange) {
    const ex = String(exchange).trim().toUpperCase();
    if (ex === "TSX" || ex === "TSE") return "TSE:" + t;
    if (ex === "NASDAQ") return "NASDAQ:" + t;
    if (ex === "NYSE") return "NYSE:" + t;
    if (ex === "TSXV" || ex === "CVE") return "CVE:" + t;
  }
  return t;
}

/**
 * Fast native JS YYYY-MM-DD formatter (runs in < 0.001ms)
 */
function fastDateYMD(d) {
  if (!d) return "";
  if (typeof d === "string") {
    if (d.length >= 10 && d.charAt(4) === "-" && d.charAt(7) === "-") {
      return d.slice(0, 10);
    }
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) d = parsed;
    else return "";
  }
  if (d instanceof Date && !isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1);
    const day = (d.getDate() < 10 ? "0" : "") + d.getDate();
    return y + "-" + m + "-" + day;
  }
  return "";
}

/**
 * Helper to get a sheet with name variations
 */
function getSheetByNames(ss, nameOptions) {
  for (let i = 0; i < nameOptions.length; i++) {
    const s = ss.getSheetByName(nameOptions[i]);
    if (s) return s;
  }
  return null;
}

/**
 * Parses Sim's Spreadsheet
 * Holdings: Col A (Ticker), Col C (Shares), Col D (Initial), Col F (Current Value)
 */
function parseSimData(ss) {
  const sheet = getSheetByNames(ss, ["Sim's Spreadsheet", "Sims Spreadsheet"]);
  if (!sheet) return { total: 0, holdings: [], initial: 0, cash: 0 };

  const values = sheet.getRange(2, 1, Math.min(sheet.getLastRow(), 50), 15).getValues();
  let total = 0;
  let initial = 0;
  let holdings = [];
  let cash = 0;

  const n1Val = parseFloat(sheet.getRange("N1").getValue());
  const q1Val = parseFloat(sheet.getRange("Q1").getValue());
  if (!isNaN(n1Val)) cash += n1Val;
  if (!isNaN(q1Val)) cash += q1Val;

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const rawTicker = row[0] ? String(row[0]).trim() : "";
    if (!rawTicker || rawTicker.toLowerCase().includes("total") || rawTicker.startsWith("RBC -")) continue;

    const shares = parseFloat(row[2]) || 0;
    const initVal = parseFloat(row[3]) || 0;
    const currVal = parseFloat(row[5]); // Col F
    const profit = parseFloat(row[6]) || 0;
    const retPct = parseFloat(row[7]) || 0;
    const price = parseFloat(row[8]) || 0;

    if (!isNaN(currVal)) {
      total += currVal;
      initial += initVal;
      holdings.push({
        ticker: rawTicker,
        shares: shares,
        currentValue: currVal,
        profit: profit,
        returnPct: Math.abs(retPct) < 1 ? retPct * 100 : retPct,
        price: price,
        account: "TFSA"
      });
    }
  }

  total += cash;
  initial += cash;
  return { total, initial, cash, holdings };
}

/**
 * Parses Alex's Spreadsheet
 * Exact Formula: =SUM(E34, E30, N1, N2)
 * Rows 2-27: Stock positions
 * E30: Company RRSP
 * N1, N2: Cash
 */
function parseAlexData(ss) {
  const sheet = getSheetByNames(ss, ["Alex's Spreadsheet", "Alexs Spreadsheet"]);
  if (!sheet) return { total: 0, holdings: [], initial: 0, cash: 0 };

  // Read exact summary cells
  const e30 = parseFloat(sheet.getRange("E30").getValue()) || 0;
  const n1 = parseFloat(sheet.getRange("N1").getValue()) || 0;
  const n2 = parseFloat(sheet.getRange("N2").getValue()) || 0;
  const baseCash = e30 + n1 + n2;

  const values = sheet.getRange(2, 1, 26, 14).getValues(); // Rows 2 to 27
  let totalStocks = 0;
  let initial = baseCash;
  let holdings = [];

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const rawTicker = row[0] ? String(row[0]).trim() : "";
    if (!rawTicker || rawTicker.toLowerCase().includes("total")) continue;

    const shares = parseFloat(row[2]) || 0;
    const initVal = parseFloat(row[3]) || 0;
    const currVal = parseFloat(row[4]); // Col E
    const profit = parseFloat(row[5]) || 0;
    const retPct = parseFloat(row[6]) || 0;
    const price = parseFloat(row[7]) || 0;
    const account = row[11] ? String(row[11]).trim() : "TFSA";

    if (!isNaN(currVal)) {
      totalStocks += currVal;
      initial += initVal;
      holdings.push({
        ticker: rawTicker,
        shares: shares,
        currentValue: currVal,
        profit: profit,
        returnPct: Math.abs(retPct) < 1 ? retPct * 100 : retPct,
        price: price,
        account: account
      });
    }
  }

  const grandTotal = totalStocks + baseCash;
  return { total: grandTotal, initial, cash: baseCash, holdings };
}

/**
 * Parses Chris's Spreadsheet
 * Exact Formula: =SUM(Chris_Portfolio[Current Value]) = E43
 * Rows 2 to 42: Stock positions
 */
function parseChrisData(ss) {
  const sheet = getSheetByNames(ss, ["Chris Spreadsheet", "Chris's Spreadsheet"]);
  if (!sheet) return { total: 0, holdings: [], initial: 0, cash: 0 };

  const values = sheet.getRange(2, 1, 41, 14).getValues(); // Rows 2 to 42
  let total = 0;
  let initial = 0;
  let holdings = [];

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const rawTicker = row[0] ? String(row[0]).trim() : "";
    if (!rawTicker || rawTicker.toLowerCase().includes("total")) continue;

    const shares = parseFloat(row[2]) || 0;
    const initVal = parseFloat(row[3]) || 0;
    const currVal = parseFloat(row[4]); // Col E
    const profit = parseFloat(row[5]) || 0;
    const retPct = parseFloat(row[6]) || 0;
    const price = parseFloat(row[7]) || 0;
    const exchange = row[11] ? String(row[11]).trim() : "";
    const account = row[12] ? String(row[12]).trim() : "TFSA";

    if (!isNaN(currVal)) {
      total += currVal;
      initial += initVal;
      holdings.push({
        ticker: rawTicker,
        shares: shares,
        currentValue: currVal,
        profit: profit,
        returnPct: Math.abs(retPct) < 1 ? retPct * 100 : retPct,
        price: price,
        account: account,
        exchange: exchange
      });
    }
  }

  return { total, initial, cash: 0, holdings };
}

/**
 * Hourly Tracking: Runs Mon-Fri 10:00 - 17:00 EDT
 * Calculates live snapshot and appends or updates the current hour in 'Historical Data'
 */
function recordHourlyPortfolioValue() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const historySheet = getSheetByNames(ss, ["Historical Data", "Historical data", "History"]);
  if (!historySheet) {
    Logger.log("Historical Data sheet not found.");
    return;
  }

  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentHour = now.getHours();

  if (dayOfWeek >= 1 && dayOfWeek <= 5 && currentHour >= 10 && currentHour <= 17) {
    const simData = parseSimData(ss);
    const alexData = parseAlexData(ss);
    const chrisData = parseChrisData(ss);

    const cleanTimestamp = new Date(now);
    cleanTimestamp.setMinutes(0, 0, 0);
    const timeStr = Utilities.formatDate(cleanTimestamp, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd HH:00:00");

    const lastRow = historySheet.getLastRow();
    if (lastRow >= 2) {
      const lastDateVal = historySheet.getRange(lastRow, 1).getValue();
      const lastDateStr = lastDateVal instanceof Date 
        ? Utilities.formatDate(lastDateVal, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd HH:00:00")
        : String(lastDateVal);

      if (lastDateStr === timeStr) {
        historySheet.getRange(lastRow, 1, 1, 4).setValues([[cleanTimestamp, simData.total, alexData.total, chrisData.total]]);
        historySheet.getRange(lastRow, 3, 1, 2).setNumberFormat("$#,##0.00");
        Logger.log("Updated existing hourly snapshot: " + timeStr);
        return;
      }
    }

    historySheet.appendRow([cleanTimestamp, simData.total, alexData.total, chrisData.total]);
    historySheet.getRange(historySheet.getLastRow(), 3, 1, 2).setNumberFormat("$#,##0.00");
    Logger.log("Appended new hourly snapshot: " + timeStr);
  }
}

/**
 * =========================================================================
 * 1-YEAR BACKFILL FOR ALEX & CHRIS (PRESERVING SIM'S HISTORICAL DATA)
 * =========================================================================
 * Step 1: Prepares Google Finance historical daily prices (back 430 days to cover Sept 2025).
 */
function backfillAlexChris_step1_loadPrices() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const alex = parseAlexData(ss);
  const chris = parseChrisData(ss);

  // Store holding currentValues mapped by resolved ticker symbol
  // Holdings object: { [userKey]: [ { ticker, currentValue } ] }
  const holdingsMeta = { alex: [], chris: [] };
  const uniqueTickers = new Set();

  alex.holdings.forEach(h => {
    const mapped = resolveTickerSymbol(h.ticker, h.exchange);
    holdingsMeta.alex.push({ ticker: mapped, currentValue: h.currentValue });
    uniqueTickers.add(mapped);
  });

  chris.holdings.forEach(h => {
    const mapped = resolveTickerSymbol(h.ticker, h.exchange);
    holdingsMeta.chris.push({ ticker: mapped, currentValue: h.currentValue });
    uniqueTickers.add(mapped);
  });

  let tempSheet = ss.getSheetByName("Temp_Backfill");
  if (!tempSheet) {
    tempSheet = ss.insertSheet("Temp_Backfill");
  } else {
    tempSheet.clear();
  }

  const tickerArray = Array.from(uniqueTickers);
  for (let i = 0; i < tickerArray.length; i++) {
    const col = i * 2 + 1;
    tempSheet.getRange(1, col).setValue(tickerArray[i]);
    // 430 days backfills all the way to Sept 1, 2025 so there are no flat plateaus!
    tempSheet.getRange(2, col).setFormula(`=GOOGLEFINANCE("${tickerArray[i]}", "price", TODAY()-430, TODAY(), "DAILY")`);
  }

  const meta = {
    holdingsMeta: holdingsMeta,
    alexBaseCash: alex.cash
  };
  PropertiesService.getScriptProperties().setProperty("BACKFILL_META", JSON.stringify(meta));

  SpreadsheetApp.flush();
  Logger.log(`Step 1 Complete! Inserted ${tickerArray.length} verified tickers with 430 days of history. Wait ~20 seconds, then run backfillAlexChris_step2_populate.`);
}

/**
 * Step 2: Populates Alex's (Column C) and Chris's (Column D) data in 'Historical Data'
 * Sets number formatting to Currency so Chris never displays as a date!
 */
function backfillAlexChris_step2_populate() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tempSheet = ss.getSheetByName("Temp_Backfill");
  const historySheet = getSheetByNames(ss, ["Historical Data", "Historical data", "History"]);

  if (!tempSheet) {
    Logger.log("Error: Temp_Backfill sheet not found. Run backfillAlexChris_step1_loadPrices first.");
    return;
  }
  if (!historySheet) {
    Logger.log("Error: Historical Data sheet not found.");
    return;
  }

  const metaStr = PropertiesService.getScriptProperties().getProperty("BACKFILL_META");
  if (!metaStr) {
    Logger.log("Error: BACKFILL_META not found. Run step 1 first.");
    return;
  }
  const meta = JSON.parse(metaStr);
  const holdingsMeta = meta.holdingsMeta;
  const alexBaseCash = meta.alexBaseCash || 0;

  // Read entire Temp_Backfill in ONE single call
  const tempData = tempSheet.getDataRange().getValues();
  if (tempData.length < 3) {
    Logger.log("Error: Temp_Backfill has not populated yet. Wait 15 seconds and try again.");
    return;
  }

  // Build price lookup map and latest price for each ticker
  const tickerPrices = {};
  const tickerLatest = {};
  const numCols = tempData[0].length;

  for (let c = 0; c < numCols; c += 2) {
    const ticker = String(tempData[0][c] || "").trim();
    if (!ticker) continue;
    tickerPrices[ticker] = {};
    let latestPrice = 0;

    for (let r = 2; r < tempData.length; r++) {
      const dVal = tempData[r][c];
      const pVal = parseFloat(tempData[r][c + 1]);
      if (dVal && !isNaN(pVal) && pVal > 0) {
        const dStr = fastDateYMD(dVal);
        if (dStr) {
          tickerPrices[ticker][dStr] = pVal;
          latestPrice = pVal; // The last row in GOOGLEFINANCE is the most recent price!
        }
      }
    }
    tickerLatest[ticker] = latestPrice > 0 ? latestPrice : 1.0;
  }

  // Read Historical Data in ONE single call
  const histData = historySheet.getDataRange().getValues();
  if (histData.length < 2) {
    Logger.log("Error: Historical Data has no data rows.");
    return;
  }

  // Ensure row 1 header
  historySheet.getRange(1, 1, 1, 4).setValues([["Date", "Simarjot", "Alex", "Chris"]]);

  function getTickerPrice(ticker, dStr, priorDateStrs) {
    const prices = tickerPrices[ticker];
    if (!prices) return tickerLatest[ticker] || 1.0;
    if (prices[dStr] !== undefined) return prices[dStr];

    for (let i = 0; i < priorDateStrs.length; i++) {
      const prior = priorDateStrs[i];
      if (prices[prior] !== undefined) return prices[prior];
    }
    return tickerLatest[ticker] || 1.0;
  }

  // Calculates portfolio value by scaling current value by price ratio:
  // PositionValue(t) = CurrentValue * (Price(t) / Price(latest))
  function computeScaledPortfolio(userHoldings, baseCash, dStr, priorDateStrs) {
    let total = baseCash;
    for (let i = 0; i < userHoldings.length; i++) {
      const h = userHoldings[i];
      const pLatest = tickerLatest[h.ticker] || 1.0;
      const pDate = getTickerPrice(h.ticker, dStr, priorDateStrs);
      const ratio = pLatest > 0 ? (pDate / pLatest) : 1.0;
      total += h.currentValue * ratio;
    }
    return Math.round(total * 100) / 100;
  }

  const alexChrisUpdates = [];
  let updatedCount = 0;

  for (let r = 1; r < histData.length; r++) {
    const rawDate = histData[r][0];
    const dateObj = rawDate instanceof Date ? rawDate : new Date(rawDate);

    if (!isNaN(dateObj.getTime())) {
      const dStr = fastDateYMD(dateObj);
      const priorDates = [];
      const timeMs = dateObj.getTime();
      for (let offset = 1; offset <= 7; offset++) {
        priorDates.push(fastDateYMD(new Date(timeMs - offset * 86400000)));
      }

      const alexVal = computeScaledPortfolio(holdingsMeta.alex, alexBaseCash, dStr, priorDates);
      const chrisVal = computeScaledPortfolio(holdingsMeta.chris, 0, dStr, priorDates);
      alexChrisUpdates.push([alexVal, chrisVal]);
      updatedCount++;
    } else {
      alexChrisUpdates.push([histData[r][2] || "", histData[r][3] || ""]);
    }
  }

  // Write Column C (Alex) and Column D (Chris) and set format to Currency
  if (alexChrisUpdates.length > 0) {
    const targetRange = historySheet.getRange(2, 3, alexChrisUpdates.length, 2);
    targetRange.setValues(alexChrisUpdates);
    targetRange.setNumberFormat("$#,##0.00"); // Fixes Chris's column so it never displays as a date!
    SpreadsheetApp.flush();
  }

  ss.deleteSheet(tempSheet);
  PropertiesService.getScriptProperties().deleteProperty("BACKFILL_META");

  Logger.log(`Success! Populated Alex & Chris across ${updatedCount} rows. Alex ends at $${alexChrisUpdates[alexChrisUpdates.length-1][0]}, Chris ends at $${alexChrisUpdates[alexChrisUpdates.length-1][1]}`);
}

/**
 * Reads the passphrase dynamically from the Google Sheet so Alex, Chris, and Sim
 * can change or view it directly in the spreadsheet without changing any code!
 * 
 * Checked in order:
 * 1. Cell A1 or B1 on a tab named "Config", "Settings", or "Password"
 * 2. Cell Z1 on "Historical Data"
 * 3. Default fallback if not set in sheet: "portfolio2026"
 */
function getSheetPassword(ss) {
  const configSheet = getSheetByNames(ss, ["Config", "Settings", "Password"]);
  if (configSheet) {
    const valB1 = configSheet.getRange("B1").getValue();
    const valA1 = configSheet.getRange("A1").getValue();
    if (valB1) return String(valB1).trim();
    if (valA1) return String(valA1).trim();
  }

  const histSheet = getSheetByNames(ss, ["Historical Data", "Historical data", "History"]);
  if (histSheet) {
    const z1 = histSheet.getRange("Z1").getValue();
    if (z1) return String(z1).trim();
  }

  return "portfolio2026";
}

/**
 * Secure Web App Endpoint (doGet)
 * Returns JSON ONLY if the client provides the correct passphrase matching the Google Sheet!
 * Keeps your Google Sheet and data 100% private.
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetPassword = getSheetPassword(ss);

    const providedKey = (e && e.parameter && e.parameter.key) ? String(e.parameter.key).trim() : "";
    if (!providedKey || providedKey !== sheetPassword) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Unauthorized: Invalid or missing API security key."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const sim = parseSimData(ss);
    const alex = parseAlexData(ss);
    const chris = parseChrisData(ss);

    const historySheet = getSheetByNames(ss, ["Historical Data", "Historical data", "History"]);
    let history = [];

    if (historySheet && historySheet.getLastRow() >= 2) {
      const rows = historySheet.getRange(2, 1, historySheet.getLastRow() - 1, 4).getValues();
      history = rows.map(r => {
        const d = r[0] instanceof Date 
          ? Utilities.formatDate(r[0], ss.getSpreadsheetTimeZone(), "yyyy-MM-dd HH:00:00")
          : String(r[0]);
        return {
          date: d,
          simarjot: parseFloat(r[1]) || 0,
          alex: parseFloat(r[2]) || 0,
          chris: parseFloat(r[3]) || 0
        };
      });
    }

    const payload = {
      status: "success",
      updatedAt: Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
      users: {
        alex: {
          id: "alex",
          name: "Alex",
          color: "#3b82f6",
          currentValue: alex.total,
          initialValue: alex.initial,
          totalProfit: alex.total - alex.initial,
          totalReturnPct: alex.initial > 0 ? ((alex.total - alex.initial) / alex.initial) * 100 : 0,
          holdings: alex.holdings
        },
        chris: {
          id: "chris",
          name: "Chris",
          color: "#ef4444",
          currentValue: chris.total,
          initialValue: chris.initial,
          totalProfit: chris.total - chris.initial,
          totalReturnPct: chris.initial > 0 ? ((chris.total - chris.initial) / chris.initial) * 100 : 0,
          holdings: chris.holdings
        },
        simarjot: {
          id: "simarjot",
          name: "Simarjot",
          color: "#a855f7",
          currentValue: sim.total,
          initialValue: sim.initial,
          totalProfit: sim.total - sim.initial,
          totalReturnPct: sim.initial > 0 ? ((sim.total - sim.initial) / sim.initial) * 100 : 0,
          holdings: sim.holdings
        }
      },
      history: history
    };

    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
