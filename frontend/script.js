
let quizTimer = null;
let quizTimeLeft = 15;

console.log("SCRIPT LOADED");
const dataEntryQuestions = [
    {
        q1: "What is your name?",
        q2: "How old are you?"
    },
    {
        q1: "What should we call you?",
        q2: "What year were you born?"
    },
    {
        q1: "Enter your name or nickname",
        q2: "Enter your age"
    },
    {
        q1: "What is your full name?",
        q2: "How many years old are you?"
    },
    {
        q1: "Tell us your name",
        q2: "Select your age group (e.g. 20, 30, 40...)"
    }
];

const surveyQuestions = [
    {
        question: "How was your experience using the app?",
        options: ["Excellent", "Good", "Average", "Poor"]
    },
    {
        question: "Was the app easy to use?",
        options: ["Very easy", "Easy", "Difficult"]
    },
    {
        question: "Would you recommend this app to others?",
        options: ["Yes", "Maybe", "No"]
    },
    {
        question: "How satisfied are you with the tasks?",
        options: ["Very satisfied", "Satisfied", "Not satisfied"]
    }
];

const verificationQuestions = [
    {
        question: "Select the correct spelling",
        options: ["Receive", "Recieve"],
        answer: "Receive"
    },
    {
        question: "Which word is correct?",
        options: ["Definately", "Definitely"],
        answer: "Definitely"
    },
    {
        question: "Choose the correct form",
        options: ["Seperate", "Separate"],
        answer: "Separate"
    },
    {
        question: "Which is spelled correctly?",
        options: ["Occured", "Occurred"],
        answer: "Occurred"
    }
];

const feedbackQuestions = [
    {
        q1: "What did you like about the app?",
        q2: "Rate the usability (1–5)"
    },
    {
        q1: "What feature did you find most useful?",
        q2: "How easy was the app to navigate?"
    },
    {
        q1: "What improvements would you suggest?",
        q2: "Rate your overall experience (1–5)"
    },
    {
        q1: "What did you enjoy the most?",
        q2: "How satisfied are you with the design?"
    }
];

const pollQuestions = [
    {
        question: "Do you like using this app?",
        options: ["Yes", "No"]
    },
    {
        question: "Would you use this app daily?",
        options: ["Definitely", "Maybe", "No"]
    },
    {
        question: "Is the app easy to use?",
        options: ["Very easy", "Okay", "Hard"]
    },
    {
        question: "Would you recommend this app?",
        options: ["Yes", "Not sure", "No"]
    }
];

const quizQuestions = [
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5"],
        answer: "4"
    },
    {
        question: "Capital of India?",
        options: ["Delhi", "Mumbai", "Chennai"],
        answer: "Delhi"
    },
    {
        question: "Which is a fruit?",
        options: ["Carrot", "Apple", "Potato"],
        answer: "Apple"
    },
    {
        question: "5 × 3 = ?",
        options: ["15", "10", "20"],
        answer: "15"
    }
];

const rewards = [2, 5, 8, 10, 12, 15];
let currentRotation = 0;

function getRandomQuiz() {
    return quizQuestions[
        Math.floor(Math.random() * quizQuestions.length)
    ];
}

function getRandomPoll() {
    return pollQuestions[
        Math.floor(Math.random() * pollQuestions.length)
    ];
}

function getRandomFeedback() {
    return feedbackQuestions[
        Math.floor(Math.random() * feedbackQuestions.length)
    ];
}

function getRandomVerification() {
    return verificationQuestions[
        Math.floor(Math.random() * verificationQuestions.length)
    ];
}

function getRandomSurvey() {
    return surveyQuestions[
        Math.floor(Math.random() * surveyQuestions.length)
    ];
}

function getUserWallet() {
    const user = localStorage.getItem("currentUser");

    
    if (!user) return null;

    let wallet = localStorage.getItem("wallet_" + user);

    if (!wallet) {
        // generate fake unique wallet
        const random = Math.random().toString(16).substring(2, 42);
        wallet = "0x" + random.padEnd(40, "0");

        localStorage.setItem("wallet_" + user, wallet);
    }

    return wallet;
}

