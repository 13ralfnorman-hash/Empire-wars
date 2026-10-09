
let gold = 100;
let army = 10;
let territory = 1;
let selectedTile = null;
let gameOver = false;
let enemyCapitalsRemaining = 2;

const map = document.getElementById("map");
const message = document.getElementById("message");

// ================================
// SKAPA KARTAN
// ================================

function createMap() {
    map.innerHTML = "";

    for (let i = 0; i < 100; i++) {
        const tile = document.createElement("button");
        tile.classList.add("tile");

        if (i === 55) {
            tile.classList.add("player", "player-capital");
            tile.textContent = "👑";
        } else if ([0, 24].includes(i)) {
            tile.classList.add("enemy", "enemy-capital");
            tile.textContent = "👑";
        } else if ([4, 20].includes(i)) {
            tile.classList.add("enemy");
            tile.textContent = "⚔️";
        } else if ([2, 19, 45, 78, 92].includes(i)) {
            tile.classList.add("city");
            tile.textContent = "🏙️";
        } else if ([8, 26, 37, 56, 69, 85].includes(i)) {
            tile.classList.add("village");
            tile.textContent = "🏘️";
        } else if ([6, 18, 33, 62, 81].includes(i)) {
            tile.classList.add("mountain");
            tile.textContent = "⛰️";
        } else if ([7, 17, 29, 48, 73].includes(i)) {
            tile.classList.add("farmland");
            tile.textContent = "🌾";
        } else {
            tile.classList.add("neutral");
            tile.textContent = "🌲";
        }

        tile.addEventListener("click", () => {
            if (gameOver) return;

            if (tile.classList.contains("player")) {
                selectedTile = tile;
                message.textContent = "🏰 Du har valt ditt territorium!";
            } else {
                attack(tile);
            }
        });

        map.appendChild(tile);
    }
}

// ================================
// KONTROLLERA SPELETS SLUT
// ================================

function finishGame(won) {
    gameOver = true;

    if (won) {
        message.textContent =
            "🏆 SEGER! Du har besegrat alla fiendehuvudstäder och vunnit Empire Wars!";
    } else {
        message.textContent =
            "💀 NEDERLAG! Din huvudstad har fallit. Ladda om sidan för att spela igen.";
    }

    document.querySelectorAll("button").forEach(button => {
        if (button.closest("#map")) {
            button.disabled = true;
        }
    });

    ["recruit", "endTurn", "upgrade", "buildFarm", "buildMarket"]
        .forEach(id => {
            const button = document.getElementById(id);
            if (button) button.disabled = true;
        });
}

// ================================
// ATTACKERA OCH ERÖVRA
// ================================

function attack(tile) {
    if (gameOver) return;

    if (tile.classList.contains("player")) {
        message.textContent = "Det området är redan ditt!";
        return;
    }

    const isMountain = tile.classList.contains("mountain");
    const isForest = tile.classList.contains("neutral");
    const isEnemy = tile.classList.contains("enemy");
    const wasFarm = tile.classList.contains("farmland");
    const wasCity = tile.classList.contains("city");
    const wasVillage = tile.classList.contains("village");
    const wasEnemyCapital = tile.classList.contains("enemy-capital");

    const cost = isMountain ? 5 : 3;

    if (army < cost) {
        message.textContent = "Du behöver minst " + cost + " soldater!";
        return;
    }

    army -= cost;

    let chance = 0.7;
    if (isMountain) chance = 0.4;
    if (isForest) chance = 0.65;
    if (isEnemy) chance = 0.35;

    if (Math.random() < chance) {
        if (wasFarm) tile.classList.add("farm-owned");
        if (wasCity) tile.classList.add("city-owned");
        if (wasVillage) tile.classList.add("village-owned");

        tile.classList.remove(
            "neutral",
            "mountain",
            "farmland",
            "enemy",
            "enemy-capital",
            "city",
            "village"
        );

        tile.classList.add("player");

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
            message.textContent = "🌾 Du erövrade jordbruksmark och fick 35 guld!";
        } else if (isMountain) {
            message.textContent = "⛰️ Du erövrade ett berg!";
        } else {
            message.textContent = "🔥 Du erövrade ett nytt territorium!";
        }
    } else {
        message.textContent = isMountain
            ? "⛰️ Berget var svårt att inta!"
            : isEnemy
            ? "⚔️ Fienden försvarade sitt territorium!"
            : "💀 Attacken misslyckades!";
    }

    updateStats();
}

