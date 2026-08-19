const Project = require('../models/Project');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = catchAsync(async (req, res, next) => {
  const projects = await Project.find({
    $or: [{ owner: req.user.id }, { members: req.user.id }]
  }).populate('owner', 'name email');

  sendSuccess(res, 200, { data: projects });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('members', 'name email');

  if (!project) {
    return sendError(res, 404, `Project not found with id of ${req.params.id}`);
  }

  // Check if user is owner or member
  const isOwner = project.owner._id.toString() === req.user.id;
  const isMember = project.members.some(m => m._id.toString() === req.user.id);
  
  if (!isOwner && !isMember) {
    return sendError(res, 403, 'Not authorized to access this project');
  }

  sendSuccess(res, 200, { data: project });
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = catchAsync(async (req, res, next) => {
  // Add user to req.body
  req.body.owner = req.user.id;

  const project = await Project.create(req.body);

  sendSuccess(res, 201, { data: project });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = catchAsync(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return sendError(res, 404, `Project not found with id of ${req.params.id}`);
  }

  // Make sure user is project owner
  if (project.owner.toString() !== req.user.id) {
    return sendError(res, 403, `User ${req.user.id} is not authorized to update this project`);
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  sendSuccess(res, 200, { data: project });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return sendError(res, 404, `Project not found with id of ${req.params.id}`);
  }

  // Make sure user is project owner
  if (project.owner.toString() !== req.user.id) {
    return sendError(res, 403, `User ${req.user.id} is not authorized to delete this project`);
  }

  await project.deleteOne();

  sendSuccess(res, 200, { data: {} }, 'Project deleted successfully');
});