function lockTaskUI() {

    // 🎯 disable controls
    const controls = document.querySelectorAll(
        "input, .taskBtn, #spinBtn"
    );

    controls.forEach(el => {

        el.disabled = true;

        el.style.opacity = "0.5";

        el.style.cursor = "not-allowed";
    });

    // 🎯 dim labels/questions
    const labels = document.querySelectorAll(
        "#task-container label, #task-container h3"
    );

    labels.forEach(el => {
        el.style.opacity = "0.5";
    });

    // 🔒 memory cards
    const memoryGrid =
        document.getElementById("memoryGrid");

    if (memoryGrid) {

        memoryGrid.style.pointerEvents = "none";

        memoryGrid.style.opacity = "0.5";
    }

    // 🚫 keep back button active
    const backBtn =
        document.querySelector("button[onclick='goBack()']");

    if (backBtn) {

        backBtn.disabled = false;

        backBtn.style.opacity = "1";

        backBtn.style.cursor = "pointer";
    }

    // ✅ update existing status text
    const status =
        document.getElementById("taskStatus");

    if (status) {

      status.innerHTML =
    `<div class="completed-text">
        ⛔ Already completed today
    </div>`;

        status.style.color = "#f87171";

        status.style.opacity = "1";
    }
}
// ================= AUTH =================
function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) return alert("Fill all fields");

    localStorage.setItem("user_" + username, JSON.stringify({ username, password }));
    alert("Registered successfully!");
}

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const stored = localStorage.getItem("user_" + username);
    if (!stored) return alert("User not found");

    const user = JSON.parse(stored);

    if (user.password !== password) return alert("Wrong password");

    localStorage.setItem("currentUser", username);
    localStorage.setItem("isAdmin", "false");

    // 🔥 ADD ROLE SYSTEM (NEW)
    if (username === "admin") {
        localStorage.setItem("role", "admin");
    } else {
        localStorage.setItem("role", "user");
    }

    // 🔥 EXISTING BACKEND CALL (KEEP SAME)
    try {
        await fetch("http://localhost:5000/api/create-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                walletAddress: getUserWallet(),
                username: username
            })
        });
    } catch (err) {
        console.error("User creation failed", err);
    }

    alert("✅ Login successful!");

    location.reload();
}

function adminLogin() {

    const username =
        document.getElementById("username").value;

    // optional password
    const password =
        document.getElementById("password").value;

    if (username === "admin") {

        // ✅ IMPORTANT
        localStorage.setItem(
            "isAdmin",
            "true"
        );

        localStorage.setItem(
            "currentUser",
            "admin"
        );

        alert("✅ Admin login successful");

        location.reload();

    } else {

        alert("❌ Invalid admin login");
    }
}

function openRewards() {
    window.location.href = "rewards.html";
}


