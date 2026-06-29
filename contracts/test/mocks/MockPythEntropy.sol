// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockPythEntropy {
    uint64 private _nextSequenceNumber = 1;
    uint256 public mockFee = 0.1 ether;

    function setFee(uint256 _fee) external {
        mockFee = _fee;
    }

    function request(
        address /* provider */,
        bytes32 /* userCommitment */,
        bool /* useBlockhash */
    ) external payable returns (uint64 sequenceNumber) {
        sequenceNumber = _nextSequenceNumber++;
    }

    function reveal(
        address /* provider */,
        uint64 /* sequenceNumber */,
        bytes32 userRandom,
        bytes32 providerRandom
    ) external pure returns (bytes32 randomNumber) {
        randomNumber = keccak256(abi.encodePacked(userRandom, providerRandom));
    }

    function getFee(address /* provider */) external view returns (uint256) {
        return mockFee;
    }
}
