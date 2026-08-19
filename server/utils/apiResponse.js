exports.sendSuccess = (res, statusCode, data, message) => {
  const response = { success: true };
  if (message) response.message = message;
  
  if (data) {
    if (data.token) {
      response.token = data.token;
      response.user = data.user;
    } else if (data.data !== undefined) {
      Object.assign(response, data);
    } else {
      response.data = data;
    }
  }

  return res.status(statusCode).json(response);
};

exports.sendError = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};
