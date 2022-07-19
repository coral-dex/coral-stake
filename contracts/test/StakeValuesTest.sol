pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0 pragma solidity >=0.4.16 <0.7.0;
pragma experimental ABIEncoderV2;

import "../TimeUitls.sol";
import "../StakeValues.sol";

contract StakeValuesTest  {
    using StakeValues for StakeValues.List;
    using StakeValues for StakeValues.ValueList;

    StakeValues.List list;

    function add(uint256 value) public {
        list.addValue(value, value, now + 60);
    } 

    function clear() public {
        list.clear();
    }
    
    function stakeValue() public view returns(uint) {
        return list.stakeValue();
    }
    
    function unlockValue() public view returns(uint, uint) {
        return list.unlockValue();
    }
    
    function all() public view returns(StakeValues.ValueList[] memory) {
        return list.list();
    }
}

