const projectNameInput = document.getElementById("projectNameInput");
const ideaInput = document.getElementById("ideaInput");
const budgetInput = document.getElementById("budgetInput");
const categoryInput = document.getElementById("categoryInput");
const languageInput = document.getElementById("languageInput");
const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const depthInput = document.getElementById("depthInput");
const materialTypeInput = document.getElementById("materialTypeInput");
const spacingInput = document.getElementById("spacingInput");
const objectCountInput = document.getElementById("objectCountInput");
const requiredAreaInput = document.getElementById("requiredAreaInput");
const imageInput = document.getElementById("imageInput");
const imageGallery = document.getElementById("imageGallery");
const itemsContainer = document.getElementById("itemsContainer");
const addItemBtn = document.getElementById("addItemBtn");
const addFurnitureBtn = document.getElementById("addFurnitureBtn");
const addGardenBtn = document.getElementById("addGardenBtn");
const addTechBtn = document.getElementById("addTechBtn");
const createBtn = document.getElementById("createBtn");
const saveBtn = document.getElementById("saveBtn");
const speakBtn = document.getElementById("speakBtn");
const voiceBtn = document.getElementById("voiceBtn");
const jsonBtn = document.getElementById("jsonBtn");
const pdfBtn = document.getElementById("pdfBtn");
const printBtn = document.getElementById("printBtn");
const clearBtn = document.getElementById("clearBtn");
const output = document.getElementById("output");
const savedProjectsList = document.getElementById("savedProjectsList");
const dashboard = document.getElementById("dashboard");
const assistantBox = document.getElementById("assistantBox");
const planCanvas = document.getElementById("planCanvas");
const ctx = planCanvas.getContext("2d");
const toggle3dBtn = document.getElementById("toggle3dBtn");
const threeDBox = document.getElementById("threeDBox");
const modeBadge = document.getElementById("modeBadge");
const langBadge = document.getElementById("langBadge");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

const STORAGE_KEY = "my_planer_projects_v5";
let currentImages = [];
let dragSourceRow = null;
let is3D = false;

function uniqueList(items) {
  return [...new Set(items)];
}

function getSavedProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  renderSavedProjects();
  renderDashboard();
}

function addOrUpdateProject(project) {
  const projects = getSavedProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) projects[index] = project;
  else projects.unshift(project);
  saveProjects(projects);
}

function deleteProject(id) {
  saveProjects(getSavedProjects().filter(p => p.id !== id));
}

function addItemRow(name = "", price = "") {
  const row = document.createElement("div");
  row.className = "item-row";
  row.draggable = true;
  row.innerHTML = `
    <input class="item-name" type="text" placeholder="Artikelname" value="${name}">
    <input class="item-price" type="number" placeholder="Preis €" min="0" step="0.01" value="${price}">
    <button type="button" class="small-btn remove-btn">Entfernen</button>
  `;

  row.addEventListener("dragstart", () => {
    dragSourceRow = row;
    row.style.opacity = "0.5";
  });

  row.addEventListener("dragend", () => {
    row.style.opacity = "1";
    dragSourceRow = null;
  });

  row.addEventListener("dragover", e => e.preventDefault());

  row.addEventListener("drop", e => {
    e.preventDefault();
    if (dragSourceRow && dragSourceRow !== row) {
      itemsContainer.insertBefore(dragSourceRow, row);
      renderDashboard();
    }
  });

  row.querySelector(".remove-btn").addEventListener("click", () => {
    row.remove();
    renderDashboard();
  });

  row.querySelector(".item-name").addEventListener("input", renderDashboard);
  row.querySelector(".item-price").addEventListener("input", renderDashboard);

  itemsContainer.appendChild(row);
}

