pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0 pragma solidity >=0.4.16 <0.7.0;
pragma experimental ABIEncoderV2;

import "./TimeUitls.sol";
import "./SafeMath.sol";

library ValueList {    
    
    struct Value {
        uint256 value;
        uint256 nextValue;
        uint256 prevIndex;
    }

    struct List {
        uint256 lastIndex;
        mapping(uint256 => Value) list;
    }

    function add(List storage self, uint256 value) internal {
        uint256 index = now / TimeUitls.DAY;
        
        if (self.lastIndex != index) {
            uint prevValue;
            if(self.lastIndex != 0) {
                prevValue = self.list[self.lastIndex].nextValue;
            }
            
            self.list[index] = Value({
                value: prevValue + value * (TimeUitls.DAY - now % TimeUitls.DAY) / TimeUitls.DAY,
                nextValue: prevValue + value,
                prevIndex: self.lastIndex
            });
            self.lastIndex = index;
        } else {
            self.list[index].value = self.list[index].value + value * (TimeUitls.DAY - now % TimeUitls.DAY) / TimeUitls.DAY;
            self.list[index].nextValue = self.list[index].nextValue + value;
        }
    }

    function sub(List storage self, uint256 value) internal {
        uint256 index = now / TimeUitls.DAY;
        if (self.lastIndex != index) {
            self.list[index] = Value({
                value: SafeMath.sub(self.list[self.lastIndex].nextValue, value * (TimeUitls.DAY - now % TimeUitls.DAY) / TimeUitls.DAY),
                nextValue: SafeMath.sub(self.list[self.lastIndex].nextValue, value),
                prevIndex: self.lastIndex
            });
            self.lastIndex = index;
        } else {
            self.list[index].value = SafeMath.sub(self.list[index].value, value * (TimeUitls.DAY - now % TimeUitls.DAY) / TimeUitls.DAY);
            self.list[index].nextValue = SafeMath.sub(self.list[index].nextValue, value);
        }
    }

   function clear(List storage self) internal {
        if(self.lastIndex == 0) {
            return;
        }

        uint256 index = now / TimeUitls.DAY;
        
        uint256 _index;
        if(index == self.lastIndex) {
            _index = self.list[self.lastIndex].prevIndex;  
            self.list[self.lastIndex].prevIndex = 0;     
        } else {
            _index = self.lastIndex;
            if(self.list[self.lastIndex].nextValue !=0) {
                self.list[index].value = self.list[self.lastIndex].nextValue;
                self.list[index].nextValue = self.list[self.lastIndex].nextValue;
                self.lastIndex = index;
            } else{
                delete self.list[self.lastIndex];
                self.lastIndex = 0;
            }
        }
        
        while (_index != 0) {
            uint delIndex = _index;
            _index = self.list[_index].prevIndex;
            delete self.list[delIndex];
        }
    }

    function currentValue(List storage self) internal view returns (uint256) {
        if(self.lastIndex == 0) {
            return 0;
        }
        
        uint256 index = now / TimeUitls.DAY;
        if(index == self.lastIndex) {
            return self.list[self.lastIndex].value;
        } else {
            return self.list[self.lastIndex].nextValue;
        }
    }

    function all(List storage self) internal view returns (uint lastIndex, Value[] memory rets) {
        uint256 _index = self.lastIndex; 
        uint256 count;
        while (_index != 0) {
            count++;
            _index = self.list[_index].prevIndex;
        }

        lastIndex = self.lastIndex;
        rets = new Value[](count);
        _index = self.lastIndex;
        
        while (_index != 0) {
            rets[count - 1] = self.list[_index];
            (_index) = (rets[count - 1].prevIndex);
            count-- ;
        }
    }
}



