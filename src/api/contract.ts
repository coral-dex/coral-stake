import * as config from './config';
import service from "./service";
import BigNumber from 'bignumber.js'

const serojs = require("serojs");
const seropp = require("sero-pp");

export interface Params {
    from?: string
    to: string
    cy?: string
    value?: string
    gas?: string
    gasPrice?: string
    data?: string
}
class Contract {
    contract: any;

    constructor() {
        this.contract = serojs.callContract(config.abi, config.address)
    }

    async stakeValue(account: any) {
        console.log("stakeValue")
        const res = await this.call("stakeValue", [], account.MainPKr)
        return res;
    }

    async poolValue(account: any) {
        const res = await this.call("poolValue", [], account.MainPKr)
        return res[0];
    }
    async rewardValue(account: any) {
        const res = await this.call("rewardValue", [], account.MainPKr)
        return res[0];
    }


    async stake(account: any, cy: string, value: string, daysLimit: any) {
        console.log("stake",value)
        const res = await this.execute("stake", [daysLimit], account, cy, value);
        return res;
    }

    async unstake(account: any, cy: string, to: string) {
        console.log("unstake", to)
        const res = await this.execute("unstake", [to], account, cy, '0x0');
        return res;
    }


    async harvest(account: any, cy: string, to: string) {
        console.log("harvest", to)
        const res = await this.execute("harvest", [to], account, cy, '0x0');
        return res;
    }

    async recharge(account: any, cy: string, value: string) {
        console.log("recharge", value)
        const res = await this.execute("recharge", [], account, cy, value);
        return res;
    }


    async balanceOf(): Promise<any> {
        return new Promise((resolve, reject) => {
            service.rpc("sero_getBalance", [config.address, "latest"]).then(data => {
                if (data != "0x") {
                    resolve(data)
                } else {
                }
            }).catch(err => {
                reject(err)
            })
        })
    }

    async call(method: string, args: Array<any>, from: string, cy?: string, value?: string): Promise<any> {
        const packData: any = this.contract.packData(method, args, true)
        const contract = this.contract;
        return new Promise((resolve, reject) => {
            const params: Params = {
                to: this.contract.address
            }
            params.from = from
            params.data = packData;
            if (cy) {
                params.cy = cy;
            }
            if (value) {
                params.value = value;
            }
            service.rpc("sero_call", [params, "latest"]).then(data => {
                if (data != "0x") {
                    const rest: any = contract.unPackDataEx(method, data);
                    if (rest.__length__ > 0) {
                        resolve(rest)
                    } else {
                        resolve(data)
                    }
                } else {
                    resolve(data)
                }
            }).catch(err => {
                reject(err)
            })

        })
    }

    async execute(method: string, args: Array<any>, account: any, cy?: string, value?: string): Promise<any> {
        const packData: any = this.contract.packData(method, args, true)
        return new Promise((resolve, reject) => {
            const params: Params = {
                to: this.contract.address
            }
            params.from = account.MainPKr
            params.data = packData;
            if (cy) {
                params.cy = cy;
            }
            if (value) {
                params.value = "0x" + new BigNumber(value).toString(16);
            }
            service.rpc("sero_estimateGas", [params]).then((data: any) => {
                params.gas = data;
                params.from = account.PK
                seropp.executeContract(params, function (hash: any, err: any) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(hash)
                    }
                })
            }).catch(e => {
                reject(e)
            })
        })
    }
}
const contract = new Contract();

export default contract;