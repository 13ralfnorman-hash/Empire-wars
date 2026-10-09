
let gold = 100;
let army = 10;
let territory = 1;
let selectedTile = null;
let gameOver = false;
let enemyCapitalsRemaining = 4;

const map = document.getElementById("map");
const message = document.getElementById("message");

// =====================================
// KARTANS PLACERINGAR
// =====================================

const PLAYER_CAPITAL = 55;

// En fiendehuvudstad i varje hörn
const ENEMY_CAPITALS = [0, 9, 90, 99];

// Extra fiendeterritorier nära hörnen
const ENEMIES = [3, 14, 85, 96];

const CITIES = [2, 19, 45, 78, 92];
const VILLAGES = [8, 26, 37, 56, 69, 85];
const MOUNTAINS = [6, 18, 33, 62, 81];
const FARMLAND = [7, 17, 29, 48, 73];
const FORESTS = [11, 13, 21, 31, 39, 42, 51, 64, 71, 83, 96];
const RIVERS = [15, 16, 27, 38, 49, 59, 68, 77, 87, 97];

// =====================================
// SKAPA KARTAN
// =====================================

function createMap() {
    map.innerHTML = "";

    for (let i = 0; i < 100; i++) {
        const tile = document.createElement("button");

        tile.classList.add("tile");
        tile.dataset.index = i;

        if (i === PLAYER_CAPITAL) {
            tile.classList.add("player", "player-capital");
            tile.textContent = "👑";
            tile.title = "Din huvudstad";
        } else if (ENEMY_CAPITALS.includes(i)) {
            tile.classList.add("enemy", "enemy-capital");
            tile.textContent = "🏰";
            tile.title = "Fiendens huvudstad";
        } else if (ENEMIES.includes(i)) {
            tile.classList.add("enemy");
            tile.textContent = "⚔️";
            tile.title = "Fiendens territorium";
        } else if (CITIES.includes(i)) {
            tile.classList.add("city");
            tile.textContent = "🏙️";
            tile.title = "Stad";
        } else if (VILLAGES.includes(i)) {
            tile.classList.add("village");
            tile.textContent = "🏘️";
            tile.title = "By";
        } else if (MOUNTAINS.includes(i)) {
            tile.classList.add("mountain");
            tile.textContent = "⛰️";
            tile.title = "Berg";
        } else if (FARMLAND.includes(i)) {
            tile.classList.add("farmland");
            tile.textContent = "🌾";
            tile.title = "Jordbruksmark";
        } else if (RIVERS.includes(i)) {
            tile.classList.add("river");
            tile.textContent = "🌊";
            tile.title = "Flod – kan inte erövras";
        } else if (FORESTS.includes(i)) {
            tile.classList.add("forest");
            tile.textContent = "🌲";
            tile.title = "Skog";
        } else {
            tile.classList.add("neutral");
            tile.textContent = "🌲";
            tile.title = "Neutral mark";
        }

        tile.addEventListener("click", () => {
            if (gameOver) return;

            if (tile.classList.contains("player")) {
                selectTerritory(tile);
            } else {
                attack(tile);
            }
        });

        map.appendChild(tile);
    }
}

// =====================================
// VÄLJ TERRITORIUM
// =====================================

function selectTerritory(tile) {
    if (selectedTile) {
        selectedTile.classList.remove("selected");
    }

    selectedTile = tile;
    selectedTile.classList.add("selected");

    message.textContent = "🏰 Du har valt ditt territorium!";
}

// =====================================
// HJÄLPFUNKTIONER
// =====================================

function isRiver(tile) {
    return tile.classList.contains("river");
}

function getNeighbors(index) {
    const neighbors = [];

    if (index >= 10) neighbors.push(index - 10);
    if (index < 90) neighbors.push(index + 10);
    if (index % 10 !== 0) neighbors.push(index - 1);
    if (index % 10 !== 9) neighbors.push(index + 1);

    return neighbors;
}

function isEnemyTile(tile) {
    return tile.classList.contains("enemy");
}

function isPlayerTile(tile) {
    return tile.classList.contains("player");
}

// =====================================
// SEGER OCH NEDERLAG
// =====================================

function finishGame(won) {
    if (gameOver) return;

    gameOver = true;

    if (won) {
        message.textContent =
            "🏆 SEGER! Du har erövrat alla fyra fiendehuvudstäder!";
    } else {
        message.textContent =
            "💀 NEDERLAG! Din huvudstad har fallit. Ladda om sidan för att spela igen.";
    }

    map.querySelectorAll("button").forEach(button => {
        button.disabled = true;
    });

    [
        "recruit",
        "endTurn",
        "upgrade",
        "buildFarm",
        "buildMarket"
    ].forEach(id => {
        const button = document.getElementById(id);
        if (button) button.disabled = true;
    });
}

// =====================================
// SPELARENS ATTACK
// =====================================

