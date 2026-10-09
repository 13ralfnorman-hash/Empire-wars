
let gold = 100;
let army = 10;
let territory = 1;
let selectedTile = null;

const map = document.getElementById("map");
const message = document.getElementById("message");

// Skapa kartan med 100 territorier
function createMap() {
    map.innerHTML = "";

    for (let i = 0; i < 100; i++) {
        const tile = document.createElement("button");
        tile.classList.add("tile");

        if (i === 55) {
            tile.classList.add("player");
            tile.textContent = "🏰";
        } else if ([0, 4, 20, 24].includes(i)) {
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
            if (tile.classList.contains("player")) {
                selectedTile = tile;
                message.textContent =
                    "🏰 Du har valt ditt territorium!";
            } else {
                attack(tile);
            }
        });

        map.appendChild(tile);
    }
}

// Attackera och erövra territorier
function attack(tile) {
    if (tile.classList.contains("player")) {
        message.textContent = "Det där området är redan ditt!";
        return;
    }

    const isMountain = tile.classList.contains("mountain");
    const isForest = tile.classList.contains("neutral");
    const isEnemy = tile.classList.contains("enemy");
    const wasFarm = tile.classList.contains("farmland");
    const wasCity = tile.classList.contains("city");
    const wasVillage = tile.classList.contains("village");

    const cost = isMountain ? 5 : 3;

    if (army < cost) {
        message.textContent =
            "Du behöver minst " + cost + " soldater!";
        return;
    }

    army -= cost;

    let chance = 0.7;

    if (isMountain) chance = 0.4;
    if (isForest) chance = 0.65;
    if (isEnemy) chance = 0.35;

    if (Math.random() < chance) {
        // Spara vilken typ av territorium du erövrade
        if (wasFarm) tile.classList.add("farm-owned");
        if (wasCity) tile.classList.add("city-owned");
        if (wasVillage) tile.classList.add("village-owned");

        tile.classList.remove(
            "neutral",
            "mountain",
            "farmland",
            "enemy",
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
        } else if (isMountain) {
            tile.textContent = "⛰️";
        } else {
            tile.textContent = "🏰";
        }

        territory++;
        gold += wasFarm ? 35 : 20;

        message.textContent = wasCity
            ? "🏙️ Du erövrade en stad!"
            : wasVillage
            ? "🏘️ Du erövrade en by!"
            : wasFarm
            ? "🌾 Du erövrade jordbruksmark och fick 35 guld!"
            : isMountain
            ? "⛰️ Du erövrade ett berg!"
            : "🔥 Du erövrade ett nytt territorium!";

    } else {
        message.textContent = isMountain
            ? "⛰️ Berget var svårt att inta!"
            : isEnemy
            ? "⚔️ Fienden försvarade sitt territorium!"
            : "💀 Attacken misslyckades!";
    }

    updateStats();
}


 // Fiendernas tur
function enemyTurn() {
    const tiles = Array.from(map.children);
    const enemies = tiles.filter(tile =>
        tile.classList.contains("enemy")
    );

    let captured = 0;

    enemies.forEach(enemyTile => {
        const index = tiles.indexOf(enemyTile);
        const neighbors = [];

        // Hitta rutorna ovanför och nedanför
        if (index >= 10) neighbors.push(tiles[index - 10]);
        if (index < 90) neighbors.push(tiles[index + 10]);

        // Hitta rutorna till vänster och höger
        if (index % 10 !== 0) neighbors.push(tiles[index - 1]);
        if (index % 10 !== 9) neighbors.push(tiles[index + 1]);

        // Välj de angränsande rutor som du äger
        const targets = neighbors.filter(tile =>
            tile.classList.contains("player")
        );

        // Fienden har 45 % chans att lyckas med en attack
        if (targets.length > 0 && Math.random() < 0.45) {
            const target =
                targets[Math.floor(Math.random() * targets.length)];

            target.classList.remove(
                "player",
                "farm-owned",
                "city-owned",
                "village-owned",
                "capital-owned"
            );

            target.classList.add("enemy");
            target.textContent = "⚔️";

            territory--;

            if (selectedTile === target) {
                selectedTile = null;
            }

            captured++;
        }
    });

    updateStats();

    if (captured > 0) {
        return "⚔️ Fienden erövrade " + captured + " av dina territorier!";
    }

    return "";
}


// Rekrytera soldater
const recruitButton = document.getElementById("recruit");

if (recruitButton) {
    recruitButton.addEventListener("click", () => {
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

// Avsluta tur och samla in inkomster
const endTurnButton = document.getElementById("endTurn");

if (endTurnButton) {
    endTurnButton.addEventListener("click", () => {
        const farms =
            document.querySelectorAll("#map .farm-owned").length;
        const cities =
            document.querySelectorAll("#map .city-owned").length;
        const villages =
            document.querySelectorAll("#map .village-owned").length;
        const capitals =
            document.querySelectorAll("#map .capital-owned").length;

        const income =
            territory * 5 +
            farms * 10 +
            cities * 15 +
            villages * 7 +
            capitals * 40;

        gold += income;

        message.textContent =
            "💰 Du fick " + income + " guld denna tur!";

        updateStats();
    });
}

// Uppgradera byar till städer och städer till huvudstäder
const upgradeButton = document.getElementById("upgrade");

if (upgradeButton) {
    upgradeButton.addEventListener("click", () => {
        if (
            !selectedTile ||
            !selectedTile.classList.contains("player")
        ) {
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

            message.textContent =
                "🏙️ Du uppgraderade byn till en stad!";

        } else if (
            selectedTile.classList.contains("city-owned")
        ) {
            if (gold < 250) {
                message.textContent = "Du behöver 250 guld!";
                return;
            }

            gold -= 250;
            selectedTile.classList.remove("city-owned");
            selectedTile.classList.add("capital-owned");
            selectedTile.textContent = "👑";

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

// Uppdatera siffrorna i gränssnittet
function updateStats() {
    document.getElementById("gold").textContent = gold;
    document.getElementById("army").textContent = army;
    document.getElementById("territory").textContent = territory;
}

// Starta spelet
createMap();
updateStats();



