const $ = (id) => document.getElementById(id);

const form = $("plannerForm");
const fields = {
  projectName: $("projectName"),
  objectType: $("objectType"),
  length: $("length"),
  width: $("width"),
  height: $("height"),
  wallThickness: $("wallThickness"),
  areaManual: $("areaManual"),
  volumeManual: $("volumeManual"),
  material: $("material"),
  materialQty: $("materialQty"),
  materialCost: $("materialCost"),
  laborCost: $("laborCost"),
  transportCost: $("transportCost"),
  extraCost: $("extraCost"),
  floorPlan: $("floorPlan"),
  floorPlanFile: $("floorPlanFile"),
  notes: $("notes")
};

const outputs = {
  totalCost: $("totalCostOut"),
  area: $("areaOut"),
  volume: $("volumeOut"),
  material: $("materialOut"),
  materialCost: $("materialCostOut"),
  laborCost: $("laborCostOut"),
  costPerArea: $("costPerAreaOut"),
  costPerVolume: $("costPerVolumeOut"),
  materialFill: $("materialFill"),
  fileBadge: $("fileBadge")
};

const formatNumber = (n) =>
  new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);

const formatCurrency = (n) => `${formatNumber(n)} €`;

function val(el) {
  return parseFloat(el.value.replace(",", ".")) || 0;
}

function calculate() {
  const length = val(fields.length);
  const width = val(fields.width);
  const height = val(fields.height);

  const autoArea = length > 0 && width > 0 ? length * width : 0;
  const autoVolume = autoArea > 0 && height > 0 ? autoArea * height : 0;

  const area = val(fields.areaManual) || autoArea;
  const volume = val(fields.volumeManual) || autoVolume;

  const materialCost = val(fields.materialCost);
  const laborCost = val(fields.laborCost);
  const transportCost = val(fields.transportCost);
  const extraCost = val(fields.extraCost);

  const totalCost = materialCost + laborCost + transportCost + extraCost;
  const costPerArea = area > 0 ? totalCost / area : 0;
  const costPerVolume = volume > 0 ? totalCost / volume : 0;
  const materialPercent = totalCost > 0 ? Math.min((materialCost / totalCost) * 100, 100) : 0;

  outputs.totalCost.textContent = formatCurrency(totalCost);
  outputs.area.textContent = `${formatNumber(area)} m²`;
  outputs.volume.textContent = `${formatNumber(volume)} m³`;
  outputs.material.textContent = fields.material.value || "–";
  outputs.materialCost.textContent = formatCurrency(materialCost);
  outputs.laborCost.textContent = formatCurrency(laborCost);
  outputs.costPerArea.textContent = formatCurrency(costPerArea);
  outputs.costPerVolume.textContent = formatCurrency(costPerVolume);
  outputs.materialFill.style.width = `${materialPercent}%`;

  return {
    projectName: fields.projectName.value,
    objectType: fields.objectType.value,
    length,
    width,
    height,
    wallThickness: val(fields.wallThickness),
    areaManual: val(fields.areaManual),
    volumeManual: val(fields.volumeManual),
    area,
    volume,
    material: fields.material.value,
    materialQty: val(fields.materialQty),
    materialCost,
    laborCost,
    transportCost,
    extraCost,
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
  const old = $("saveBtn").textContent;
  $("saveBtn").textContent = "Gespeichert";
  setTimeout(() => $("saveBtn").textContent = old, 1400);
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
  } catch (e) {}
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  calculate();
});

["input", "change"].forEach((evt) => {
  form.addEventListener(evt, (e) => {
    if (e.target.matches("input, select, textarea")) calculate();
  });
});

$("resetBtn").addEventListener("click", () => {
  form.reset();
  outputs.fileBadge.textContent = "Keine Grundriss-Datei ausgewählt";
  outputs.materialFill.style.width = "0%";
  calculate();
  localStorage.removeItem("objektplaner-data");
});

$("saveBtn").addEventListener("click", saveToLocal);

$("demoFillBtn").addEventListener("click", () => {
  fields.projectName.value = "Gartenhaus Nord";
  fields.objectType.value = "Gartenhaus";
  fields.length.value = "6";
  fields.width.value = "4";
  fields.height.value = "2.8";
  fields.wallThickness.value = "12";
  fields.areaManual.value = "";
  fields.volumeManual.value = "";
  fields.material.value = "Holz";
  fields.materialQty.value = "24";
  fields.materialCost.value = "6800";
  fields.laborCost.value = "2400";
  fields.transportCost.value = "450";
  fields.extraCost.value = "350";
  fields.floorPlan.value = "Rechteckiger Grundriss, Eingang vorne mittig, Lagerbereich hinten rechts, Arbeitsfläche links.";
  fields.notes.value = "Dach leicht geneigt, 2 Fenster an der Längsseite, isolierte Wände.";
  calculate();
  window.scrollTo({ top: $("planer").offsetTop - 90, behavior: "smooth" });
});

fields.floorPlanFile.addEventListener("change", () => {
  const file = fields.floorPlanFile.files[0];
  outputs.fileBadge.textContent = file ? `Datei: ${file.name}` : "Keine Grundriss-Datei ausgewählt";
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
