const $ = (id) => document.getElementById(id);

const form = $("plannerForm");

const fields = {
  projectName: $("projectName"),
  objectType: $("objectType"),
  location: $("location"),
  status: $("status"),
  roomCount: $("roomCount"),
  length: $("length"),
  width: $("width"),
  height: $("height"),
  wallThickness: $("wallThickness"),
  areaManual: $("areaManual"),
  volumeManual: $("volumeManual"),
  roofType: $("roofType"),
  roofArea: $("roofArea"),
  windowArea: $("windowArea"),
  doorArea: $("doorArea"),
  insulation: $("insulation"),
  material: $("material"),
  materialQty: $("materialQty"),
  materialUnitPrice: $("materialUnitPrice"),
  materialCost: $("materialCost"),
  fastenerType: $("fastenerType"),
  fastenerQty: $("fastenerQty"),
  fastenerUnitPrice: $("fastenerUnitPrice"),
  fastenerCost: $("fastenerCost"),
  laborCost: $("laborCost"),
  transportCost: $("transportCost"),
  extraCost: $("extraCost"),
  weight: $("weight"),
  loadCapacity: $("loadCapacity"),
  floorPlan: $("floorPlan"),
  notes: $("notes")
};

const outputs = {
  totalCost: $("totalCostOut"),
  area: $("areaOut"),
  volume: $("volumeOut"),
  objectType: $("objectTypeOut"),
  roofType: $("roofTypeOut"),
  roofArea: $("roofAreaOut"),
  roomCount: $("roomCountOut"),
  windowArea: $("windowAreaOut"),
  doorArea: $("doorAreaOut"),
  insulation: $("insulationOut"),
  status: $("statusOut"),
  material: $("materialOut"),
  materialUnitPrice: $("materialUnitPriceOut"),
  materialCost: $("materialCostOut"),
  fastenerType: $("fastenerTypeOut"),
  fastenerCost: $("fastenerCostOut"),
  laborCost: $("laborCostOut"),
  costPerArea: $("costPerAreaOut"),
  costPerVolume: $("costPerVolumeOut"),
  weight: $("weightOut"),
  loadCapacity: $("loadCapacityOut"),
  location: $("locationOut"),
  materialFill: $("materialFill"),
  fileBadge: $("fileBadge")
};

const formatNumber = (n) =>
  new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(n) || 0);

const formatCurrency = (n) => `${formatNumber(n)} €`;

function val(el) {
  return parseFloat((el?.value || "").replace(",", ".")) || 0;
}

function textOrDash(v) {
  return v && String(v).trim() ? String(v) : "–";
}

function calculate() {
  const length = val(fields.length);
  const width = val(fields.width);
  const height = val(fields.height);

  const autoArea = length > 0 && width > 0 ? length * width : 0;
  const autoVolume = autoArea > 0 && height > 0 ? autoArea * height : 0;

  const area = val(fields.areaManual) || autoArea;
  const volume = val(fields.volumeManual) || autoVolume;

  const materialQty = val(fields.materialQty);
  const materialUnitPrice = val(fields.materialUnitPrice);
  const materialCostManual = val(fields.materialCost);

  const calculatedMaterialCost =
    materialQty > 0 && materialUnitPrice > 0
      ? materialQty * materialUnitPrice
      : materialCostManual;

  const fastenerQty = val(fields.fastenerQty);
  const fastenerUnitPrice = val(fields.fastenerUnitPrice);
  const fastenerCostManual = val(fields.fastenerCost);

  const calculatedFastenerCost =
    fastenerQty > 0 && fastenerUnitPrice > 0
      ? fastenerQty * fastenerUnitPrice
      : fastenerCostManual;

  const laborCost = val(fields.laborCost);
  const transportCost = val(fields.transportCost);
  const extraCost = val(fields.extraCost);

  const totalCost =
    calculatedMaterialCost +
    calculatedFastenerCost +
    laborCost +
    transportCost +
    extraCost;

  const costPerArea = area > 0 ? totalCost / area : 0;
  const costPerVolume = volume > 0 ? totalCost / volume : 0;
  const materialPercent =
    totalCost > 0 ? Math.min((calculatedMaterialCost / totalCost) * 100, 100) : 0;

  outputs.totalCost.textContent = formatCurrency(totalCost);
  outputs.area.textContent = `${formatNumber(area)} m²`;
  outputs.volume.textContent = `${formatNumber(volume)} m³`;
  outputs.objectType.textContent = textOrDash(fields.objectType.value);
  outputs.roofType.textContent = textOrDash(fields.roofType.value);
  outputs.roofArea.textContent = `${formatNumber(val(fields.roofArea))} m²`;
  outputs.roomCount.textContent = String(Math.floor(val(fields.roomCount)));
  outputs.windowArea.textContent = `${formatNumber(val(fields.windowArea))} m²`;
  outputs.doorArea.textContent = `${formatNumber(val(fields.doorArea))} m²`;
  outputs.insulation.textContent = textOrDash(fields.insulation.value);
  outputs.status.textContent = textOrDash(fields.status.value);
  outputs.material.textContent = textOrDash(fields.material.value);
  outputs.materialUnitPrice.textContent = formatCurrency(materialUnitPrice);
  outputs.materialCost.textContent = formatCurrency(calculatedMaterialCost);
  outputs.fastenerType.textContent = textOrDash(fields.fastenerType.value);
  outputs.fastenerCost.textContent = formatCurrency(calculatedFastenerCost);
  outputs.laborCost.textContent = formatCurrency(laborCost);
  outputs.costPerArea.textContent = formatCurrency(costPerArea);
  outputs.costPerVolume.textContent = formatCurrency(costPerVolume);
  outputs.weight.textContent = `${formatNumber(val(fields.weight))} kg`;
  outputs.loadCapacity.textContent = `${formatNumber(val(fields.loadCapacity))} kg/m²`;
  outputs.location.textContent = textOrDash(fields.location.value);
  outputs.materialFill.style.width = `${materialPercent}%`;

  return {
    projectName: fields.projectName.value,
    objectType: fields.objectType.value,
    location: fields.location.value,
    status: fields.status.value,
    roomCount: val(fields.roomCount),
    length,
    width,
    height,
    wallThickness: val(fields.wallThickness),
    areaManual: val(fields.areaManual),
    volumeManual: val(fields.volumeManual),
    area,
    volume,
    roofType: fields.roofType.value,
    roofArea: val(fields.roofArea),
    windowArea: val(fields.windowArea),
    doorArea: val(fields.doorArea),
    insulation: fields.insulation.value,
    material: fields.material.value,
    materialQty,
    materialUnitPrice,
    materialCost: calculatedMaterialCost,
    fastenerType: fields.fastenerType.value,
    fastenerQty,
    fastenerUnitPrice,
    fastenerCost: calculatedFastenerCost,
    laborCost,
    transportCost,
    extraCost,
    weight: val(fields.weight),
    loadCapacity: val(fields.loadCapacity),
    floorPlan: fields.floorPlan.value,
    notes: fields.notes.value,
    totalCost,
    costPerArea,
    costPerVolume
  };
}

