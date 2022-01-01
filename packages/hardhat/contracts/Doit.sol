//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Doit {
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

    mapping(address => Goal[]) public goals;

    function createGoal(
        string memory _goal,
        uint256 _deadline,
        address _supervisor
    ) public payable {
        Goal memory g = Goal(
            _goal,
            msg.value,
            _deadline,
            _supervisor,
            GoalStatus.InProgress
        );
        goals[msg.sender].push(g);
    }

    function completeGoal(uint256 _index) public {
        require(goals[msg.sender].length > _index, "Goal does not exist");
        Goal storage g = goals[msg.sender][_index];
        require(g.status == GoalStatus.InProgress);
        require(g.deadline > block.timestamp);
        g.status = GoalStatus.Completed;
        payable(msg.sender).transfer(g.stake);
    }

    function claimStake(uint256 _index, address goalCreator) public {
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
        payable(msg.sender).transfer(g.stake);
    }

    function getBlockTimestamp() public view returns (uint256) {
        return block.timestamp;
    }
}
