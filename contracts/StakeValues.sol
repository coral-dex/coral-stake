pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0 pragma solidity >=0.4.16 <0.7.0;
pragma experimental ABIEncoderV2;

import "./TimeUitls.sol";
import "./SafeMath.sol";

library StakeValues {
    
    struct Value {
        uint256 value;
        uint256 weightedValue;
    }
    
    struct ValueList {
        Value[] list;
        uint256 prveIndex;
    }
    
    struct List {
        uint256 lastIndex;
        mapping(uint256 => ValueList) values;
    }
    
    function addValue(List storage self, uint256 value, uint256 weightedValue, uint256 expireDate) internal {
        uint index = expireDate / TimeUitls.DAY;
        uint currentIndex = self.lastIndex;
        
        self.values[index].list.push(Value({
            value: value,
            weightedValue: weightedValue
        }));
        
        if(currentIndex < index) {
            self.lastIndex = index;
            self.values[index].prveIndex = currentIndex;
        } else {
            while(index <= self.values[currentIndex].prveIndex) {
                currentIndex = self.values[currentIndex].prveIndex;
            }
            
            if(currentIndex != index) {
                self.values[index].prveIndex = self.values[currentIndex].prveIndex;
                self.values[currentIndex].prveIndex = index;
            }
        }
    }
    
    function clear(List storage self) internal returns(uint256 value, uint256 weightedValue) {
        uint nextIndex = self.lastIndex;
        uint index = now / TimeUitls.DAY;
        
        if(nextIndex < index) {
            self.lastIndex = 0;
        }
        
        while(nextIndex > 0) {
            uint currentIndex = nextIndex;
            nextIndex = self.values[currentIndex].prveIndex;
            
            if(currentIndex < index) {
                Value[] storage list = self.values[currentIndex].list;
                for(uint i; i < list.length; i++) {
                    value += list[i].value;
                    weightedValue += list[i].weightedValue;
                }
                delete self.values[currentIndex];
            } else if(nextIndex < index) {
                self.values[currentIndex].prveIndex = 0;
            }
        }
    }
    
    function stakeValue(List storage self) internal view returns(uint value) {
        uint currentIndex = self.lastIndex;
        
        while(currentIndex > 0) {
            Value[] storage list = self.values[currentIndex].list;
            for(uint i; i < list.length; i++) {
                value += list[i].value;
            }
            currentIndex = self.values[currentIndex].prveIndex;
        }
    }
    
    function unlockValue(List storage self) internal view returns(uint256 value, uint256 weightedValue) {
        uint currentIndex = self.lastIndex;
        uint index = now / TimeUitls.DAY;
        
        while(currentIndex > 0) {
            if(index > currentIndex) {
                Value[] storage list = self.values[currentIndex].list;
                for(uint i; i < list.length; i++) {
                    value += list[i].value;
                    weightedValue += list[i].weightedValue;
                }
            }
            currentIndex = self.values[currentIndex].prveIndex;
        }
    }
    
    function list(List storage self) internal view returns(ValueList[] memory rets) {
        uint currentIndex = self.lastIndex;
        uint count;
        while(currentIndex > 0) {
            count++;
            currentIndex = self.values[currentIndex].prveIndex;
        }
        
        rets = new ValueList[](count);
        currentIndex = self.lastIndex;
        while(currentIndex > 0) {
            rets[--count] = self.values[currentIndex];
            rets[count].prveIndex = currentIndex;
            
            currentIndex = self.values[currentIndex].prveIndex;
        }
    }
}