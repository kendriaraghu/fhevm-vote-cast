import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

interface FHEVoteCastTaskArgs {
  action: string;
  surveyId?: string;
  title?: string;
  description?: string;
  surveyType?: string;
  startTime?: string;
  endTime?: string;
  score?: string;
  user?: string;
}

task("fheVoteCast", "Interact with FHEVoteCast contract")
  .addParam("action", "Action to perform: create, start, end, vote, stats, info")
  .addOptionalParam("surveyId", "Survey ID")
  .addOptionalParam("title", "Survey title")
  .addOptionalParam("description", "Survey description")
  .addOptionalParam("surveyType", "Survey type: 0=STAR_5, 1=SCORE_10, 2=GRADE_ABC")
  .addOptionalParam("startTime", "Start time (Unix timestamp)")
  .addOptionalParam("endTime", "End time (Unix timestamp)")
  .addOptionalParam("score", "Vote score")
  .addOptionalParam("user", "User address")
  .setAction(async (taskArgs: FHEVoteCastTaskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;
    const [deployer] = await ethers.getSigners();

    // Get contract instance
    const deployment = await deployments.get("FHEVoteCast");
    const fheVoteCast = await ethers.getContractAt("FHEVoteCast", deployment.address);

    console.log(`Using FHEVoteCast at: ${deployment.address}`);
    console.log(`Using account: ${deployer.address}`);

    try {
      switch (taskArgs.action) {
        case "create": {
          if (!taskArgs.title || !taskArgs.description || !taskArgs.surveyType || !taskArgs.startTime || !taskArgs.endTime) {
            throw new Error("Missing required parameters: title, description, surveyType, startTime, endTime");
          }

          const surveyType = parseInt(taskArgs.surveyType);
          const startTime = parseInt(taskArgs.startTime);
          const endTime = parseInt(taskArgs.endTime);

          console.log("Creating survey...");
          const tx = await fheVoteCast.createSurvey(
            taskArgs.title,
            taskArgs.description,
            surveyType,
            startTime,
            endTime
          );

          const receipt = await tx.wait();
          console.log(`Survey created! Transaction hash: ${receipt?.hash}`);

          // Get the survey ID from the event
          const event = receipt?.logs.find(log => {
            try {
              const parsed = fheVoteCast.interface.parseLog(log);
              return parsed?.name === "SurveyCreated";
            } catch {
              return false;
            }
          });

          if (event) {
            const parsed = fheVoteCast.interface.parseLog(event);
            console.log(`Survey ID: ${parsed?.args.surveyId}`);
          }
          break;
        }

        case "start": {
          if (!taskArgs.surveyId) {
            throw new Error("Missing required parameter: surveyId");
          }

          const surveyId = parseInt(taskArgs.surveyId);
          console.log(`Starting survey ${surveyId}...`);
          
          const tx = await fheVoteCast.startSurvey(surveyId);
          const receipt = await tx.wait();
          console.log(`Survey started! Transaction hash: ${receipt?.hash}`);
          break;
        }

        case "end": {
          if (!taskArgs.surveyId) {
            throw new Error("Missing required parameter: surveyId");
          }

          const surveyId = parseInt(taskArgs.surveyId);
          console.log(`Ending survey ${surveyId}...`);
          
          const tx = await fheVoteCast.endSurvey(surveyId);
          const receipt = await tx.wait();
          console.log(`Survey ended! Transaction hash: ${receipt?.hash}`);
          break;
        }

        case "vote": {
          if (!taskArgs.surveyId || !taskArgs.score) {
            throw new Error("Missing required parameters: surveyId, score");
          }

          const surveyId = parseInt(taskArgs.surveyId);
          const score = parseInt(taskArgs.score);

          console.log(`Voting on survey ${surveyId} with score ${score}...`);
          
          // Note: This is a simplified example. In a real implementation,
          // you would need to create encrypted input using FHEVM SDK
          console.log("Note: Voting requires encrypted input. Use the frontend for actual voting.");
          break;
        }

        case "stats": {
          if (!taskArgs.surveyId) {
            throw new Error("Missing required parameter: surveyId");
          }

          const surveyId = parseInt(taskArgs.surveyId);
          console.log(`Getting stats for survey ${surveyId}...`);
          
          const stats = await fheVoteCast.getSurveyStats(surveyId);
          console.log("Encrypted statistics:");
          console.log(`Total responses handle: ${stats.totalResponses}`);
          console.log(`Average score handle: ${stats.averageScore}`);
          break;
        }

        case "info": {
          if (!taskArgs.surveyId) {
            throw new Error("Missing required parameter: surveyId");
          }

          const surveyId = parseInt(taskArgs.surveyId);
          console.log(`Getting info for survey ${surveyId}...`);
          
          const info = await fheVoteCast.getSurveyInfo(surveyId);
          console.log("Survey information:");
          console.log(`Title: ${info.title}`);
          console.log(`Description: ${info.description}`);
          console.log(`Type: ${info.surveyType}`);
          console.log(`Creator: ${info.creator}`);
          console.log(`Start time: ${new Date(Number(info.startTime) * 1000).toISOString()}`);
          console.log(`End time: ${new Date(Number(info.endTime) * 1000).toISOString()}`);
          console.log(`Status: ${info.status}`);
          break;
        }

        case "list": {
          console.log("Listing user surveys...");
          const surveys = await fheVoteCast.getUserSurveys(deployer.address);
          console.log(`User surveys: ${surveys.join(", ")}`);

          console.log("Listing user participations...");
          const participations = await fheVoteCast.getUserParticipations(deployer.address);
          console.log(`User participations: ${participations.join(", ")}`);
          break;
        }

        default:
          throw new Error(`Unknown action: ${taskArgs.action}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

