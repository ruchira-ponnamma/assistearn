async function loadTaskBreakdown() {

    const res =
        await fetch(
            "http://localhost:5000/api/task-breakdown"
        );

    const data =
        await res.json();

    document.getElementById("quizStats").innerHTML = `
        <h3>🧠 Quiz</h3>
        Attempts: ${data.quiz?.attempts || 0}<br>
        Success: ${data.quiz?.success || 0}<br>
        Failed: ${data.quiz?.failed || 0}
    `;

    document.getElementById("verificationStats").innerHTML = `
    <h3>🔍 Content Verification</h3>
    Attempts: ${data.verification?.attempts || 0}<br>
    Success: ${data.verification?.success || 0}<br>
    Failed: ${data.verification?.failed || 0}
`;

    document.getElementById("memoryStats").innerHTML = `
    <h3>🧩 Memory Game</h3>
    Attempts: ${data.memory?.attempts || 0}<br>
    Success: ${data.memory?.success || 0}<br>
    Failed: ${data.memory?.failed || 0}
`;

document.getElementById("captchaStats").innerHTML = `
    <h3>🧩 CAPTCHA</h3>
    Attempts: ${data.captcha?.attempts || 0}<br>
    Success: ${data.captcha?.success || 0}<br>
    Failed: ${data.captcha?.failed || 0}
`;

document.getElementById("streakStats").innerHTML = `
    <h3>📅 Daily Streak</h3>
    Completed: ${data.streak?.success || 0}
`;
document.getElementById("dataEntryStats").innerHTML = `
    <h3>📝 Data Entry</h3>
    Completed: ${data["data-entry"]?.success || 0}
`;

document.getElementById("surveyStats").innerHTML = `
    <h3>📊 Survey</h3>
    Completed: ${data.survey?.success || 0}
`;

document.getElementById("feedbackStats").innerHTML = `
    <h3>⭐ Feedback</h3>
    Completed: ${data.feedback?.success || 0}
`;

document.getElementById("wheelStats").innerHTML = `
    <h3>🎡 Spin Wheel</h3>
    Completed: ${data.spin?.success || 0}
`;
document.getElementById("pollStats").innerHTML = `
    <h3>📊 Poll</h3>
    Completed: ${data.poll?.success || 0}
`;
}

loadTaskBreakdown();