function renderImageGallery() {
  imageGallery.innerHTML = "";
  if (currentImages.length === 0) {
    imageGallery.innerHTML = `<p class="muted">Noch keine Bilder hochgeladen.</p>`;
    return;
  }
  currentImages.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Bild ${index + 1}`;
    imageGallery.appendChild(img);
  });
}

function detectCategory(text) {
  const lowerText = text.toLowerCase();
  const categories = [
    { name: "Gartenprojekt", keywords: ["garten", "teich", "weg", "blumen", "beet", "hochbeet", "terrasse", "zaun", "sitzplatz", "gartenhaus", "pflanze", "pflanzen", "balkon"] },
    { name: "Wohn- oder Raumprojekt", keywords: ["zimmer", "wohnung", "wohnzimmer", "schlafzimmer", "küche", "bad", "regal", "schrank", "tisch", "stuhl", "sofa", "couch", "deko", "möbel", "einrichtung", "lampe", "bett", "teppich", "vorhang"] },
    { name: "Technikprojekt", keywords: ["app", "website", "webseite", "programm", "code", "script", "software", "computer", "handy", "tool", "funktion"] },
    { name: "Schul- oder Lernprojekt", keywords: ["schule", "lernen", "hausaufgabe", "referat", "projekt", "vortrag", "aufsatz", "präsentation"] },
    { name: "Bastel- oder DIY-Projekt", keywords: ["basteln", "diy", "bauen", "werkeln", "handarbeit", "selber machen", "upcycling", "dekoration"] },
    { name: "Organisationsprojekt", keywords: ["planen", "organisieren", "ordnung", "aufräumen", "sortieren", "struktur", "liste", "ablauf"] },
    { name: "Freizeit- oder Eventprojekt", keywords: ["party", "geburtstag", "ausflug", "reise", "urlaub", "treffen", "feier", "event"] },
    { name: "Kindergartenprojekt", keywords: ["kindergarten", "kinder", "spielbereich", "gruppe", "pädagogik"] },
    { name: "Schulgebäudeprojekt", keywords: ["schule", "klassenzimmer", "flur", "aula", "fluchtweg"] },
    { name: "Schwimmbadprojekt", keywords: ["schwimmbad", "becken", "wasser", "umkleide", "dusche"] },
    { name: "Firmenprojekt", keywords: ["firma", "büro", "arbeitsplatz", "meeting", "team", "arbeitsraum"] },
    { name: "Game-Design-Projekt", keywords: ["spiel", "level", "map", "game", "game design", "welt"] },
    { name: "Innenarchitekturprojekt", keywords: ["innenarchitektur", "innenraum", "raumgestaltung", "einrichtung"] }
  ];
  for (const category of categories) {
    if (category.keywords.some(k => lowerText.includes(k))) return category.name;
  }
  return "Allgemeines Projekt";
}

function extractKeywords(text) {
  const lowerText = text.toLowerCase();
  const groups = [
    { label: "Ort", words: ["garten", "zimmer", "wohnung", "haus", "balkon", "terrasse", "hof", "raum"] },
    { label: "Natur", words: ["teich", "blumen", "beet", "hochbeet", "pflanzen", "baum", "gras"] },
    { label: "Bau", words: ["bauen", "anlegen", "gestalten", "einrichten", "umbauen", "planen"] },
    { label: "Technik", words: ["app", "website", "code", "programm", "software", "tool", "script"] },
    { label: "Organisation", words: ["planen", "organisieren", "struktur", "liste", "ablauf", "ordnung"] },
    { label: "Freizeit", words: ["party", "ausflug", "reise", "urlaub", "feier", "event"] },
    { label: "Bildung", words: ["schule", "lernen", "referat", "vortrag", "präsentation"] },
    { label: "Kinder", words: ["kindergarten", "kinder", "spielbereich"] },
    { label: "Business", words: ["firma", "büro", "team", "arbeitsplatz"] }
  ];
  return uniqueList(groups.filter(g => g.words.some(w => lowerText.includes(w))).map(g => g.label));
}

function getSuggestions(category) {
  const suggestions = {
    "Gartenprojekt": ["Blumen", "Erde", "Pflanzkübel", "Gießkanne", "Handschuhe", "Schaufel"],
    "Wohn- oder Raumprojekt": ["Bett", "Schrank", "Lampe", "Nachttisch", "Teppich", "Vorhänge"],
    "Technikprojekt": ["Laptop", "Monitor", "Tastatur", "Maus", "Software", "Kabel"],
    "Schul- oder Lernprojekt": ["Heft", "Stifte", "Mappe", "Bücher", "Plakat", "Präsentationskarten"],
    "Bastel- oder DIY-Projekt": ["Kleber", "Schere", "Papier", "Holz", "Farben", "Werkzeug"],
    "Organisationsprojekt": ["Boxen", "Etiketten", "Ordner", "Regale", "Körbe", "Listen"],
    "Freizeit- oder Eventprojekt": ["Deko", "Snacks", "Getränke", "Lichter", "Einladungen", "Musik"],
    "Kindergartenprojekt": ["Spielgeräte", "Sitzkissen", "Farben", "Tische", "Regale", "Sicherheitsmatten"],
    "Schulgebäudeprojekt": ["Tafeln", "Tische", "Stühle", "Schränke", "Fluchtweg", "Beschilderung"],
    "Schwimmbadprojekt": ["Becken", "Rutschschutz", "Duschen", "Umkleiden", "Sitzbereiche", "Sicherheitszonen"],
    "Firmenprojekt": ["Schreibtische", "Stühle", "Monitore", "Meetingtisch", "Lampen", "Stauraum"],
    "Game-Design-Projekt": ["Level", "Objekte", "Spawnpunkte", "Zonen", "Kollisionen", "Trigger"],
    "Innenarchitekturprojekt": ["Sofa", "Tisch", "Lampe", "Regal", "Teppich", "Dekoration"],
    "Allgemeines Projekt": ["Material", "Werkzeug", "Plan", "Zeit", "Budget", "Ziel"]
  };
  return suggestions[category] || suggestions["Allgemeines Projekt"];
}

function getEstimatedPrice(itemName) {
  const name = itemName.toLowerCase();
  const map = [
    { keys: ["bett"], price: 250 }, { keys: ["schrank"], price: 180 }, { keys: ["lampe"], price: 35 },
    { keys: ["nachttisch"], price: 45 }, { keys: ["teppich"], price: 60 }, { keys: ["vorhang"], price: 40 },
    { keys: ["blumen"], price: 20 }, { keys: ["erde"], price: 12 }, { keys: ["pflanzkübel"], price: 18 },
    { keys: ["gießkanne"], price: 15 }, { keys: ["handschuhe"], price: 10 }, { keys: ["schaufel"], price: 14 },
    { keys: ["laptop"], price: 700 }, { keys: ["monitor"], price: 180 }, { keys: ["tastatur"], price: 40 },
    { keys: ["maus"], price: 25 }, { keys: ["kabel"], price: 12 }, { keys: ["software"], price: 50 },
    { keys: ["tisch"], price: 120 }, { keys: ["stuhl"], price: 55 }, { keys: ["regal"], price: 90 },
    { keys: ["sofa"], price: 480 }, { keys: ["becken"], price: 1500 }
  ];
  for (const entry of map) if (entry.keys.some(k => name.includes(k))) return entry.price;
  return 25;
}

function calculateArea(width, height) {
  const w = parseFloat(width), h = parseFloat(height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return w * h;
}

function calculateVolume(width, height, depth) {
  const w = parseFloat(width), h = parseFloat(height), d = parseFloat(depth);
  if (!Number.isFinite(w) || !Number.isFinite(h) || !Number.isFinite(d) || w <= 0 || h <= 0 || d <= 0) return null;
  return w * h * d;
}

function calculatePerimeter(width, height) {
  const w = parseFloat(width), h = parseFloat(height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return 2 * (w + h);
}

function calculateMaterialAmount(area, materialType, category) {
  if (!Number.isFinite(area) || area <= 0) return null;
  const factors = {
    farbe: 0.12, boden: 1.0, teppich: 1.05, pflaster: 1.08, erde: 0.25, beton: 0.10, holz: 1.15, fliesen: 1.10
  };
  const categoryBoost = category === "Gartenprojekt" ? 1.1 : category === "Schwimmbadprojekt" ? 1.2 : 1;
  return area * (factors[String(materialType || "").toLowerCase()] ?? 1) * categoryBoost;
}

function calculateDistanceRequirement(objectCount, spacing) {
  const count = parseInt(objectCount, 10), space = parseFloat(spacing);
  if (!Number.isFinite(count) || !Number.isFinite(space) || count <= 0 || space < 0) return null;
  return count === 1 ? 0 : (count - 1) * space;
}

function estimateRoomFit(area, requiredArea) {
  const a = parseFloat(area), r = parseFloat(requiredArea);
  if (!Number.isFinite(a) || !Number.isFinite(r) || a <= 0 || r <= 0) return null;
  if (r > a) return "zu klein";
  if (r === a) return "genau passend";
  return "passt";
}

function calculateProjectMetrics(data) {
  const area = calculateArea(data.width, data.height);
  const volume = calculateVolume(data.width, data.height, data.depth);
  const perimeter = calculatePerimeter(data.width, data.height);
  const materialAmount = area !== null ? calculateMaterialAmount(area, data.materialType, data.category) : null;
  const distance = calculateDistanceRequirement(data.objectCount, data.spacing);
  return { area, volume, perimeter, materialAmount, distance, fitStatus: estimateRoomFit(area, data.requiredArea) };
}

function buildPlan(category, keywords, text) {
  const planItems = [
    `Die Idee als ${category} einordnen`,
    "Ziel und gewünschtes Ergebnis klar beschreiben",
    "Rahmenbedingungen festlegen",
    "Material, Aufwand und Reihenfolge planen"
  ];
  const todoItems = [
    "Idee in einem Satz zusammenfassen",
    "Wichtige Begriffe und Anforderungen notieren",
    "Passenden Ort oder Einsatzbereich festlegen",
    "Benötigte Materialien oder Werkzeuge sammeln",
    "Einzelne Umsetzungsschritte in Reihenfolge bringen"
  ];
  const priorityItems = [
    "1. Ziel der Idee klären",
    "2. Rahmenbedingungen festlegen",
    "3. Materialien oder Mittel auswählen",
    "4. Schritte planen",
    "5. Umsetzung vorbereiten"
  ];
  if (keywords.includes("Natur")) { planItems.push("Pflanzen, Licht und Standortbedingungen berücksichtigen"); todoItems.push("Standort auf Sonne, Schatten und Boden prüfen"); }
  if (keywords.includes("Technik")) { planItems.push("Funktionen, Aufbau und Bedienung festlegen"); todoItems.push("Wichtige Funktionen und technische Anforderungen notieren"); }
  if (keywords.includes("Organisation")) { planItems.push("Abläufe und Struktur klar definieren"); todoItems.push("Listen, Reihenfolge und Zuständigkeiten festlegen"); }
  if (keywords.includes("Kinder")) { planItems.push("Sicherheit, Übersicht und kindgerechte Nutzung beachten"); todoItems.push("Weiche Materialien und klare Wege einplanen"); }
  if (keywords.includes("Business")) { planItems.push("Arbeitsplätze, Laufwege und Teamnutzung berücksichtigen"); todoItems.push("Flächen für Besprechung und Bewegung einplanen"); }
  if (text.length > 120) planItems.push("Die Idee in kleinere Teilaufgaben zerlegen");
  return { planItems, todoItems, priorityItems };
}

function buildProjectSummary() {
  const projectName = projectNameInput.value.trim() || "Ohne Namen";
  const idea = ideaInput.value.trim();
  const budget = budgetInput.value.trim();
  const category = categoryInput.value === "auto" ? detectCategory(idea || projectName) : categoryInput.value;
  const items = Array.from(itemsContainer.querySelectorAll(".item-row")).map(row => ({
    name: row.querySelector(".item-name").value.trim(),
    price: row.querySelector(".item-price").value.trim()
  })).filter(item => item.name || item.price);

  const metrics = calculateProjectMetrics({
    width: widthInput.value,
    height: heightInput.value,
    depth: depthInput.value,
    materialType: materialTypeInput.value,
    objectCount: objectCountInput.value,
    spacing: spacingInput.value,
    requiredArea: requiredAreaInput.value,
    category
  });

  return {
    projectName,
    idea,
    budget,
    category,
    language: languageInput.value,
    keywords: extractKeywords(idea || projectName),
    suggestions: getSuggestions(category),
    dimensions: {
      width: parseFloat(widthInput.value) || null,
      height: parseFloat(heightInput.value) || null,
      depth: parseFloat(depthInput.value) || null
    },
    materialType: materialTypeInput.value,
    spacing: parseFloat(spacingInput.value) || null,
    objectCount: parseInt(objectCountInput.value, 10) || null,
    requiredArea: parseFloat(requiredAreaInput.value) || null,
    metrics,
    items,
    images: currentImages,
    createdAt: new Date().toISOString()
  };
}

function generateAssistantText(project) {
  const lang = project.language || "de";
  const lines = [];
  if (lang === "en") {
    lines.push(`Project "${project.projectName}" detected as ${project.category}.`);
    if (project.metrics.area !== null) lines.push(`Area: ${project.metrics.area.toFixed(2)} m².`);
    if (project.metrics.volume !== null) lines.push(`Volume: ${project.metrics.volume.toFixed(2)} m³.`);
    if (project.metrics.materialAmount !== null) lines.push(`Estimated material amount: ${project.metrics.materialAmount.toFixed(2)}.`);
    if (project.metrics.fitStatus) lines.push(`Fit status: ${project.metrics.fitStatus}.`);
    lines.push("Recommendation: split the project into small steps and secure the main materials first.");
  } else {
    lines.push(`Projekt "${project.projectName}" wurde als ${project.category} erkannt.`);
    if (project.metrics.area !== null) lines.push(`Fläche: ${project.metrics.area.toFixed(2)} m².`);
    if (project.metrics.volume !== null) lines.push(`Volumen: ${project.metrics.volume.toFixed(2)} m³.`);
    if (project.metrics.materialAmount !== null) lines.push(`Geschätzte Materialmenge: ${project.metrics.materialAmount.toFixed(2)}.`);
    if (project.metrics.fitStatus) lines.push(`Fit-Status: ${project.metrics.fitStatus}.`);
    lines.push("Empfehlung: Projekt in kleine Schritte aufteilen und zuerst die wichtigsten Materialien sichern.");
  }
  return lines;
}

function exportProjectAsJSON() {
  const project = buildProjectSummary();
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.projectName.replace(/\s+/g, "_").toLowerCase() || "projekt"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportProjectAsPDF() {
  window.print();
}

function drawCanvas(project) {
  ctx.clearRect(0, 0, planCanvas.width, planCanvas.height);
  const w = project.dimensions.width || 10;
  const h = project.dimensions.height || 6;
  const padding = 60;
  const maxW = planCanvas.width - padding * 2;
  const maxH = planCanvas.height - padding * 2;
  const scale = Math.min(maxW / w, maxH / h);
  const drawW = w * scale;
  const drawH = h * scale;
  const x = (planCanvas.width - drawW) / 2;
  const y = (planCanvas.height - drawH) / 2;

  ctx.fillStyle = "rgba(74, 217, 255, 0.12)";
  ctx.fillRect(x, y, drawW, drawH);
  ctx.strokeStyle = "#4ad9ff";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, drawW, drawH);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Manrope";
  ctx.fillText(`Breite: ${w.toFixed(2)} m`, x + 20, y + 35);
  ctx.fillText(`Höhe: ${h.toFixed(2)} m`, x + 20, y + 70);
  ctx.fillStyle = "#d7d0ee";
  ctx.font = "18px Manrope";
  ctx.fillText(`Fläche: ${project.metrics.area !== null ? project.metrics.area.toFixed(2) + " m²" : "-"}`, x + 20, y + drawH - 30);
}

function renderDashboard() {
  const project = buildProjectSummary();
  const totalPrice = project.items.reduce((sum, item) => {
    const value = parseFloat(item.price);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
  const remaining = project.budget ? (parseFloat(project.budget) - totalPrice) : null;

  dashboard.innerHTML = `
    <div class="dashboard-card"><strong>Projekt</strong><span>${project.projectName}</span></div>
    <div class="dashboard-card"><strong>Kategorie</strong><span>${project.category}</span></div>
    <div class="dashboard-card"><strong>Budget</strong><span>${project.budget ? project.budget + " €" : "kein Budget"}</span></div>
    <div class="dashboard-card"><strong>Gesamtsumme</strong><span>${totalPrice.toFixed(2)} €</span></div>
    <div class="dashboard-card"><strong>Restbudget</strong><span>${remaining === null ? "nicht berechnet" : remaining.toFixed(2) + " €"}</span></div>
    <div class="dashboard-card"><strong>Fläche</strong><span>${project.metrics.area !== null ? project.metrics.area.toFixed(2) + " m²" : "-"}</span></div>
    <div class="dashboard-card"><strong>Volumen</strong><span>${project.metrics.volume !== null ? project.metrics.volume.toFixed(2) + " m³" : "-"}</span></div>
    <div class="dashboard-card"><strong>Material</strong><span>${project.metrics.materialAmount !== null ? project.metrics.materialAmount.toFixed(2) : "-"}</span></div>
    <div class="dashboard-card"><strong>Abstand</strong><span>${project.metrics.distance !== null ? project.metrics.distance.toFixed(2) + " m" : "-"}</span></div>
    <div class="dashboard-card"><strong>Bilder</strong><span>${project.images.length}</span></div>
  `;

  assistantBox.innerHTML = `<ul>${generateAssistantText(project).map(line => `<li>${line}</li>`).join("")}</ul>`;
  drawCanvas(project);
}

function renderOutput() {
  const project = buildProjectSummary();
  const plan = buildPlan(project.category, project.keywords, project.idea || project.projectName);
  const aiSteps = generateAssistantText(project);

  const totalPrice = project.items.reduce((sum, item) => {
    const value = parseFloat(item.price);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  const remaining = project.budget ? (parseFloat(project.budget) - totalPrice) : null;

  const itemsHtml = project.items.length
    ? `<ul>${project.items.map(item => `<li><strong>${item.name || "Ohne Namen"}</strong>${item.price ? ` — ${item.price} €` : ""}</li>`).join("")}</ul>`
    : `<p class="muted">Noch keine Artikel hinzugefügt.</p>`;

  output.innerHTML = `
    <div class="result-card">
      <h3>${project.projectName}</h3>
      <p><strong>Kategorie:</strong> ${project.category}</p>
      <p><strong>Budget:</strong> ${project.budget ? project.budget + " €" : "kein Budget angegeben"}</p>
      <p><strong>Gesamtsumme:</strong> ${totalPrice.toFixed(2)} €</p>
      <p><strong>Restbudget:</strong> ${remaining === null ? "nicht berechnet" : remaining.toFixed(2) + " €"}</p>
      <p><strong>Bilder:</strong> ${project.images.length}</p>
    </div>

    <div class="result-card">
      <h4>Maße</h4>
      <p><strong>Breite:</strong> ${project.dimensions.width ?? "-"} m</p>
      <p><strong>Höhe:</strong> ${project.dimensions.height ?? "-"} m</p>
      <p><strong>Tiefe:</strong> ${project.dimensions.depth ?? "-"} m</p>
      <p><strong>Fläche:</strong> ${project.metrics.area !== null ? project.metrics.area.toFixed(2) + " m²" : "-"}</p>
      <p><strong>Volumen:</strong> ${project.metrics.volume !== null ? project.metrics.volume.toFixed(2) + " m³" : "-"}</p>
      <p><strong>Umfang:</strong> ${project.metrics.perimeter !== null ? project.metrics.perimeter.toFixed(2) + " m" : "-"}</p>
    </div>

    <div class="result-card">
      <h4>Material & Abstand</h4>
      <p><strong>Material:</strong> ${project.materialType}</p>
      <p><strong>Materialmenge:</strong> ${project.metrics.materialAmount !== null ? project.metrics.materialAmount.toFixed(2) : "-"}</p>
      <p><strong>Objektanzahl:</strong> ${project.objectCount ?? "-"}</p>
      <p><strong>Abstand:</strong> ${project.spacing ?? "-"} m</p>
      <p><strong>Gesamtabstand:</strong> ${project.metrics.distance !== null ? project.metrics.distance.toFixed(2) + " m" : "-"}</p>
      <p><strong>Fit-Status:</strong> ${project.metrics.fitStatus ?? "-"}</p>
    </div>

    <div class="result-card">
      <h4>Artikel / Items</h4>
      ${itemsHtml}
    </div>

    <div class="result-card">
      <h4>Vorschläge</h4>
      <ul>${project.suggestions.map(s => `<li>${s}</li>`).join("")}</ul>
    </div>

    <div class="result-card">
      <h4>Assistent</h4>
      <ul>${aiSteps.map(step => `<li>${step}</li>`).join("")}</ul>
    </div>

    <div class="result-card">
      <h4>Plan</h4>
      <ol>${plan.planItems.map(item => `<li>${item}</li>`).join("")}</ol>
    </div>

    <div class="result-card">
      <h4>To-do</h4>
      <ul>${plan.todoItems.map(item => `<li>${item}</li>`).join("")}</ul>
    </div>

    <div class="result-card">
      <h4>Priorität</h4>
      <ol>${plan.priorityItems.map(item => `<li>${item}</li>`).join("")}</ol>
    </div>
  `;

  renderDashboard();
}

function speakText(text) {
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageInput.value === "en" ? "en-US" : "de-DE";
  utterance.rate = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();
  recognition.lang = languageInput.value === "en" ? "en-US" : "de-DE";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  output.innerHTML = `<p class="muted">Höre zu...</p>`;

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    ideaInput.value = transcript;
    renderDashboard();
    output.innerHTML = `<p class="muted">Erkannt: ${transcript}</p>`;
  };

  recognition.onerror = () => {
    output.innerHTML = `<p class="muted">Spracherkennung konnte nicht gestartet werden.</p>`;
  };

  recognition.start();
}

function renderSavedProjects() {
  const projects = getSavedProjects();
  if (projects.length === 0) {
    savedProjectsList.innerHTML = `<p class="muted">Noch keine Projekte gespeichert.</p>`;
    return;
  }

  savedProjectsList.innerHTML = projects.map(project => `
    <div class="saved-item">
      <div>
        <strong>${project.projectName || "Ohne Namen"}</strong>
        <span class="muted">${project.category || "Keine Kategorie"} · ${project.budget ? project.budget + " €" : "kein Budget"}</span>
      </div>
      <div class="saved-actions">
        <button type="button" class="small-btn load-project-btn" data-id="${project.id}">Laden</button>
        <button type="button" class="small-btn delete-project-btn" data-id="${project.id}">Löschen</button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".load-project-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const project = getSavedProjects().find(p => p.id === btn.dataset.id);
      if (project) loadProject(project);
    });
  });

  document.querySelectorAll(".delete-project-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteProject(btn.dataset.id));
  });
}