function showAppUI() {
    const auth = document.getElementById("auth-section");
    const app = document.getElementById("app-section");

    if (auth && app) {
        auth.style.display = "none";
        app.style.display = "block";
    }

    const user = localStorage.getItem("currentUser");
    const welcome = document.getElementById("welcome");

    if (user && welcome) {
        welcome.innerText = `Hey ${user} 👋 Ready to earn today? 💰`;
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

function forgotPassword() {
    const username = prompt("Enter username");
    const stored = localStorage.getItem("user_" + username);

    if (!stored) return alert("User not found");

    alert("Password: " + JSON.parse(stored).password);
}

// ================= VOICE =================
let voiceEnabled = false;

function speak(text) {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();

    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 0.95;
    window.speechSynthesis.speak(msg);
}

// ================= COUNTDOWN =================
function getMidnight() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime();
}

function startCountdown(el) {
    function update() {
        const diff = getMidnight() - Date.now();

        if (diff <= 0) {
            el.innerText = "🎉 Tasks are now available!";
            return;
        }

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        el.innerText = `⏳ Next reset in ${h}h ${m}m ${s}s`;

        setTimeout(update, 1000);
    }

    update();
}

// ================= DATA =================

// ✅ THEN THIS
function getRandomDataEntry() {
    return dataEntryQuestions[
        Math.floor(Math.random() * dataEntryQuestions.length)
    ];
}

// ================= NAV =================
function goToTask(t) {
    window.location.href = "tasks.html?task=" + t;
}

function goBack() {
    window.location.href = "index.html";
}

function openWallet() {
    window.location.href = "wallet.html";
}

function openAdmin() {
    const role = localStorage.getItem("role");

    if (role !== "admin") {
        alert("Access denied 🚫");
        return;
    }

    window.location.href = "admin.html";
}

function isTaskDoneLocally(taskType) {
    const wallet = getUserWallet();
    const today = new Date().toDateString();
    return localStorage.getItem(`task_done_${wallet}_${taskType}_${today}`);
}
// ================= LOAD TASK PAGE =================
window.onload = async function () {
    applyAccessibilitySettings();

    // ♿ LOAD ACCESSIBILITY SETTINGS

const largeText = localStorage.getItem("largeText") === "true";
const highContrast = localStorage.getItem("highContrast") === "true";
const dyslexiaFont = localStorage.getItem("dyslexiaFont") === "true";
const savedVoice = localStorage.getItem("voiceEnabled") === "true";

voiceEnabled = savedVoice;

if (largeText) {
    document.body.classList.add("large-text");

    const el = document.getElementById("textToggle");
    if (el) el.checked = true;
}

if (highContrast) {
    document.body.classList.add("high-contrast");

    const el = document.getElementById("contrastToggle");
    if (el) el.checked = true;
}

if (dyslexiaFont) {
    document.body.classList.add("dyslexia-font");

    const el = document.getElementById("dyslexiaToggle");
    if (el) el.checked = true;
}

if (savedVoice) {
    const el = document.getElementById("voiceToggle");
    if (el) el.checked = true;
}

    const user = localStorage.getItem("currentUser");

    const userWallet = getUserWallet();

if (userWallet) {

    try { 

        const res = await fetch(
            `http://localhost:5000/api/user/${userWallet}`
        );

        const data = await res.json();

        const tokenDisplay =
            document.getElementById("topTokenDisplay");

        if (tokenDisplay) {

            tokenDisplay.innerText =
                `🪙 ${data.balance || 0} Tokens`;
        }

    } catch (err) {

        console.error(
            "Failed to load tokens",
            err
        );
    }
}

    const auth = document.getElementById("auth-section");
    const app = document.getElementById("app-section");

    if (auth && app) {
        if (user) {
            auth.style.display = "none";
            app.style.display = "block";
        } else {
            auth.style.display = "block";
            app.style.display = "none";
        }
    }

    // 🔥 ADD THIS HERE (RIGHT AFTER AUTH/UI LOGIC)
const role = localStorage.getItem("role");
const adminBtn = document.getElementById("adminBtn");

if (adminBtn && role !== "admin") {
    adminBtn.style.display = "none";
}
// ✅ SET WELCOME TEXT HERE
const welcome = document.getElementById("welcome");

if (user && welcome) {
    welcome.innerText = `Hey ${user} 👋 Ready to earn today? 💰`;
}
if (localStorage.getItem("isAdmin") === "true") {

    document
        .querySelectorAll(".admin-controls")
        .forEach(el => {

            el.style.display = "block";
        });
}
const analyticsBtn =
    document.getElementById("analyticsBtn");

if (
    analyticsBtn &&
    localStorage.getItem("isAdmin") === "true"
) {

    analyticsBtn.style.display = "inline-block";

    analyticsBtn.onclick = () => {

        window.location.href =
            "adminDashboard.html";
    };
}
[
    "data-entry",
    "survey",
    "feedback",
    "verification",
    "captcha"
].forEach(taskId => {

    const savedTitle =
        localStorage.getItem(
            `${taskId}_title`
        );

    const savedDesc =
        localStorage.getItem(
            `${taskId}_desc`
        );

    if (savedTitle) {

        const el =
            document.querySelector(
                `#${taskId}-card .task-title`
            );

        if (el)
            el.innerText = savedTitle;
    }

    if (savedDesc) {

        const el =
            document.getElementById(
                `${taskId}-desc`
            );

        if (el)
            el.innerText = savedDesc;
    }
});
[
    "data-entry-card",
    "survey-card",
    "feedback-card",
    "verification-card",
    "captcha-card"
].forEach(cardId => {

    const deleted =
        localStorage.getItem(
            `${cardId}_deleted`
        );

    if (deleted === "true") {

        const card =
            document.getElementById(cardId);

        if (card)
            card.style.display = "none";
    }
});

    const params = new URLSearchParams(window.location.search);
    const task = params.get("task");

    const container = document.getElementById("task-container");
    const title = document.getElementById("task-title");

    if (!task || !container) return;

    const wallet = getUserWallet();
    const today = new Date().toDateString();

    // ✅ SINGLE SOURCE OF TRUTH
    const isDone = localStorage.getItem(`task_done_${wallet}_${task}_${today}`);

    

    // ================= RENDER UI =================

  if (task === "data-entry") {
    title.innerText = "📝 Data Entry";

    const q = getRandomDataEntry();

    container.innerHTML = `
        <p>${q.q1}</p>
        <input id="name"><br><br>

        <p>${q.q2}</p>
        <input id="age"><br><br>

        <button class="taskBtn" onclick="submitDataEntry()">Submit</button>
   <h3 id="taskStatus"></h3>
        <p id="countdown"></p>

        <button onclick="goBack()">⬅ Back</button>
    `;

   if (canSpeakTask("data-entry")) {
    setTimeout(() => {
        speak(`${q.q1}. ${q.q2}`);
    }, 300);
}
}
    if (task === "survey") {
    title.innerText = "📊 Survey";

    const q = getRandomSurvey();

    container.innerHTML = `
        <p>${q.question}</p>

        ${q.options.map(opt => `
            <button class="taskBtn" onclick="submitSurvey()">${opt}</button>
        `).join("")}
   <h3 id="taskStatus"></h3>
        <p id="countdown"></p>
      
        <button onclick="goBack()">⬅ Back</button>
    `;
 if (canSpeakTask("survey")) {
    setTimeout(() => {
        speak(q.question);
    }, 300);
}
}

   if (task === "feedback") {
    title.innerText = "⭐ Feedback";

    const q = getRandomFeedback();

    container.innerHTML = `
        <p>${q.q1}</p>
        <input id="experience"><br><br>

        <p>${q.q2}</p>
        <input id="usability"><br><br>

        <button class="taskBtn" onclick="submitFeedback()">Submit</button>
   <h3 id="taskStatus"></h3>
        <p id="countdown"></p>
        
        <button onclick="goBack()">⬅ Back</button>
    `;
 if (canSpeakTask("feedback")) {
    setTimeout(() => {
        speak(`${q.q1}. ${q.q2}`);
    }, 300);
}
}

 if (task === "poll") {
    title.innerText = "📊 Poll";

    const q = getRandomPoll();

    container.innerHTML = `
        <p>${q.question}</p>

        ${q.options.map(opt => `
            <button class="taskBtn" onclick="submitPoll()">
                ${opt}
            </button>
        `).join("")}
   <h3 id="taskStatus"></h3>
        <p id="countdown"></p>
       
        <button onclick="goBack()">⬅ Back</button>
    `;
if (canSpeakTask("poll")) {
    setTimeout(() => {
        speak(q.question);
    }, 300);
}
}

if (task === "quiz") {
    title.innerText = "🧠 Quiz";

    const q = getRandomQuiz();

    container.innerHTML = `
        <p id="quizTimer">⏳ Time: 15s</p>

        <p>${q.question}</p>

        ${q.options.map(opt => `
            <button class="taskBtn" onclick="submitQuiz('${opt}', '${q.answer}')">
                ${opt}
            </button>
        `).join("")}
   <h3 id="taskStatus"></h3>
        <p id="countdown"></p>
        
        <button onclick="goBack()">⬅ Back</button>
    `;
 if (canSpeakTask("quiz")) {
    setTimeout(() => {
        speak(q.question);
    }, 300);
}

    startQuizTimer(); // 🔥 IMPORTANT
}

if (task === "captcha") {

    title.innerText = "🧩 CAPTCHA";

    container.innerHTML = `
        <div style="
            display:flex;
            align-items:center;
            justify-content:center;
            gap:10px;
            margin-bottom:15px;
        ">

            <canvas id="captchaCanvas" width="200" height="60"></canvas>

            <button onclick="generateCaptcha()"
                style="padding:8px 12px; font-size:18px;">
                🔄
            </button>

        </div>

        <input id="captchaInput" placeholder="Enter CAPTCHA"><br><br>

        <div style="
            display:flex;
            justify-content:center;
            gap:10px;
            flex-wrap:wrap;
        ">

            <button onclick="validateCaptcha()">
                Submit
            </button>

            <button onclick="playCaptchaAudio()">
                🔊 Hear CAPTCHA
            </button>

        </div>
   <h3 id="taskStatus"></h3>
        <p id="countdown"></p>

        <button onclick="goBack()" style="margin-top:15px;">
            ⬅ Back
        </button>
    `;

    generateCaptcha();

    // 🔊 Accessibility voice
    if (canSpeakTask("captcha")) {

        setTimeout(() => {
            speak("Enter the captcha shown on screen");
            playCaptchaAudio();
        }, 500);

    }
}

if (task === "verification") {
    title.innerText = "🔍 Content Verification";

    const q = getRandomVerification();

    container.innerHTML = `
        <p>${q.question}</p>

        ${q.options.map(opt => `
            <button class="taskBtn" onclick="submitVerification('${opt}', '${q.answer}')">
                ${opt}
            </button>
        `).join("")}
   <h3 id="taskStatus"></h3>
        <p id="countdown"></p>
       
        <button onclick="goBack()">⬅ Back</button>
    `;
if (canSpeakTask("verification")) {
    setTimeout(() => {
        speak(q.question);
    }, 300);
}
}

if (task === "streak") {

    title.innerText = "📅 Daily Login Streak";

    const today = new Date().toDateString();

    const wallet = getUserWallet();

    const claimed =
        localStorage.getItem(
            `task_done_${wallet}_streak_${today}`
        );

    // 🔥 UI
    container.innerHTML = `

       

        <p>Claim your daily reward</p>

        <button
            id="claimBtn"
            class="taskBtn"
            onclick="claimStreak()"
        >
            Claim Reward
        </button>

        <p id="countdown"></p>

        <button onclick="goBack()">
            ⬅ Back
        </button>
    `;

    // 🔒 already claimed today
    if (claimed === "true") {

        const btn =
            document.getElementById("claimBtn");

        if (btn) {

            btn.disabled = true;

            btn.innerText = "✔ Claimed Today";

            btn.style.background = "#22c55e";

            btn.style.cursor = "not-allowed";

            btn.style.opacity = "0.7";
        }
    }

    // 🔊 voice
    setTimeout(() => {

        speak(
            "Claim your daily login reward"
        );

    }, 300);
}
    if (task === "spin") {
        title.innerText = "🎡 Spin Wheel";

        container.innerHTML = `
            <div id="wheelWrapper" style="position:relative;width:300px;margin:auto;">
                <div id="wheel-pointer">🔻</div>
                <canvas id="wheel" width="300" height="300"></canvas>
            </div>

            <button id="spinBtn" onclick="spinWheel()">SPIN</button>

            <p id="result"></p>
            
            <p id="countdown"></p>
              

            <button onclick="goBack()">⬅ Back</button>
        `;
        setTimeout(() => {
    speak("Spin the wheel to win random reward tokens");
}, 300);

        setTimeout(drawWheel, 100);
    }

    if (task === "memory") {
    title.innerText = "🧩 Memory Game";

    container.innerHTML = `
        <div id="memoryGrid" style="
            display:grid;
            grid-template-columns: repeat(2, 100px);
            gap:15px;
            justify-content:center;
            margin-top:20px;
        "></div>
        <p id="timer">⏳ Time: 50s</p>
        <p id="result"></p>
           <h3 id="taskStatus"></h3>
        <p id="countdown"></p>

        <button onclick="goBack()">⬅ Back</button>
    `;
 if (canSpeakTask("memory")) {
    setTimeout(() => {
        speak("Match all the cards before the timer ends");
    }, 300);
}

   const user = localStorage.getItem("currentUser");
const wallet = getUserWallet();
const today = new Date().toDateString();

const completed =
    localStorage.getItem(
        `task_done_${wallet}_memory_${today}`
    );

initMemoryGame();

if (completed === "true") {

    clearInterval(memoryTimer);

    lockTaskUI();

} else {

    startMemoryTimer();
}
    
}

    // ================= GLOBAL LOCK AFTER RENDER =================
    if (isDone) {

        if (task === "spin") {

            const wheel = document.getElementById("wheelWrapper");
            if (wheel) wheel.style.opacity = "0.4";

            const btn = document.getElementById("spinBtn");
            if (btn) {
                btn.disabled = true;
               
                btn.style.cursor = "not-allowed";
            }

            const result = document.getElementById("result");
            if (result) result.innerHTML =
    `<div class="completed-text">
        ⛔ Already completed today
    </div>`;

            const cd = document.getElementById("countdown");
            if (cd) startCountdown(cd);

        } else {

    lockTaskUI();

    const cd = document.getElementById("countdown");
    if (cd) startCountdown(cd);
}
    }
};

let currentCaptcha = "";

function generateCaptcha() {

    // 🔥 ADD THIS AT THE VERY TOP
    const input = document.getElementById("captchaInput");
    if (input) input.value = "";

    // existing code continues
    const canvas = document.getElementById("captchaCanvas");
    const ctx = canvas.getContext("2d");

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    currentCaptcha = "";

    for (let i = 0; i < 5; i++) {
        currentCaptcha += chars[Math.floor(Math.random() * chars.length)];
    }

    // background
    ctx.fillStyle = "#f3f3f3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw text
    for (let i = 0; i < currentCaptcha.length; i++) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "#000";

        const x = 20 + i * 30;
        const y = 40;

        const angle = (Math.random() - 0.5) * 0.5;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(currentCaptcha[i], 0, 0);
        ctx.restore();
    }

    // noise lines
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = "#999";
        ctx.beginPath();
        ctx.moveTo(Math.random() * 200, Math.random() * 60);
        ctx.lineTo(Math.random() * 200, Math.random() * 60);
        ctx.stroke();
    }
}

