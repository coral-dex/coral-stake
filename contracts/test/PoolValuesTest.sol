pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0 pragma solidity >=0.4.16 <0.7.0;
pragma experimental ABIEncoderV2;

import "../TimeUitls.sol";
import "../PoolValues.sol";

contract PoolValuesTest  {
    using PoolValues for PoolValues.List;
    using PoolValues for PoolValues.Item;

    PoolValues.List list;

    function update(uint value) public {
        list.add(value);
    } 

    function valueAferNDays(uint index, uint n) public view returns(uint) {
        return list.valueAfterNDay(index, n);
    }

    function rewardValue(uint startIndex, uint endIndex) public view returns(uint) {
        return list.rewardValue(startIndex, endIndex);
    }
    
    function all() public view returns(PoolValues.Item[] memory) {
        return list.all();
    }
}

