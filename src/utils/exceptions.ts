import ErrorResponse from "./errorResponse";

export class UnauthorizedException extends ErrorResponse {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenException extends ErrorResponse {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundException extends ErrorResponse {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

