
let gold = 100;
let army = 10;
let territory = 1;
let selectedTile = null;
let gameOver = false;
let enemyCapitalsRemaining = 2;

const MAP_SIZE = 10;
const TOTAL_TILES = MAP_SIZE * MAP_SIZE;

// Teknikträdet
const technologies = {
    military: {
        name: "Starkare soldater",
        cost: 120,
        researched: false,
        description: "Ökar chansen att vinna attacker med 15 procentenheter."
    },
    economy: {
        name: "Bättre ekonomi",
        cost: 100,
        researched: false,
        description: "Ökar alla skatteinkomster med 25 %."
    },
    construction: {
        name: "Billigare byggnader",
        cost: 150,
        researched: false,
        description: "Gårdar, marknader och stadsuppgraderingar kostar 30 % mindre."
    }
};

const map = document.getElementById("map");
const message = document.getElementById("message");

// Kartans placeringar
const PLAYER_CAPITAL = 55;
const ENEMY_CAPITALS = [0, 99];

// Fiendesoldater startar nära sina huvudstäder.
const ENEMY_STARTING_TROOPS = [1, 10, 98, 89];

const CITIES = [2, 19, 45, 78, 92];
const VILLAGES = [8, 26, 37, 56, 69, 85];
const MOUNTAINS = [6, 18, 33, 62, 81];
const FARMLAND = [7, 17, 29, 48, 73];

// Hjälpfunktioner
function getTile(index) {
    return map.children[index] || null;
}

function getNeighbors(index) {
    const neighbors = [];
    const row = Math.floor(index / MAP_SIZE);
    const col = index % MAP_SIZE;

    if (row > 0) neighbors.push(index - MAP_SIZE);
    if (row < MAP_SIZE - 1) neighbors.push(index + MAP_SIZE);
    if (col > 0) neighbors.push(index - 1);
    if (col < MAP_SIZE - 1) neighbors.push(index + 1);

    return neighbors.map(getTile).filter(Boolean);
}

function removeOwnershipClasses(tile) {
    tile.classList.remove(
        "player",
        "player-capital",
        "enemy",
        "enemy-capital",
        "farm-owned",
        "city-owned",
        "village-owned",
        "capital-owned",
        "building-farm",
        "building-market",
        "selected"
    );
}

function removeTerrainClasses(tile) {
    tile.classList.remove(
        "neutral",
        "forest",
        "mountain",
        "farmland",
        "city",
        "village",
        "river"
    );
}

function getBuildingCost(baseCost) {
    return technologies.construction.researched
        ? Math.round(baseCost * 0.7)
        : baseCost;
}

// =====================================
// TEKNIKTRÄD
// =====================================

function createTechnologyPanel() {
    const existing = document.getElementById("technologyPanel");
    if (existing) existing.remove();

    const panel = document.createElement("section");
    panel.id = "technologyPanel";

    panel.innerHTML = `
        <h2>🔬 Teknikträd</h2>
        <p>Forska för att göra ditt rike starkare.</p>
        <div class="technology-list">
            <div class="technology-card">
                <h3>⚔️ Starkare soldater</h3>
                <p>${technologies.military.description}</p>
                <button id="research-military">Forska – 120 guld</button>
            </div>
            <div class="technology-card">
                <h3>💰 Bättre ekonomi</h3>
                <p>${technologies.economy.description}</p>
                <button id="research-economy">Forska – 100 guld</button>
            </div>
            <div class="technology-card">
                <h3>🏗️ Billigare byggnader</h3>
                <p>${technologies.construction.description}</p>
                <button id="research-construction">Forska – 150 guld</button>
            </div>
        </div>
    `;

    const style = document.createElement("style");
    style.id = "technologyPanelStyle";
    style.textContent = `
        #technologyPanel {
            margin: 20px auto;
            padding: 16px;
            max-width: 1000px;
            border: 2px solid #777;
            border-radius: 12px;
            background: #f1ead9;
            color: #222;
        }
        #technologyPanel h2 { margin-top: 0; }
        .technology-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
            gap: 12px;
        }
        .technology-card {
            padding: 12px;
            border: 1px solid #aaa;
            border-radius: 8px;
            background: #fffaf0;
        }
        .technology-card h3 { margin-top: 0; }
        .technology-card p { min-height: 48px; }
        .technology-card button {
            width: 100%;
            margin: 4px 0;
            padding: 9px;
            cursor: pointer;
        }
    `;

    if (!document.getElementById("technologyPanelStyle")) {
        document.head.appendChild(style);
    }

    map.insertAdjacentElement("beforebegin", panel);

    document.getElementById("research-military")
        .addEventListener("click", () => researchTechnology("military"));

    document.getElementById("research-economy")
        .addEventListener("click", () => researchTechnology("economy"));

    document.getElementById("research-construction")
        .addEventListener("click", () => researchTechnology("construction"));
}

