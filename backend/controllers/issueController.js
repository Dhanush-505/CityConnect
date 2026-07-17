import Issue from '../models/Issue.js';

export const getAllIssues = async (req, res, next) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json({ issues });
  } catch (error) {
    next(error);
  }
};

export const createIssue = async (req, res, next) => {
  try {
    const { title, description, category, location } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const issue = await Issue.create({
      title,
      description,
      category,
      location,
      imageUrl,
      createdBy: req.user.id,
    });

    res.status(201).json({ issue });
  } catch (error) {
    next(error);
  }
};
