const Provider = require('./resource/provider.json');
const Org = require('./resource/org.json');
const Plant = require('./resource/plant.json');

class ConfigTools {
    constructor() {
        this.org = Org;
        this.plant = Plant;
        this.provider = Provider;
    }

}

module.exports = ConfigTools;