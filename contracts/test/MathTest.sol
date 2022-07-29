pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0 pragma solidity >=0.4.16 <0.7.0;

import "../math/PRBMathSD59x18.sol";

contract MathTest {

    int256 public a = PRBMathSD59x18.div(
                    PRBMathSD59x18.fromInt(99),
                    PRBMathSD59x18.fromInt(100));
                    
    function pow(int value, uint n) public view returns(int256) {
        return 
        PRBMathSD59x18.toInt(
            PRBMathSD59x18.mul(
                PRBMathSD59x18.fromInt(value), 
                PRBMathSD59x18.powu(a, n)
            )
        );
    }
}