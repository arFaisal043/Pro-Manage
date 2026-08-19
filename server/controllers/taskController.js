const Task = require('../models/Task');
const Project = require('../models/Project');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all tasks
// @route   GET /api/tasks
// @route   GET /api/projects/:projectId/tasks
// @access  Private
exports.getTasks = catchAsync(async (req, res, next) => {
  let query;

  if (req.params.projectId) {
    query = Task.find({ project: req.params.projectId });
  } else {
    query = Task.find();
  }

  const tasks = await query.populate({
    path: 'project',
    select: 'name status'
  });

  sendSuccess(res, 200, { count: tasks.length, data: tasks });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate({
    path: 'project',
    select: 'name description'
  }).populate('assignee', 'name email');

  if (!task) {
    return sendError(res, 404, `Task not found with id of ${req.params.id}`);
  }

  sendSuccess(res, 200, { data: task });
});

// @desc    Create new task
// @route   POST /api/projects/:projectId/tasks
// @access  Private
exports.createTask = catchAsync(async (req, res, next) => {
  req.body.project = req.params.projectId;

  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return sendError(res, 404, `Project not found with id of ${req.params.projectId}`);
  }

  // Ensure user is owner or member
  const isOwner = project.owner.toString() === req.user.id;
  const isMember = project.members.some(m => m.toString() === req.user.id);

  if (!isOwner && !isMember) {
    return sendError(res, 403, `User not authorized to add a task to this project`);
  }

  const task = await Task.create(req.body);

  sendSuccess(res, 201, { data: task });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = catchAsync(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return sendError(res, 404, `Task not found with id of ${req.params.id}`);
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  sendSuccess(res, 200, { data: task });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return sendError(res, 404, `Task not found with id of ${req.params.id}`);
  }

  await task.deleteOne();

  sendSuccess(res, 200, { data: {} }, 'Task deleted successfully');
});
