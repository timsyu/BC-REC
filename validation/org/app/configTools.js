const Provider = require(`${__dirname}/resource/provider.json`);
const OrgManager = require(`${__dirname}/resource/orgManager.json`);
const Org = require(`${__dirname}/resource/org.json`);
const Plant = require(`${__dirname}/resource/plant.json`);
const Issuer = require(`${__dirname}/resource/issuer.json`);
const Token = require(`${__dirname}/resource/token.json`);

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