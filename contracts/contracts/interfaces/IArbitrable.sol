// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IArbitrable {
    function rule(uint256 _disputeId, uint256 _ruling) external;
}
