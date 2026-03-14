document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEYS = {
    nickname: "alkol_app_nickname",
    history: "alkol_app_history"
  };

  const MAX_VISUAL_FILL = 70;
  const HISTORY_LIFETIME_MS = 12 * 60 * 60 * 1000;

  const welcomeScreen = document.getElementById("welcomeScreen");
  const calculatorScreen = document.getElementById("calculatorScreen");

  const nicknameForm = document.getElementById("nicknameForm");
  const nicknameInput = document.getElementById("nicknameInput");
  const activeNickname = document.getElementById("activeNickname");

  const form = document.getElementById("calculatorForm");
  const resultBox = document.getElementById("result");
  const resetBtn = document.getElementById("resetBtn");

  const volumeInput = document.getElementById("volume");
  const currentDegInput = document.getElementById("currentDeg");
  const targetDegInput = document.getElementById("targetDeg");
  const densityInput = document.getElementById("density");

  const liquidBase = document.getElementById("liquidBase");
  const liquidAdded = document.getElementById("liquidAdded");

  const statCurrent = document.getElementById("statCurrent");
  const statAdded = document.getElementById("statAdded");
  const statTotal = document.getElementById("statTotal");
  const legendAddedText = document.getElementById("legendAddedText");

  const historyToggleBtn = document.getElementById("historyToggleBtn");
  const historyPanel = document.getElementById("historyPanel");
  const closeHistoryBtn = document.getElementById("closeHistoryBtn");
  const historyBackdrop = document.getElementById("historyBackdrop");
  const historyList = document.getElementById("historyList");
  const historyMeta = document.getElementById("historyMeta");

  let currentUser = "";

  function formatNumber(value) {
    return Number(value).toFixed(2);
  }

  function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString("tr-TR");
  }

  function sanitizeNickname(value) {
    return value.trim().replace(/\s+/g, " ");
  }

  function getStoredNickname() {
    return localStorage.getItem(STORAGE_KEYS.nickname) || "";
  }

  function setStoredNickname(nickname) {
    localStorage.setItem(STORAGE_KEYS.nickname, nickname);
  }

  function getHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.history);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Geçmiş okunamadı:", error);
      return [];
    }
  }

  function setHistory(historyArray) {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(historyArray));
  }

  function clearAllHistory() {
    localStorage.removeItem(STORAGE_KEYS.history);
    renderHistory();
    console.log("Geçmiş hesaplamalar temizlendi.");
  }

  function resetCalculationApp() {
    localStorage.removeItem(STORAGE_KEYS.history);
    localStorage.removeItem(STORAGE_KEYS.nickname);
    console.log("Tüm uygulama verileri temizlendi.");
    location.reload();
  }

  window.clearCalculationHistory = clearAllHistory;
  window.resetCalculationApp = resetCalculationApp;

  function getRemainingMs(createdAt) {
    const expiresAt = createdAt + HISTORY_LIFETIME_MS;
    return Math.max(0, expiresAt - Date.now());
  }

  function formatRemainingTime(createdAt) {
    const remainingMs = getRemainingMs(createdAt);

    if (remainingMs <= 0) {
      return "Süresi doldu";
    }

    const totalMinutes = Math.ceil(remainingMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}s ${minutes}dk`;
  }

  function pruneExpiredHistory() {
    const history = getHistory();
    const filtered = history.filter((item) => getRemainingMs(item.createdAt) > 0);

    if (filtered.length !== history.length) {
      setHistory(filtered);
    }

    return filtered;
  }

  function saveCalculation(entry) {
    const history = pruneExpiredHistory();
    history.unshift(entry);
    setHistory(history);
    renderHistory();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function parseUserAgentInfo(userAgent) {
    const ua = userAgent || "";
    let os = "Bilinmiyor";
    let browser = "Bilinmiyor";
    let platformType = /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? "Mobil" : "Masaüstü";

    if (/Windows NT 10\.0/i.test(ua)) os = "Windows 10/11";
    else if (/Windows NT 6\.3/i.test(ua)) os = "Windows 8.1";
    else if (/Windows NT 6\.2/i.test(ua)) os = "Windows 8";
    else if (/Windows NT 6\.1/i.test(ua)) os = "Windows 7";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
    else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
    else if (/Linux/i.test(ua)) os = "Linux";

    if (/Edg\//i.test(ua)) browser = "Microsoft Edge";
    else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = "Opera";
    else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Google Chrome";
    else if (/Firefox\//i.test(ua)) browser = "Mozilla Firefox";
    else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Safari";

    return {
      os,
      browser,
      platformType
    };
  }

  async function getDeviceMetadata() {
    const nav = navigator;
    const ua = nav.userAgent || "Bilinmiyor";
    const platform = nav.platform || "Bilinmiyor";
    const parsed = parseUserAgentInfo(ua);

    let brandModel = "Bilinmiyor";

    try {
      if (nav.userAgentData) {
        const highEntropyValues = await nav.userAgentData.getHighEntropyValues([
          "platform",
          "platformVersion",
          "model",
          "architecture",
          "bitness",
          "uaFullVersion"
        ]);

        const brands = Array.isArray(nav.userAgentData.brands)
          ? nav.userAgentData.brands.map((item) => item.brand).filter(Boolean).join(", ")
          : "";

        const model = highEntropyValues.model || "";
        const platformName = highEntropyValues.platform || "";
        const platformVersion = highEntropyValues.platformVersion || "";

        if (model) {
          brandModel = model;
        } else if (brands) {
          brandModel = brands;
        }

        return {
          os: parsed.os !== "Bilinmiyor"
            ? parsed.os
            : platformName
              ? `${platformName}${platformVersion ? ` ${platformVersion}` : ""}`
              : "Bilinmiyor",
          browser: parsed.browser,
          platform,
          platformType: parsed.platformType,
          userAgent: ua,
          brandModel
        };
      }
    } catch (error) {
      console.warn("Detaylı cihaz bilgisi alınamadı:", error);
    }

    return {
      os: parsed.os,
      browser: parsed.browser,
      platform,
      platformType: parsed.platformType,
      userAgent: ua,
      brandModel
    };
  }

  function renderHistory() {
    const history = pruneExpiredHistory();
    historyMeta.textContent = `Toplam kayıt: ${history.length} • Kayıtlar 12 saat sonunda otomatik silinir`;

    if (!history.length) {
      historyList.innerHTML = `<div class="history-empty">Henüz kayıtlı bir hesaplama yok.</div>`;
      return;
    }

    historyList.innerHTML = history
      .map((item, index) => {
        return `
          <article class="history-item">
            <div class="history-item-top">
              <div class="history-user">${escapeHtml(item.nickname)}</div>
              <div class="history-time">${escapeHtml(formatDateTime(item.createdAt))}</div>
            </div>

            <div class="history-type-row">
              <div class="history-type">${escapeHtml(item.operationLabel)}</div>
              <div class="history-expiry">Silinmeye kalan: <strong>${escapeHtml(formatRemainingTime(item.createdAt))}</strong></div>
            </div>

            <div class="history-grid">
              <div>Mevcut Hacim: <strong>${escapeHtml(item.volumeText)}</strong></div>
              <div>Mevcut Derece: <strong>%${escapeHtml(item.currentDegText)}</strong></div>
              <div>Hedef Derece: <strong>%${escapeHtml(item.targetDegText)}</strong></div>
              <div>Yoğunluk: <strong>${escapeHtml(item.densityText)}</strong></div>
              <div>Eklenecek: <strong>${escapeHtml(item.addedText)}</strong></div>
              <div>Toplam: <strong>${escapeHtml(item.totalText)}</strong></div>
            </div>

            <div class="history-actions">
              <button
                type="button"
                class="history-detail-btn"
                data-detail-btn="${index}"
                aria-expanded="false"
              >
                Detaylar
              </button>
            </div>

            <div class="history-details" data-detail-panel="${index}" hidden>
              <div class="history-detail-grid">
                <div>İşletim Sistemi: <strong>${escapeHtml(item.osText || "Bilinmiyor")}</strong></div>
                <div>Tarayıcı: <strong>${escapeHtml(item.browserText || "Bilinmiyor")}</strong></div>
                <div>Platform: <strong>${escapeHtml(item.platformText || "Bilinmiyor")}</strong></div>
                <div>Cihaz Türü: <strong>${escapeHtml(item.platformTypeText || "Bilinmiyor")}</strong></div>
                <div>Marka/Model: <strong>${escapeHtml(item.brandModelText || "Bilinmiyor")}</strong></div>
                <div class="history-user-agent">User Agent: <strong>${escapeHtml(item.userAgentText || "Bilinmiyor")}</strong></div>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function toggleHistoryDetails(button) {
    const index = button.getAttribute("data-detail-btn");
    const panel = historyList.querySelector(`[data-detail-panel="${index}"]`);

    if (!panel) return;

    const isOpen = !panel.hasAttribute("hidden");

    if (isOpen) {
      panel.setAttribute("hidden", "");
      button.setAttribute("aria-expanded", "false");
      button.textContent = "Detaylar";
    } else {
      panel.removeAttribute("hidden");
      button.setAttribute("aria-expanded", "true");
      button.textContent = "Detayları Gizle";
    }
  }

  function showWelcomeScreen() {
    welcomeScreen.classList.add("active");
    calculatorScreen.classList.remove("active");
    historyToggleBtn.style.display = "none";
    nicknameInput.focus();
  }

  function showCalculatorScreen(nickname) {
    currentUser = nickname;
    activeNickname.textContent = nickname;
    welcomeScreen.classList.remove("active");
    calculatorScreen.classList.add("active");
    historyToggleBtn.style.display = "inline-flex";
    renderHistory();
    volumeInput.focus();
  }

  function showResult(message, type = "info") {
    resultBox.textContent = message;
    resultBox.className = `result-box ${type}`;
  }

  function clearResult() {
    resultBox.textContent = "";
    resultBox.className = "result-box";
  }

  function resetCylinder() {
    liquidBase.style.height = "0%";
    liquidAdded.style.height = "0%";
    liquidAdded.style.bottom = "0%";

    statCurrent.textContent = "0.00 L";
    statAdded.textContent = "0.00";
    statTotal.textContent = "0.00 L";
    legendAddedText.textContent = "Eklenecek Miktar";
  }

  function updateCylinder(currentValue, addedValue, addedLabel, addedUnit, totalValue) {
    const safeCurrent = Math.max(0, currentValue);
    const safeAdded = Math.max(0, addedValue);
    const safeTotal = Math.max(safeCurrent + safeAdded, 0.0001);

    const currentRatio = safeCurrent / safeTotal;
    const addedRatio = safeAdded / safeTotal;

    const currentPercent = currentRatio * MAX_VISUAL_FILL;
    const addedPercent = addedRatio * MAX_VISUAL_FILL;

    liquidBase.style.height = `${currentPercent}%`;
    liquidAdded.style.height = `${addedPercent}%`;
    liquidAdded.style.bottom = `${currentPercent}%`;

    statCurrent.textContent = `${formatNumber(safeCurrent)} L`;
    statAdded.textContent = `${formatNumber(safeAdded)} ${addedUnit}`;
    statTotal.textContent = `${formatNumber(totalValue)} L`;
    legendAddedText.textContent = addedLabel;
  }

  function openHistoryPanel() {
    historyPanel.classList.add("open");
    historyBackdrop.classList.add("show");
    historyPanel.setAttribute("aria-hidden", "false");
  }

  function closeHistoryPanel() {
    historyPanel.classList.remove("open");
    historyBackdrop.classList.remove("show");
    historyPanel.setAttribute("aria-hidden", "true");
  }

  async function calculateAlcohol(event) {
    event.preventDefault();

    const V = parseFloat(volumeInput.value);
    const A1 = parseFloat(currentDegInput.value);
    const A2 = parseFloat(targetDegInput.value);
    const densityRaw = densityInput.value.trim();
    const rho = densityRaw === "" ? 0.8 : parseFloat(densityRaw);

    if (
      Number.isNaN(V) ||
      Number.isNaN(A1) ||
      Number.isNaN(A2) ||
      Number.isNaN(rho) ||
      V <= 0 ||
      A1 <= 0 ||
      A2 <= 0 ||
      rho <= 0
    ) {
      showResult("Lütfen tüm alanlara geçerli ve pozitif değerler giriniz.", "error");
      resetCylinder();
      return;
    }

    if (A1 >= 100 || A2 >= 100) {
      showResult("Alkol derecesi 100'den küçük olmalıdır.", "error");
      resetCylinder();
      return;
    }

    if (A2 >= 96 && A2 > A1) {
      showResult("ENA ile yükseltme işleminde hedef derece 96'dan küçük olmalıdır.", "error");
      resetCylinder();
      return;
    }

    let operationLabel = "";
    let addedValue = 0;
    let addedUnit = "L";
    let totalVisual = V;
    let resultMessage = "";

    if (A2 > A1) {
      const enaKg = (V * (A2 - A1)) / (96 - A2) * rho;
      operationLabel = "ENA Ekleme";
      addedValue = enaKg;
      addedUnit = "kg";
      totalVisual = V + enaKg;
      resultMessage = `Dereceyi %${formatNumber(A1)}'den %${formatNumber(A2)}'ye çıkarmak için yaklaşık ${formatNumber(enaKg)} kg ENA eklenmelidir.`;

      showResult(resultMessage, "success");
      updateCylinder(V, enaKg, "Eklenecek ENA", "kg", totalVisual);
    } else if (A2 < A1) {
      const waterLiters = (V * (A1 - A2)) / A2;
      operationLabel = "Su Ekleme";
      addedValue = waterLiters;
      addedUnit = "L";
      totalVisual = V + waterLiters;
      resultMessage = `Dereceyi %${formatNumber(A1)}'den %${formatNumber(A2)}'ye düşürmek için yaklaşık ${formatNumber(waterLiters)} litre su eklenmelidir.`;

      showResult(resultMessage, "success");
      updateCylinder(V, waterLiters, "Eklenecek Su", "L", totalVisual);
    } else {
      operationLabel = "İşlem Yok";
      addedValue = 0;
      addedUnit = "L";
      totalVisual = V;
      resultMessage = "Mevcut ve hedef dereceler eşit. Ek işlem gerekmiyor.";

      showResult(resultMessage, "info");
      updateCylinder(V, 0, "Eklenecek Miktar", "L", V);
    }

    const deviceMeta = await getDeviceMetadata();

    saveCalculation({
      nickname: currentUser,
      createdAt: Date.now(),
      operationLabel,
      volumeText: `${formatNumber(V)} L`,
      currentDegText: formatNumber(A1),
      targetDegText: formatNumber(A2),
      densityText: formatNumber(rho),
      addedText: `${formatNumber(addedValue)} ${addedUnit}`,
      totalText: `${formatNumber(totalVisual)} L`,
      osText: deviceMeta.os,
      browserText: deviceMeta.browser,
      platformText: deviceMeta.platform,
      platformTypeText: deviceMeta.platformType,
      userAgentText: deviceMeta.userAgent,
      brandModelText: deviceMeta.brandModel
    });
  }

  function resetForm() {
    form.reset();
    clearResult();
    resetCylinder();
    volumeInput.focus();
  }

  function handleNicknameSubmit(event) {
    event.preventDefault();

    const nickname = sanitizeNickname(nicknameInput.value);

    if (!nickname) {
      alert("Lütfen bir takma ad girin.");
      nicknameInput.focus();
      return;
    }

    setStoredNickname(nickname);
    showCalculatorScreen(nickname);
  }

  nicknameForm.addEventListener("submit", handleNicknameSubmit);
  form.addEventListener("submit", calculateAlcohol);
  resetBtn.addEventListener("click", resetForm);

  historyToggleBtn.addEventListener("click", openHistoryPanel);
  closeHistoryBtn.addEventListener("click", closeHistoryPanel);
  historyBackdrop.addEventListener("click", closeHistoryPanel);

  historyList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-detail-btn]");
    if (!button) return;
    toggleHistoryDetails(button);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeHistoryPanel();
    }
  });

  resetCylinder();
  renderHistory();

  const savedNickname = getStoredNickname();
  if (savedNickname) {
    showCalculatorScreen(savedNickname);
  } else {
    showWelcomeScreen();
  }

  setInterval(() => {
    renderHistory();
  }, 60000);
});