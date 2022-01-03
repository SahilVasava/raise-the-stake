//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RaiseTheStake is ReentrancyGuard, Ownable {
    enum GoalStatus {
        InProgress,
        Completed,
        Failed
    }

    struct Goal {
        string goal;
        uint256 stake;
        uint256 deadline;
        address supervisor;
        GoalStatus status;
    }

    uint256 public contractFeePercent = 10; // 10% of the stake value is taken as a fee if failed
    uint256 public minimumStake = 0.5 ether;
    mapping(address => Goal[]) public goals;

    event GoalCreated(
        address indexed _goalCreator,
        string _goal,
        uint256 _stake,
        uint256 _deadline,
        address indexed _supervisor
    );

    event GoalCompleted(
        address indexed _goalCreator,
        string _goal,
        uint256 _stake,
        uint256 _deadline,
        address indexed _supervisor
    );

    event StakeClaimed(
        address indexed _goalCreator,
        string _goal,
        uint256 _stake,
        uint256 _deadline,
        address indexed _supervisor
    );

    function createGoal(
        string memory _goal,
        uint256 _deadline,
        address _supervisor
    ) public payable {
        require(msg.value >= minimumStake, "Stake is too low");
        require(_supervisor != address(0), "Supervisor is not set");
        Goal memory g = Goal(
            _goal,
            msg.value,
            _deadline,
            _supervisor,
            GoalStatus.InProgress
        );
        goals[msg.sender].push(g);
        emit GoalCreated(msg.sender, _goal, msg.value, _deadline, _supervisor);
    }

    function completeGoal(uint256 _index) public nonReentrant {
        require(goals[msg.sender].length > _index, "Goal does not exist");
        Goal storage g = goals[msg.sender][_index];
        require(g.status == GoalStatus.InProgress);
        require(g.deadline > block.timestamp);
        g.status = GoalStatus.Completed;
        payable(msg.sender).transfer(g.stake);
        emit GoalCompleted(
            msg.sender,
            g.goal,
            g.stake,
            g.deadline,
            g.supervisor
        );
    }

    function claimStake(uint256 _index, address goalCreator)
        public
        nonReentrant
    {
        Goal storage g = goals[goalCreator][_index];

        require(
            g.supervisor == msg.sender,
            "You are not the supervisor of this goal"
        );

        if (g.status == GoalStatus.Completed) {
            revert("Goal already completed");
        } else if (g.status == GoalStatus.Failed) {
            revert("Goal failed and stake already claimed");
        }

        require(
            block.timestamp > g.deadline,
            "There's still time left to complete to goal"
        );

        g.status = GoalStatus.Failed;

        uint256 stakeToTransfer = g.stake -
            (g.stake * contractFeePercent) /
            100;
        payable(msg.sender).transfer(stakeToTransfer);
        emit StakeClaimed(goalCreator, g.goal, g.stake, g.deadline, msg.sender);
    }

    function changeMinimumStake(uint256 _newMinimumStake) public onlyOwner {
        require(_newMinimumStake > 0, "Minimum stake must be greater than 0");
        minimumStake = _newMinimumStake;
    }

    function changeContractFeePercent(uint256 _newContractFeePercent)
        public
        onlyOwner
    {
        contractFeePercent = _newContractFeePercent;
    }

    receive() external payable {}
}
