const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Doit", () => {
  let DoitFactory, doit, goalCreator, supervisor, randomUser;
  beforeEach(async () => {
    [goalCreator, supervisor, randomUser] = await ethers.getSigners();
    DoitFactory = await ethers.getContractFactory("Doit");
    doit = await DoitFactory.deploy();
    await doit.deployed();
  });

  it("should create a Goal", async () => {
    let today = new Date();
    today.setDate(today.getDate() + 1);
    let dealine = Math.floor(today.getTime() / 1000);
    await doit
      .connect(goalCreator)
      .createGoal("Dummy goal", dealine, supervisor.address, {
        value: ethers.utils.parseEther("1"),
      });

    const goal = await doit.goals(goalCreator.address, 0);
    expect(goal.goal).to.equal("Dummy goal");
    console.log(goal);
  });

  it("mark a Goal as complete and transfer stake back to goal creator", async () => {
    let today = new Date();
    today.setDate(today.getDate() + 1);
    let dealine = Math.floor(today.getTime() / 1000);
    await doit
      .connect(goalCreator)
      .createGoal("Dummy goal", dealine, supervisor.address, {
        value: ethers.utils.parseEther("1"),
      });
    await expect(
      await doit.connect(goalCreator).completeGoal(0)
    ).to.changeEtherBalance(goalCreator, ethers.utils.parseEther("1"));
    const goal = await doit.goals(goalCreator.address, 0);
    expect(goal.status).to.equal(1);
    console.log(goal);
  });

  it("call claimStake and fail because the claimer is not supervisor", async () => {
    let today = new Date();
    today.setDate(today.getDate() + 1);
    let dealine = Math.floor(today.getTime() / 1000);
    await doit
      .connect(goalCreator)
      .createGoal("Dummy goal", dealine, supervisor.address, {
        value: ethers.utils.parseEther("1"),
      });

    await expect(
      doit.connect(randomUser).claimStake(0, goalCreator.address)
    ).to.be.revertedWith("You are not the supervisor of this goal");
  });

  it("call claimStake and fail because the goal is completed", async () => {
    let today = new Date();
    today.setDate(today.getDate() + 1);
    let dealine = Math.floor(today.getTime() / 1000);
    await doit
      .connect(goalCreator)
      .createGoal("Dummy goal", dealine, supervisor.address, {
        value: ethers.utils.parseEther("1"),
      });

    await doit.connect(goalCreator).completeGoal(0);

    await expect(
      doit.connect(supervisor).claimStake(0, goalCreator.address)
    ).to.be.revertedWith("Goal already completed");
  });

  it("call claimStake and fail because the deadline is yet not reached", async () => {
    let today = new Date();
    today.setDate(today.getDate() + 1);
    let dealine = Math.floor(today.getTime() / 1000);
    await doit
      .connect(goalCreator)
      .createGoal("Dummy goal", dealine, supervisor.address, {
        value: ethers.utils.parseEther("1"),
      });

    await expect(
      doit.connect(supervisor).claimStake(0, goalCreator.address)
    ).to.be.revertedWith("There's still time left to complete to goal");
  });

  it("call claimStake and transfer staked amount to supervisor", async () => {
    let today = new Date();

    // today.setTime(today.getTime() + 1000 * 0);
    let dealine = Math.floor(today.getTime() / 1000);
    await doit
      .connect(goalCreator)
      .createGoal("Dummy goal", dealine, supervisor.address, {
        value: ethers.utils.parseEther("1"),
      });
    await expect(
      await doit.connect(supervisor).claimStake(0, goalCreator.address)
    ).to.changeEtherBalance(supervisor, ethers.utils.parseEther("1"));
  });

  it("call claimStake and fail because stake already claimed", async () => {
    let today = new Date();

    let dealine = Math.floor(today.getTime() / 1000);
    await doit
      .connect(goalCreator)
      .createGoal("Dummy goal", dealine, supervisor.address, {
        value: ethers.utils.parseEther("1"),
      });
    await doit.connect(supervisor).claimStake(0, goalCreator.address);
    await expect(
      doit.connect(supervisor).claimStake(0, goalCreator.address)
    ).to.be.revertedWith("Goal failed and stake already claimed");
  });
});
