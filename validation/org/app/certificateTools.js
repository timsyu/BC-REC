class CertificateTools {
    constructor(web3, account, privateKey, config) {
        this.web3 = web3;
        this.account = account;
        this.privateKey = privateKey;
        this.config = config;
    }
    
    calcertNum = async(orgAddress) => {
        const allPlantPowers = await this.#getAllPower(orgAddress);
        let certNumList = [];
        allPlantPowers.forEach((powers, plantId) => {
            let total = 0;
            powers.forEach((power, powerId) => {
                total += power.remainValue;
            });
            let certNum = Math.floor(total / 1000);
            let info = {
                'plantId': plantId,
                'certNum': certNum,
                'totalPower': total
            };
            certNumList.push(info);
        });
        return certNumList;
    }

    generatePowerInfo = async(orgAddress, plantId, number) => {
        const allPlantPowers = await this.#getAllPower(orgAddress);
        const powerMap = allPlantPowers.get(plantId);
        const powers = [...powerMap.entries()];
        const { powerIds, values } = this.#calculate(powers, number);
        console.log(powerIds);
        console.log(values);
        return { 'powerIds': powerIds, 'values': values };
    }

    // #getAllPower = async(orgAddress) => {
    //     const web3 = this.web3;
    //     const org = this.config.org;

    //     let orgContract = new web3.eth.Contract(org.abi, orgAddress);
    //     // get all power from plants
    //     let plantIds = await orgContract.methods.getAllPlant().call();
    //     let plantMap = new Map();
    //     for(let i = 0; i < plantIds.length; i++) {
    //         let powers = await this.#getPlantAllPower(plantIds[i]);
    //         plantMap.set(plantIds[i], powers);
    //     }
    //     // get all certificate request from org
    //     let requests = await this.#getAllCertificateRequest(orgAddress);
    //     for (let i = 0; i < requests.length; i++) {
    //         let request = requests[i];
    //         let number = request.number;
    //         let plantId = request.plantId;
    //         let powerIds = request.powerIds;
    //         let values = request[5];
    //         let powers = plantMap.get(plantId);
    //         for (let j = 0; j < number; j++) {
    //             let pIds = powerIds[j];
    //             let vs = values[j];
    //             for (let k = 0; k < pIds.length; k++) {
    //                 let powerId = pIds[k];
    //                 let value = parseInt(vs[k]);
    //                 let power = powers.get(powerId);
    //                 let v = power.remainValue;
    //                 power.remainValue = v - value
    //                 // powers.set(powerId, power);
    //                 if (power.remainValue === 0) {
    //                     powers.delete(powerId);
    //                 }
    //             }
    //         }
    //         // plantMap.set(plantId, powers);
    //     }
    //     return plantMap;
    // }

    #getAllPower = async(orgAddress) => {
        const web3 = this.web3;
        const org = this.config.org;

        let orgContract = new web3.eth.Contract(org.abi, orgAddress);
        // get all power from plants
        let plantIds = await orgContract.methods.getAllPlant().call();
        let plantMap = new Map();
        for(let i = 0; i < plantIds.length; i++) {
            let powers = await this.#getPlantAllPowerIfRemain(plantIds[i]);
            plantMap.set(plantIds[i], powers);
        }
        // get all certificate request from org
        
        return plantMap;
    }
    
    #getPlantAllPowerIfRemain = async(plantId) => {
        const web3 = this.web3;
        const plant = this.config.plant;

        let plantContract = new web3.eth.Contract(plant.abi, plantId);
        let powers = await plantContract.methods.getAllPower().call();
        let powerMap = new Map();
        for(let i = 0; i < powers.length; i++) {
            let power = powers[i];
            let remainValue = parseInt(power.remainValue);
            if (remainValue > 0) {
                let info = {
                    'id': parseInt(power.id),
                    'deviceId': power.deviceId,
                    'date': power.date,
                    'value': parseInt(power.value),
                    'remainValue': remainValue,
                    'txHash': power.txHash
                };
                powerMap.set(power.id, info);
            }
        }
        return powerMap;
    }

    #getPlantAllPower = async(plantId) => {
        const web3 = this.web3;
        const plant = this.config.plant;

        let plantContract = new web3.eth.Contract(plant.abi, plantId);
        let powers = await plantContract.methods.getAllPower().call();
        let powerMap = new Map();
        for(let i = 0; i < powers.length; i++) {
            let power = powers[i];
            let info = {
                'id': parseInt(power.id),
                'deviceId': power.deviceId,
                'date': power.date,
                'value': parseInt(power.value),
                'remainValue': parseInt(power.remainValue),
                'txHash': power.txHash
            };
            powerMap.set(power.id, info);
        }
        return powerMap;
    }
    
    #getAllCertificateRequest = async(orgAddress) => {
        const web3 = this.web3;
        const org = this.config.org;

        let orgContract = new web3.eth.Contract(org.abi, orgAddress);
        let requests = await orgContract.methods.getAllCertificateRequest().call();
        // console.log(requests);
        return requests;
    }
    
    // powers: powers of plant
    // number: cert. number
    #calculate = (powers, number) => {
        number = parseInt(number);
        let powerIds = [];
        let values = [];
        let currentNumber = 0;
        for (let i = 0;i < number;i++) {
            let iPowerIds = [];
            let iValues = [];
            let target = 1000;
            let count = 0;
            for (let j = 0;j < powers.length;j++) {
                let p = powers[j][1];
                if (p.remainValue != 0) {
                    iPowerIds[count] = p.id;
                    if (target > p.remainValue) {
                        target -= p.remainValue;
                        iValues[count] = p.remainValue;
                        count++;
                        p.remainValue = 0;
                    } else { // generate a cert.
                        p.remainValue -= target;
                        iValues[count] = target;
                        count++;
                        currentNumber++;
                        target = 0;
                        break;
                    }
                }
            }
            powerIds[i] = iPowerIds;
            values[i] = iValues;
        }
        
        if (currentNumber == number ) {
            return {'powerIds': powerIds, 'values': values};
        } else {
            return {'powerIds': [], 'values': []};
        }
    }
    
}

module.exports = CertificateTools;

