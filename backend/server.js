const express = require("express");
require("dotenv").config();


const cors = require("cors");
const admin = require("firebase-admin");
const { ethers } = require("ethers");

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------- FIREBASE ---------------- */
const serviceAccount = require("/etc/secrets/firebase-adminsdk.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://assistearn-bbac8-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

/* ---------------- BLOCKCHAIN SETUP ---------------- */
const provider = new ethers.JsonRpcProvider(
  "https://rpc-amoy.polygon.technology"
);

// ⚠️ FIXED: must start with 0x
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const CONTRACT_ABI = [
  "function recordReward(address user,string taskType,uint256 tokens) public",
  "event RewardRecorded(address indexed user,string taskType,uint256 tokens,uint256 timestamp)"
];

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  wallet
);

/* ---------------- ROOT ---------------- */
app.get("/", (req, res) => {
  res.send("AssistEarn Backend Running 🚀");
});

/* ---------------- VALIDATE TASK ---------------- */
app.post("/api/validate-task", async (req, res) => {
  try {
    let { walletAddress, taskType } = req.body;

    if (!walletAddress || !taskType) {
      return res.status(400).json({ error: "Missing data" });
    }

    walletAddress = walletAddress.toLowerCase().trim();
    const today = new Date().toDateString();

    const taskRef = db.ref(`tasks/${walletAddress}/${taskType}`);
    const snapshot = await taskRef.once("value");

    if (snapshot.exists() && snapshot.val().date === today) {
      return res.status(400).json({ error: "Task already completed today" });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- RECORD REWARD ---------------- */
app.post("/api/record-reward", async (req, res) => {
  try {
    let { walletAddress, tokens, taskType, username } = req.body;

    if (!walletAddress || !taskType) {
      return res.status(400).json({ error: "Missing data" });
    }

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    walletAddress = walletAddress.toLowerCase().trim();
    tokens = Number(tokens || 0);

    if (tokens <= 0) {
      return res.status(400).json({ error: "Invalid tokens" });
    }

    const today = new Date().toDateString();

    console.log("🚀 Sending blockchain transaction...");

    const tx = await contract.recordReward(
      walletAddress,
      taskType,
      tokens
    );

    console.log("TX HASH:", tx.hash);

    await tx.wait();

    const explorerUrl = `https://amoy.polygonscan.com/tx/${tx.hash}`;

    /* SAVE TASK COMPLETION */
    await db.ref(`tasks/${walletAddress}/${taskType}`).set({
      date: today,
      timestamp: Date.now()
    });

    /* SAVE REWARD */
    const rewardRef = db.ref("rewards").push();

    await rewardRef.set({
      walletAddress,
      username: username || "User",
      tokens,
      taskType,
      txHash: tx.hash,
      explorerUrl,
      timestamp: Date.now()
    });

    /* UPDATE USER */
    const userRef = db.ref(`users/${walletAddress}`);
    const snapshot = await userRef.once("value");

    const existing = snapshot.val() || {};
    const currentBalance = Number(existing.balance || 0);
    const newBalance = currentBalance + tokens;

    await userRef.update({
    balance: newBalance,
    username: username || existing.username || "User"
  });
    res.json({
      success: true,
      txHash: tx.hash,
      explorerUrl,
      balance: newBalance
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- GET USER ---------------- */
app.get("/api/user/:wallet", async (req, res) => {
  try {
    const wallet = req.params.wallet.toLowerCase().trim();

    const ref = db.ref(`users/${wallet}`);
    const snapshot = await ref.once("value");

    const data = snapshot.val();

    if (!data) {
      return res.json({ balance: 0, username: "User" });
    }

    res.json({
      balance: data.balance || 0,
      username: data.username || "User"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- REWARD HISTORY ---------------- */
app.get("/api/user-rewards/:wallet", async (req, res) => {
  try {
    const wallet = req.params.wallet.toLowerCase().trim();

    const ref = db.ref("rewards");
    const snapshot = await ref.once("value");

    const data = snapshot.val() || {};

    const result = Object.values(data)
      .filter((r) => r.walletAddress === wallet)
      .sort((a, b) => b.timestamp - a.timestamp);

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- CREATE USER ---------------- */
app.post("/api/create-user", async (req, res) => {
  try {
    let { walletAddress, username } = req.body;

    if (!walletAddress || !username) {
      return res.status(400).json({ error: "Missing data" });
    }

    walletAddress = walletAddress.toLowerCase().trim();

    const userRef = db.ref(`users/${walletAddress}`);
    const snapshot = await userRef.once("value");

    const existing = snapshot.val() || {};

    await userRef.set({
      balance: existing.balance || 0,
      username: username
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- CREATE COMPANY TASK ---------------- */
app.post("/api/create-task", async (req, res) => {
  try {
    const { title, reward, type } = req.body;

    if (!title || !reward) {
      return res.status(400).json({ error: "Missing data" });
    }

    const ref = db.ref("company_tasks").push();

    await ref.set({
      title,
      reward,
      type: type || "general",
      createdAt: Date.now()
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- GET COMPANY TASKS (ADDED) ---------------- */
app.get("/api/company-tasks", async (req, res) => {
  try {
    const snapshot = await db.ref("company_tasks").once("value");
    const data = snapshot.val() || {};

    res.json(Object.values(data));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- REDEEM REWARD ---------------- */
app.post("/api/redeem", async (req, res) => {
  try {
    let { walletAddress, cost, rewardName } = req.body;

    if (!walletAddress || !cost || !rewardName) {
      return res.status(400).json({ error: "Missing data" });
    }

    walletAddress = walletAddress.toLowerCase().trim();
    cost = Number(cost);

    const userRef = db.ref(`users/${walletAddress}`);
    const snapshot = await userRef.once("value");

    const user = snapshot.val();

    // ❌ user not found
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // ❌ insufficient balance
    if ((user.balance || 0) < cost) {
      return res.status(400).json({ error: "Not enough tokens" });
    }

    // ✅ deduct balance
    const newBalance = user.balance - cost;

    await userRef.update({
      balance: newBalance
    });

    // ✅ store redemption history
    const redemptionRef = db.ref("redemptions").push();
    // 🎟 Generate coupon code
const couponCode =
  rewardName.substring(0,3).toUpperCase() +
  Math.floor(1000 + Math.random() * 9000);

// 📅 Expiry date (2 months)
const expiry = new Date();

expiry.setMonth(expiry.getMonth() + 2);

const expiryDate = expiry.toLocaleDateString();

 await redemptionRef.set({
  walletAddress,
  rewardName,
  cost,
  couponCode,
  expiryDate,
  timestamp: Date.now()
});
    console.log(`🎁 Redeemed: ${rewardName} | New Balance: ${newBalance}`);

   res.json({
  success: true,
  balance: newBalance,
  couponCode,
  expiryDate
});

  } catch (err) {
    console.error("REDEEM ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- GET REDEMPTION HISTORY ---------------- */
app.get("/api/redemptions/:wallet", async (req, res) => {
  try {

    const wallet = req.params.wallet.toLowerCase().trim();

    const ref = db.ref("redemptions");

    const snapshot = await ref.once("value");

    const data = snapshot.val() || {};

    const result = Object.values(data)
      .filter(r => r.walletAddress === wallet)
      .sort((a, b) => b.timestamp - a.timestamp);

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});