async function validateCaptcha() {

    const userInput =
        document.getElementById("captchaInput")
        .value
        .trim()
        .toUpperCase();

    // Attempt
    await fetch(
        "http://localhost:5000/api/analytics",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                task: "captcha",
                type: "attempts"
            })
        }
    );

    if (userInput === currentCaptcha) {

        // Success
        await fetch(
            "http://localhost:5000/api/analytics",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    task: "captcha",
                    type: "success"
                })
            }
        );

        alert("✅ CAPTCHA Verified");

        completeTask("captcha", 3);

    } else {

        // Failed
        await fetch(
            "http://localhost:5000/api/analytics",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    task: "captcha",
                    type: "failed"
                })
            }
        );

        alert(
            "❌ Wrong CAPTCHA. Try again tomorrow."
        );

        const wallet =
            getUserWallet();

        const today =
            new Date().toDateString();

        localStorage.setItem(
            `task_done_${wallet}_captcha_${today}`,
            "true"
        );

        lockTaskUI();
    }
}
// ================= TASK ACTIONS =================
async function submitDataEntry(){

    const name = document.getElementById("name")?.value;
    const age = document.getElementById("age")?.value;

    if (!name || !age) {
        alert("Fill all fields");
        return;
    }

    // 🔒 lock AFTER validation
    lockTaskUI();
    await fetch("http://localhost:5000/api/analytics", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        task: "data-entry",
        type: "success"
    })
});

    completeTask("data-entry", 8);
}

