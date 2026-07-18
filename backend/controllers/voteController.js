import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const castVote = async (req, res, next) => {
  try {
    const { complaintId } = req.body;

    if (!complaintId) {
      return sendError(res, 'Complaint ID is required.', 400);
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return sendError(res, 'Complaint not found.', 404);
    }

    const userId = req.user.id;
    const hasVoted = complaint.votedBy && complaint.votedBy.some((id) => String(id) === String(userId));

    if (hasVoted) {
      // Remove vote (toggle)
      complaint.votedBy = complaint.votedBy.filter((id) => String(id) !== String(userId));
      complaint.votesCount = Math.max(0, (complaint.votesCount || 1) - 1);
      await complaint.save();

      return sendSuccess(res, 'Support vote removed successfully.', {
        votesCount: complaint.votesCount,
        hasVoted: false,
      });
    }

    // Add vote
    if (!complaint.votedBy) complaint.votedBy = [];
    complaint.votedBy.push(userId);
    complaint.votesCount = (complaint.votesCount || 0) + 1;

    // Upvote recommendation: elevate priority if votes count > 10
    if (complaint.votesCount >= 10 && complaint.priority === 'Low') {
      complaint.priority = 'Medium';
    } else if (complaint.votesCount >= 25 && complaint.priority === 'Medium') {
      complaint.priority = 'High';
    }

    await complaint.save();

    // Reward gamification points
    const user = await User.findById(userId);
    if (user) {
      user.points = (user.points || 0) + 5;
      const userVotesCount = await Complaint.countDocuments({ votedBy: userId });
      if (userVotesCount >= 5 && !user.earnedBadges.includes('Community Volunteer')) {
        user.earnedBadges.push('Community Volunteer');
      }
      if (userVotesCount >= 15 && !user.earnedBadges.includes('Top Contributor')) {
        user.earnedBadges.push('Top Contributor');
      }
      await user.save();
    }

    return sendSuccess(res, 'Complaint upvoted successfully!', {
      votesCount: complaint.votesCount,
      hasVoted: true,
      priority: complaint.priority,
    });
  } catch (error) {
    next(error);
  }
};
