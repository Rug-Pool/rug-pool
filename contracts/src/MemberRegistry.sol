// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MemberRegistry is Ownable {
    uint256 public registrationFee = 0.5 ether;
    mapping(address => bool) public isRegistered;
    mapping(address => uint256) public memberSince;
    uint256 public totalMembers;
    uint256 public constant MAX_FOUNDING_MEMBERS = 1000;

    event MemberRegistered(address indexed wallet, uint256 timestamp, uint256 memberNumber);

    constructor() Ownable(msg.sender) {}

    function register() external payable {
        require(!isRegistered[msg.sender], "Already registered");
        require(msg.value == registrationFee, "Incorrect fee");
        require(totalMembers < MAX_FOUNDING_MEMBERS, "Max founding members reached");

        isRegistered[msg.sender] = true;
        memberSince[msg.sender] = block.timestamp;
        totalMembers++;

        emit MemberRegistered(msg.sender, block.timestamp, totalMembers);
    }

    function registerFor(address user) external payable onlyOwner {
        require(!isRegistered[user], "Already registered");
        require(msg.value == registrationFee, "Incorrect fee");
        require(totalMembers < MAX_FOUNDING_MEMBERS, "Max founding members reached");

        isRegistered[user] = true;
        memberSince[user] = block.timestamp;
        totalMembers++;

        emit MemberRegistered(user, block.timestamp, totalMembers);
    }

    function getMemberSince(address wallet) external view returns (uint256) {
        return memberSince[wallet];
    }

    function isFounded() external view returns (bool) {
        return totalMembers >= MAX_FOUNDING_MEMBERS;
    }

    function withdrawFees(address payable to) external onlyOwner {
        (bool success, ) = to.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    function updateFee(uint256 newFee) external onlyOwner {
        registrationFee = newFee;
    }
}
