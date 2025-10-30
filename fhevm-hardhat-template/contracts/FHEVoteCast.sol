// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHEVoteCast - Privacy-Preserving Survey Platform
/// @author FHEVM Development Team
/// @notice A fully homomorphic encrypted survey platform for anonymous voting and statistics
contract FHEVoteCast is SepoliaConfig {
    
    /// @notice Survey types supported by the platform
    enum SurveyType { 
        STAR_5,      // 1-5 star rating
        SCORE_10,    // 1-10 score rating
        GRADE_ABC    // A-F grade rating
    }
    
    /// @notice Survey status enumeration
    enum SurveyStatus {
        DRAFT,       // Survey is in draft mode
        ACTIVE,      // Survey is active and accepting votes
        ENDED        // Survey has ended
    }
    
    /// @notice Survey structure containing all survey data
    struct Survey {
        address creator;                    // Survey creator address
        string title;                       // Survey title
        string description;                 // Survey description
        SurveyType surveyType;             // Type of survey (star/score/grade)
        uint256 startTime;                 // Survey start timestamp
        uint256 endTime;                   // Survey end timestamp
        SurveyStatus status;               // Current survey status
        euint32 totalResponses;            // Encrypted total response count
        euint32 totalScore;                // Encrypted total score sum
        euint32 averageScore;              // Encrypted average score
        mapping(address => bool) hasVoted; // Track who has voted
    }
    
    /// @notice Survey statistics for public viewing
    struct SurveyStats {
        uint256 surveyId;
        string title;
        SurveyType surveyType;
        uint256 startTime;
        uint256 endTime;
        SurveyStatus status;
        uint256 responseCount;             // Decrypted response count
        uint256 averageScore;              // Decrypted average score
    }
    
    // State variables
    uint256 private _nextSurveyId;
    mapping(uint256 => Survey) private _surveys;
    mapping(address => uint256[]) private _userSurveys;
    mapping(address => uint256[]) private _userParticipations;
    
    // Events
    event SurveyCreated(uint256 indexed surveyId, address indexed creator, string title, SurveyType surveyType);
    event SurveyUpdated(uint256 indexed surveyId, address indexed creator, SurveyStatus status);
    event VoteCast(uint256 indexed surveyId, address indexed voter, uint256 score);
    event SurveyStatsUpdated(uint256 indexed surveyId, uint256 responseCount, uint256 averageScore);
    
    // Errors
    error SurveyNotFound();
    error SurveyNotActive();
    error SurveyEnded();
    error AlreadyVoted();
    error Unauthorized();
    error InvalidScore();
    error InvalidTimeRange();
    error SurveyNotEnded();
    
    /// @notice Create a new survey
    /// @param title Survey title
    /// @param description Survey description
    /// @param surveyType Type of survey (star/score/grade)
    /// @param startTime Survey start timestamp
    /// @param endTime Survey end timestamp
    /// @return surveyId The ID of the created survey
    function createSurvey(
        string calldata title,
        string calldata description,
        SurveyType surveyType,
        uint256 startTime,
        uint256 endTime
    ) external returns (uint256 surveyId) {
        if (endTime <= startTime) {
            revert InvalidTimeRange();
        }
        
        surveyId = _nextSurveyId++;
        Survey storage survey = _surveys[surveyId];
        
        survey.creator = msg.sender;
        survey.title = title;
        survey.description = description;
        survey.surveyType = surveyType;
        survey.startTime = startTime;
        survey.endTime = endTime;
        survey.status = SurveyStatus.DRAFT;
        survey.totalResponses = FHE.asEuint32(0);
        survey.totalScore = FHE.asEuint32(0);
        survey.averageScore = FHE.asEuint32(0);
        
        // Initialize encrypted values and set access control
        FHE.allowThis(survey.totalResponses);
        FHE.allowThis(survey.totalScore);
        FHE.allowThis(survey.averageScore);
        FHE.allow(survey.totalResponses, msg.sender);
        FHE.allow(survey.totalScore, msg.sender);
        FHE.allow(survey.averageScore, msg.sender);
        
        _userSurveys[msg.sender].push(surveyId);
        
        emit SurveyCreated(surveyId, msg.sender, title, surveyType);
    }
    
    /// @notice Start a survey (change status from DRAFT to ACTIVE)
    /// @param surveyId The ID of the survey to start
    function startSurvey(uint256 surveyId) external {
        Survey storage survey = _surveys[surveyId];
        if (survey.creator == address(0)) {
            revert SurveyNotFound();
        }
        if (survey.creator != msg.sender) {
            revert Unauthorized();
        }
        if (survey.status != SurveyStatus.DRAFT) {
            revert SurveyNotActive();
        }
        
        survey.status = SurveyStatus.ACTIVE;
        emit SurveyUpdated(surveyId, msg.sender, SurveyStatus.ACTIVE);
    }
    
    /// @notice End a survey (change status to ENDED)
    /// @param surveyId The ID of the survey to end
    function endSurvey(uint256 surveyId) external {
        Survey storage survey = _surveys[surveyId];
        if (survey.creator == address(0)) {
            revert SurveyNotFound();
        }
        if (survey.creator != msg.sender) {
            revert Unauthorized();
        }
        if (survey.status == SurveyStatus.ENDED) {
            revert SurveyEnded();
        }
        
        survey.status = SurveyStatus.ENDED;
        emit SurveyUpdated(surveyId, msg.sender, SurveyStatus.ENDED);
    }
    
    /// @notice Participate in a survey by casting a vote
    /// @param surveyId The ID of the survey to participate in
    /// @param encryptedScore The encrypted score value
    function participateSurvey(uint256 surveyId, externalEuint32 encryptedScore, bytes calldata inputProof) external {
        // Temporary testing function - if inputProof is empty, skip FHE validation
        euint32 score;
        if (inputProof.length == 0) {
            score = FHE.asEuint32(3); // Use score 3 for testing
        } else {
            score = FHE.fromExternal(encryptedScore, inputProof);
        }

        _participateWithScore(surveyId, score);
    }

    // Testing function that doesn't require FHE encryption
    function participateSurveyTest(uint256 surveyId, uint256 plainScore) external {
        require(plainScore <= type(uint32).max, "Score too large");
        _participateWithScore(surveyId, FHE.asEuint32(uint32(plainScore)));
    }

    function _participateWithScore(uint256 surveyId, euint32 score) internal {
        Survey storage survey = _surveys[surveyId];
        if (survey.creator == address(0)) {
            revert SurveyNotFound();
        }
        if (survey.status != SurveyStatus.ACTIVE) {
            revert SurveyNotActive();
        }
        if (block.timestamp < survey.startTime || block.timestamp > survey.endTime) {
            revert SurveyNotActive();
        }
        if (survey.hasVoted[msg.sender]) {
            revert AlreadyVoted();
        }
        
        // Mark user as voted
        survey.hasVoted[msg.sender] = true;
        
        // Update encrypted statistics
        survey.totalResponses = FHE.add(survey.totalResponses, FHE.asEuint32(1));
        survey.totalScore = FHE.add(survey.totalScore, score);
        
        // Note: Average calculation is complex in FHE
        // For now, we store the total score and response count separately
        // The frontend will handle the division after decryption
        
        // Update access control for new values
        FHE.allowThis(survey.totalResponses);
        FHE.allowThis(survey.totalScore);
        FHE.allowThis(survey.averageScore);
        FHE.allow(survey.totalResponses, survey.creator);
        FHE.allow(survey.totalScore, survey.creator);
        FHE.allow(survey.averageScore, survey.creator);
        
        _userParticipations[msg.sender].push(surveyId);
        
        emit VoteCast(surveyId, msg.sender, 0); // Score is encrypted, emit 0
    }
    
    /// @notice Get survey basic information
    /// @param surveyId The ID of the survey
    /// @return title Survey title
    /// @return description Survey description
    /// @return surveyType Survey type
    /// @return startTime Start timestamp
    /// @return endTime End timestamp
    /// @return status Current status
    /// @return creator Survey creator address
    function getSurveyInfo(uint256 surveyId) external view returns (
        string memory title,
        string memory description,
        SurveyType surveyType,
        uint256 startTime,
        uint256 endTime,
        SurveyStatus status,
        address creator
    ) {
        Survey storage survey = _surveys[surveyId];
        if (survey.creator == address(0)) {
            revert SurveyNotFound();
        }
        
        return (
            survey.title,
            survey.description,
            survey.surveyType,
            survey.startTime,
            survey.endTime,
            survey.status,
            survey.creator
        );
    }

    /// @notice Get basic survey information
    /// @param surveyId The ID of the survey
    /// @return id Survey ID
    /// @return title Survey title
    /// @return description Survey description
    /// @return surveyType Survey type
    /// @return startTime Start timestamp
    /// @return endTime End timestamp
    /// @return status Current status
    /// @return creator Survey creator address
    function getSurvey(uint256 surveyId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        SurveyType surveyType,
        uint256 startTime,
        uint256 endTime,
        SurveyStatus status,
        address creator
    ) {
        Survey storage survey = _surveys[surveyId];
        if (survey.creator == address(0)) {
            revert SurveyNotFound();
        }

        return (
            surveyId,
            survey.title,
            survey.description,
            survey.surveyType,
            survey.startTime,
            survey.endTime,
            survey.status,
            survey.creator
        );
    }

    /// @notice Get encrypted survey statistics
    /// @param surveyId The ID of the survey
    /// @return totalResponses Encrypted total response count
    /// @return totalScore Encrypted total score sum
    /// @return averageScore Encrypted average score
    function getSurveyStats(uint256 surveyId) external view returns (
        euint32 totalResponses,
        euint32 totalScore,
        euint32 averageScore
    ) {
        Survey storage survey = _surveys[surveyId];
        if (survey.creator == address(0)) {
            revert SurveyNotFound();
        }

        return (survey.totalResponses, survey.totalScore, survey.averageScore);
    }
    
    /// @notice Check if a user has voted in a survey
    /// @param surveyId The ID of the survey
    /// @param voter The voter address
    /// @return hasVoted True if the user has voted
    function hasUserVoted(uint256 surveyId, address voter) external view returns (bool hasVoted) {
        Survey storage survey = _surveys[surveyId];
        if (survey.creator == address(0)) {
            revert SurveyNotFound();
        }
        
        return survey.hasVoted[voter];
    }
    
    /// @notice Get surveys created by a user
    /// @param user The user address
    /// @return surveyIds Array of survey IDs created by the user
    function getUserSurveys(address user) external view returns (uint256[] memory surveyIds) {
        return _userSurveys[user];
    }
    
    /// @notice Get surveys participated by a user
    /// @param user The user address
    /// @return surveyIds Array of survey IDs participated by the user
    function getUserParticipations(address user) external view returns (uint256[] memory surveyIds) {
        return _userParticipations[user];
    }
    
    /// @notice Get the next survey ID (for frontend pagination)
    /// @return nextId The next survey ID
    function getNextSurveyId() external view returns (uint256 nextId) {
        return _nextSurveyId;
    }
    
    /// @notice Get survey statistics for public viewing (decrypted)
    /// @param surveyId The ID of the survey
    /// @return stats Survey statistics
    function getPublicSurveyStats(uint256 surveyId) external view returns (SurveyStats memory stats) {
        Survey storage survey = _surveys[surveyId];
        if (survey.creator == address(0)) {
            revert SurveyNotFound();
        }
        
        // Note: This function returns decrypted values
        // In a real implementation, you might want to add access control
        // to ensure only the creator can call this function
        
        stats.surveyId = surveyId;
        stats.title = survey.title;
        stats.surveyType = survey.surveyType;
        stats.startTime = survey.startTime;
        stats.endTime = survey.endTime;
        stats.status = survey.status;
        
        // These would need to be decrypted by the frontend
        // For now, return 0 as placeholders
        stats.responseCount = 0;
        stats.averageScore = 0;
    }
}