async function submitSurvey() {

    lockTaskUI();
    await fetch("http://localhost:5000/api/analytics", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        task: "survey",
        type: "success"
    })
});

    completeTask("survey", 6);
}

async function submitFeedback() {

    lockTaskUI();

    const exp = document.getElementById("experience")?.value;
    const usability = document.getElementById("usability")?.value;

    if (!exp || !usability) {
        alert("Fill all fields");
        return;
    }
    await fetch("http://localhost:5000/api/analytics", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        task: "feedback",
        type: "success"
    })
});

    completeTask("feedback", 10);
}
async function submitPoll() {

    await fetch("http://localhost:5000/api/analytics", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            task: "poll",
            type: "success"
        })
    });

    completeTask("poll", 3);
}

// ================= WHEEL =================
function drawWheel() {
    const canvas = document.getElementById("wheel");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const center = 150;
    const radius = 140;
    const arc = (2 * Math.PI) / rewards.length;

    ctx.clearRect(0, 0, 300, 300);

    for (let i = 0; i < rewards.length; i++) {

        // ✅ start from TOP
        const start = arc * i - Math.PI / 2;
        const end = arc * (i + 1) - Math.PI / 2;

        ctx.beginPath();
        ctx.fillStyle = i % 2 ? "#22c55e" : "#38bdf8";

        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, start, end);
        ctx.fill();

        // ✅ BIGGER + CENTERED TEXT
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(start + arc / 2);

        ctx.fillStyle = "#000";
        ctx.font = "bold 22px Arial";   // 👈 increased size
        ctx.textAlign = "center";
        ctx.fillText(rewards[i], 100, 10);

        ctx.restore();
    }
}
// ================= SPIN =================
function spinWheel() {

    const btn = document.getElementById("spinBtn");

    // 🚫 HARD BLOCK
    if (!btn || btn.disabled) return;

    // 🔒 disable immediately
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.style.cursor = "not-allowed";

    const canvas = document.getElementById("wheel");
    if (!canvas) return;

    const spin = Math.floor(Math.random() * 360) + 1440;
    currentRotation += spin;

    canvas.style.transition = "transform 4s ease-out";
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {

        const slice = 360 / rewards.length;
        const normalized = currentRotation % 360;
        const pointerAngle = (360 - normalized) % 360;

        const index = Math.floor(pointerAngle / slice);
        const reward = rewards[index];

        document.getElementById("result").innerText =
            `🎉 You got ${reward} tokens`;

        speak(`You won ${reward} tokens`);

        // 🎊 confetti
        if (window.confetti) {
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 }
            });
        }

        // ✅ IMPORTANT: SAVE USING WALLET (NOT USER)
        const wallet = getUserWallet();
        const today = new Date().toDateString();
        localStorage.setItem(`task_done_${wallet}_spin_${today}`, "true");

        // ✅ DIM WHEEL IMMEDIATELY
        const wheel = document.getElementById("wheelWrapper");
        if (wheel) wheel.style.opacity = "0.4";

        // ⏳ start countdown immediately
        const cd = document.getElementById("countdown");
        if (cd) startCountdown(cd);

        fetch("http://localhost:5000/api/analytics", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        task: "spin",
        type: "success"
    })
});

        // 🔗 backend call
        completeTask("spin", reward);

    }, 4000);
}
function celebrateReward() {

    if (window.confetti) {

        confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
        });
    }
}
// ================= BLOCKCHAIN =================
async function completeTask(taskType, tokens) {

    const user = localStorage.getItem("currentUser");
    if (!user) return;

    const wallet = getUserWallet();
    const today = new Date().toDateString();

    console.log("USER WALLET:", wallet);

    

    // ⏳ start countdown immediately
    const cd = document.getElementById("countdown");
    if (cd) startCountdown(cd);

    // 🔗 show loading state
    const tx = document.getElementById("txHash");
    if (tx) tx.innerText = "⏳ Processing transaction...";

    try {

        // 🔥 STEP 1: VALIDATE (FIREBASE DAILY LIMIT)
        const validateRes = await fetch("http://localhost:5000/api/validate-task", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            walletAddress: wallet,
            username: localStorage.getItem("currentUser"),
            taskType,
            tokens
            })
        });

        const validateData = await validateRes.json();

        if (!validateRes.ok) {
            alert(validateData.error);
            return;
        }
        

        // 🔥 STEP 2: RECORD REWARD (BLOCKCHAIN)
        const rewardRes = await fetch("http://localhost:5000/api/record-reward", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
           walletAddress: wallet,
           username: localStorage.getItem("currentUser"),
           taskType,
           tokens
            })
        });

        const rewardData = await rewardRes.json();

        if (!rewardRes.ok) {
            alert("Reward failed");
            return;
        }

        // 🔗 STEP 3: SHOW TX HASH
        if (tx && rewardData.txHash) {
            tx.innerHTML = `
                <a target="_blank" href="https://amoy.polygonscan.com/tx/${rewardData.txHash}">
                    🔗 View Transaction on PolygonScan
                </a>
            `;
        } else if (tx) {
            tx.innerText = "⚠️ Transaction failed";
        }

        

        // ✅ success message
        alert(`✅ Earned ${tokens} tokens`);
        celebrateReward();
        speak(`You earned ${tokens} tokens`);

        localStorage.setItem(
    `task_done_${wallet}_${taskType}_${today}`,
    "true"
);
        lockTaskUI();

    } catch (err) {
        console.error(err);
        alert("Something went wrong");
    }
}

