let gold = 100;
let army = 10;
let territory = 1;

const map = document.getElementById("map");
const message = document.getElementById("message");

function createMap() {

    for (let i = 0; i < 25; i++) {

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

        // Neutrala territorier
        else {
            tile.classList.add("neutral");
            tile.textContent = "🌲";
        }

        tile.addEventListener("click", () => attack(tile));

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

    army -= 3;

    const success = Math.random() > 0.3;

    if (success) {

        tile.classList.remove("neutral");
        tile.classList.add("player");

        tile.textContent = "🏰";

        territory++;

        gold += 20;

        message.textContent = "🔥 Du erövrade ett nytt område!";

    } else {

        message.textContent = "💀 Attacken misslyckades!";
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

    gold += territory * 5;

    message.textContent =
        "⏭️ Ny tur! Du fick " + (territory * 5) + " guld.";

    updateStats();
});

function updateStats() {

    document.getElementById("gold").textContent = gold;

    document.getElementById("army").textContent = army;

    document.getElementById("territory").textContent = territory;
}

createMap();
