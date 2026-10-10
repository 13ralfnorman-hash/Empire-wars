
"use strict";

// ============================================
// EMPIRE WARS
// Huvudmeny, teknikträd, ekonomi, byggnader,
// strider och fiender som expanderar.
// ============================================

let gold = 100;
let army = 10;
let territory = 1;
let selectedTile = null;
let gameOver = false;
let enemyCapitalsRemaining = 2;
let gameStarted = false;

const MAP_SIZE = 10;
const TOTAL_TILES = MAP_SIZE * MAP_SIZE;

const PLAYER_CAPITAL = 55;
const ENEMY_CAPITALS = [0, 99];
const ENEMY_STARTING_TROOPS = [1, 10, 98, 89];

const CITIES = [2, 19, 45, 78, 92];
const VILLAGES = [8, 26, 37, 56, 69, 85];
const MOUNTAINS = [6, 18, 33, 62, 81];
const FARMLAND = [7, 17, 29, 48, 73];

const technologies = {
    military: {
        name: "Starkare soldater",
        cost: 120,
        researched: false,
        description:
            "Ökar chansen att vinna attacker med 15 procentenheter."
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
        description:
            "Gårdar, marknader och stadsuppgraderingar kostar 30 % mindre."
    }
};

const map = document.getElementById("map");
const message = document.getElementById("message");

if (!map || !message) {
    throw new Error(
        "Empire Wars: #map eller #message saknas i index.html."
    );
}

// ============================================
// MENYERNAS UTSEENDE
// Skapas här, så index.html och style.css
// inte behöver ändras.
// ============================================

function addMenuStyles() {
    if (document.getElementById("ew-menu-styles")) return;

    const style = document.createElement("style");
    style.id = "ew-menu-styles";

    style.textContent = `
        .ew-menu-bar {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 8px;
            margin: 14px auto;
        }

        .ew-menu-overlay {
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 18px;
            background: rgba(5, 12, 17, 0.88);
            backdrop-filter: blur(6px);
        }

        .ew-menu-overlay[hidden] {
            display: none !important;
        }

        .ew-menu-card {
            width: min(560px, 100%);
            max-height: 90vh;
            overflow-y: auto;
            padding: 26px;
            color: #edf4ed;
            background: linear-gradient(145deg, #1a2731, #263844);
            border: 2px solid #c5a75b;
            border-radius: 16px;
            box-shadow: 0 18px 70px #0009;
            text-align: center;
        }

        .ew-menu-card h2 {
            margin-top: 0;
            color: #f5ca67;
            font-size: clamp(25px, 5vw, 38px);
        }

        .ew-menu-card p {
            line-height: 1.6;
        }

        .ew-menu-actions {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
            margin-top: 20px;
        }

        .ew-menu-actions button {
            width: 100%;
            min-height: 44px;
            margin: 0;
        }

        #ew-technology-panel {
            max-width: 1000px;
            margin: 18px auto;
            padding: 16px;
            color: #edf4ed;
            background: #1a2731;
            border: 2px solid #c5a75b;
            border-radius: 12px;
        }

        #ew-technology-panel[hidden] {
            display: none !important;
        }

        .ew-tech-list {
            display: grid;
            grid-template-columns: repeat(
                auto-fit, minmax(190px, 1fr)
            );
            gap: 12px;
        }

        .ew-tech-card {
            padding: 14px;
            background: #263844;
            border: 1px solid #657b80;
            border-radius: 10px;
        }

        .ew-tech-card h3 {
            margin-top: 0;
            color: #f5ca67;
        }

        .ew-tech-card p {
            min-height: 54px;
        }

        .ew-tech-card button {
            width: 100%;
            margin: 0;
        }

        #ew-settings-content {
            margin-top: 14px;
            padding: 12px;
            background: #101820;
            border-radius: 8px;
            text-align: left;
        }

        #ew-settings-content[hidden] {
            display: none !important;
        }

        .tile.enemy-capital {
            position: relative;
        }

        @media (max-width: 520px) {
            .ew-menu-card {
                padding: 18px;
            }

            #ew-technology-panel {
                padding: 10px;
            }
        }
    `;

    document.head.appendChild(style);
}