function loadProject(project) {
  projectNameInput.value = project.projectName || "";
  ideaInput.value = project.idea || "";
  budgetInput.value = project.budget ?? "";
  categoryInput.value = project.category || "auto";
  languageInput.value = project.language || "de";
  widthInput.value = project.dimensions?.width ?? "";
  heightInput.value = project.dimensions?.height ?? "";
  depthInput.value = project.dimensions?.depth ?? "";
  materialTypeInput.value = project.materialType || "farbe";
  spacingInput.value = project.spacing ?? "";
  objectCountInput.value = project.objectCount ?? "";
  requiredAreaInput.value = project.requiredArea ?? "";
  itemsContainer.innerHTML = "";
  currentImages = project.images || [];
  renderImageGallery();
  (project.items || []).forEach(item => addItemRow(item.name, item.price));
  if ((project.items || []).length === 0) addItemRow();
  renderDashboard();
  output.innerHTML = `<p class="muted">Projekt geladen.</p>`;
}

function saveCurrentProject() {
  const project = buildProjectSummary();
  project.id = project.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
  addOrUpdateProject(project);
  output.innerHTML = `<p class="muted">Projekt gespeichert.</p>`;
}

function setTab(tabId) {
  tabPanels.forEach(panel => panel.classList.toggle("active", panel.id === tabId));
  tabButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tabId));
}

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => setTab(btn.dataset.tab));
});

