import React, { useEffect, useState } from 'react'

import service from '../api/service';
import contract from '../api/contract';
import { Button, Input, List, Modal, Select, Spin, Statistic } from 'antd';
import BigNumber from 'bignumber.js'
import { verify } from '../utils';
import { LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import i18n from '../i18n';

const { Option } = Select;

const successIcon = <CheckCircleOutlined style={{ fontSize: 24 }} />
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
export default function Coralstake() {
  const [currentAccount, setCurrentAccount] = useState<any>({});
  const [accountList, setAccountList] = useState<any>([]);

  const [userVisible, setUserVisible] = useState<boolean>(false);
  const [stakeValue, setStakeValue] = useState<string>('');
  const [stakeUnlockedValue, setStakeUnlockedValue] = useState<string>('');

  const [poolValue, setPoolValue] = useState<string>('');
  const [rewardValue, setRewardValue] = useState<string>('');
  const [coralAmount, setCoralAmount] = useState<string>('0');


  const [stakeVisible, setStakeVisible] = useState<boolean>(false);

  const [sendStakeAmount, setSendStakeAmount] = useState<string>('0');

  const [daysLimit, setDaysLimit] = useState<string>('5');

  const [loadState, setLoadState] = useState<boolean>(false);
  const [loadDescription, setDescription] = useState<string>('');
  const [loadIndicator, setLoadIndicator] = useState<any>(antIcon);

  const [totalAmount, setTotalAmount] = useState<string>('0');
  useEffect(() => {
    gatdata();
  }, [])


  const gatdata = () => {
    service.accountList().then((res: any) => {
      let userobj: any = {};
      if (sessionStorage.getItem("userName")?.length === undefined) {
        userobj = res.find(function (item: any) {
          return item.IsCurrent === true;
        })
      } else {
        userobj = res.find(function (item: any) {
          return item.Name === sessionStorage.getItem("userName");
        })
      }
      // console.log("userobj", userobj);
      setAccountList(res);
      init(userobj);
    })
  }

  const init = (account: any) => {
    getStakeValue(account);
    getPoolValue(account);
    getrewardValue(account);
    getCoralAmount(account);
    setCurrentAccount(account);
    getTotal();
  }


  const getTotal = () => {
    contract.balanceOf().then((res) => {
      if (res.tkn && res.tkn.CORAL) {
        setTotalAmount(fromValue(res.tkn.CORAL, 18))
      } else {
        setTotalAmount("0.00")
      }

    }).catch((err: any) => {
      console.log("balanceOf err=", err)
      setTotalAmount("0.00")
    })
  }

  const getCoralAmount = (account: any) => {
    // console.log(account.Balance.get("CORAL"), "getCoralAmount", new BigNumber(account.Balance.get("CORAL")).dividedBy(10 ** 18).toFixed(2));
    if (account.Balance.get("CORAL")) {
      setCoralAmount(fromValue(account.Balance.get("CORAL"), 18))
    } else {
      setCoralAmount("0.00")
    }
  }

  const getStakeValue = (account: any) => {
    contract.stakeValue(account).then((res) => {
      console.log("stakeValue=", res)
      setStakeValue(fromValue(res.value, 18));
      setStakeUnlockedValue(fromValue(res.unlockedValue, 18))
    }).catch((err: any) => {
      console.log("stakeValue err=", err)
    })
  }

  const getPoolValue = (account: any) => {
    contract.poolValue(account).then((res) => {
      console.log("poolValue=", res)
      setPoolValue(fromValue(res, 18))
    }).catch((err: any) => {
      console.log("poolValue err=", err)
    })
  }

  const getrewardValue = (account: any) => {
    contract.rewardValue(account).then((res) => {
      console.log("rewardValue=", res)
      setRewardValue(fromValue(res, 18));
    }).catch((err: any) => {
      console.log("rewardValue err=", err)
    })
  }

  // stake(account: any, cy: string, value: string,daysLimit:any) 
  const sendStake = () => {
    console.log("sendStake", sendStakeAmount, daysLimit)
    contract.stake(currentAccount, "CORAL", new BigNumber(sendStakeAmount).multipliedBy(10 ** 18).toString(), daysLimit).then((hash) => {
      console.log("sendStake hash=", hash)
      setStakeVisible(false);
      setSendStakeAmount('');
      setDaysLimit("30");
      setTimeout(function () {
        loading(true, "PENDING...", antIcon)
        service.getTransactionReceipt(hash).then((res) => {
          loading(true, "SUCCESSFUL", successIcon)
          setTimeout(function () {
            init(currentAccount)
            loading(false, "PENDING...", antIcon)
          }, 1500)
        })
      }, 1500)

    }).catch((err: any) => {
      console.log("sendStake err=", err)
    })
  }

  //  unstake(account: any, cy: string, value: string,to:any) {
  const sendUnstake = () => {
    console.log(currentAccount)
    contract.unstake(currentAccount, "CORAL", currentAccount.MainPKr).then((hash) => {
      console.log("sendUnstake hash=", hash)

      setTimeout(function () {
        loading(true, "PENDING...", antIcon)
        service.getTransactionReceipt(hash).then((res) => {
          console.log("getTransactionReceipt", res)
          loading(true, "SUCCESSFUL", successIcon)
          setTimeout(function () {
            init(currentAccount)
            loading(false, "PENDING...", antIcon)
          }, 1500)
        })
      }, 1500)
    }).catch((err: any) => {
      console.log("sendUnstake err=", err)
    })
  }

  const sendHarvest = () => {
    contract.harvest(currentAccount, "CORAL", currentAccount.MainPKr).then((hash) => {
      console.log("sendUnstake hash=", hash)
      setTimeout(function () {
        loading(true, "PENDING...", antIcon)
        service.getTransactionReceipt(hash).then((res) => {
          loading(true, "SUCCESSFUL", successIcon)
          setTimeout(function () {
            init(currentAccount)
            loading(false, "PENDING...", antIcon)
          }, 1500)
        })
      }, 1500)
    }).catch((err: any) => {
      console.log("sendUnstake err=", err)
    })
  }


  const loading = (status: boolean, description: string, indicator: any) => {
    setLoadState(status);
    setDescription(description)
    setLoadIndicator(indicator)
  }

  const fromValue = (v: any, d: number) => {
    if (v) {
      return new BigNumber(v).dividedBy(10 ** d).toFixed(2)
    } else {
      return new BigNumber(0).toFixed(2)
    }
  }

  return (
    <div className='main'>
      <div style={{
        display: loadState ? "inherit" : "none",
        position: "absolute",
        width: "100px",
        top: "50%",
        left: "50%",
        margin: "-100px 0 0 -50px",
        background: "#333",
        textAlign: "center",
        padding: "10px",
        borderRadius: "10px",
        wordBreak: "break-all"
      }}>
        <Spin indicator={loadIndicator} spinning={loadState} tip={loadDescription}>
        </Spin>
      </div>

      <div className='account'>
        <p className='title'>
          <span>{i18n.t("Account")}</span>
        </p>
        {/* <Button type="primary" onClick={() => {
          contract.recharge(currentAccount, "CORAL", new BigNumber(10).multipliedBy(10 ** 18).toString()).then((hash) => {
            console.log(hash)
          }).catch((err) => {
            console.log(err)
          })
        }}>recharge</Button> */}

        <div className='account-content'>
          <div className='item'>
            <div className='content'>
              <p style={{
                lineHeight: "24px"
              }}>{currentAccount.Name}&nbsp;&nbsp;&nbsp;&nbsp;{currentAccount.MainPKr && `${currentAccount.MainPKr.substring(0, 5)}.....${currentAccount.MainPKr.substring(currentAccount.MainPKr.length - 5, currentAccount.MainPKr.length)}`}
              </p>

            </div>
            <div className='switch'>
              <p>
                <Button type='primary' size='small'
                  onClick={() => setUserVisible(true)}
                > {i18n.t("Switch")}</Button>

                <Modal
                  className="userboxs"
                  title={i18n.t("Switchuser")}
                  visible={userVisible}
                  onCancel={() => setUserVisible(false)}
                  footer={null}
                  centered={true}
                >
                  <List
                    size="small"
                    className="userlistbox"
                    itemLayout="horizontal"
                    dataSource={accountList}
                    renderItem={(item: any, index: number) => (
                      <List.Item
                        onClick={() => {
                          console.log("accountList", accountList, item.Name)
                          let userobj = accountList.find(function (data: any) {
                            return data.Name == item.Name;
                          })
                          // console.log("userobj",userobj)
                          let userName = userobj.Name;
                          sessionStorage.setItem("userName", userName);
                          setCurrentAccount(userobj);
                          setUserVisible(false);
                          init(userobj);
                        }}
                        key={index}
                      >
                        <List.Item.Meta
                          description={<p className='user-item'>
                            <span>{item.Name}</span>
                            <span>{item.MainPKr.substring(0, 8)} ..... {item.MainPKr.substring(item.MainPKr.length - 7, item.MainPKr.length)}</span>
                          </p>}
                        />
                      </List.Item>
                    )}
                  />
                </Modal>
              </p>
            </div>
          </div>

          <div className='item' style={{
            lineHeight: "40px"
          }}>
            <div className='content'>
              <p>
                <Statistic value={coralAmount} precision={2} suffix="CORAL" />
              </p>
            </div>
            <div className='switch'>
              <p>
                <Button type='primary' disabled={new BigNumber(coralAmount).isZero() ? true : false} size='small'
                  onClick={() => setStakeVisible(true)}
                >{i18n.t("stake")}</Button>

                <Modal
                  className="stake"
                  title={i18n.t("stake")}
                  visible={stakeVisible}
                  centered={true}
                  onOk={() => {
                    sendStake()
                  }}
                  onCancel={() => setStakeVisible(false)}
                  okText={i18n.t("confirm")}
                  cancelText={i18n.t("cancel")}
                >
                  <div className='stake-item'>
                    <div>
                      <p>{i18n.t("amount")}:</p>
                    </div>
                    <div>
                      <Input min={0} value={sendStakeAmount} placeholder='0.0' onChange={(e) => {
                        let value = e.target.value;
                        value = verify(value);
                        setSendStakeAmount(value)
                      }
                      } />
                    </div>
                  </div>

                  <div className='stake-item'>
                    <div>
                      <p>{i18n.t("cycle")}:</p>
                    </div>
                    <div>
                      <Select defaultValue={daysLimit} style={{ width: "100%" }} onChange={(value: any) => {
                        setDaysLimit(value)
                      }}>
                        <Option value="5">5 {i18n.t("day")}</Option>
                        <Option value="60">60 {i18n.t("day")}</Option>
                        <Option value="90">90 {i18n.t("day")}</Option>
                      </Select>
                    </div>
                  </div>

                </Modal>
              </p>
            </div>
          </div>

        </div>

      </div>

      <div className='pool'>
        <p className='title'>
          <span>{i18n.t("pool")}</span>
        </p>
        <div className='pool-content'>
          <p className='pool-item'>
            <span style={{
              lineHeight: '37px'
            }}>{i18n.t("totalStake")}</span>
            <Statistic value={totalAmount} precision={2} suffix="CORAL" />
          </p>

          <p className='pool-item'>
            <span style={{
              lineHeight: '37px'
            }}>{i18n.t("Pooltotal")}</span>
            <Statistic value={poolValue} precision={2} suffix="SERO" />
          </p>
        </div>
      </div>

      <div className='funds'>
        <p className='title'>
          <span>{i18n.t("myStale")}</span>
        </p>
        <div className='funds-content'>
          <div>
            {i18n.t("UnlockedValue")}/{i18n.t("StaleValue")}
          </div>
          <div className='funds-item'>
            <div className='item-left' style={{
              display: "flex",
              lineHeight: "37px",
              wordBreak: 'break-all'
            }}>
              <Statistic value={stakeUnlockedValue} precision={2} /> &nbsp;/&nbsp; <Statistic value={stakeValue} precision={2} suffix="CORAL" />
            </div>
            <div className='item-right'>
              <p style={{
                lineHeight: '37px'
              }}>
                <Button type='primary' disabled={new BigNumber(stakeUnlockedValue).isZero() ? true : false} size='small'
                  onClick={() => (sendUnstake())}
                > {i18n.t("Unstake")}</Button>
              </p>
            </div>
          </div>
          <div>
            {i18n.t("Canextractyield")}
          </div>
          <div className='funds-item'>
            <div className='item-left'>
              <Statistic value={rewardValue} precision={2} suffix="CORAL" />
            </div>
            <div className='item-right'>
              <p style={{
                lineHeight: '37px'
              }}>
                <Button type='primary' disabled={new BigNumber(rewardValue).isZero() ? true : false} size='small'
                  onClick={() => { sendHarvest() }}
                >{i18n.t("harvest")}</Button>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
