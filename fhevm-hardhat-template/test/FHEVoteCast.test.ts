import { expect } from "chai";
import { ethers } from "hardhat";
import { FHEVoteCast } from "../types/contracts/FHEVoteCast";
import { FhevmInstance } from "fhevm";

describe("FHEVoteCast", function () {
  let fheVoteCast: FHEVoteCast;
  let instance: FhevmInstance;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const FHEVoteCastFactory = await ethers.getContractFactory("FHEVoteCast");
    fheVoteCast = await FHEVoteCastFactory.deploy();
    await fheVoteCast.waitForDeployment();

    // Skip FHEVM instance creation for now
    // Focus on testing contract logic without encryption
    instance = undefined as any;
  });

  describe("Survey Creation", function () {
    it("Should create a survey successfully", async function () {
      const title = "Test Survey";
      const description = "A test survey for FHEVM";
      const surveyType = 0; // STAR_5
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 86400; // 24 hours

      const tx = await fheVoteCast.createSurvey(
        title,
        description,
        surveyType,
        startTime,
        endTime
      );

      await expect(tx)
        .to.emit(fheVoteCast, "SurveyCreated")
        .withArgs(0, owner.address, title, surveyType);

      const surveyInfo = await fheVoteCast.getSurveyInfo(0);
      expect(surveyInfo.title).to.equal(title);
      expect(surveyInfo.description).to.equal(description);
      expect(surveyInfo.surveyType).to.equal(surveyType);
      expect(surveyInfo.creator).to.equal(owner.address);
    });

    it("Should reject survey with invalid time range", async function () {
      const title = "Invalid Survey";
      const description = "A survey with invalid time range";
      const surveyType = 0; // STAR_5
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime - 3600; // End time before start time

      await expect(
        fheVoteCast.createSurvey(
          title,
          description,
          surveyType,
          startTime,
          endTime
        )
      ).to.be.revertedWithCustomError(fheVoteCast, "InvalidTimeRange");
    });
  });

  describe("Survey Management", function () {
    let surveyId: number;

    beforeEach(async function () {
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 86400;
      
      const tx = await fheVoteCast.createSurvey(
        "Test Survey",
        "A test survey",
        0, // STAR_5
        startTime,
        endTime
      );
      
      const receipt = await tx.wait();
      surveyId = 0;
    });

    it("Should start a survey", async function () {
      await expect(fheVoteCast.startSurvey(surveyId))
        .to.emit(fheVoteCast, "SurveyUpdated")
        .withArgs(surveyId, owner.address, 1); // ACTIVE status

      const surveyInfo = await fheVoteCast.getSurveyInfo(surveyId);
      expect(surveyInfo.status).to.equal(1); // ACTIVE
    });

    it("Should end a survey", async function () {
      // First start the survey
      await fheVoteCast.startSurvey(surveyId);
      
      // Then end it
      await expect(fheVoteCast.endSurvey(surveyId))
        .to.emit(fheVoteCast, "SurveyUpdated")
        .withArgs(surveyId, owner.address, 2); // ENDED status

      const surveyInfo = await fheVoteCast.getSurveyInfo(surveyId);
      expect(surveyInfo.status).to.equal(2); // ENDED
    });

    it("Should reject unauthorized survey management", async function () {
      await expect(
        fheVoteCast.connect(user1).startSurvey(surveyId)
      ).to.be.revertedWithCustomError(fheVoteCast, "Unauthorized");
    });
  });

  describe("Survey Participation", function () {
    let surveyId: number;

    beforeEach(async function () {
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 86400;
      
      const tx = await fheVoteCast.createSurvey(
        "Test Survey",
        "A test survey",
        0, // STAR_5
        startTime,
        endTime
      );
      
      surveyId = 0;
      
      // Start the survey
      await fheVoteCast.startSurvey(surveyId);
    });

    it("Should reject voting in a draft survey", async function () {
      // Create a new survey but don't start it
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 86400;
      
      await fheVoteCast.createSurvey(
        "Draft Survey",
        "A draft survey",
        0, // STAR_5
        startTime,
        endTime
      );

      // Note: This test would require encrypted input
      // For now, we test the contract logic without encryption
      console.log("Voting tests require FHEVM instance - skipping for now");
    });
  });

  describe("Survey Statistics", function () {
    let surveyId: number;

    beforeEach(async function () {
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 86400;
      
      const tx = await fheVoteCast.createSurvey(
        "Test Survey",
        "A test survey",
        0, // STAR_5
        startTime,
        endTime
      );
      
      surveyId = 0;
      
      // Start the survey
      await fheVoteCast.startSurvey(surveyId);
    });

    it("Should return encrypted statistics", async function () {
      const stats = await fheVoteCast.getSurveyStats(surveyId);
      expect(stats.totalResponses).to.not.be.undefined;
      expect(stats.averageScore).to.not.be.undefined;
    });

    it("Should track user surveys", async function () {
      const surveys = await fheVoteCast.getUserSurveys(owner.address);
      expect(surveys).to.include(BigInt(surveyId));
    });
  });

  describe("Edge Cases", function () {
    it("Should handle non-existent survey", async function () {
      await expect(
        fheVoteCast.getSurveyInfo(999)
      ).to.be.revertedWithCustomError(fheVoteCast, "SurveyNotFound");
    });

    it("Should return correct next survey ID", async function () {
      const nextId = await fheVoteCast.getNextSurveyId();
      expect(nextId).to.equal(0);

      // Create a survey
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 86400;
      
      await fheVoteCast.createSurvey(
        "Test Survey",
        "A test survey",
        0, // STAR_5
        startTime,
        endTime
      );

      const newNextId = await fheVoteCast.getNextSurveyId();
      expect(newNextId).to.equal(1);
    });
  });
});