function attack(tile) {
    if (gameOver) return;

    if (isPlayerTile(tile)) {
        message.textContent = "Det området är redan ditt!";
        return;
    }

    if (isRiver(tile)) {
        message.textContent =
            "🌊 Floden blockerar vägen! Välj ett annat territorium.";
        return;
    }

    const isMountain = tile.classList.contains("mountain");
    const isForest = tile.classList.contains("forest") ||
                     tile.classList.contains("neutral");
    const isEnemy = tile.classList.contains("enemy");

    const wasFarm = tile.classList.contains("farmland");
    const wasCity = tile.classList.contains("city");
    const wasVillage = tile.classList.contains("village");
    const wasEnemyCapital = tile.classList.contains("enemy-capital");

    const cost = isMountain ? 5 : isEnemy ? 4 : 3;

    if (army < cost) {
        message.textContent =
            "Du behöver minst " + cost + " soldater för attacken!";
        return;
    }

    army -= cost;

    let chance = 0.78;

    if (isMountain) chance = 0.45;
    if (isForest) chance = 0.60;
    if (isEnemy) chance = 0.42;
    if (wasEnemyCapital) chance = 0.35;

    if (Math.random() < chance) {
        tile.classList.remove(
            "neutral",
            "forest",
            "mountain",
            "farmland",
            "enemy",
            "enemy-capital",
            "city",
            "village"
        );

        if (wasFarm) tile.classList.add("farm-owned");
        if (wasCity) tile.classList.add("city-owned");
        if (wasVillage) tile.classList.add("village-owned");

        tile.classList.add("player");
        tile.title = "Ditt territorium";

        if (wasCity) {
            tile.textContent = "🏙️";
        } else if (wasVillage) {
            tile.textContent = "🏘️";
        } else if (wasFarm) {
            tile.textContent = "🌾";
        } else if (wasEnemyCapital) {
            tile.textContent = "👑";
        } else if (isMountain) {
            tile.textContent = "⛰️";
        } else {
            tile.textContent = "🏰";
        }

        territory++;
        gold += wasFarm ? 35 : 20;

        if (wasEnemyCapital) {
            enemyCapitalsRemaining--;
        }

        updateStats();

        if (wasEnemyCapital && enemyCapitalsRemaining <= 0) {
            finishGame(true);
            return;
        }

        if (wasEnemyCapital) {
            message.textContent =
                "👑 Fiendehuvudstad erövrad! " +
                enemyCapitalsRemaining + " återstår.";
        } else if (wasCity) {
            message.textContent = "🏙️ Du erövrade en stad!";
        } else if (wasVillage) {
            message.textContent = "🏘️ Du erövrade en by!";
        } else if (wasFarm) {
            message.textContent =
                "🌾 Du erövrade jordbruksmark och fick 35 guld!";
        } else if (isMountain) {
            message.textContent = "⛰️ Du erövrade ett berg!";
        } else if (isEnemy) {
            message.textContent = "⚔️ Du besegrade fiendens försvar!";
        } else {
            message.textContent = "🛡️ Du erövrade nytt territorium!";
        }
    } else {
        message.textContent = isEnemy
            ? "⚔️ Fienden försvarade sitt territorium!"
            : isMountain
            ? "⛰️ Berget var svårt att inta!"
            : "💥 Attacken misslyckades!";
    }

    updateStats();
}

// =====================================
// FIENDERNAS TUR
// Fienderna anfaller neutrala rutor
// OCH spelarens territorier.
// =====================================

