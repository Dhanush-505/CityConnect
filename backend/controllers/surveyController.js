import Survey from '../models/Survey.js';
import SurveyResponse from '../models/SurveyResponse.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createSurvey = async (req, res, next) => {
  try {
    const { title, description, category, targetDepartment, questions, expiresAt } = req.body;

    if (!title || !description || !questions || !Array.isArray(questions)) {
      return sendError(res, 'Title, description, and questions array are required.', 400);
    }

    const survey = await Survey.create({
      title,
      description,
      category: category || 'General',
      targetDepartment: targetDepartment || 'All',
      questions,
      createdBy: req.user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    return sendSuccess(res, 'Digital survey created successfully.', survey, 201);
  } catch (error) {
    next(error);
  }
};

export const getSurveys = async (req, res, next) => {
  try {
    const isCitizen = req.user && req.user.role === 'citizen';
    const query = isCitizen ? { isActive: true } : {};

    const surveys = await Survey.find(query).sort({ createdAt: -1 }).lean();

    if (isCitizen && req.user) {
      const userResponses = await SurveyResponse.find({ citizenId: req.user.id }).select('surveyId').lean();
      const respondedSurveyIds = new Set(userResponses.map((r) => String(r.surveyId)));

      const surveysWithStatus = surveys.map((s) => ({
        ...s,
        hasResponded: respondedSurveyIds.has(String(s._id)),
      }));

      return sendSuccess(res, 'Surveys retrieved successfully.', surveysWithStatus);
    }

    return sendSuccess(res, 'Surveys retrieved successfully.', surveys);
  } catch (error) {
    next(error);
  }
};

export const submitSurveyResponse = async (req, res, next) => {
  try {
    const { id: surveyId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return sendError(res, 'Answers array is required.', 400);
    }

    const survey = await Survey.findById(surveyId);
    if (!survey || !survey.isActive) {
      return sendError(res, 'Survey not found or inactive.', 404);
    }

    const existingResponse = await SurveyResponse.findOne({ surveyId, citizenId: req.user.id });
    if (existingResponse) {
      return sendError(res, 'You have already submitted a response for this survey.', 400);
    }

    const response = await SurveyResponse.create({
      surveyId,
      citizenId: req.user.id,
      answers,
    });

    survey.responseCount = (survey.responseCount || 0) + 1;
    await survey.save();

    // Reward points and badge checking
    const user = await User.findById(req.user.id);
    if (user) {
      user.points = (user.points || 0) + 15;
      if (!user.earnedBadges.includes('Active Citizen')) {
        user.earnedBadges.push('Active Citizen');
      }
      await user.save();
    }

    return sendSuccess(res, 'Survey response submitted successfully.', response, 201);
  } catch (error) {
    next(error);
  }
};
