const Provider = require(`${__dirname}/resource/provider.json`);
const OrgManager = require(`${__dirname}/resource/orgManager.json`);
const Issuer = require(`${__dirname}/resource/issuer.json`);
const Plant = require(`${__dirname}/resource/plant.json`);
const NFT = require(`${__dirname}/resource/nft.json`);

class ConfigTools {
    constructor() {
        this.issuer = Issuer;
        this.orgManager = OrgManager;
        this.provider = Provider;
        this.plant = Plant;
        this.nft = NFT;
    }
}

module.exports = ConfigTools;