// ============================================
// HUVUDMENY
// ============================================

let menuOverlay;
let settingsContent;

function createMainMenu() {
    menuOverlay = document.createElement("div");
    menuOverlay.className = "ew-menu-overlay";
    menuOverlay.id = "ew-main-menu";

    menuOverlay.innerHTML = `
        <section class="ew-menu-card">
            <h2>⚔️ Empire Wars</h2>
            <p>
                Bygg ditt rike, samla resurser, forska fram ny teknik
                och besegra båda fiendehuvudstäderna.
            </p>

            <div class="ew-menu-actions">
                <button id="ew-play">▶️ Spela</button>
                <button id="ew-continue">↩️ Fortsätt spela</button>
                <button id="ew-settings">⚙️ Inställningar</button>
                <button id="ew-restart">🔄 Starta om</button>
            </div>

            <div id="ew-settings-content" hidden>
                <h3>Inställningar och regler</h3>
                <p>
                    Kartan är 10 × 10 rutor. Klicka på ett område
                    för att attackera det. Välj ett av dina områden
                    för att bygga eller uppgradera.
                </p>
                <p>
                    Avsluta turen för att få inkomster och låta
                    fienderna agera. Förlora inte din huvudstad!
                </p>
                <p>
                    Spelet sparas inte automatiskt. Starta om
                    sidan om du vill börja från början.
                </p>
            </div>
        </section>
    `;

    document.body.appendChild(menuOverlay);

    settingsContent = document.getElementById("ew-settings-content");

    document.getElementById("ew-play").addEventListener("click", () => {
        gameStarted = true;
        closeMainMenu();
        message.textContent =
            "Välj ett område att attackera. Besegra båda fiendehuvudstäderna!";
    });

    document.getElementById("ew-continue").addEventListener("click", () => {
        gameStarted = true;
        closeMainMenu();
    });

    document.getElementById("ew-settings").addEventListener("click", () => {
        settingsContent.hidden = !settingsContent.hidden;
    });

    document.getElementById("ew-restart").addEventListener("click", () => {
        window.location.reload();
    });
}

function openMainMenu() {
    menuOverlay.hidden = false;
}

function closeMainMenu() {
    menuOverlay.hidden = true;
}

// ============================================
// MENYKNAPPAR I SPELET
// ============================================

function createMenuBar() {
    const bar = document.createElement("div");
    bar.className = "ew-menu-bar";
    bar.id = "ew-menu-bar";

    bar.innerHTML = `
        <button id="ew-open-menu">☰ Huvudmeny</button>
        <button id="ew-toggle-tech">🔬 Visa teknikträd</button>
    `;

    map.insertAdjacentElement("beforebegin", bar);

    document.getElementById("ew-open-menu")
        .addEventListener("click", openMainMenu);

    document.getElementById("ew-toggle-tech")
        .addEventListener("click", toggleTechnologyPanel);
}

// ============================================
// SEPARAT TEKNIKTRÄD
// ============================================

let technologyPanel;