imageInput.addEventListener("change", () => {
  const files = Array.from(imageInput.files || []);
  if (!files.length) return;

  Promise.all(files.map(file => new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  }))).then(results => {
    currentImages = results;
    renderImageGallery();
    renderDashboard();
  });
});

addItemBtn.addEventListener("click", () => { addItemRow(); renderDashboard(); });
addFurnitureBtn.addEventListener("click", () => { addItemRow("Möbel", getEstimatedPrice("möbel")); renderDashboard(); });
addGardenBtn.addEventListener("click", () => { addItemRow("Gartenobjekt", getEstimatedPrice("garten")); renderDashboard(); });
addTechBtn.addEventListener("click", () => { addItemRow("Technik", getEstimatedPrice("technik")); renderDashboard(); });

createBtn.addEventListener("click", renderOutput);
saveBtn.addEventListener("click", saveCurrentProject);
jsonBtn.addEventListener("click", exportProjectAsJSON);
pdfBtn.addEventListener("click", exportProjectAsPDF);
printBtn.addEventListener("click", () => window.print());
speakBtn.addEventListener("click", () => speakText(ideaInput.value.trim() || "Bitte zuerst eine Idee eingeben."));
voiceBtn.addEventListener("click", startVoiceInput);

clearBtn.addEventListener("click", () => {
  projectNameInput.value = "";
  ideaInput.value = "";
  budgetInput.value = "";
  categoryInput.value = "auto";
  languageInput.value = "de";
  widthInput.value = "";
  heightInput.value = "";
  depthInput.value = "";
  materialTypeInput.value = "farbe";
  spacingInput.value = "";
  objectCountInput.value = "";
  requiredAreaInput.value = "";
  imageInput.value = "";
  itemsContainer.innerHTML = "";
  currentImages = [];
  imageGallery.innerHTML = `<p class="muted">Noch keine Bilder hochgeladen.</p>`;
  addItemRow();
  output.innerHTML = `<p class="muted">Alles wurde zurückgesetzt.</p>`;
  dashboard.innerHTML = "";
  assistantBox.innerHTML = "Hier erscheint die intelligente Zusammenfassung.";
  ctx.clearRect(0, 0, planCanvas.width, planCanvas.height);
});

function init() {
  addItemRow();
  renderSavedProjects();
  renderDashboard();
  imageGallery.innerHTML = `<p class="muted">Noch keine Bilder hochgeladen.</p>`;

  [
    projectNameInput, ideaInput, budgetInput, categoryInput, languageInput,
    widthInput, heightInput, depthInput, materialTypeInput, spacingInput,
    objectCountInput, requiredAreaInput
  ].forEach(el => el.addEventListener("input", renderDashboard));

  itemsContainer.addEventListener("input", renderDashboard);
  modeBadge.textContent = "2D";
  langBadge.textContent = "DE";
}

toggle3dBtn.addEventListener("click", () => {
  is3D = !is3D;
  threeDBox.style.display = is3D ? "grid" : "none";
  modeBadge.textContent = is3D ? "3D" : "2D";
  threeDBox.style.opacity = is3D ? "1" : "0.85";
});

init();
