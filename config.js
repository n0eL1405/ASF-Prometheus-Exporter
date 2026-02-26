const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

require('dotenv').config({ path: path.join(__dirname, '.env') });

try {
  // load config files
  const fileContents = fs.readFileSync(path.join(__dirname, 'config.yaml'), 'utf8');
  const yamlConfig = yaml.load(fileContents);

  // create config object
  module.exports = {
    ...yamlConfig,
    uptimekuma: {
      ...yamlConfig.uptimekuma,
      key: process.env.UPTIMEKUMA_KEY,
      using: yamlConfig.uptimekuma?.ip !== undefined,
    },
    asf: {
      ...yamlConfig.asf,
      password: process.env.ASF_IPCPASSWORD,
      requireAuth: process.env.ASF_IPCPASSWORD !== undefined
    }
  };
} catch (e) {
  console.error("Error on loading config:", e);
  process.exit(1);
}