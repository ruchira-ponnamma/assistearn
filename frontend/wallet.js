console.log("WALLET JS VERSION TEST");
// ================= GET USER WALLET =================
function getUserWallet() {
    const user = localStorage.getItem("currentUser");
    if (!user) return null;

    let wallet = localStorage.getItem("wallet_" + user);

    if (!wallet) {
        const random = Math.random().toString(16).substring(2, 42);
        wallet = "0x" + random.padEnd(40, "0");
        localStorage.setItem("wallet_" + user, wallet);
    }

    return wallet;
}

// ================= NAV =================
function goBack() {
    window.location.href = "index.html";
}

// ================= LOAD WALLET =================
async function loadWallet() {

    const walletAddress = getUserWallet();

    // 🔒 Not logged in
    if (!walletAddress) {
        document.getElementById("balance").innerText = "Please login first";
        return;
    }

    try {
        console.log("Loading wallet for:", walletAddress);

        // ================= BALANCE =================
  const url = `https://knee-ribbon-battering.ngrok-free.dev/api/user/${walletAddress}`;

console.log("FETCHING URL:", url);

const res = await fetch(url, {
    headers: {
        "ngrok-skip-browser-warning": "true"
    }
});

console.log("FETCH SUCCESS", res);

let userData = null;
try {
    userData = await res.json();
    console.log("USER DATA", userData);
} catch {
    userData = null;
}
const balance = userData && userData.balance ? userData.balance : 0;

document.getElementById("balance").innerText =
    `Total Tokens: ${balance}`;

        // ================= HISTORY =================
const rewardsRes = await fetch(
    `https://knee-ribbon-battering.ngrok-free.dev/api/user-rewards/${walletAddress}`,
    {
        headers: {
            "ngrok-skip-browser-warning": "true"
        }
    }
);

let rewards = [];
try {
    rewards = await rewardsRes.json();
} catch {
    rewards = [];
}

        const list = document.getElementById("history");
        list.innerHTML = "";

        // 🧾 No history
        if (!rewards || rewards.length === 0) {
            list.innerHTML = "<li>No transactions yet</li>";
            return;
        }

        // 🧾 Show history
       rewards.forEach(r => {
    const li = document.createElement("li");

    // ✅ convert timestamp → readable date
    const date = new Date(r.timestamp);

    const formattedDate = date.toLocaleString(); 
    // example: "5/1/2026, 3:45:12 PM"

    li.innerHTML = `
        <b>${r.taskType}</b> → +${r.tokens} tokens
        <br>
        🕒 ${formattedDate}
        <br>
        <a href="https://amoy.polygonscan.com/tx/${r.txHash}" target="_blank">
            🔗 View Blockchain Transaction
        </a>
    `;

    list.appendChild(li);
});

    } catch (err) {
        console.error("Wallet Load Error:", err);

        // ❌ Don't show annoying alert anymore
        document.getElementById("balance").innerText = "Unable to load wallet";
    }
}
function applyAccessibilitySettings() {

    const highContrast =
        localStorage.getItem("highContrast") === "true";

    if (highContrast) {
        document.body.classList.add("high-contrast");
    }

    const dyslexia =
        localStorage.getItem("dyslexiaFont") === "true";

    if (dyslexia) {
        document.body.classList.add("dyslexia-font");
    }
}

// ================= AUTO LOAD =================
window.onload = () => {
    applyAccessibilitySettings();
    loadWallet();
};
console.log("ACCESSIBILITY FUNCTION LOADED");