function researchTechnology(key) {
    if (gameOver) return;

    const tech = technologies[key];
    if (!tech) return;

    if (tech.researched) {
        message.textContent = "Du har redan forskat fram den tekniken!";
        return;
    }

    if (gold < tech.cost) {
        message.textContent = `Du behöver ${tech.cost} guld för den forskningen!`;
        return;
    }

    gold -= tech.cost;
    tech.researched = true;

    message.textContent = `🔬 Du har forskat fram: ${tech.name}!`;
    updateStats();
}

// =====================================
// SKAPA KARTAN
// =====================================

function createMap() {
    map.innerHTML = "";

    for (let i = 0; i < TOTAL_TILES; i++) {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.classList.add("tile");
        tile.dataset.index = String(i);
        tile.setAttribute("aria-label", `Område ${i + 1}`);

        // Huvudstäder och fiendesoldater prioriteras
        // så att terräng aldrig skriver över deras positioner.
        if (i === PLAYER_CAPITAL) {
            tile.classList.add("player", "player-capital");
            tile.textContent = "👑";
            tile.setAttribute("aria-label", "Din huvudstad");
        } else if (ENEMY_CAPITALS.includes(i)) {
            tile.classList.add("enemy", "enemy-capital");
            tile.textContent = "🏰👑";
            tile.setAttribute("aria-label", "Fiendens huvudstad");
        } else if (ENEMY_STARTING_TROOPS.includes(i)) {
            tile.classList.add("enemy");
            tile.textContent = "⚔️";
            tile.setAttribute("aria-label", "Fiendeterritorium");
        } else if (CITIES.includes(i)) {
            tile.classList.add("city");
            tile.textContent = "🏙️";
        } else if (VILLAGES.includes(i)) {
            tile.classList.add("village");
            tile.textContent = "🏘️";
        } else if (MOUNTAINS.includes(i)) {
            tile.classList.add("mountain");
            tile.textContent = "⛰️";
        } else if (FARMLAND.includes(i)) {
            tile.classList.add("farmland");
            tile.textContent = "🌾";
        } else {
            // CSS visar skogsträdet. Tom text förhindrar dubbla träd.
            tile.classList.add("neutral");
            tile.textContent = "";
        }

        tile.addEventListener("click", () => handleTileClick(tile));
        map.appendChild(tile);
    }
}

function handleTileClick(tile) {
    if (gameOver || tile.disabled) return;

    if (tile.classList.contains("player")) {
        if (selectedTile) selectedTile.classList.remove("selected");

        selectedTile = tile;
        selectedTile.classList.add("selected");

        message.textContent = "🏰 Du har valt ditt territorium!";
        return;
    }

    attack(tile);
}

// =====================================
// SPELETS SLUT
// =====================================

function finishGame(won) {
    if (gameOver) return;

    gameOver = true;

    message.textContent = won
        ? "🏆 SEGER! Du har besegrat alla fiendehuvudstäder!"
        : "💀 NEDERLAG! Din huvudstad har fallit. Ladda om sidan för att spela igen.";

    document.querySelectorAll("button").forEach(button => {
        button.disabled = true;
    });
}

// =====================================
// SPELAREN ATTACKERAR
// =====================================

