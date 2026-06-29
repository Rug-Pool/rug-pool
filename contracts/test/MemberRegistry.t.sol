// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/MemberRegistry.sol";

contract MemberRegistryTest is Test {
    MemberRegistry public registry;
    address public owner = address(0x1);
    address public user = address(0x2);
    address public nonOwner = address(0x3);

    uint256 public constant FEE = 0.5 ether;

    function setUp() public {
        vm.prank(owner);
        registry = new MemberRegistry();
    }

    function test_RegisterWithCorrectFee() public {
        vm.deal(user, FEE);
        vm.prank(user);
        registry.register{value: FEE}();
        assertTrue(registry.isRegistered(user));
    }

    function test_RevertWhen_RegisterTwice() public {
        vm.deal(user, FEE * 2);
        vm.startPrank(user);
        registry.register{value: FEE}();
        vm.expectRevert("Already registered");
        registry.register{value: FEE}();
        vm.stopPrank();
    }

    function test_RevertWhen_RegisterWithWrongFee() public {
        vm.deal(user, FEE + 1 ether);
        vm.prank(user);
        vm.expectRevert("Incorrect fee");
        registry.register{value: FEE + 0.1 ether}();
    }

    function test_IsRegisteredReturnsTrue() public {
        vm.deal(user, FEE);
        vm.prank(user);
        registry.register{value: FEE}();
        assertTrue(registry.isRegistered(user));
    }

    function test_GetMemberSinceReturnsCorrectTimestamp() public {
        vm.deal(user, FEE);
        vm.prank(user);
        vm.warp(1000);
        registry.register{value: FEE}();
        assertEq(registry.getMemberSince(user), 1000);
    }

    function test_TotalMembersIncrements() public {
        vm.deal(user, FEE);
        vm.prank(user);
        registry.register{value: FEE}();
        assertEq(registry.totalMembers(), 1);
    }

    function test_WithdrawFeesByOwner() public {
        vm.deal(user, FEE);
        vm.prank(user);
        registry.register{value: FEE}();
        uint256 balanceBefore = address(owner).balance;
        vm.prank(owner);
        registry.withdrawFees(payable(owner));
        assertEq(address(registry).balance, 0);
        assertEq(address(owner).balance, balanceBefore + FEE);
    }

    function test_RevertWhen_WithdrawFeesByNonOwner() public {
        vm.deal(user, FEE);
        vm.prank(user);
        registry.register{value: FEE}();
        vm.prank(nonOwner);
        vm.expectRevert();
        registry.withdrawFees(payable(nonOwner));
    }

    function test_UpdateFeeByOwner() public {
        vm.prank(owner);
        registry.updateFee(1 ether);
        assertEq(registry.registrationFee(), 1 ether);
    }

    function test_RevertWhen_UpdateFeeByNonOwner() public {
        vm.prank(nonOwner);
        vm.expectRevert();
        registry.updateFee(1 ether);
    }

    function test_MemberRegisteredEvent() public {
        vm.deal(user, FEE);
        vm.prank(user);
        vm.expectEmit(true, true, true, true);
        emit MemberRegistry.MemberRegistered(user, block.timestamp, 1);
        registry.register{value: FEE}();
    }
}
