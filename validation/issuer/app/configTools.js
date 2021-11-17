const Provider = require('./resource/provider.json');
const Issuer = require('./resource/issuer.json');
const Plant = require('./resource/plant.json');

class ConfigTools {
    constructor() {
        this.issuer = Issuer;
        this.provider = Provider;
        this.plant = Plant;
    }
}

module.exports = ConfigTools;