function attack(tile) {
    if (gameOver) return;

    if (tile.classList.contains("player")) {
        message.textContent = "Det området är redan ditt!";
        return;
    }

    const isMountain = tile.classList.contains("mountain");
    const isForest = tile.classList.contains("neutral") ||
                     tile.classList.contains("forest");
    const isEnemy = tile.classList.contains("enemy");
    const wasFarm = tile.classList.contains("farmland");
    const wasCity = tile.classList.contains("city");
    const wasVillage = tile.classList.contains("village");
    const wasEnemyCapital = tile.classList.contains("enemy-capital");

    const cost = isMountain ? 5 : 3;

    if (army < cost) {
        message.textContent = `Du behöver minst ${cost} soldater!`;
        return;
    }

    army -= cost;

    let chance = 0.7;

    if (isMountain) chance = 0.4;
    else if (isForest) chance = 0.65;
    else if (isEnemy) chance = 0.35;

    if (technologies.military.researched) chance += 0.15;
    chance = Math.min(chance, 0.95);

    if (Math.random() >= chance) {
        message.textContent = isMountain
            ? "⛰️ Berget var svårt att inta!"
            : isEnemy
            ? "⚔️ Fienden försvarade sitt territorium!"
            : "💀 Attacken misslyckades!";

        updateStats();
        return;
    }

    if (selectedTile) selectedTile.classList.remove("selected");
    selectedTile = null;

    if (wasFarm) tile.classList.add("farm-owned");
    if (wasCity) tile.classList.add("city-owned");
    if (wasVillage) tile.classList.add("village-owned");

    removeOwnershipClasses(tile);
    removeTerrainClasses(tile);
    tile.classList.add("player");

    if (wasEnemyCapital) {
        tile.textContent = "👑";
        enemyCapitalsRemaining--;
    } else if (wasCity) {
        tile.textContent = "🏙️";
    } else if (wasVillage) {
        tile.textContent = "🏘️";
    } else if (wasFarm) {
        tile.textContent = "🌾";
    } else if (isMountain) {
        tile.textContent = "⛰️";
    } else {
        tile.textContent = "🏰";
    }

    territory++;
    gold += wasFarm ? 35 : 20;

    updateStats();

    if (wasEnemyCapital && enemyCapitalsRemaining <= 0) {
        finishGame(true);
        return;
    }

    if (wasEnemyCapital) {
        message.textContent =
            `👑 Fiendehuvudstad erövrad! ${enemyCapitalsRemaining} återstår.`;
    } else if (wasCity) {
        message.textContent = "🏙️ Du erövrade en stad!";
    } else if (wasVillage) {
        message.textContent = "🏘️ Du erövrade en by!";
    } else if (wasFarm) {
        message.textContent = "🌾 Du erövrade jordbruksmark och fick 35 guld!";
    } else if (isEnemy) {
        message.textContent = "⚔️ Du besegrade fienden och tog området!";
    } else if (isMountain) {
        message.textContent = "⛰️ Du erövrade ett berg!";
    } else {
        message.textContent = "🔥 Du erövrade ett nytt territorium!";
    }

    updateStats();
}

// =====================================
// FIENDERNAS TUR OCH EXPANSION
// =====================================

