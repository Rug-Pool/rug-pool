// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IPythEntropy {
    function request(address provider, bytes32 userCommitment, bool useBlockhash) external payable returns (uint64 sequenceNumber);
    function reveal(address provider, uint64 sequenceNumber, bytes32 userRandom, bytes32 providerRandom) external returns (bytes32 randomNumber);
    function getFee(address provider) external view returns (uint256 fee);
}

interface IRugPool {
    function onRandomnessFulfilled(address coinAddress, uint256 cycleNumber, bytes32 seed) external;
}

contract VRFConsumer is Ownable {
    address public entropy;
    address public entropyProvider;
    address public rugPool;

    struct RandomRequest {
        address coinAddress;
        uint256 cycleNumber;
        uint64 sequenceNumber;
        bytes32 userRandom;
        bool fulfilled;
        bytes32 result;
    }

    mapping(uint64 => RandomRequest) public requests;
    mapping(address => mapping(uint256 => bytes32)) public cycleSeeds;

    event RandomnessRequested(address indexed coinAddress, uint256 cycleNumber, uint64 sequenceNumber);
    event RandomnessFulfilled(address indexed coinAddress, uint256 cycleNumber, bytes32 seed);

    constructor(address _entropy, address _entropyProvider) Ownable(msg.sender) {
        entropy = _entropy;
        entropyProvider = _entropyProvider;
    }

    function requestRandomness(
        address coinAddress,
        uint256 cycleNumber,
        bytes32 userRandom
    ) external payable returns (uint64 sequenceNumber) {
        require(msg.sender == rugPool, "Only rug pool");
        uint256 fee = IPythEntropy(entropy).getFee(entropyProvider);
        require(msg.value >= fee, "Insufficient fee");

        sequenceNumber = IPythEntropy(entropy).request{value: fee}(entropyProvider, userRandom, false);

        requests[sequenceNumber] = RandomRequest({
            coinAddress: coinAddress,
            cycleNumber: cycleNumber,
            sequenceNumber: sequenceNumber,
            userRandom: userRandom,
            fulfilled: false,
            result: bytes32(0)
        });

        emit RandomnessRequested(coinAddress, cycleNumber, sequenceNumber);
    }

    function fulfillRandomness(uint64 sequenceNumber, bytes32 providerRandom) external {
        RandomRequest storage req = requests[sequenceNumber];
        require(req.sequenceNumber == sequenceNumber, "Request not found");
        require(!req.fulfilled, "Already fulfilled");

        bytes32 randomNumber = IPythEntropy(entropy).reveal(
            entropyProvider,
            sequenceNumber,
            req.userRandom,
            providerRandom
        );

        req.result = randomNumber;
        req.fulfilled = true;
        cycleSeeds[req.coinAddress][req.cycleNumber] = randomNumber;

        IRugPool(rugPool).onRandomnessFulfilled(req.coinAddress, req.cycleNumber, randomNumber);

        emit RandomnessFulfilled(req.coinAddress, req.cycleNumber, randomNumber);
    }

    function deriveOutcome(
        bytes32 seed,
        address wallet,
        uint256 cycleNumber,
        uint8 exitProbability
    ) public pure returns (bool isHeads) {
        bytes32 hash = keccak256(abi.encodePacked(seed, wallet, cycleNumber));
        uint256 outcome = uint256(hash) % 100;
        isHeads = outcome < exitProbability;
    }

    function getCycleSeed(address coinAddress, uint256 cycleNumber) external view returns (bytes32) {
        return cycleSeeds[coinAddress][cycleNumber];
    }

    function getRequestFee() external view returns (uint256) {
        return IPythEntropy(entropy).getFee(entropyProvider);
    }

    function setRugPool(address _rugPool) external onlyOwner {
        rugPool = _rugPool;
    }

    function setEntropy(address _entropy, address _entropyProvider) external onlyOwner {
        entropy = _entropy;
        entropyProvider = _entropyProvider;
    }

    // TESTNET ONLY — directly sets seed for any coin/cycle without needing a stored request
    function manualFulfill(
        address coinAddress,
        uint256 cycleNumber,
        bytes32 manualSeed
    ) external onlyOwner {
        require(cycleSeeds[coinAddress][cycleNumber] == bytes32(0), "Already fulfilled");
        cycleSeeds[coinAddress][cycleNumber] = manualSeed;
        IRugPool(rugPool).onRandomnessFulfilled(coinAddress, cycleNumber, manualSeed);
        emit RandomnessFulfilled(coinAddress, cycleNumber, manualSeed);
    }
}
