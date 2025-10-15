class ErrorResponse extends Error {
  statusCode: number;
  errors?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ErrorResponse.prototype);
  }

  getErrors<T>(): T | undefined {
    return this.errors as T;
  }
}

export default ErrorResponse;