// ================================
// FIENDERNAS TUR
// ================================

function enemyTurn() {
    if (gameOver) return "";

    const tiles = Array.from(map.children);
    const enemies = tiles.filter(tile =>
        tile.classList.contains("enemy")
    );

    let captured = 0;

    enemies.forEach(enemyTile => {
        if (gameOver) return;

        const index = tiles.indexOf(enemyTile);
        const neighbors = [];

        if (index >= 10) neighbors.push(tiles[index - 10]);
        if (index < 90) neighbors.push(tiles[index + 10]);
        if (index % 10 !== 0) neighbors.push(tiles[index - 1]);
        if (index % 10 !== 9) neighbors.push(tiles[index + 1]);

        const targets = neighbors.filter(tile =>
            tile.classList.contains("player")
        );

        if (targets.length > 0 && Math.random() < 0.45) {
            const target =
                targets[Math.floor(Math.random() * targets.length)];

            const wasPlayerCapital =
                target.classList.contains("player-capital");

            target.classList.remove(
                "player",
                "player-capital",
                "farm-owned",
                "city-owned",
                "village-owned",
                "capital-owned",
                "building-farm",
                "building-market"
            );

            target.classList.add("enemy");
            target.textContent = "⚔️";

            territory--;
            captured++;

            if (selectedTile === target) selectedTile = null;

            if (wasPlayerCapital) {
                finishGame(false);
            }
        }
    });

    updateStats();

    if (gameOver) return "💀 Din huvudstad har fallit!";

    if (captured > 0) {
        return "⚔️ Fienden erövrade " + captured + " av dina territorier!";
    }

    return "🛡️ Fienden anföll inte denna tur.";
}

// ================================
// EKONOMI
// ================================

function calculateEconomy() {
    const farms = document.querySelectorAll("#map .farm-owned").length;
    const cities = document.querySelectorAll("#map .city-owned").length;
    const villages = document.querySelectorAll("#map .village-owned").length;
    const capitals = document.querySelectorAll("#map .capital-owned").length;
    const builtFarms = document.querySelectorAll("#map .building-farm").length;
    const markets = document.querySelectorAll("#map .building-market").length;

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

// ================================
// BYGGNADER
// ================================

function buildBuilding(cost, buildingClass, name, emoji) {
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

    if (gold < cost) {
        message.textContent = "Du behöver " + cost + " guld!";
        return;
    }

    gold -= cost;
    selectedTile.classList.add(buildingClass);
    selectedTile.textContent = emoji;

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

// ================================
// REKRYTERA SOLDATER
// ================================

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

// ================================
// AVSLUTA TUR
// ================================

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

// ================================
// UPPGRADERA BYAR OCH STÄDER
// ================================

const upgradeButton = document.getElementById("upgrade");

if (upgradeButton) {
    upgradeButton.addEventListener("click", () => {
        if (gameOver) return;

        if (!selectedTile || !selectedTile.classList.contains("player")) {
            message.textContent = "Välj ett territorium som du äger först!";
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

            message.textContent = "🏙️ Du uppgraderade byn till en stad!";
        } else if (selectedTile.classList.contains("city-owned")) {
            if (gold < 250) {
                message.textContent = "Du behöver 250 guld!";
                return;
            }

            gold -= 250;
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

// ================================
// UPPDATERA SIFFROR
// ================================

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

// ================================
// STARTA SPELET
// ================================

createMap();
updateStats();
