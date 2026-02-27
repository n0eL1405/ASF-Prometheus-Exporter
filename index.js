const prom = require('prom-client');
const express = require('express')
const config = require('./config');

// Uptime Kuma monitoring
if (config.uptimekuma.using) {
  const pushURL = `http://${config.uptimekuma.ip}:${config.uptimekuma.port}/api/push/${config.uptimekuma.key}?status=up&msg=OK&ping=`;
  const interval = config.uptimekuma.hearthbeat !== undefined ? parseInt(config.uptimekuma.hearthbeat) : 60;
  const hearthbeat = async () => {
    await fetch(pushURL);
    console.log("Hearthbeat!");
  };
  hearthbeat();
  setInterval(hearthbeat, interval * 1000);
}

// load common ASF information
let asfInfo;
const loadCommonAsfInfo = async() => {
  asfInfo = await (await callASF('ASF')).json();
}
loadCommonAsfInfo();
setTimeout(loadCommonAsfInfo, 600000);

// create Prometheus metrics
const promPrefix = config.prometheus.prefix !== undefined ? config.prometheus.prefix.toLowerCase() + '_' : '';
prom.collectDefaultMetrics({prefix: `${promPrefix}default_`})

new prom.Gauge({
  name: `${promPrefix}build_info`,
  help: 'Build information about ASF in form of label values',
  labelNames: ['variant', 'version'],
  collect() {
    this.labels({ variant: asfInfo.Result.BuildVariant, version: asfInfo.Result.Version }).set(1);
  }
});

new prom.Gauge({
  name: `${promPrefix}total_number_of_bots`,
  help: 'Total number of bots on ASF instance',
  async collect() {
    try {
      const response = await callASF('Bot/ASF');
      const data = await response.json();

      if (data.Success && data.Result) {
        this.set(Object.keys(data.Result).length);
      }
    } catch (error) {
      console.error("Error leading ASF endpoint:", error.message);
    }
  }
});

new prom.Gauge({
  name: `${promPrefix}games_remaining_to_farm`,
  help: 'Total number of remaining games to farm',
  async collect() {
    try {
      const response = await callASF('Bot/ASF');
      const data = await response.json();

      if (data.Success && data.Result) {
        let gamesToFarmTotal = 0;
        const bots = Object.values(data.Result);
        for (const bot of bots) {
          if (bot.CardsFarmer) {
            gamesToFarmTotal += bot.CardsFarmer.GamesToFarm.length;
          }
        }
        this.set(gamesToFarmTotal);
      }
    } catch (error) {
      console.error("Error leading ASF endpoint:", error.message);
    }
  }
});

new prom.Gauge({
  name: `${promPrefix}cards_remaining_to_farm`,
  help: 'Total number of cards remaining to farm',
  async collect() {
    try {
      const response = await callASF('Bot/ASF');
      const data = await response.json();

      if (data.Success && data.Result) {
        let cardsToFarmTotal = 0;
        const bots = Object.values(data.Result);
        for (const bot of bots) {
          if (bot.CardsFarmer) {
            for (const game of bot.CardsFarmer.GamesToFarm) {
              cardsToFarmTotal += game.CardsRemaining;
            }
          }
        }
        this.set(cardsToFarmTotal);
      }
    } catch (error) {
      console.error("Error leading ASF endpoint:", error.message);
    }
  }
});

new prom.Gauge({
  name: `${promPrefix}bots_currently_farming`,
  help: 'Total number of bots currently farming',
  async collect() {
    try {
      const response = await callASF('Bot/ASF');
      const data = await response.json();

      if (data.Success && data.Result) {
        const bots = Object.values(data.Result);
        this.set(bots.filter(
            bot => bot.CardsFarmer && bot.CardsFarmer.NowFarming).length);
      }
    } catch (error) {
      console.error("Error leading ASF endpoint:", error.message);
    }
  }
});

// create metric endpoint
const app = express();
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', prom.register.contentType);
    res.end(await prom.register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});
app.listen(parseInt(config.app.port), () => console.log(`Server running on port ${config.app.port}`));

// functions
async function callASF(endpoint) {
  const headers = {'accept': 'application/json'};
  if (config.asf.requireAuth) {
    headers['Authentication'] = config.asf.password;
  }

  const response = await fetch(
      `http://${config.asf.ip}:${config.asf.port}/Api/${endpoint}`, {
        method: 'GET',
        headers: headers
      });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  return response;
}