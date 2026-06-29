// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/VRFConsumer.sol";
import "./mocks/MockPythEntropy.sol";

contract MockRugPool {
    VRFConsumer public vrf;

    constructor(VRFConsumer _vrf) {
        vrf = _vrf;
    }

    function requestRandomness(address coinAddress, uint256 cycleNumber, bytes32 userRandom) external payable {
        vrf.requestRandomness{value: msg.value}(coinAddress, cycleNumber, userRandom);
    }

    function onRandomnessFulfilled(address, uint256, bytes32) external {}
}

contract VRFConsumerTest is Test {
    VRFConsumer public vrf;
    MockPythEntropy public mockEntropy;
    MockRugPool public mockRugPool;
    address public owner = address(0x1);
    address public nonOwner = address(0x2);

    bytes32 public constant SEED = keccak256("seed");
    address public constant WALLET_A = address(0xA);
    address public constant WALLET_B = address(0xB);
    uint256 public constant CYCLE = 1;

    function setUp() public {
        mockEntropy = new MockPythEntropy();
        vm.prank(owner);
        vrf = new VRFConsumer(address(mockEntropy), address(0x99));
        mockRugPool = new MockRugPool(vrf);
    }

    // --- deriveOutcome tests ---

    function test_DeriveOutcomeConsistent() public {
        bool r1 = vrf.deriveOutcome(SEED, WALLET_A, CYCLE, 50);
        bool r2 = vrf.deriveOutcome(SEED, WALLET_A, CYCLE, 50);
        assertEq(r1, r2);
    }

    function test_DeriveOutcomeDifferentWallets() public {
        bool r0 = vrf.deriveOutcome(SEED, address(uint160(0)), CYCLE, 50);
        bool allSame = true;
        for (uint256 i = 1; i < 50; i++) {
            if (vrf.deriveOutcome(SEED, address(uint160(i)), CYCLE, 50) != r0) {
                allSame = false;
                break;
            }
        }
        assertFalse(allSame, "All 50 wallets got same outcome");
    }

    function test_DeriveOutcomeDistribution33() public {
        uint256 heads;
        for (uint256 i = 0; i < 1000; i++) {
            address wallet = address(uint160(i));
            if (vrf.deriveOutcome(SEED, wallet, CYCLE, 33)) {
                heads++;
            }
        }
        assertTrue(heads > 200, "Too few heads");
        assertTrue(heads < 460, "Too many heads");
    }

    function test_DeriveOutcomeDistribution50() public {
        uint256 heads;
        for (uint256 i = 0; i < 1000; i++) {
            address wallet = address(uint160(i + 1000));
            if (vrf.deriveOutcome(SEED, wallet, CYCLE, 50)) {
                heads++;
            }
        }
        assertTrue(heads > 400, "Too few heads");
        assertTrue(heads < 600, "Too many heads");
    }

    // --- access control tests ---

    function test_RevertWhen_RequestRandomnessNotRugPool() public {
        bytes32 userRandom = keccak256("random");
        vm.prank(nonOwner);
        vm.expectRevert("Only rug pool");
        vrf.requestRandomness(address(0xCAFE), 1, userRandom);
    }

    // --- getCycleSeed tests ---

    function test_GetCycleSeedZeroBeforeFulfillment() public {
        bytes32 seed = vrf.getCycleSeed(address(0xCAFE), 1);
        assertEq(seed, bytes32(0));
    }

    // --- setRugPool tests ---

    function test_SetRugPoolByOwner() public {
        vm.prank(owner);
        vrf.setRugPool(address(0xCAFE));
        assertEq(vrf.rugPool(), address(0xCAFE));
    }

    function test_RevertWhen_SetRugPoolByNonOwner() public {
        vm.prank(nonOwner);
        vm.expectRevert();
        vrf.setRugPool(address(0xCAFE));
    }
}
