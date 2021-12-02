const Provider = require(`${__dirname}/resource/provider.json`);
const Org = require(`${__dirname}/resource/org.json`);
const Plant = require(`${__dirname}/resource/plant.json`);

class ConfigTools {
    constructor() {
        this.org = Org;
        this.plant = Plant;
        this.provider = Provider;
    }

}

module.exports = ConfigTools;