// ================= QUIZ =================
async function submitQuiz(selected, correct) {

    if (quizTimer) clearInterval(quizTimer);

    // attempt
    await fetch("http://localhost:5000/api/analytics", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            task: "quiz",
            type: "attempts"
        })
    });

    if (selected === correct) {

        await fetch("http://localhost:5000/api/analytics", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                task: "quiz",
                type: "success"
            })
        });

        completeTask("quiz", 5);

    } else {

        await fetch("http://localhost:5000/api/analytics", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                task: "quiz",
                type: "failed"
            })
        });

        alert("Wrong answer");
        lockTaskUI();
    }
}
//==============CONTENT VERIFICATION=========
async function submitVerification(selected, correct) {

    fetch("http://localhost:5000/api/analytics", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        task: "verification",
        type: "attempts"
    })
});

    // ✅ correct answer
    if (selected === correct) {

        alert("✅ Correct Answer!");
        speak("Correct answer");
await fetch("http://localhost:5000/api/analytics", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        task: "verification",
        type: "success"
    })
});
        completeTask("verification", 12);

    } else {
        await fetch("http://localhost:5000/api/analytics", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        task: "verification",
        type: "failed"
    })
});

        alert("❌ Wrong answer. Try again tomorrow.");
        speak("Wrong answer. Try again tomorrow");

        // 🔒 lock task for today
        lockTaskUI();

        // optional local storage lock
        const wallet = getUserWallet();
        const today = new Date().toDateString();

        localStorage.setItem(
            `task_done_${wallet}_verification_${today}`,
            "true"
        );
    }
}