function enemyTurn() {
    if (gameOver) return "";

    // Vi tar en kopia av fienderna som finns när turen börjar.
    // Nya territorier som erövras får börja anfalla nästa tur.
    const tiles = Array.from(map.children);

    const enemies = tiles.filter(tile =>
        tile.classList.contains("enemy")
    );

    let neutralCaptured = 0;
    let playerCaptured = 0;

    enemies.forEach(enemyTile => {
        if (gameOver) return;

        const index = Number(enemyTile.dataset.index);

        // Fienden kan anfalla neutrala rutor, städer, byar,
        // jordbruksmark, berg, skogar och spelarens territorier.
        // Floder och andra fiender blockerar expansionen.
        const targets = getNeighbors(index)
            .map(i => tiles[i])
            .filter(tile =>
                !isRiver(tile) &&
                !isEnemyTile(tile)
            );

        if (targets.length === 0) return;

        // Varje fiendeterritorium har 50 % chans att försöka anfalla.
        if (Math.random() >= 0.50) return;

        // Fienden väljer ett angränsande mål.
        // Spelarens områden prioriteras ibland för att skapa press.
        const playerTargets = targets.filter(isPlayerTile);

        let target;

        if (playerTargets.length > 0 && Math.random() < 0.60) {
            target = playerTargets[
                Math.floor(Math.random() * playerTargets.length)
            ];
        } else {
            target = targets[
                Math.floor(Math.random() * targets.length)
            ];
        }

        const wasPlayer = isPlayerTile(target);
        const wasPlayerCapital =
            target.classList.contains("player-capital");

        const wasMountain = target.classList.contains("mountain");
        const wasForest = target.classList.contains("forest") ||
                          target.classList.contains("neutral");

        // Fienden har olika chans att lyckas beroende på terräng.
        let successChance = 0.65;

        if (wasMountain) successChance = 0.25;
        else if (wasForest) successChance = 0.45;
        else if (wasPlayer) successChance = 0.35;

        if (Math.random() >= successChance) return;

        // Ta bort tidigare ägande och resurser från målet.
        target.classList.remove(
            "player",
            "player-capital",
            "neutral",
            "forest",
            "mountain",
            "farmland",
            "city",
            "village",
            "farm-owned",
            "city-owned",
            "village-owned",
            "capital-owned",
            "building-farm",
            "building-market",
            "selected"
        );

        // Fienden tar över rutan.
        target.classList.add("enemy");
        target.textContent = "⚔️";
        target.title = "Fiendekontrollerat territorium";

        if (wasPlayer) {
            territory--;
            playerCaptured++;
        } else {
            neutralCaptured++;
        }

        if (selectedTile === target) {
            selectedTile = null;
        }

        // Förlust om spelarens huvudstad blir erövrad.
        if (wasPlayerCapital) {
            finishGame(false);
        }
    });

    updateStats();

    if (gameOver) {
        return "💀 Din huvudstad har fallit!";
    }

    if (playerCaptured > 0 && neutralCaptured > 0) {
        return "⚔️ Fienden tog " + playerCaptured +
            " av dina territorier och erövrade " +
            neutralCaptured + " neutrala rutor!";
    }

    if (playerCaptured > 0) {
        return "⚔️ Fienden erövrade " +
            playerCaptured + " av dina territorier!";
    }

    if (neutralCaptured > 0) {
        return "🟥 Fienden expanderade och erövrade " +
            neutralCaptured + " neutrala rutor!";
    }

    return "🛡️ Fienden försökte anfalla, men erövrade inget denna tur.";
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

    const taxes =
        territory * 8 +
        farms * 10 +
        cities * 15 +
        villages * 7 +
        capitals * 40 +
        builtFarms * 10 +
        markets * 20;

    const upkeep = Math.ceil(army / 2);

    return {
        taxes,
        upkeep,
        net: taxes - upkeep
    };
}

// =====================================
// BYGG GÅRDAR OCH MARKNADER
// =====================================

function buildBuilding(cost, buildingClass, name, emoji) {
    if (gameOver) return;

    if (!selectedTile || !selectedTile.classList.contains("player")) {
        message.textContent =
            "Välj ett territorium som du äger först!";
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

    if (gold < cost) {
        message.textContent = "Du behöver " + cost + " guld!";
        return;
    }

    gold -= cost;

    selectedTile.classList.add(buildingClass);
    selectedTile.textContent = emoji;
    selectedTile.title = name;

    message.textContent = "🏗️ Du byggde " + name + "!";
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
            message.textContent =
                "Du har inte tillräckligt med guld!";
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
                "💰 Skatter: " + economy.taxes +
                " | ⚔️ Arméunderhåll: " + economy.upkeep +
                " | Netto: " + economy.net + " guld. " +
                enemyMessage;
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
            message.textContent =
                "Välj ett territorium som du äger först!";
            return;
        }

        if (selectedTile.classList.contains("village-owned")) {
            if (gold < 100) {
                message.textContent = "Du behöver 100 guld!";
                return;
            }

            gold -= 100;

            selectedTile.classList.remove("village-owned");
            selectedTile.classList.add("city-owned");
            selectedTile.textContent = "🏙️";
            selectedTile.title = "Din stad";

            message.textContent =
                "🏙️ Du uppgraderade byn till en stad!";
        } else if (selectedTile.classList.contains("city-owned")) {
            if (gold < 250) {
                message.textContent = "Du behöver 250 guld!";
                return;
            }

            gold -= 250;

            selectedTile.classList.remove("city-owned");
            selectedTile.classList.add("capital-owned");
            selectedTile.textContent = "👑";
            selectedTile.title = "Din huvudstad";

            message.textContent =
                "👑 Du byggde en huvudstad!";
        } else {
            message.textContent =
                "Du kan bara uppgradera byar och städer!";
            return;
        }

        updateStats();
    });
}

// =====================================
// UPPDATERA STATISTIK
// =====================================

function updateStats() {
    document.getElementById("gold").textContent = gold;
    document.getElementById("army").textContent = army;
    document.getElementById("territory").textContent = territory;

    const economy = calculateEconomy();

    const taxElement = document.getElementById("taxIncome");
    const upkeepElement = document.getElementById("armyUpkeep");
    const netElement = document.getElementById("netIncome");

    if (taxElement) taxElement.textContent = economy.taxes;
    if (upkeepElement) upkeepElement.textContent = economy.upkeep;
    if (netElement) netElement.textContent = economy.net;
}

// =====================================
// STARTA SPELET
// =====================================

createMap();
updateStats();