function enemyTurn() {
    if (gameOver) return "";

    // En kopia gör att nya områden inte kan expandera igen
    // under samma tur. Varje befintligt fiendeområde får ett försök.
    const enemies = Array.from(map.children).filter(tile =>
        tile.classList.contains("enemy")
    );

    let capturedPlayerAreas = 0;
    let expandedAreas = 0;

    // Blanda ordningen så att samma fiende inte alltid får fördel.
    enemies.sort(() => Math.random() - 0.5);

    for (const enemyTile of enemies) {
        if (gameOver) break;
        if (!map.contains(enemyTile)) continue;

        const neighbors = getNeighbors(Number(enemyTile.dataset.index));

        // Fienden kan ta neutrala områden, gårdar, byar, städer
        // eller territorier som tillhör spelaren.
        const targets = neighbors.filter(tile =>
            !tile.classList.contains("enemy") &&
            !tile.classList.contains("enemy-capital")
        );

        if (targets.length === 0) continue;

        // Prioritera att angripa spelaren när det finns ett
        // spelarterritorium intill. Annars expanderar fienden.
        const playerTargets = targets.filter(tile =>
            tile.classList.contains("player")
        );

        let target = null;

        if (playerTargets.length > 0) {
            if (Math.random() < 0.45) {
                target = playerTargets[
                    Math.floor(Math.random() * playerTargets.length)
                ];
            }
        } else if (Math.random() < 0.55) {
            target = targets[Math.floor(Math.random() * targets.length)];
        }

        if (!target) continue;

        const wasPlayer = target.classList.contains("player");
        const wasPlayerCapital = target.classList.contains("player-capital");

        if (wasPlayer) {
            capturedPlayerAreas++;
            territory--;
        } else {
            expandedAreas++;
        }

        if (selectedTile === target) selectedTile = null;

        removeOwnershipClasses(target);
        removeTerrainClasses(target);

        target.classList.add("enemy");
        target.textContent = "⚔️";
        target.setAttribute("aria-label", "Fiendeterritorium");

        if (wasPlayerCapital) {
            finishGame(false);
            break;
        }
    }

    updateStats();

    if (gameOver) return "💀 Din huvudstad har fallit!";

    const parts = [];

    if (capturedPlayerAreas > 0) {
        parts.push(`Fienden erövrade ${capturedPlayerAreas} av dina områden`);
    }

    if (expandedAreas > 0) {
        parts.push(`Fienden expanderade till ${expandedAreas} nya områden`);
    }

    return parts.length
        ? "⚔️ " + parts.join(". ") + "."
        : "🛡️ Fienden tog inga nya områden denna tur.";
}

// =====================================
// EKONOMI
// =====================================

function calculateEconomy() {
    const farms = map.querySelectorAll(".farm-owned").length;
    const cities = map.querySelectorAll(".city-owned").length;
    const villages = map.querySelectorAll(".village-owned").length;
    const capitals = map.querySelectorAll(".capital-owned").length;
    const builtFarms = map.querySelectorAll(".building-farm").length;
    const markets = map.querySelectorAll(".building-market").length;

    let taxes =
        territory * 8 +
        farms * 10 +
        cities * 15 +
        villages * 7 +
        capitals * 40 +
        builtFarms * 10 +
        markets * 20;

    if (technologies.economy.researched) {
        taxes = Math.floor(taxes * 1.25);
    }

    const upkeep = Math.ceil(army / 2);

    return {
        taxes,
        upkeep,
        net: taxes - upkeep
    };
}

// =====================================
// BYGGNADER
// =====================================

function buildBuilding(baseCost, buildingClass, name, emoji) {
    if (gameOver) return;

    if (!selectedTile || !selectedTile.classList.contains("player")) {
        message.textContent = "Välj ett territorium som du äger först!";
        return;
    }

    if (
        selectedTile.classList.contains("building-farm") ||
        selectedTile.classList.contains("building-market")
    ) {
        message.textContent = "Det finns redan en byggnad på detta territorium!";
        return;
    }

    const cost = getBuildingCost(baseCost);

    if (gold < cost) {
        message.textContent = `Du behöver ${cost} guld!`;
        return;
    }

    gold -= cost;
    selectedTile.classList.add(buildingClass);
    selectedTile.textContent = emoji;

    message.textContent = `🏗️ Du byggde ${name} för ${cost} guld!`;
    updateStats();
}

const buildFarmButton = document.getElementById("buildFarm");
const buildMarketButton = document.getElementById("buildMarket");

if (buildFarmButton) {
    buildFarmButton.addEventListener("click", () => {
        buildBuilding(80, "building-farm", "en gård", "🌾");
    });
}

if (buildMarketButton) {
    buildMarketButton.addEventListener("click", () => {
        buildBuilding(150, "building-market", "en marknad", "🏪");
    });
}

// =====================================
// REKRYTERA SOLDATER
// =====================================

