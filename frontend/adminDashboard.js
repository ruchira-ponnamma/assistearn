async function loadAnalytics() {

    const res =
        await fetch(
            "https://knee-ribbon-battering.ngrok-free.dev/api/dashboard"
        );

    const data =
        await res.json();

    document.getElementById(
        "totalUsers"
    ).innerText =
        data.totalUsers;

         document.getElementById(
        "totalUsers"
    ).innerText =
        data.totalUsers;

        document.getElementById(
    "totalAttempts"
).innerText =
    data.totalAttempts || 0;

document.getElementById(
    "totalSuccess"
).innerText =
    data.totalSuccess || 0;

document.getElementById(
    "totalFailed"
).innerText =
    data.totalFailed || 0;

    document.getElementById(
    "totalRedeemed"
).innerText =
    data.totalRedeemed || 0;

document.getElementById(
    "totalTokens"
).innerText =
    data.totalTokens || 0;

}

loadAnalytics();