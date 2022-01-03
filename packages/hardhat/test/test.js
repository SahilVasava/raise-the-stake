const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RaiseTheStake", () => {
  let RaiseTheStakeFactory, rts, goalCreator, supervisor, randomUser;
  beforeEach(async () => {
    [goalCreator, supervisor, randomUser] = await ethers.getSigners();
    RaiseTheStakeFactory = await ethers.getContractFactory("RaiseTheStake");
    rts = await RaiseTheStakeFactory.deploy();
    await rts.deployed();
  });

  it("should try to create a Goal and fail because of low stake value", async () => {
    let today = new Date();
    today.setDate(today.getDate() + 1);
    let dealine = Math.floor(today.getTime() / 1000);
    await expect(
      rts
        .connect(goalCreator)
        .createGoal("Dummy goal", dealine, supervisor.address, {
          value: ethers.utils.parseEther("0.4"),
        })
    ).to.be.revertedWith("Stake is too low");
  });

  it("should create a Goal", async () => {
    let today = new Date();
    today.setDate(today.getDate() + 1);
    let dealine = Math.floor(today.getTime() / 1000);
    await rts
      .connect(goalCreator)
      .createGoal("Dummy goal", dealine, supervisor.address, {
        value: ethers.utils.parseEther("1"),
      });

    rts.on("GoalCreated", console.log);

    const goal = await rts.goals(goalCreator.address, 0);
    expect(goal.goal).to.equal("Dummy goal");

    /* Code to test GoalCreated Event */
    /* Uncomment to test */
    // function timeout(ms) {
    //   return new Promise((resolve) => setTimeout(resolve, ms));
    // }
    // await timeout(5000);
  });

  it("should mark a Goal as complete and transfer stake back to goal creator", async () => {
    let today = new Date();
    today.setDate(today.getDate() + 1);
    let dealine = Math.floor(today.getTime() / 1000);
    const stake = ethers.utils.parseEther("1");
    await rts
      .connect(goalCreator)
      .createGoal("Dummy goal", dealine, supervisor.address, {
        value: stake,
      });

    await expect(
      await rts.connect(goalCreator).completeGoal(0)
    ).to.changeEtherBalance(goalCreator, stake);
    const goal = await rts.goals(goalCreator.address, 0);
    expect(goal.status).to.equal(1);

    /* Code to test GoalCompleted Event */
    /* Uncomment to test */
    // function timeout(ms) {
    //   return new Promise((resolve) => setTimeout(resolve, ms));
    // }
    // await timeout(5000);
  });

  it("should call claimStake and fail because the claimer is not supervisor", async () => {
    let today = new Date();
    today.setDate(today.getDate() + 1);
    let dealine = Math.floor(today.getTime() / 1000);
    await rts
      .connect(goalCreator)
      .createGoal("Dummy goal", dealine, supervisor.address, {
        value: ethers.utils.parseEther("1"),
      });

    await expect(
      rts.connect(randomUser).claimStake(0, goalCreator.address)
    ).to.be.revertedWith("You are not the supervisor of this goal");
  });

  it("should call claimStake and fail because the goal is completed", async () => {
    let today = new Date();
    today.setDate(today.getDate() + 1);
    let dealine = Math.floor(today.getTime() / 1000);
    await rts
      .connect(goalCreator)
      .createGoal("Dummy goal", dealine, supervisor.address, {
        value: ethers.utils.parseEther("1"),
      });

    await rts.connect(goalCreator).completeGoal(0);

    await expect(
      rts.connect(supervisor).claimStake(0, goalCreator.address)
    ).to.be.revertedWith("Goal already completed");
  });

  it("should call claimStake and fail because the deadline is yet not reached", async () => {
    let today = new Date();
    today.setDate(today.getDate() + 1);
    let dealine = Math.floor(today.getTime() / 1000);
    await rts
      .connect(goalCreator)
      .createGoal("Dummy goal", dealine, supervisor.address, {
        value: ethers.utils.parseEther("1"),
      });

    await expect(
      rts.connect(supervisor).claimStake(0, goalCreator.address)
    ).to.be.revertedWith("There's still time left to complete to goal");
  });

  it("should call claimStake and transfer staked amount to supervisor", async () => {
    let today = new Date();

    // today.setTime(today.getTime() + 1000 * 0);
    let dealine = Math.floor(today.getTime() / 1000);
    const stake = ethers.utils.parseEther("1");
    await rts
      .connect(goalCreator)
      .createGoal("Dummy goal", dealine, supervisor.address, {
        value: stake,
      });

    const stakeToBeReturned = stake.sub(stake.mul(10).div(100));
    await expect(
      await rts.connect(supervisor).claimStake(0, goalCreator.address)
    ).to.changeEtherBalance(supervisor, stakeToBeReturned);

    /* Code to test StakeClaimed Event */
    /* Uncomment to test */
    // function timeout(ms) {
    //   return new Promise((resolve) => setTimeout(resolve, ms));
    // }
    // await timeout(5000);
  });

  it("should call claimStake and fail because stake already claimed", async () => {
    let today = new Date();

    let dealine = Math.floor(today.getTime() / 1000);
    await rts
      .connect(goalCreator)
      .createGoal("Dummy goal", dealine, supervisor.address, {
        value: ethers.utils.parseEther("1"),
      });
    await rts.connect(supervisor).claimStake(0, goalCreator.address);
    await expect(
      rts.connect(supervisor).claimStake(0, goalCreator.address)
    ).to.be.revertedWith("Goal failed and stake already claimed");
  });

  it("should call changeMinimumStake and fail because the caller is not the owner", async () => {
    await expect(
      rts.connect(supervisor).changeMinimumStake(ethers.utils.parseEther("0.5"))
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should call changeMinimumStake and fail because the stake was set to zero", async () => {
    await expect(
      rts.changeMinimumStake(ethers.utils.parseEther("0"))
    ).to.be.revertedWith("Minimum stake must be greater than 0");
  });

  it("should call changeMinimumStake and pass", async () => {
    await rts.changeMinimumStake(ethers.utils.parseEther("0.7"));
    expect(await rts.minimumStake()).to.equal(ethers.utils.parseEther("0.7"));
  });

  it("should call changeContractFeePercent", async () => {
    await rts.changeContractFeePercent(20);
    expect(await rts.contractFeePercent()).to.equal(20);
  });
});