function createTechnologyPanel() {
    technologyPanel = document.createElement("section");
    technologyPanel.id = "ew-technology-panel";
    technologyPanel.hidden = true;

    technologyPanel.innerHTML = `
        <h2>🔬 Teknikträd</h2>
        <p>
            Forska för att förbättra din armé, ekonomi och byggnader.
        </p>

        <div class="ew-tech-list">
            <article class="ew-tech-card">
                <h3>⚔️ Starkare soldater</h3>
                <p>${technologies.military.description}</p>
                <button id="research-military">Forska – 120 guld</button>
            </article>

            <article class="ew-tech-card">
                <h3>💰 Bättre ekonomi</h3>
                <p>${technologies.economy.description}</p>
                <button id="research-economy">Forska – 100 guld</button>
            </article>

            <article class="ew-tech-card">
                <h3>🏗️ Billigare byggnader</h3>
                <p>${technologies.construction.description}</p>
                <button id="research-construction">
                    Forska – 150 guld
                </button>
            </article>
        </div>
    `;

    map.insertAdjacentElement("beforebegin", technologyPanel);

    document.getElementById("research-military")
        .addEventListener("click", () => researchTechnology("military"));

    document.getElementById("research-economy")
        .addEventListener("click", () => researchTechnology("economy"));

    document.getElementById("research-construction")
        .addEventListener("click", () => researchTechnology("construction"));
}

function toggleTechnologyPanel() {
    technologyPanel.hidden = !technologyPanel.hidden;

    const button = document.getElementById("ew-toggle-tech");
    button.textContent = technologyPanel.hidden
        ? "🔬 Visa teknikträd"
        : "🔬 Dölj teknikträd";

    if (!technologyPanel.hidden) {
        technologyPanel.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }
}

function researchTechnology(key) {
    if (gameOver || !gameStarted) return;

    const tech = technologies[key];
    if (!tech) return;

    if (tech.researched) {
        message.textContent = "Du har redan forskat fram den tekniken!";
        return;
    }

    if (gold < tech.cost) {
        message.textContent =
            `Du behöver ${tech.cost} guld för den forskningen!`;
        return;
    }

    gold -= tech.cost;
    tech.researched = true;

    message.textContent = `🔬 Du har forskat fram: ${tech.name}!`;
    updateStats();
}

function getBuildingCost(baseCost) {
    return technologies.construction.researched
        ? Math.round(baseCost * 0.7)
        : baseCost;
}

// ============================================
// KARTANS HJÄLPFUNKTIONER
// ============================================

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

function setTileText(tile, emoji) {
    tile.textContent = emoji;
}

// ============================================
// SKAPA KARTAN
// ============================================

function createMap() {
    map.innerHTML = "";

    for (let i = 0; i < TOTAL_TILES; i++) {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.classList.add("tile");
        tile.dataset.index = String(i);
        tile.setAttribute("aria-label", `Område ${i + 1}`);

        // Huvudstäder och fiender har prioritet
        // över resurser och terräng.
        if (i === PLAYER_CAPITAL) {
            tile.classList.add("player", "player-capital");
            setTileText(tile, "👑");
            tile.setAttribute("aria-label", "Din huvudstad");
        } else if (ENEMY_CAPITALS.includes(i)) {
            tile.classList.add("enemy", "enemy-capital");
            setTileText(tile, "🏰👑");
            tile.setAttribute("aria-label", "Fiendens huvudstad");
        } else if (ENEMY_STARTING_TROOPS.includes(i)) {
            tile.classList.add("enemy");
            setTileText(tile, "⚔️");
            tile.setAttribute("aria-label", "Fiendeterritorium");
        } else if (CITIES.includes(i)) {
            tile.classList.add("city");
            setTileText(tile, "🏙️");
        } else if (VILLAGES.includes(i)) {
            tile.classList.add("village");
            setTileText(tile, "🏘️");
        } else if (MOUNTAINS.includes(i)) {
            tile.classList.add("mountain");
            setTileText(tile, "⛰️");
        } else if (FARMLAND.includes(i)) {
            tile.classList.add("farmland");
            setTileText(tile, "🌾");
        } else {
            tile.classList.add("neutral");
            // style.css visar ett träd med ::before.
            // Tom text förhindrar att två träd visas.
            setTileText(tile, "");
        }

        tile.addEventListener("click", () => handleTileClick(tile));
        map.appendChild(tile);
    }
}

