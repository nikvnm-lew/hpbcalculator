function getTypicalIndexGcv(indexName) {
  const gcvMap = {
    NEWC: 6322,
    ICI1: 6500,
    ICI2: 5800,
    ICI3: 5000,
    ICI4: 4200,
    ICI5: 3400,
    M42: 4200,
    M50: 5000,
    M58: 5800
  };

  return gcvMap[indexName] || 0;
}

function formatIndexLabel(indexName) {
  const labelMap = {
    NEWC: "NEWC",
    ICI1: "ICI 1",
    ICI2: "ICI 2",
    ICI3: "ICI 3",
    ICI4: "ICI 4",
    ICI5: "ICI 5",
    M42: "M42",
    M50: "M50",
    M58: "M58"
  };

  return labelMap[indexName] || indexName;
}

function formatUSD(value) {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return `$ ${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatGar(value) {
  if (value === null || value === undefined || isNaN(value) || value === 0) return "-";
  return `${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })} GAR`;
}

function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return `${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}%`;
}

function togglePricingSections() {
  const pricingType = document.getElementById("pricingType").value;
  const singleSection = document.getElementById("singleIndexSection");
  const blendedSection = document.getElementById("blendedIndexSection");
  const fixedSection = document.getElementById("fixedPriceSection");

  singleSection.classList.add("hidden");
  blendedSection.classList.add("hidden");
  fixedSection.classList.add("hidden");

  if (pricingType === "SINGLE_INDEX") {
    singleSection.classList.remove("hidden");
  } else if (pricingType === "BLENDED_2_INDEX") {
    blendedSection.classList.remove("hidden");
  } else if (pricingType === "FIXED_PRICE") {
    fixedSection.classList.remove("hidden");
  }
}

function toggleHbaReferenceMode() {
  const mode = document.getElementById("hbaReferenceMode").value;
  const manualSection = document.getElementById("manualReferenceSection");
  const autoActions = document.getElementById("autoReferenceActions");

  if (mode === "MANUAL") {
    manualSection.classList.remove("hidden");
    autoActions.classList.add("hidden");
    document.getElementById("minerbaStatus").innerText = "Manual mode";
  } else {
    manualSection.classList.add("hidden");
    autoActions.classList.remove("hidden");
    document.getElementById("minerbaStatus").innerText = "Not loaded";
  }
}

function updateSingleIndexLabel() {
  const indexName = document.getElementById("singleIndexName").value;
  document.getElementById("singleIndexValueLabel").innerText =
    `${formatIndexLabel(indexName)} Value`;
}

function updateBlendedIndexLabels() {
  const leg1Index = document.getElementById("leg1Index").value;
  const leg2Index = document.getElementById("leg2Index").value;

  document.getElementById("leg1ValueLabel").innerText =
    `${formatIndexLabel(leg1Index)} Value`;

  document.getElementById("leg2ValueLabel").innerText =
    `${formatIndexLabel(leg2Index)} Value`;
}

function detectNormalHbaRule(gcv) {
  if (!gcv || gcv <= 0) return { formula: "-", label: "HBA" };

  if (gcv > 6000) {
    return { formula: "HPB_6000", label: "HBA" };
  } else if (gcv >= 5300) {
    return { formula: "HPB_5300", label: "HBA I" };
  } else if (gcv > 4100) {
    return { formula: "HPB_4100", label: "HBA II" };
  } else if (gcv > 3400) {
    return { formula: "HPB_3400", label: "HBA III" };
  } else {
    return { formula: "HPB_Sub3400", label: "HBA III" };
  }
}

function updateHpbInputSection() {
  const gcv = parseFloat(document.getElementById("gcv").value) || 0;
  const hpbMode = document.getElementById("hpbMode").value;

  const normalSection = document.getElementById("hpbNormalSection");
  const cap70Section = document.getElementById("hpbCap70Section");
  const cap90Section = document.getElementById("hpbCap90Section");
  const detectedRule = document.getElementById("detectedHpbRule");
  const normalHbaLabel = document.getElementById("normalHbaLabel");

  normalSection.classList.add("hidden");
  cap70Section.classList.add("hidden");
  cap90Section.classList.add("hidden");

  if (hpbMode === "CAP70") {
    cap70Section.classList.remove("hidden");
    detectedRule.innerText = "HBA CAP 70";
  } else if (hpbMode === "CAP90") {
    cap90Section.classList.remove("hidden");
    detectedRule.innerText = "HBA CAP 90";
  } else {
    const rule = detectNormalHbaRule(gcv);
    normalSection.classList.remove("hidden");
    normalHbaLabel.innerText = rule.label;
    detectedRule.innerText = rule.label;
  }
}

function applyReferenceDisplay(data) {
  const hbaText = formatUSD(data.hba);
  const hba1Text = formatUSD(data.hba1);
  const hba2Text = formatUSD(data.hba2);
  const hba3Text = formatUSD(data.hba3);

  document.getElementById("displayHbaRight").innerText = hbaText;
  document.getElementById("displayHba1Right").innerText = hba1Text;
  document.getElementById("displayHba2Right").innerText = hba2Text;
  document.getElementById("displayHba3Right").innerText = hba3Text;

  document.getElementById("latestHbaPeriodDisplay").innerText =
    `Period: ${data.period || "-"}`;
}

function applyReferenceValuesToCalculator(data) {
  document.getElementById("hba0Value").value = data.hba ?? "";

  const mode = document.getElementById("hpbMode").value;
  const gcv = parseFloat(document.getElementById("gcv").value) || 0;
  const rule = detectNormalHbaRule(gcv);

  if (mode === "NORMAL") {
    if (rule.formula === "HPB_6000") {
      document.getElementById("normalHbaValue").value = data.hba ?? "";
    } else if (rule.formula === "HPB_5300") {
      document.getElementById("normalHbaValue").value = data.hba1 ?? "";
    } else if (rule.formula === "HPB_4100") {
      document.getElementById("normalHbaValue").value = data.hba2 ?? "";
    } else {
      document.getElementById("normalHbaValue").value = data.hba3 ?? "";
    }
  }
}

function applyManualReferenceToCalculator() {
  const mode = document.getElementById("hbaReferenceMode").value;

  if (mode !== "MANUAL") {
    if (window.latestMinerbaHBA) {
      applyReferenceValuesToCalculator(window.latestMinerbaHBA);
      applyReferenceDisplay(window.latestMinerbaHBA);
    }
    return;
  }

  const manualData = {
    period: document.getElementById("manualHbaPeriod").value || "-",
    hba: parseFloat(document.getElementById("manualHba").value) || 0,
    hba1: parseFloat(document.getElementById("manualHba1").value) || 0,
    hba2: parseFloat(document.getElementById("manualHba2").value) || 0,
    hba3: parseFloat(document.getElementById("manualHba3").value) || 0
  };

  window.latestMinerbaHBA = manualData;

  document.getElementById("minerbaStatus").innerText = "Manual reference applied";
  applyReferenceDisplay(manualData);
  applyReferenceValuesToCalculator(manualData);
}

async function fetchHBAFromMinerba() {
  const statusEl = document.getElementById("minerbaStatus");
  const periodDisplayEl = document.getElementById("latestHbaPeriodDisplay");

  statusEl.innerText = "Failed to load directly from Minerba";
  periodDisplayEl.innerText = "Period: unavailable";

  document.getElementById("displayHbaRight").innerText = "-";
  document.getElementById("displayHba1Right").innerText = "-";
  document.getElementById("displayHba2Right").innerText = "-";
  document.getElementById("displayHba3Right").innerText = "-";
}

function convertPremDisc(type, value) {
  return type === "DISCOUNT" ? -value : value;
}

function getRoyaltyRate({ permitType, hpbMode, hba0, gcv }) {
  if (permitType === "IUPK") {
    if (hpbMode === "CAP70" || hpbMode === "CAP90") return 14;

    if (hba0 < 70) return 15;
    if (hba0 < 120) return 18;
    if (hba0 < 140) return 19;
    if (hba0 < 160) return 22;
    if (hba0 < 180) return 25;
    return 28;
  }

  const isCap = hpbMode === "CAP70" || hpbMode === "CAP90";

  if (gcv <= 4200) {
    if (isCap) return 6;
    if (hba0 < 70) return 5;
    if (hba0 < 90) return 6;
    return 9;
  }

  if (gcv < 5200) {
    if (isCap) return 8.5;
    if (hba0 < 70) return 7;
    if (hba0 < 90) return 8.5;
    return 11.5;
  }

  if (isCap) return 11.5;
  if (hba0 < 70) return 9.5;
  if (hba0 < 90) return 11.5;
  return 13.5;
}

function calculate() {
  const hpbMode = document.getElementById("hpbMode").value;
  const permitType = document.getElementById("permitType").value;

  const gcv = parseFloat(document.getElementById("gcv").value) || 0;
  const tm = parseFloat(document.getElementById("tm").value) || 0;
  const ts = parseFloat(document.getElementById("ts").value) || 0;
  const ash = parseFloat(document.getElementById("ash").value) || 0;

  const hba0 = parseFloat(document.getElementById("hba0Value").value) || 0;
  const transhipmentFreight =
    parseFloat(document.getElementById("transhipmentFreight").value) || 0;

  const normalHbaValue = parseFloat(document.getElementById("normalHbaValue").value) || 0;
  const hbaCap70 = parseFloat(document.getElementById("hbaCap70").value) || 70;
  const hbaCap90 = parseFloat(document.getElementById("hbaCap90").value) || 90;

  const pricingType = document.getElementById("pricingType").value;
  const contractGcv = parseFloat(document.getElementById("contractGcv").value) || 0;

  function priceCAP(hbaCap) {
    if (gcv > 4200) {
      return (
        hbaCap * (gcv / 6322) * ((100 - tm) / (100 - 8)) -
        (((ts - 0.8) * 4) + ((ash - 15) * 0.4))
      );
    } else {
      const base =
        hbaCap *
        (4200 / 6322) *
        ((100 - 35) /
          (100 - 8 / ((((100 - 8) / (100 - 35)) * 35 + (100 - 8)) / 100)));

      if (tm < 40) {
        return (
          base *
            (gcv / 4200) *
            ((100 - tm) / (100 - 35)) *
            (100 - 8 / ((((100 - 8) / (100 - 35)) * 35 + (100 - 8)) / 100)) /
            (100 - 8 / ((((100 - 8) / (100 - tm)) * tm + (100 - 8)) / 100)) -
          (((ts - 0.8) * 4) + ((ash - 15) * 0.4))
        );
      } else {
        return (
          base *
          (gcv / 4200) *
          ((100 - tm) / (100 - 35)) *
          (100 - 8 / ((((100 - 8) / (100 - 35)) * 35 + (100 - 8)) / 100)) /
          (100 - 8 / ((((100 - 8) / (100 - tm)) * tm + (100 - 8)) / 100))
        );
      }
    }
  }

  function price6000(hba) {
    return (
      hba * (gcv / 6322) * ((100 - tm) / (100 - 12.26)) -
      (((ts - 0.66) * 4) + ((ash - 7.94) * 0.4))
    );
  }

  function price5300(hba1) {
    return (
      hba1 * (gcv / 5300) * ((100 - tm) / (100 - 21.32)) -
      (((ts - 0.75) * 4) + ((ash - 6.04) * 0.4))
    );
  }

  function price4100(hba2) {
    return (
      hba2 * (gcv / 4100) * ((100 - tm) / (100 - 35.73)) -
      (((ts - 0.23) * 4) + ((ash - 3.9) * 0.4))
    );
  }

  function price3400(hba3) {
    return (
      hba3 *
        (gcv / 4100) *
        ((100 - tm) /
          (100 - 35.73 / ((((100 - 35.73) / (100 - tm)) * tm + (100 - 35.73)) / 100))) -
      (((ts - 0.23) * 4) + ((ash - 3.9) * 0.4))
    );
  }

  function priceSub3400(hba3) {
    return (
      hba3 *
        (gcv / 3400) *
        ((100 - tm) /
          (100 - 44.3 / ((((100 - 44.3) / (100 - tm)) * tm + (100 - 44.3)) / 100))) -
      (((ts - 0.24) * 4) + ((ash - 3.88) * 0.4))
    );
  }

  let hpb = 0;
  let selectedFormula = "";

  if (hpbMode === "CAP70") {
    hpb = priceCAP(hbaCap70);
    selectedFormula = "HPB_CAP 70";
  } else if (hpbMode === "CAP90") {
    hpb = priceCAP(hbaCap90);
    selectedFormula = "HPB_CAP 90";
  } else {
    const rule = detectNormalHbaRule(gcv);

    if (rule.formula === "HPB_6000") {
      hpb = price6000(normalHbaValue);
      selectedFormula = "HPB_6000 (HBA)";
    } else if (rule.formula === "HPB_5300") {
      hpb = price5300(normalHbaValue);
      selectedFormula = "HPB_5300 (HBA I)";
    } else if (rule.formula === "HPB_4100") {
      hpb = price4100(normalHbaValue);
      selectedFormula = "HPB_4100 (HBA II)";
    } else if (rule.formula === "HPB_3400") {
      hpb = price3400(normalHbaValue);
      selectedFormula = "HPB_3400 (HBA III)";
    } else {
      hpb = priceSub3400(normalHbaValue);
      selectedFormula = "HPB_Sub3400 (HBA III)";
    }
  }

  function calculateSingleIndexSellingPrice() {
    const indexName = document.getElementById("singleIndexName").value;
    const indexValue = parseFloat(document.getElementById("singleIndexValue").value) || 0;
    const premDiscType = document.getElementById("singlePremDiscType").value;
    const premDiscValue = parseFloat(document.getElementById("singlePremDiscValue").value) || 0;
    const premDiscPosition = document.getElementById("singlePremDiscPosition").value;

    const premDiscSigned = convertPremDisc(premDiscType, premDiscValue);
    const premDiscLabel = premDiscType === "DISCOUNT" ? "-" : "+";
    const typicalIndexGcv = getTypicalIndexGcv(indexName);

    let basePrice = 0;
    let baseFormula = "";

    if (premDiscPosition === "BEFORE_PRORATE") {
      const indexedWithPremDisc = indexValue + premDiscSigned;
      basePrice = typicalIndexGcv ? (indexedWithPremDisc * contractGcv / typicalIndexGcv) : 0;
      baseFormula =
        `(${formatIndexLabel(indexName)} ${premDiscLabel} ${premDiscValue}) × ${contractGcv} / ${typicalIndexGcv}`;
    } else {
      const proratedIndex = typicalIndexGcv ? (indexValue * contractGcv / typicalIndexGcv) : 0;
      basePrice = proratedIndex + premDiscSigned;
      baseFormula =
        `(${formatIndexLabel(indexName)} × ${contractGcv} / ${typicalIndexGcv}) ${premDiscLabel} ${premDiscValue}`;
    }

    const adjPrice = contractGcv ? (basePrice * gcv / contractGcv) : 0;
    const adjFormula = contractGcv
      ? `${formatUSD(basePrice)} × ${gcv} / ${contractGcv}`
      : "-";

    return {
      mode: "Single Index",
      basePrice,
      adjPrice,
      baseFormula,
      adjFormula
    };
  }

  function calculateBlended2SellingPrice() {
    const premDiscPosition = document.getElementById("blendedPremDiscPosition").value;

    const leg1Weight = parseFloat(document.getElementById("leg1Weight").value) || 0;
    const leg1Index = document.getElementById("leg1Index").value;
    const leg1Value = parseFloat(document.getElementById("leg1Value").value) || 0;
    const leg1PremDiscType = document.getElementById("leg1PremDiscType").value;
    const leg1PremDiscValue = parseFloat(document.getElementById("leg1PremDiscValue").value) || 0;

    const leg2Weight = parseFloat(document.getElementById("leg2Weight").value) || 0;
    const leg2Index = document.getElementById("leg2Index").value;
    const leg2Value = parseFloat(document.getElementById("leg2Value").value) || 0;
    const leg2PremDiscType = document.getElementById("leg2PremDiscType").value;
    const leg2PremDiscValue = parseFloat(document.getElementById("leg2PremDiscValue").value) || 0;

    const w1 = leg1Weight / 100;
    const w2 = leg2Weight / 100;

    const typicalIndexGcv1 = getTypicalIndexGcv(leg1Index);
    const typicalIndexGcv2 = getTypicalIndexGcv(leg2Index);

    const leg1PremDiscSigned = convertPremDisc(leg1PremDiscType, leg1PremDiscValue);
    const leg2PremDiscSigned = convertPremDisc(leg2PremDiscType, leg2PremDiscValue);

    const leg1SignLabel = leg1PremDiscType === "DISCOUNT" ? "-" : "+";
    const leg2SignLabel = leg2PremDiscType === "DISCOUNT" ? "-" : "+";

    let leg1Base = 0;
    let leg2Base = 0;
    let baseFormula = "";

    if (premDiscPosition === "BEFORE_PRORATE") {
      leg1Base = typicalIndexGcv1
        ? (w1 * (leg1Value + leg1PremDiscSigned)) * contractGcv / typicalIndexGcv1
        : 0;
      leg2Base = typicalIndexGcv2
        ? (w2 * (leg2Value + leg2PremDiscSigned)) * contractGcv / typicalIndexGcv2
        : 0;

      baseFormula =
        `(${leg1Weight}% × (${formatIndexLabel(leg1Index)} ${leg1SignLabel} ${leg1PremDiscValue}) × ${contractGcv} / ${typicalIndexGcv1}) + ` +
        `(${leg2Weight}% × (${formatIndexLabel(leg2Index)} ${leg2SignLabel} ${leg2PremDiscValue}) × ${contractGcv} / ${typicalIndexGcv2})`;
    } else {
      leg1Base = typicalIndexGcv1
        ? ((w1 * leg1Value) * contractGcv / typicalIndexGcv1) + leg1PremDiscSigned
        : 0;
      leg2Base = typicalIndexGcv2
        ? ((w2 * leg2Value) * contractGcv / typicalIndexGcv2) + leg2PremDiscSigned
        : 0;

      baseFormula =
        `(${leg1Weight}% × ${formatIndexLabel(leg1Index)} × ${contractGcv} / ${typicalIndexGcv1} ${leg1SignLabel} ${leg1PremDiscValue}) + ` +
        `(${leg2Weight}% × ${formatIndexLabel(leg2Index)} × ${contractGcv} / ${typicalIndexGcv2} ${leg2SignLabel} ${leg2PremDiscValue})`;
    }

    const basePrice = leg1Base + leg2Base;
    const adjPrice = contractGcv ? (basePrice * gcv / contractGcv) : 0;
    const adjFormula = contractGcv
      ? `${formatUSD(basePrice)} × ${gcv} / ${contractGcv}`
      : "-";

    return {
      mode: "Blended 2 Index",
      basePrice,
      adjPrice,
      baseFormula,
      adjFormula
    };
  }

  function calculateFixedPrice() {
    const fixedBasePrice = parseFloat(document.getElementById("fixedBasePrice").value) || 0;

    const adjPrice = contractGcv ? (fixedBasePrice * gcv / contractGcv) : 0;
    const adjFormula = contractGcv
      ? `${formatUSD(fixedBasePrice)} × ${gcv} / ${contractGcv}`
      : "-";

    return {
      mode: "Fixed Price",
      basePrice: fixedBasePrice,
      adjPrice,
      baseFormula: "Fixed Price Input",
      adjFormula
    };
  }

  let sellingPriceResult;

  if (pricingType === "BLENDED_2_INDEX") {
    sellingPriceResult = calculateBlended2SellingPrice();
  } else if (pricingType === "FIXED_PRICE") {
    sellingPriceResult = calculateFixedPrice();
  } else {
    sellingPriceResult = calculateSingleIndexSellingPrice();
  }

  const royaltyRate = getRoyaltyRate({
    permitType,
    hpbMode,
    hba0,
    gcv
  });

  const royaltyBase = Math.max(hpb, sellingPriceResult.adjPrice) - transhipmentFreight;
  const royaltyValue = royaltyBase * (royaltyRate / 100);

  document.getElementById("selectedFormula").innerText = selectedFormula;
  document.getElementById("result").innerText = formatUSD(hpb);

  document.getElementById("royaltyRateResult").innerText = formatPercent(royaltyRate);
  document.getElementById("royaltyValueResult").innerText = formatUSD(royaltyValue);

  document.getElementById("pricingModeResult").innerText = sellingPriceResult.mode;
  document.getElementById("typicalContractGcvResult").innerText = formatGar(contractGcv);
  document.getElementById("basePriceFormula").innerText = sellingPriceResult.baseFormula;
  document.getElementById("basePriceResult").innerText = formatUSD(sellingPriceResult.basePrice);
  document.getElementById("adjPriceFormula").innerText = sellingPriceResult.adjFormula;
  document.getElementById("adjPriceResult").innerText = formatUSD(sellingPriceResult.adjPrice);
}

function exportToPDF() {
  const now = new Date();

  document.getElementById("pdfTimestamp").innerText =
    `Generated on ${now.toLocaleString("en-US")}`;

  document.getElementById("pdfGcv").innerText =
    document.getElementById("gcv").value
      ? `${Number(document.getElementById("gcv").value).toLocaleString("en-US")} GAR`
      : "-";

  document.getElementById("pdfTm").innerText =
    document.getElementById("tm").value ? `${document.getElementById("tm").value} %` : "-";

  document.getElementById("pdfTs").innerText =
    document.getElementById("ts").value ? `${document.getElementById("ts").value} %` : "-";

  document.getElementById("pdfAsh").innerText =
    document.getElementById("ash").value ? `${document.getElementById("ash").value} %` : "-";

  document.getElementById("pdfHbaPeriod").innerText =
    window.latestMinerbaHBA?.period || document.getElementById("manualHbaPeriod").value || "-";

  document.getElementById("pdfSelectedFormula").innerText =
    document.getElementById("selectedFormula").innerText;

  document.getElementById("pdfHpb").innerText =
    document.getElementById("result").innerText;

  document.getElementById("pdfRoyaltyRate").innerText =
    document.getElementById("royaltyRateResult").innerText;

  document.getElementById("pdfRoyaltyValue").innerText =
    document.getElementById("royaltyValueResult").innerText;

  document.getElementById("pdfPricingMode").innerText =
    document.getElementById("pricingModeResult").innerText;

  document.getElementById("pdfTypicalContractGcv").innerText =
    document.getElementById("typicalContractGcvResult").innerText;

  document.getElementById("pdfBaseFormula").innerText =
    document.getElementById("basePriceFormula").innerText;

  document.getElementById("pdfBasePrice").innerText =
    document.getElementById("basePriceResult").innerText;

  document.getElementById("pdfAdjFormula").innerText =
    document.getElementById("adjPriceFormula").innerText;

  document.getElementById("pdfAdjPrice").innerText =
    document.getElementById("adjPriceResult").innerText;

  window.print();
}

window.onload = function () {
  togglePricingSections();
  toggleHbaReferenceMode();
  updateSingleIndexLabel();
  updateBlendedIndexLabels();
  updateHpbInputSection();
};