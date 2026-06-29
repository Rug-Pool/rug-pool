// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/MemberRegistry.sol";
import "../src/CoinFactory.sol";
import "../src/RugToken.sol";

contract CoinFactoryTest is Test {
    MemberRegistry public registry;
    CoinFactory public factory;
    address public owner = address(0x1);
    address public user = address(0x2);
    address public nonOwner = address(0x3);

    uint256 public constant REG_FEE = 0.5 ether;
    uint256 public constant VERIFIED_FEE = 10 ether;

    function setUp() public {
        vm.prank(owner);
        registry = new MemberRegistry();

        vm.deal(user, REG_FEE);
        vm.prank(user);
        registry.register{value: REG_FEE}();

        vm.prank(owner);
        factory = new CoinFactory(address(registry));
    }

    function test_LaunchCoinAsRegisteredMember() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        factory.launchCoin("Test", "TST", "desc", "img.jpg", 0.001 ether, 1_000_000 ether, 50, false);
        assertEq(factory.totalCoins(), 1);
    }

    function test_RevertWhen_LaunchCoinAsUnregistered() public {
        vm.prank(nonOwner);
        vm.expectRevert("Not registered");
        factory.launchCoin("Test", "TST", "desc", "img.jpg", 0.001 ether, 1_000_000 ether, 50, false);
    }

    function test_RevertWhen_InvalidFlipConfig() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        vm.expectRevert("Invalid flip config");
        factory.launchCoin("Test", "TST", "desc", "img.jpg", 0.001 ether, 1_000_000 ether, 99, false);
    }

    function test_LaunchVerifiedCoinWithCorrectFee() public {
        vm.deal(user, VERIFIED_FEE);
        vm.prank(user);
        factory.launchCoin{value: VERIFIED_FEE}("Verified", "VRF", "desc", "img.jpg", 0.001 ether, 1_000_000 ether, 50, true);
        address tokenAddr = factory.allCoins(0);
        CoinFactory.CoinInfo memory coin = factory.getCoin(tokenAddr);
        assertTrue(coin.isVerified);
    }

    function test_RevertWhen_LaunchVerifiedCoinWithWrongFee() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        vm.expectRevert("Insufficient verified fee");
        factory.launchCoin{value: 1 ether}("Verified", "VRF", "desc", "img.jpg", 0.001 ether, 1_000_000 ether, 50, true);
    }

    function test_GetCoinReturnsCorrectInfo() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        factory.launchCoin("Test", "TST", "desc", "img.jpg", 0.001 ether, 1_000_000 ether, 50, false);
        address tokenAddr = factory.allCoins(0);
        CoinFactory.CoinInfo memory coin = factory.getCoin(tokenAddr);
        assertEq(coin.name, "Test");
        assertEq(coin.ticker, "TST");
        assertEq(coin.description, "desc");
        assertEq(coin.imageUrl, "img.jpg");
        assertEq(coin.initialPrice, 0.001 ether);
        assertEq(coin.maxSupply, 1_000_000 ether);
        assertEq(coin.flipConfig, 50);
        assertFalse(coin.isVerified);
        assertEq(coin.creator, user);
        assertEq(coin.tokenAddress, tokenAddr);
    }

    function test_GetAllCoinsIncludesNewCoin() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        factory.launchCoin("Test", "TST", "desc", "img.jpg", 0.001 ether, 1_000_000 ether, 50, false);
        address[] memory all = factory.getAllCoins();
        assertEq(all.length, 1);
        assertTrue(all[0] != address(0));
    }

    function test_GetCreatorCoinsIncludesNewCoin() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        factory.launchCoin("Test", "TST", "desc", "img.jpg", 0.001 ether, 1_000_000 ether, 50, false);
        address[] memory creators = factory.getCreatorCoins(user);
        assertEq(creators.length, 1);
        assertTrue(creators[0] != address(0));
    }

    function test_TotalCoinsIncrements() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        factory.launchCoin("Test", "TST", "desc", "img.jpg", 0.001 ether, 1_000_000 ether, 50, false);
        assertEq(factory.totalCoins(), 1);
    }

    function test_CoinLaunchedEvent() public {
        vm.deal(user, 1 ether);
        address expectedTokenAddr = vm.computeCreateAddress(address(factory), vm.getNonce(address(factory)));
        vm.prank(user);
        vm.expectEmit(true, true, true, true);
        emit CoinFactory.CoinLaunched(expectedTokenAddr, user, "Test", "TST", false, 50, block.timestamp);
        factory.launchCoin("Test", "TST", "desc", "img.jpg", 0.001 ether, 1_000_000 ether, 50, false);
    }

    function test_WithdrawFeesByOwner() public {
        vm.deal(user, VERIFIED_FEE);
        vm.prank(user);
        factory.launchCoin{value: VERIFIED_FEE}("V", "V", "d", "i", 0, 1 ether, 50, true);
        uint256 balanceBefore = address(owner).balance;
        vm.prank(owner);
        factory.withdrawFees(payable(owner));
        assertEq(address(factory).balance, 0);
        assertEq(address(owner).balance, balanceBefore + VERIFIED_FEE);
    }

    function test_UpdateVerifiedFeeByOwner() public {
        vm.prank(owner);
        factory.updateVerifiedFee(20 ether);
        assertEq(factory.verifiedBadgeFee(), 20 ether);
    }
}
