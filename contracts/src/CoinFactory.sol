// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MemberRegistry.sol";
import "./RugToken.sol";

interface IRugPool {
    function registerCoin(address tokenAddress, address creator, uint8 flipConfig, uint256 initialPoolValue) external;
}

contract CoinFactory is Ownable {
    struct CoinInfo {
        address tokenAddress;
        address creator;
        string name;
        string ticker;
        string description;
        string imageUrl;
        uint256 initialPrice;
        uint256 maxSupply;
        uint256 launchTime;
        bool isVerified;
        uint8 flipConfig;
    }

    mapping(address => CoinInfo) public coins;
    mapping(address => address[]) public creatorCoins;
    address[] public allCoins;
    address public memberRegistry;
    address public rugPool;
    uint256 public verifiedBadgeFee = 10 ether;

    event CoinLaunched(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string ticker,
        bool isVerified,
        uint8 flipConfig,
        uint256 timestamp
    );

    constructor(address _memberRegistry) Ownable(msg.sender) {
        memberRegistry = _memberRegistry;
    }

    function launchCoin(
        string calldata name,
        string calldata ticker,
        string calldata description,
        string calldata imageUrl,
        uint256 initialPrice,
        uint256 maxSupply,
        uint8 flipConfig,
        bool wantsVerified
    ) external payable {
        require(MemberRegistry(memberRegistry).isRegistered(msg.sender), "Not registered");
        require(
            flipConfig == 33 || flipConfig == 50 || flipConfig == 70 || flipConfig == 80,
            "Invalid flip config"
        );

        if (wantsVerified) {
            require(msg.value >= verifiedBadgeFee, "Insufficient verified fee");
        }

        RugToken token = new RugToken(name, ticker, maxSupply, address(this));
        address tokenAddress = address(token);

        coins[tokenAddress] = CoinInfo({
            tokenAddress: tokenAddress,
            creator: msg.sender,
            name: name,
            ticker: ticker,
            description: description,
            imageUrl: imageUrl,
            initialPrice: initialPrice,
            maxSupply: maxSupply,
            launchTime: block.timestamp,
            isVerified: wantsVerified,
            flipConfig: flipConfig
        });

        allCoins.push(tokenAddress);
        creatorCoins[msg.sender].push(tokenAddress);

        if (rugPool != address(0)) {
            uint256 initialPoolValue = (initialPrice * maxSupply) / 1e18;
            IRugPool(rugPool).registerCoin(tokenAddress, msg.sender, flipConfig, initialPoolValue);
            RugToken(tokenAddress).transfer(rugPool, maxSupply);
        }

        emit CoinLaunched(
            tokenAddress,
            msg.sender,
            name,
            ticker,
            wantsVerified,
            flipConfig,
            block.timestamp
        );
    }

    function launchCoinFor(
        address creator,
        string calldata name,
        string calldata ticker,
        string calldata description,
        string calldata imageUrl,
        uint256 initialPrice,
        uint256 maxSupply,
        uint8 flipConfig,
        bool wantsVerified
    ) external payable onlyOwner {
        require(MemberRegistry(memberRegistry).isRegistered(creator), "Creator not registered");
        require(
            flipConfig == 33 || flipConfig == 50 || flipConfig == 70 || flipConfig == 80,
            "Invalid flip config"
        );

        if (wantsVerified) {
            require(msg.value >= verifiedBadgeFee, "Insufficient verified fee");
        }

        RugToken token = new RugToken(name, ticker, maxSupply, address(this));
        address tokenAddress = address(token);

        coins[tokenAddress] = CoinInfo({
            tokenAddress: tokenAddress,
            creator: creator,
            name: name,
            ticker: ticker,
            description: description,
            imageUrl: imageUrl,
            initialPrice: initialPrice,
            maxSupply: maxSupply,
            launchTime: block.timestamp,
            isVerified: wantsVerified,
            flipConfig: flipConfig
        });

        allCoins.push(tokenAddress);
        creatorCoins[creator].push(tokenAddress);

        if (rugPool != address(0)) {
            uint256 initialPoolValue = (initialPrice * maxSupply) / 1e18;
            IRugPool(rugPool).registerCoin(tokenAddress, creator, flipConfig, initialPoolValue);
            RugToken(tokenAddress).transfer(rugPool, maxSupply);
        }

        emit CoinLaunched(
            tokenAddress,
            creator,
            name,
            ticker,
            wantsVerified,
            flipConfig,
            block.timestamp
        );
    }

    function getCoin(address tokenAddress) external view returns (CoinInfo memory) {
        return coins[tokenAddress];
    }

    function getAllCoins() external view returns (address[] memory) {
        return allCoins;
    }

    function getCreatorCoins(address creator) external view returns (address[] memory) {
        return creatorCoins[creator];
    }

    function totalCoins() external view returns (uint256) {
        return allCoins.length;
    }

    function setRugPool(address _rugPool) external onlyOwner {
        rugPool = _rugPool;
    }

    function updateVerifiedFee(uint256 newFee) external onlyOwner {
        verifiedBadgeFee = newFee;
    }

    function withdrawFees(address payable to) external onlyOwner {
        (bool success, ) = to.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}
