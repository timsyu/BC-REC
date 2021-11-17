const Provider = require('./resource/provider.json');
const OrgManager = require('./resource/orgManager.json');
const Org = require('./resource/org.json');
const Plant = require('./resource/plant.json');
const Issuer = require('./resource/issuer.json');
const Token = require('./resource/token.json');

class ConfigTools {
    constructor() {
        this.orgManager = OrgManager;
        this.org = Org;
        this.plant = Plant;
        this.issuer = Issuer;
        this.token = Token;
        this.provider = Provider;
    }

}

module.exports = ConfigTools;