class BadRequestError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
    this.name = "BadRequestError";
    this.statusCode = 400;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
    this.name = "ForbiddenError";
    this.statusCode = 403;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class MethodNotAllowedError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, MethodNotAllowedError.prototype);
    this.name = "MethodNotAllowedError";
    this.statusCode = 405;
  }
}

class InternalServerError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, InternalServerError.prototype);
    this.name = "InternalServerError";
    this.statusCode = 500;
  }
}

module.exports = {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  InternalServerError,
  MethodNotAllowedError,
  UnauthorizedError,
}