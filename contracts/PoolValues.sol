pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0 pragma solidity >=0.4.16 <0.7.0;
pragma experimental ABIEncoderV2;

import "./TimeUitls.sol";
import "./SafeMath.sol";

library PoolValues {
    struct Item {
        uint value;
        uint index;
    }
    
    struct List {
        Item[] list;
    }
    
    function add(List storage self, uint value) internal {
        uint index = now / TimeUitls.DAY;
        
        if(self.list.length == 0) {
             self.list.push(Item({value: value, index : index}));
        } else {
            uint lastIndex = self.list.length - 1;
            if(self.list[lastIndex].index == index) {
                self.list[lastIndex].value += value;
            } else {
                self.list.push(Item({value: value + valueAfterNDay(self, lastIndex, index - self.list[lastIndex].index), 
                                    index : index}));
            }
        }
    }
    
    function valueAfterNDay(List storage self, uint index, uint n) internal view returns(uint) {
        if(index > self.list.length) {
            return 0;
        }
        return self.list[index].value 
                * SafeMath.pow(99, n) / SafeMath.pow(100, n);
    }
    
    function rewardValue(List storage self, uint startIndex, uint endIndex) internal view returns(uint value) {
        if(self.list.length == 0) {
            return 0;
        }
        
        uint i;
        for(i = self.list.length; i > 0 && self.list[i - 1].index > startIndex; i--) {
            if(endIndex > self.list[i - 1].index) {
                value += SafeMath.sub(self.list[i - 1].value, 
                                 valueAfterNDay(self, i - 1, SafeMath.sub(endIndex, self.list[i - 1].index)));
            }
            endIndex = self.list[i - 1].index;
        }
        
        if(endIndex > startIndex && i > 0) {
            value += SafeMath.sub(valueAfterNDay(self, i - 1, SafeMath.sub(startIndex, self.list[i - 1].index)), 
                                  valueAfterNDay(self, i - 1, SafeMath.sub(endIndex, self.list[i - 1].index)));
        }
    }
    
    function all(List storage self) internal view returns (Item[] memory rets) {
       return self.list;
    }
}