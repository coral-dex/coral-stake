import * as config from './config';
import axios from 'axios';
import i18n from '../i18n';
const seropp = require("sero-pp");

class Service {
    id: number

    constructor() {
        this.id = 0;
    }
    async getTransactionReceipt(hash: string) {
        const that = this;
        return new Promise((resolve, reject) => {
            let id: any
            id = setInterval(function () {
                that.rpc("sero_getTransactionReceipt", [hash]).then((rest: any) => {
                    if (rest) {
                        clearInterval(id)
                        resolve(rest);
                    } else {
                    }
                }).catch(e => {
                    reject(e)
                })
            }, 5000)
        })
    }

    async rpc(method: string, args: any) {
        return new Promise((resolve, reject) => {
            this.initDApp().then((host: any) => {
                const data: any = {
                    id: this.id++,
                    method: method,
                    params: args
                }
                if (!host) {
                    reject(new Error("rpc unset !"))
                } else {
                    axios.post(host, data).then((resp: any) => {
                        if (resp.data && resp.data.error) {
                            reject(resp.data.error.message)
                        } else if (resp.data && resp.data.result) {
                            resolve(resp.data.result)
                        }
                    }).catch(e => {
                        reject(e)
                    })
                }
            });
        })
    }

    async accountList() {
        return new Promise((resolve, reject) => {
            seropp.getAccountList(function (data: any, err: any) {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        })
    }
    async initDApp() {
        const dapp = {
            name: "Coral Stake",
            contractAddress: config.address,
            github: "1",
            author: "Coral Stake",
            url: window.location.origin + window.location.pathname,
            logo: window.location.origin + window.location.pathname + "dapplogo.png",
            barColor: "#1890ff",
            navColor: "#1890ff",
            barMode: "dark",
            navMode: "light"
        }
        return new Promise((resolve, reject) => {
            seropp.init(dapp, function (rest: any, err: any) {
                if (err) {
                    reject(err)
                } else {
                    seropp.getInfo(function (data: any) {
                        if (data) {
                            localStorage.setItem("language", data.language);
                            localStorage.setItem("host", data.rpc)
                        }
                        resolve(data.rpc)
                    })
                }
            });
        })
    }

    setLanguage() {
        seropp.getInfo(function (info: any) {
            localStorage.setItem("language", info.language);
            i18n.changeLanguage(info.language).catch((e:any)=>{
            });
        })
    }
}

const service = new Service();

export default service;