const recruitButton = document.getElementById("recruit");

if (recruitButton) {
    recruitButton.addEventListener("click", () => {
        if (gameOver) return;

        if (gold < 20) {
            message.textContent = "Du har inte tillräckligt med guld!";
            return;
        }

        gold -= 20;
        army += 5;

        message.textContent = "⚔️ Du rekryterade 5 soldater!";
        updateStats();
    });
}

// =====================================
// AVSLUTA TUR
// =====================================

const endTurnButton = document.getElementById("endTurn");

if (endTurnButton) {
    endTurnButton.addEventListener("click", () => {
        if (gameOver) return;

        const economy = calculateEconomy();
        gold = Math.max(0, gold + economy.net);

        const enemyMessage = enemyTurn();

        if (!gameOver) {
            message.textContent =
                `💰 Skatter: ${economy.taxes} | ` +
                `⚔️ Arméunderhåll: ${economy.upkeep} | ` +
                `Netto: ${economy.net} guld. ${enemyMessage}`;
        }

        updateStats();
    });
}

// =====================================
// UPPGRADERA BYAR OCH STÄDER
// =====================================

const upgradeButton = document.getElementById("upgrade");

if (upgradeButton) {
    upgradeButton.addEventListener("click", () => {
        if (gameOver) return;

        if (!selectedTile || !selectedTile.classList.contains("player")) {
            message.textContent = "Välj ett territorium som du äger först!";
            return;
        }

        if (selectedTile.classList.contains("village-owned")) {
            const cost = getBuildingCost(100);

            if (gold < cost) {
                message.textContent = `Du behöver ${cost} guld!`;
                return;
            }

            gold -= cost;
            selectedTile.classList.remove("village-owned");
            selectedTile.classList.add("city-owned");
            selectedTile.textContent = "🏙️";
            message.textContent = "🏙️ Du uppgraderade byn till en stad!";
        } else if (selectedTile.classList.contains("city-owned")) {
            const cost = getBuildingCost(250);

            if (gold < cost) {
                message.textContent = `Du behöver ${cost} guld!`;
                return;
            }

            gold -= cost;
            selectedTile.classList.remove("city-owned");
            selectedTile.classList.add("capital-owned");
            selectedTile.textContent = "👑";
            message.textContent = "👑 Du byggde en huvudstad!";
        } else {
            message.textContent = "Du kan bara uppgradera byar och städer!";
            return;
        }

        updateStats();
    });
}

// =====================================
// UPPDATERA TEKNIKTRÄD OCH STATISTIK
// =====================================

function updateTechnologyButtons() {
    Object.entries(technologies).forEach(([key, tech]) => {
        const button = document.getElementById("research-" + key);
        if (!button) return;

        if (tech.researched) {
            button.textContent = "✅ Forskning klar";
            button.disabled = true;
        } else {
            button.textContent = `Forska – ${tech.cost} guld`;
            button.disabled = gameOver || gold < tech.cost;
        }
    });
}

function updateStats() {
    const goldElement = document.getElementById("gold");
    const armyElement = document.getElementById("army");
    const territoryElement = document.getElementById("territory");

    if (goldElement) goldElement.textContent = gold;
    if (armyElement) armyElement.textContent = army;
    if (territoryElement) territoryElement.textContent = territory;

    const economy = calculateEconomy();

    const taxElement = document.getElementById("taxIncome");
    const upkeepElement = document.getElementById("armyUpkeep");
    const netElement = document.getElementById("netIncome");

    if (taxElement) taxElement.textContent = economy.taxes;
    if (upkeepElement) upkeepElement.textContent = economy.upkeep;
    if (netElement) netElement.textContent = economy.net;

    updateTechnologyButtons();
}

// =====================================
// STARTA SPELET
// =====================================

if (!map || !message) {
    console.error("Empire Wars: #map eller #message saknas i index.html.");
} else {
    createTechnologyPanel();
    createMap();
    updateStats();
    message.textContent =
        "Välj ett område att attackera. Besegra båda fiendehuvudstäderna för att vinna!";
}
