pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0 pragma solidity >=0.4.16 <0.7.0;
pragma experimental ABIEncoderV2;

import "../TimeUitls.sol";
import "../ValueList2.sol";

contract ValueListTest  {
    using ValueList for ValueList.List;
    using ValueList for ValueList.Value;

    ValueList.List list;

    function add(uint256 value) public {
        list.add(value);
    } 

    function sub(uint value) public {
        list.sub(value);
    }
    
    function clear() public {
        list.clear();
    }
    
    function all() public view returns(uint, ValueList.Value[] memory) {
        return list.all();
    }
}

