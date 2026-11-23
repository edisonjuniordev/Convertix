const CURRENCY_META = {
  BRL: {
    code: "BRL",
    name: "Real Brasileiro",
    locale: "pt-BR",
    decimals: 2
  },
  USD: {
    code: "USD",
    name: "Dólar Americano",
    locale: "en-US",
    decimals: 2
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    locale: "de-DE",
    decimals: 2
  },
  BTC: {
    code: "BTC",
    name: "Bitcoin",
    locale: "en-US",
    decimals: 6
  }
};

// Valor de cada moeda em BRL (1 unidade da moeda = X BRL)
let brlRates = {
  BRL: 1,
  USD: 5.55,
  EUR: 6.05,
  BTC: 500000
};

let variations24h = {
  USD: "+0.00%",
  EUR: "+0.00%",
  BTC: "+0.00%"
};

let swapAngle = 0;
let refreshAngle = 0;

function buildSvgDataUrl(type) {
  let svg = "";
  if (type === "logo") {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="#06120d"/>
      <path d="M18 22h20l-6-6m12 26H24l6 6" stroke="#00ff88" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`;
  } else if (type === "arrow") {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M5 12h14m0 0-5-5m5 5-5 5" stroke="#00ff88" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`;
  } else if (type === "BTC") {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="#071a12" stroke="#00ff88" stroke-width="3"/>
      <text x="32" y="41" text-anchor="middle" fill="#00ff88" font-size="26" font-weight="800" font-family="Arial,sans-serif">₿</text>
    </svg>`;
  } else if (type === "EUR") {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="#071a12" stroke="#10b981" stroke-width="3"/>
      <text x="32" y="41" text-anchor="middle" fill="#00ff88" font-size="26" font-weight="800" font-family="Arial,sans-serif">€</text>
    </svg>`;
  } else {
    const symbol = type === "BRL" ? "R$" : "$";
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="#071a12" stroke="#00ff88" stroke-width="3"/>
      <text x="32" y="40" text-anchor="middle" fill="#00ff88" font-size="${type === "BRL" ? "20" : "26"}" font-weight="800" font-family="Arial,sans-serif">${symbol}</text>
    </svg>`;
  }
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function initializeIcons() {
  const brandLogo = document.getElementById("brand-logo");
  const flowArrow = document.getElementById("flow-arrow-icon");
  const cardUsd = document.getElementById("card-usd-icon");
  const cardEur = document.getElementById("card-eur-icon");
  const cardBtc = document.getElementById("card-btc-icon");

  if (brandLogo) brandLogo.src = buildSvgDataUrl("logo");
  if (flowArrow) flowArrow.src = buildSvgDataUrl("arrow");
  if (cardUsd) cardUsd.src = buildSvgDataUrl("USD");
  if (cardEur) cardEur.src = buildSvgDataUrl("EUR");
  if (cardBtc) cardBtc.src = buildSvgDataUrl("BTC");
}

function setCurrencyIcon(imgEl, currencyCode) {
  if (!imgEl) return;
  imgEl.dataset.currency = currencyCode;
  imgEl.src = buildSvgDataUrl(currencyCode);
}

function formatAmount(value, currencyCode) {
  const meta = CURRENCY_META[currencyCode] || CURRENCY_META.USD;
  const safeNum = Number.isFinite(value) ? value : 0;

  if (currencyCode === "BTC") {
    return `${safeNum.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })} BTC`;
  }

  try {
    return new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: meta.decimals
    }).format(safeNum);
  } catch {
    return `${currencyCode} ${safeNum.toFixed(2)}`;
  }
}

function updateConversion() {
  const amountInput = document.getElementById("amount-input");
  const fromSelect = document.getElementById("from-currency");
  const toSelect = document.getElementById("to-currency");

  if (!amountInput || !fromSelect || !toSelect) return;

  const fromCode = fromSelect.value;
  const toCode = toSelect.value;
  const rawAmount = parseFloat(amountInput.value);
  const amount = !Number.isNaN(rawAmount) && rawAmount >= 0 ? rawAmount : 0;

  const fromMeta = CURRENCY_META[fromCode] || CURRENCY_META.BRL;
  const toMeta = CURRENCY_META[toCode] || CURRENCY_META.USD;

  const amountInBrl = amount * brlRates[fromCode];
  const converted = amountInBrl / brlRates[toCode];
  const unitRate = brlRates[fromCode] / brlRates[toCode];

  setCurrencyIcon(document.getElementById("from-select-icon"), fromCode);
  setCurrencyIcon(document.getElementById("to-select-icon"), toCode);
  setCurrencyIcon(document.getElementById("display-from-icon"), fromCode);
  setCurrencyIcon(document.getElementById("display-to-icon"), toCode);

  const displayFromCode = document.getElementById("display-from-code");
  const displayFromName = document.getElementById("display-from-name");
  const displayFromValue = document.getElementById("display-from-value");
  const displayToCode = document.getElementById("display-to-code");
  const displayToName = document.getElementById("display-to-name");
  const displayToValue = document.getElementById("display-to-value");
  const unitRateText = document.getElementById("unit-rate-text");
  const variationText = document.getElementById("variation-text");

  if (displayFromCode) displayFromCode.textContent = fromMeta.code;
  if (displayFromName) displayFromName.textContent = fromMeta.name;
  if (displayFromValue) displayFromValue.textContent = formatAmount(amount, fromCode);

  if (displayToCode) displayToCode.textContent = toMeta.code;
  if (displayToName) displayToName.textContent = toMeta.name;
  if (displayToValue) displayToValue.textContent = formatAmount(converted, toCode);

  const rateDecimals = toCode === "BTC" ? 8 : 6;
  if (unitRateText) {
    unitRateText.textContent = `1 ${fromCode} = ${unitRate.toFixed(rateDecimals)} ${toCode}`;
  }

  const varInfo = variations24h[toCode] || variations24h[fromCode] || "+0.00%";
  if (variationText) {
    variationText.textContent = `Variação 24h: ${varInfo}`;
  }

  const cardUsdPrice = document.getElementById("card-usd-price");
  const cardEurPrice = document.getElementById("card-eur-price");
  const cardBtcPrice = document.getElementById("card-btc-price");

  if (cardUsdPrice) cardUsdPrice.textContent = formatAmount(brlRates.USD, "BRL");
  if (cardEurPrice) cardEurPrice.textContent = formatAmount(brlRates.EUR, "BRL");
  if (cardBtcPrice) cardBtcPrice.textContent = formatAmount(brlRates.BTC, "BRL");
}

function swapCurrencies() {
  const fromSelect = document.getElementById("from-currency");
  const toSelect = document.getElementById("to-currency");
  const swapIcon = document.getElementById("swap-icon");

  if (!fromSelect || !toSelect) return;

  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;

  swapAngle += 180;
  if (swapIcon) {
    swapIcon.style.transform = `rotate(${swapAngle}deg)`;
  }

  updateConversion();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("toast-visible");

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("toast-visible");
  }, 2200);
}

async function fetchLiveRates() {
  const statusEl = document.getElementById("rate-status");
  const refreshIcon = document.getElementById("refresh-icon");

  refreshAngle += 360;
  if (refreshIcon) {
    refreshIcon.style.transform = `rotate(${refreshAngle}deg)`;
  }

  try {
    const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL", {
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();

    if (data.USDBRL && parseFloat(data.USDBRL.bid) > 0) {
      brlRates.USD = parseFloat(data.USDBRL.bid);
      const pct = parseFloat(data.USDBRL.pctChange || 0);
      variations24h.USD = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
    }

    if (data.EURBRL && parseFloat(data.EURBRL.bid) > 0) {
      brlRates.EUR = parseFloat(data.EURBRL.bid);
      const pct = parseFloat(data.EURBRL.pctChange || 0);
      variations24h.EUR = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
    }

    if (data.BTCBRL && parseFloat(data.BTCBRL.bid) > 0) {
      brlRates.BTC = parseFloat(data.BTCBRL.bid);
      const pct = parseFloat(data.BTCBRL.pctChange || 0);
      variations24h.BTC = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
    }

    if (statusEl) {
      statusEl.innerHTML = `<span class="status-dot"></span>Cotações ao vivo`;
    }
  } catch {
    if (statusEl) {
      statusEl.innerHTML = `<span class="status-dot"></span>Modo referência`;
    }
  }

  updateConversion();
}

document.addEventListener("DOMContentLoaded", () => {
  initializeIcons();

  document.getElementById("amount-input")?.addEventListener("input", updateConversion);
  document.getElementById("from-currency")?.addEventListener("change", updateConversion);
  document.getElementById("to-currency")?.addEventListener("change", updateConversion);
  document.getElementById("swap-btn")?.addEventListener("click", swapCurrencies);
  document.getElementById("refresh-btn")?.addEventListener("click", fetchLiveRates);

  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.preset;
      const input = document.getElementById("amount-input");
      if (input) {
        input.value = val;
        updateConversion();
      }
    });
  });

  document.getElementById("copy-btn")?.addEventListener("click", async () => {
    const resultText = document.getElementById("display-to-value")?.textContent || "";
    try {
      await navigator.clipboard.writeText(resultText);
      showToast(`Copiado: ${resultText}`);
    } catch {
      showToast("Não foi possível copiar automaticamente");
    }
  });

  updateConversion();
  fetchLiveRates();
});