function saveToLocal() {
  const data = calculate();
  localStorage.setItem("objektplaner-data", JSON.stringify(data));
  const oldText = $("saveBtn").textContent;
  $("saveBtn").textContent = "Gespeichert";
  setTimeout(() => {
    $("saveBtn").textContent = oldText;
  }, 1400);
}

function loadFromLocal() {
  const raw = localStorage.getItem("objektplaner-data");
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    Object.keys(data).forEach((key) => {
      if (fields[key] && typeof data[key] !== "object") {
        fields[key].value = data[key];
      }
    });
    calculate();
  } catch (e) {
    console.error("Fehler beim Laden:", e);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  calculate();
});

["input", "change"].forEach((evt) => {
  form.addEventListener(evt, (e) => {
    if (e.target.matches("input, select, textarea")) {
      calculate();
    }
  });
});

$("resetBtn").addEventListener("click", () => {
  form.reset();
  outputs.materialFill.style.width = "0%";
  localStorage.removeItem("objektplaner-data");
  calculate();
});

$("saveBtn").addEventListener("click", saveToLocal);

$("demoFillBtn").addEventListener("click", () => {
  fields.projectName.value = "Gartenbereich Nord";
  fields.objectType.value = "Garten";
  fields.location.value = "draußen";
  fields.status.value = "geplant";
  fields.roomCount.value = "3";
  fields.length.value = "6";
  fields.width.value = "4";
  fields.height.value = "2.8";
  fields.wallThickness.value = "12";
  fields.areaManual.value = "";
  fields.volumeManual.value = "";
  fields.roofType.value = "Satteldach";
  fields.roofArea.value = "28";
  fields.windowArea.value = "4.5";
  fields.doorArea.value = "2.1";
  fields.insulation.value = "mittel";
  fields.material.value = "Holz";
  fields.materialQty.value = "24";
  fields.materialUnitPrice.value = "285";
  fields.materialCost.value = "";
  fields.fastenerType.value = "Schrauben";
  fields.fastenerQty.value = "120";
  fields.fastenerUnitPrice.value = "0.35";
  fields.fastenerCost.value = "";
  fields.laborCost.value = "2400";
  fields.transportCost.value = "450";
  fields.extraCost.value = "350";
  fields.weight.value = "1800";
  fields.loadCapacity.value = "250";
  fields.floorPlan.value = "Rechteckiger Grundriss, Eingang vorne mittig, Lagerbereich hinten rechts, Arbeitsfläche links.";
  fields.notes.value = "Dach leicht geneigt, 2 Fenster an der Längsseite, isolierte Wände, zusätzliche Schrauben und Winkel einplanen.";
  calculate();
  window.scrollTo({ top: $("planer").offsetTop - 90, behavior: "smooth" });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".obs").forEach((el) => observer.observe(el));

loadFromLocal();
calculate();
