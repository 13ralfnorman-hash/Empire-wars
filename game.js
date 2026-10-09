let gold = 100;
let army = 10;
let territory = 1;

const map = document.getElementById("map");
const message = document.getElementById("message");
let selectedTile = null;

function createMap() {

    for (let i = 0; i < 100; i++) {

        const tile = document.createElement("button");

        tile.classList.add("tile");

        // Ditt territorium
        if (i === 12) {
            tile.classList.add("player");
            tile.textContent = "🏰";
        }

        // Fiendens territorier
        else if (i === 0 || i === 4 || i === 20 || i === 24) {
            tile.classList.add("enemy");
            tile.textContent = "⚔️";
        }
            
        
        // Städer
        else if ([2, 19, 45, 78, 92].includes(i)) {
            tile.classList.add("city");
            tile.textContent = "🏙️";
        }

        // Byar
        else if ([8, 26, 37, 56, 69, 85].includes(i)) {
            tile.classList.add("village");
            tile.textContent = "🏘️";
        }



        // Berg
else if (i === 6 || i === 18) {
    tile.classList.add("mountain");
    tile.textContent = "⛰️";
}

// Jordbruksmark
else if (i === 7 || i === 17) {
    tile.classList.add("farmland");
    tile.textContent = "🌾";
}

// Skog
else {
    tile.classList.add("neutral");
    tile.textContent = "🌲";
}

        
        tile.addEventListener("click", () => {
    selectedTile = tile;

    if (tile.classList.contains("player")) {
        message.textContent = "🏰 Du har valt ditt territorium!";
    } else {
        attack(tile);
    }
});

        map.appendChild(tile);
    }
}


function attack(tile) {
    if (tile.classList.contains("player")) {
        message.textContent = "Det där området är redan ditt 😭";
        return;
    }

    if (army < 3) {
        message.textContent = "Du behöver minst 3 soldater!";
        return;
    }

    const isMountain = tile.classList.contains("mountain");
    const isForest = tile.classList.contains("neutral");
    const isEnemy = tile.classList.contains("enemy");

    // Berg kräver fler soldater
    const cost = isMountain ? 5 : 3;

    if (army < cost) {
        message.textContent =
            "Du behöver minst " + cost + " soldater för att attackera här!";
        return;
    }

    army -= cost;

    // Berg och fiender är svårare att besegra
    let chance = 0.7;

    if (isMountain) chance = 0.4;
    if (isForest) chance = 0.65;
    if (isEnemy) chance = 0.35;

    if (Math.random() < chance) {
        const wasFarm = tile.classList.contains("farmland");
if (wasFarm) tile.classList.add("farm-owned");

        tile.classList.remove(
            "neutral", "mountain", "farmland", "enemy"
        );
        tile.classList.add("player");
        tile.textContent = "🏰";

        territory++;
        gold += wasFarm ? 35 : 20;

        message.textContent = wasFarm
            ? "🌾 Du erövrade jordbruksmark! Du fick 35 guld."
            : "🔥 Du erövrade ett nytt område!";
    } else {
        message.textContent = isMountain
            ? "⛰️ Berget var svårt att inta! Attacken misslyckades."
            : isEnemy
            ? "⚔️ Fienden försvarade sitt territorium!"
            : "💀 Attacken misslyckades!";
    }

    updateStats();
}


document.getElementById("recruit").addEventListener("click", () => {
    if (gold < 20) {
        message.textContent = "Du har inte tillräckligt med guld!";
        return;
    }

    gold -= 20;
    army += 5;
    message.textContent = "⚔️ Du rekryterade 5 soldater!";
    updateStats();
});

document.getElementById("endTurn").addEventListener("click", () => {
    const farms = document.querySelectorAll("#map .farm-owned").length;
    const income = territory * 5 + farms * 10;

    gold += income;
    message.textContent = "⏭️ Ny tur! Du fick " + income + " guld.";
    updateStats();
});

function updateStats() {
    document.getElementById("gold").textContent = gold;
    document.getElementById("army").textContent = army;
    document.getElementById("territory").textContent = territory;
}

createMap();