function handleTileClick(tile) {
    if (!gameStarted || gameOver || tile.disabled) return;

    if (tile.classList.contains("player")) {
        if (selectedTile) {
            selectedTile.classList.remove("selected");
        }

        selectedTile = tile;
        selectedTile.classList.add("selected");

        message.textContent =
            "Du har valt ditt territorium. Bygg eller uppgradera!";
        return;
    }

    attack(tile);
}

// ============================================
// SPELAREN ATTACKERAR
// ============================================

function attack(tile) {
    if (!gameStarted || gameOver) return;

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

    if (isMountain) {
        chance = 0.4;
    } else if (isForest) {
        chance = 0.65;
    } else if (isEnemy) {
        chance = 0.35;
    }

    if (technologies.military.researched) {
        chance += 0.15;
    }

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

    if (selectedTile) {
        selectedTile.classList.remove("selected");
    }
    selectedTile = null;

    // Ta bort gammalt ägarskap och terräng innan
    // nya ägar- och resursklasser läggs till.
    removeOwnershipClasses(tile);
    removeTerrainClasses(tile);
    tile.classList.add("player");

    if (wasFarm) tile.classList.add("farm-owned");
    if (wasCity) tile.classList.add("city-owned");
    if (wasVillage) tile.classList.add("village-owned");

    if (wasEnemyCapital) {
        setTileText(tile, "👑");
        enemyCapitalsRemaining--;
    } else if (wasCity) {
        setTileText(tile, "🏙️");
    } else if (wasVillage) {
        setTileText(tile, "🏘️");
    } else if (wasFarm) {
        setTileText(tile, "🌾");
    } else if (isMountain) {
        setTileText(tile, "⛰️");
    } else {
        setTileText(tile, "🏰");
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

// ============================================
// FIENDERNAS TUR OCH EXPANSION
// ============================================

function enemyTurn() {
    if (gameOver) return "";

    // Endast territorier som var fiendens vid
    // turens början får agera under denna tur.
    const enemies = Array.from(map.children).filter(tile =>
        tile.classList.contains("enemy")
    );

    // Slumpmässig ordning gör expansionen mindre förutsägbar.
    for (let i = enemies.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [enemies[i], enemies[j]] = [enemies[j], enemies[i]];
    }

    let capturedPlayerAreas = 0;
    let expandedAreas = 0;

    for (const enemyTile of enemies) {
        if (gameOver) break;
        if (!map.contains(enemyTile)) continue;

        const index = Number(enemyTile.dataset.index);
        const neighbors = getNeighbors(index);

        // Alla områden utom fiendens egna kan bli mål.
        const targets = neighbors.filter(tile =>
            !tile.classList.contains("enemy")
        );

        if (targets.length === 0) continue;

        const playerTargets = targets.filter(tile =>
            tile.classList.contains("player")
        );

        let target = null;

        // Om spelaren ligger intill försöker fienden ibland
        // attackera. Annars kan den expandera mot andra rutor.
        if (playerTargets.length > 0 && Math.random() < 0.45) {
            target = playerTargets[
                Math.floor(Math.random() * playerTargets.length)
            ];
        } else {
            const expansionTargets = targets.filter(tile =>
                !tile.classList.contains("player")
            );

            if (
                expansionTargets.length > 0 &&
                Math.random() < 0.65
            ) {
                target = expansionTargets[
                    Math.floor(Math.random() * expansionTargets.length)
                ];
            } else if (playerTargets.length > 0) {
                target = playerTargets[
                    Math.floor(Math.random() * playerTargets.length)
                ];
            }
        }

        if (!target) continue;

        const wasPlayer = target.classList.contains("player");
        const wasPlayerCapital =
            target.classList.contains("player-capital");

        if (wasPlayer) {
            capturedPlayerAreas++;
            territory--;
        } else {
            expandedAreas++;
        }

        if (selectedTile === target) {
            selectedTile.classList.remove("selected");
            selectedTile = null;
        }

        // Fienden tar området och dess byggnader/resurser.
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

    if (expandedAreas > 0) {
        parts.push(`Fienden expanderade till ${expandedAreas} nya områden`);
    }

    if (capturedPlayerAreas > 0) {
        parts.push(`Fienden erövrade ${capturedPlayerAreas} av dina områden`);
    }

    return parts.length
        ? "⚔️ " + parts.join(". ") + "."
        : "🛡️ Fienden tog inga nya områden denna tur.";
}

// ============================================
// SPELETS SLUT
// ============================================

function finishGame(won) {
    if (gameOver) return;

    gameOver = true;

    message.textContent = won
        ? "🏆 SEGER! Du har besegrat alla fiendehuvudstäder!"
        : "💀 NEDERLAG! Din huvudstad har fallit. Starta om för att spela igen.";

    // Inaktivera spelkontroller men låt huvudmenyn
    // och omstartsknappen fortsätta fungera.
    const controlIds = [
        "recruit",
        "endTurn",
        "upgrade",
        "buildFarm",
        "buildMarket",
        "research-military",
        "research-economy",
        "research-construction"
    ];

    controlIds.forEach(id => {
        const button = document.getElementById(id);
        if (button) button.disabled = true;
    });

    map.querySelectorAll("button").forEach(tile => {
        tile.disabled = true;
    });

    updateStats();
}

// ============================================
// EKONOMI
// ============================================

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

// ============================================
// BYGGNADER
// ============================================

function buildBuilding(baseCost, buildingClass, name, emoji) {
    if (!gameStarted || gameOver) return;

    if (!selectedTile || !selectedTile.classList.contains("player")) {
        message.textContent = "Välj ett territorium som du äger först!";
        return;
    }

    if (
        selectedTile.classList.contains("building-farm") ||
        selectedTile.classList.contains("building-market")
    ) {
        message.textContent =
            "Det finns redan en byggnad på detta territorium!";
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

// ============================================
// REKRYTERING
// ============================================

const recruitButton = document.getElementById("recruit");

if (recruitButton) {
    recruitButton.addEventListener("click", () => {
        if (!gameStarted || gameOver) return;

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

// ============================================
// AVSLUTA TUR
// ============================================

const endTurnButton = document.getElementById("endTurn");

if (endTurnButton) {
    endTurnButton.addEventListener("click", () => {
        if (!gameStarted || gameOver) return;

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

// ============================================
// UPPGRADERA BYAR OCH STÄDER
// ============================================

const upgradeButton = document.getElementById("upgrade");

if (upgradeButton) {
    upgradeButton.addEventListener("click", () => {
        if (!gameStarted || gameOver) return;

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
            message.textContent =
                "Du kan bara uppgradera byar och städer!";
            return;
        }

        updateStats();
    });
}

// ============================================
// STATISTIK OCH KNAPPAR
// ============================================

function updateTechnologyButtons() {
    Object.entries(technologies).forEach(([key, tech]) => {
        const button = document.getElementById("research-" + key);
        if (!button) return;

        if (tech.researched) {
            button.textContent = "✅ Forskning klar";
            button.disabled = true;
        } else {
            button.textContent = `Forska – ${tech.cost} guld`;
            button.disabled =
                !gameStarted || gameOver || gold < tech.cost;
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

    // Före spelstart är spelkontrollerna låsta.
    [
        "recruit",
        "endTurn",
        "upgrade",
        "buildFarm",
        "buildMarket"
    ].forEach(id => {
        const button = document.getElementById(id);
        if (button) button.disabled = !gameStarted || gameOver;
    });

    // Om spelet är slut ska alla spelrutor förbli låsta.
    if (gameOver) {
        map.querySelectorAll("button").forEach(tile => {
            tile.disabled = true;
        });
    }
}

// ============================================
// STARTA SPELET
// ============================================

addMenuStyles();
createMenuBar();
createTechnologyPanel();
createMap();
createMainMenu();
updateStats();

message.textContent =
    "Öppna huvudmenyn och välj Spela för att börja.";