//=============DAILY STREAK==============
async function claimStreak() {

    const today =
        new Date().toDateString();

    const wallet =
        getUserWallet();

    const alreadyClaimed =
        localStorage.getItem(
            `task_done_${wallet}_streak_${today}`
        );

    // ❌ already claimed
    if (alreadyClaimed === "true") {

        alert("Already claimed today");

        return;
    }

    // ✅ save daily claim
    localStorage.setItem(
        `task_done_${wallet}_streak_${today}`,
        "true"
    );

    

await fetch("http://localhost:5000/api/analytics", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        task: "streak",
        type: "success"
    })
});

    // ✅ reward
    completeTask("streak", 2);

    // 🔒 lock button instantly
    const btn =
        document.getElementById("claimBtn");

    if (btn) {

        btn.disabled = true;

        btn.innerText = "✔ Claimed Today";

        btn.style.background = "#22c55e";

        btn.style.cursor = "not-allowed";

        btn.style.opacity = "0.7";
    }
}


async function isTaskCompletedToday(taskType) {
    const user = getUserWallet();

    const res = await fetch("http://localhost:5000/api/user-rewards/" + user);
    const data = await res.json();

    const today = new Date().toDateString();

    return data.some(r =>
        r.taskType === taskType &&
        new Date(r.timestamp).toDateString() === today
    );
}
let firstCard = null;
let lockBoard = false;
let matches = 0;

let memoryTimer;
let timeLeft = 30;

async function initMemoryGame() {

    try {

        await fetch("http://localhost:5000/api/analytics", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                task: "memory",
                type: "attempts"
            })
        });

    } catch (err) {

        console.log("Analytics unavailable");

    }

    // 🎯 symbol pool
    const allSymbols = ["🍎","🍌","🍇","🍊","🍓","🥝","🍉","🍍"];

    // 🎯 choose random difficulty (pairs)
    const pairCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 pairs

    const selected = allSymbols
        .sort(() => 0.5 - Math.random())
        .slice(0, pairCount);

    const cards = [...selected, ...selected]; // duplicate

    // shuffle
    cards.sort(() => 0.5 - Math.random());

    const grid = document.getElementById("memoryGrid");
    console.log("Memory Grid Found:", grid);
alert("Memory Game Started");
    grid.innerHTML = "";

    // 🎯 dynamic grid layout
    const cols = Math.ceil(Math.sqrt(cards.length));
    grid.style.gridTemplateColumns = `repeat(${cols}, 80px)`;

    // reset
    firstCard = null;
    matches = 0;
    lockBoard = false;

    cards.forEach(symbol => {
        const card = document.createElement("div");

        card.innerText = "❓";
        card.dataset.value = symbol;

        card.style.width = "80px";
        card.style.height = "80px";
        card.style.display = "flex";
        card.style.alignItems = "center";
        card.style.justifyContent = "center";
        card.style.fontSize = "26px";
        card.style.background = "#e2e8f0";
        card.style.cursor = "pointer";
        card.style.borderRadius = "12px";
        card.style.transition = "0.3s";

        card.onclick = () => flipCard(card);

        grid.appendChild(card);
    });
    startMemoryTimer();
}

