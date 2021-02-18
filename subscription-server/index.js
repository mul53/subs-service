const express = require("express");
const { ethers, utils } = require("ethers");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");

const ERC20_ABI = require("./erc20.json");
const { isAddress } = require("ethers/lib/utils");

const {
  utils: { id, Interface },
  providers: { JsonRpcProvider },
} = ethers;

const db = [];
const topicSets = [id("Transfer(address,address,uint256)"), null];
const interface = new Interface(ERC20_ABI);
const provider = new JsonRpcProvider("https://rpc.fuse.io");
const app = express();

app.use(bodyParser.json());
app.set("port", 5000);

app.post("/subscribe", (req, res) => {
  const { address } = req.body;
  if (!isAddress(address)) {
    res.send({
      message: "Please provide an ethereum address",
    });
    return;
  }

  db.push(address);

  res.send({
    message: "Added " + address,
  });
});

app.post("/unsubscribe", (req, res) => {
  const { address } = req.body;
  if (!isAddress(address)) {
    res.send({
      message: "Please provide an ethereum address",
    });
    return;
  }

  let message = "";

  const idx = db.indexOf(address);
  if (idx !== -1) {
    db.splice(idx, 1);
    message = "Address was removed";
  } else {
    message = "Address not included";
  }

  res.send({
    message,
  });
});

app.listen(app.get("port"), () => {
  console.log(`Subscriber server listening on port ${app.get("port")}...`);

  console.log("Attaching listener...");
  provider.on(topicSets, async (log) => {
    const { args } = interface.parseLog(log);
    const [, to] = args;

    if (db.includes(to)) {
      await fetch("http://localhost:4000/webhooks/wallets/balance/updates", {
        method: "post",
        body: JSON.stringify(log),
        headers: { "Content-Type": "application/json" },
      });
    }
  });
});
