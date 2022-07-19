pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0 pragma solidity >=0.4.16 <0.7.0;
pragma experimental ABIEncoderV2;

import "./TimeUitls.sol";
import "./SafeMath.sol";
import "./Strings.sol";
import "./ValueList.sol";
import "./PoolValues.sol";
import "./StakeValues.sol";

contract SeroInterface {
    
    bytes32 private topic_sero_balanceOf = 0xcf19eb4256453a4e30b6a06d651f1970c223fb6bd1826a28ed861f0e602db9b8;
    bytes32 private topic_sero_send = 0x868bd6629e7c2e3d2ccf7b9968fad79b448e7a2bfb3ee20ed1acbc695c3c8b23;
    bytes32 private topic_sero_currency = 0x7c98e64bd943448b4e24ef8c2cdec7b8b1275970cfe10daf2a9bfa4b04dce905;

    function sero_msg_currency() internal returns (string memory) {
        bytes memory tmp = new bytes(32);
        bytes32 b32;
        assembly {
            log1(tmp, 0x20, sload(topic_sero_currency_slot))
            b32 := mload(tmp)
        }
        return Strings._bytes32ToStr(b32);
    }

    function sero_send_token(address _receiver, string memory _currency, uint256 _amount) internal returns (bool success){
        return sero_send(_receiver, _currency, _amount, "", 0);
    }

    function sero_send(address _receiver, string memory _currency, uint256 _amount, string memory _category, bytes32 _ticket) internal returns (bool success){
        bytes memory temp = new bytes(160);
        assembly {
            mstore(temp, _receiver)
            mstore(add(temp, 0x20), _currency)
            mstore(add(temp, 0x40), _amount)
            mstore(add(temp, 0x60), _category)
            mstore(add(temp, 0x80), _ticket)
            log1(temp, 0xa0, sload(topic_sero_send_slot))
            success := mload(add(temp, 0x80))
        }
    }
}


contract CoralStake is SeroInterface{
    using StakeValues for StakeValues.List;
    using ValueList for ValueList.List;
    using PoolValues for PoolValues.List;
    
    string constant STAKE_TOKEN = "TOKEN_0";
    string constant SERO_TOKEN = "SERO";
    
    mapping(uint256 => uint256) public weights;
    
    ValueList.List wholePledge;
    mapping(address => ValueList.List) pledgesMap;
    
    mapping(address => StakeValues.List) stakesMap;
    PoolValues.List poolValues;
    
    
    function stakeValue() public view returns(uint value, uint unlockedValue, uint pledgeValue, uint total) {
        value = stakesMap[msg.sender].stakeValue();
        (unlockedValue,) = stakesMap[msg.sender].unlockValue();
        pledgeValue = pledgesMap[msg.sender].currentValue();
        total = wholePledge.currentValue();
    }
    
    function poolValue() public view returns(uint) {
        uint len = poolValues.list.length;
        if(len == 0) {
            return 0;
        }
        
        return poolValues.valueAfterNDay(len - 1, now / TimeUitls.DAY - poolValues.list[len-1].index);
    }
    
    function rewardValue() public view returns(uint) {
        return _caleReward(msg.sender);
    }
    
    function recharge(uint value) public {
        // require(Strings._stringEq(SERO_TOKEN, sero_msg_currency()));
        poolValues.add(value);
    }
    
    function stake(uint value, uint daysLimit) public {
        // require(Strings._stringEq(STAKE_TOKEN, sero_msg_currency()));
        uint weight = 1;
        
        wholePledge.add(value * weight);
        pledgesMap[msg.sender].add(value * weight);
        stakesMap[msg.sender].addValue(value, value * weight, now + daysLimit * TimeUitls.DAY);
    }
    
    function unstake(address to) public {
        (uint value, uint weightedValue) = stakesMap[msg.sender].clear();
        if(value > 0) {
            wholePledge.sub(weightedValue);
            pledgesMap[msg.sender].sub(weightedValue);
        
            // require(sero_send_token(to, STAKE_TOKEN, value), "send_token error");
        }
    }
    
    function harvest(address to) external returns(uint value) {
        value = _caleReward(msg.sender);
        pledgesMap[msg.sender].clear();
        
        // require(sero_send_token(to, SERO_TOKEN, value), "send_token error");
    }
    
    function _caleReward(address pledger) internal view returns(uint amount) {
        ValueList.List storage selfPledge = pledgesMap[pledger];
        
        uint256 selfIndex = selfPledge.lastIndex;
        uint256 wholeIndex = wholePledge.lastIndex;
        uint256 endIndex = now / TimeUitls.DAY;

        if(selfIndex != 0 && selfIndex == endIndex) {
            selfIndex = selfPledge.list[selfIndex].prevIndex;
        }

        if(wholeIndex != 0 && wholeIndex == endIndex) {
            wholeIndex = wholePledge.list[wholeIndex].prevIndex;
        }

        while(true) {
            if(selfIndex == 0) {
                break;
            }

            ValueList.Value storage selfValue = selfPledge.list[selfIndex];
            
            while(selfIndex <= wholeIndex) {
                if(selfValue.nextValue != 0) {
                    amount += poolValues.rewardValue(wholeIndex + 1, endIndex) * 
                                selfValue.nextValue / wholePledge.list[wholeIndex].nextValue;
                }
                
                if(selfValue.value != 0) {
                     amount += poolValues.rewardValue(wholeIndex, wholeIndex + 1) * 
                                selfValue.value / wholePledge.list[wholeIndex].value;
                }
                
                endIndex = wholeIndex;
                wholeIndex = wholePledge.list[wholeIndex].prevIndex;
            }
            
            if(selfIndex < endIndex) {
                if(selfValue.value != 0) {
                    amount += poolValues.rewardValue(selfIndex, selfIndex + 1) * 
                                selfValue.value / wholePledge.list[wholeIndex].nextValue;
                }
                
                if(selfValue.nextValue != 0) {
                    amount += poolValues.rewardValue(selfIndex + 1, endIndex) * 
                                selfValue.nextValue / wholePledge.list[wholeIndex].nextValue;
                }
                
                endIndex = selfIndex;
            }
            
            selfIndex = selfPledge.list[selfIndex].prevIndex;
        }
    }
}