function startMemoryTimer() {
    clearInterval(memoryTimer);
    timeLeft = 50;

    const timerEl = document.getElementById("timer");

    memoryTimer = setInterval(() => {
        timeLeft--;

        if (timerEl) {
            timerEl.innerText = `⏳ Time: ${timeLeft}s`;
        }

        if (timeLeft <= 0) {
            clearInterval(memoryTimer);

            document.getElementById("result").innerText =
                "⛔ Time's up! Try again tomorrow.";

                const wallet = getUserWallet();
    const today = new Date().toDateString();

    localStorage.setItem(
        `task_done_${wallet}_memory_${today}`,
        "true"
    );
fetch("http://localhost:5000/api/analytics", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        task: "memory",
        type: "failed"
    })
});
            lockTaskUI(); // 🔒 lock task
        }

    }, 1000);
}
function flipCard(card) {

    if (lockBoard || card.innerText !== "❓") return;

    card.innerText = card.dataset.value;

    if (!firstCard) {
        firstCard = card;
        return;
    }

    // second click
    if (firstCard.dataset.value === card.dataset.value) {

        matches++;
        firstCard = null;

       if (matches === document.querySelectorAll("#memoryGrid div").length / 2) {

    clearInterval(memoryTimer);  // ✅ ADD THIS LINE HERE

    document.getElementById("result").innerText =
        "🎉 You matched all cards!";
 fetch("http://localhost:5000/api/analytics", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        task: "memory",
        type: "success"
    })
});
    completeTask("memory", 8);
}

    } else {
        lockBoard = true;

        setTimeout(() => {
            card.innerText = "❓";
            firstCard.innerText = "❓";
            firstCard = null;
            lockBoard = false;
        }, 800);
    }
}
function startQuizTimer() {

    // reset
    if (quizTimer) clearInterval(quizTimer);

    quizTimeLeft = 15;

    const el = document.getElementById("quizTimer");

    quizTimer = setInterval(() => {
        quizTimeLeft--;

        if (el) {
            el.innerText = `⏳ Time: ${quizTimeLeft}s`;
        }

        if (quizTimeLeft <= 0) {
            clearInterval(quizTimer);

            alert("⛔ Time's up!");

            const wallet = getUserWallet();
const today = new Date().toDateString();

localStorage.setItem(
    `task_done_${wallet}_quiz_${today}`,
    "true"
);

            lockTaskUI(); // 🔒 block for today
        }

    }, 1000);
}

/* ♿ PANEL */
function toggleAccessibilityPanel() {
    const panel = document.getElementById("accessibilityPanel");

    panel.style.display =
        panel.style.display === "none" ? "block" : "none";
}

/* 🔊 VOICE */
function toggleVoice(el) {

    voiceEnabled = el.checked;

    localStorage.setItem("voiceEnabled", el.checked);

    if (voiceEnabled) {
        speak("Voice assistance enabled");
    } else {
        window.speechSynthesis.cancel();
    }
}

function speak(text) {
    if (!voiceEnabled) return;

    window.speechSynthesis.cancel();

    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 0.9;

    window.speechSynthesis.speak(msg);
}

/* 🌗 CONTRAST */
function toggleContrast(el) {

    document.body.classList.toggle("high-contrast", el.checked);

    localStorage.setItem("highContrast", el.checked);
}
/* 🔤 DYSLEXIA FONT */
function toggleDyslexia(el) {

    document.body.classList.toggle("dyslexia-font", el.checked);

    localStorage.setItem("dyslexiaFont", el.checked);
}
/* 🔎 LARGE TEXT */
function toggleLargeText(el) {

    document.body.classList.toggle("large-text", el.checked);

    localStorage.setItem("largeText", el.checked);
}
function autoReadPage() {

    if (!voiceEnabled) return;

    const container = document.getElementById("task-container");

    if (!container) return;

    const paragraphs = container.querySelectorAll("p");

    let text = "";

    paragraphs.forEach(p => {
        text += p.innerText + ". ";
    });

    speak(text);
}
function canSpeakTask(task) {

    const wallet = getUserWallet();
    const today = new Date().toDateString();

    return !localStorage.getItem(
        `task_done_${wallet}_${task}_${today}`
    );
}
function playCaptchaAudio() {

    if (!currentCaptcha) return;

    const spaced = currentCaptcha.split("").join(" ");

    speak(`Captcha is ${spaced}`);
}

function editTask(event, taskId) {

    event.stopPropagation();

    // title element
    const titleEl =
        document.querySelector(
            `#${taskId}-card .task-title`
        );

    // description element
    const descEl =
        document.getElementById(
            `${taskId}-desc`
        );

    // current values
    const currentTitle =
        titleEl.innerText;

    const currentDesc =
        descEl.innerText;

    // prompts
    const newTitle =
        prompt(
            "Edit task title:",
            currentTitle
        );

    const newDesc =
        prompt(
            "Edit description:",
            currentDesc
        );

    if (!newTitle || !newDesc) return;

    // update UI
    titleEl.innerText = newTitle;

    descEl.innerText = newDesc;

    // save
    localStorage.setItem(
        `${taskId}_title`,
        newTitle
    );

    localStorage.setItem(
        `${taskId}_desc`,
        newDesc
    );

    alert("✅ Task updated");
}

function deleteTask(event, cardId) {

    event.stopPropagation();

    const confirmDelete =
        confirm("Delete this task?");

    if (!confirmDelete) return;

    const card =
        document.getElementById(cardId);

    card.style.display = "none";

    localStorage.setItem(
        `${cardId}_deleted`,
        "true"
    );
}
function applyAccessibilitySettings() {

    // 🔠 Large Text
    const largeText =
        localStorage.getItem("largeText") === "true";

    if (largeText) {

        document.body.classList.add(
            "large-text"
        );
    }

    // 🌗 High Contrast
    const highContrast =
        localStorage.getItem("highContrast") === "true";

    if (highContrast) {

        document.body.classList.add(
            "high-contrast"
        );
    }

    // 📘 Dyslexia Font
    const dyslexia =
        localStorage.getItem("dyslexiaFont") === "true";

    if (dyslexia) {

        document.body.classList.add(
            "dyslexia-font"
        );
    }
}