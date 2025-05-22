import { HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';

export class ApiError extends HttpException {
  constructor(
    public readonly statusCode: number,
    public readonly responseMessage: string,
    public readonly logMessage: string,
    public readonly error?: unknown,
  ) {
    super(responseMessage, statusCode);
    this.name = 'ApiError';
  }

  static badRequest(
    respMsg: string,
    logMsg: string,
    error?: unknown,
  ): ApiError {
    return new ApiError(400, respMsg, logMsg, error);
  }

  static notFound(respMsg: string, logMsg: string, error?: unknown): ApiError {
    return new ApiError(404, respMsg, logMsg, error);
  }

  static internal(respMsg: string, logMsg: string, error?: unknown): ApiError {
    return new ApiError(500, respMsg, logMsg, error);
  }
}

export function catchAndFormatInternalError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    throw error;
  }
  if (error instanceof AxiosError) {
    const errorMessage =
      (typeof error.response?.data === 'object' &&
      error.response?.data !== null &&
      'message' in error.response.data &&
      typeof (error.response.data as { message?: unknown }).message === 'string'
        ? (error.response.data as { message?: string }).message
        : undefined) || error.message;
    const statusCode = error.response?.status;
    const errorCode = error.code;

    let logMessage = `Axios error`;

    if (statusCode) {
      logMessage += ` [Status: ${statusCode}]`;
    }

    if (errorCode) {
      logMessage += ` [Code: ${errorCode}]`;
    }

    logMessage += `: ${errorMessage}`;

    throw ApiError.internal(
      'Problem getting data from external service',
      logMessage,
      error,
    );
  }

  if (error instanceof Error) {
    throw ApiError.internal('An unknown error occurred', error.message, error);
  }
  throw ApiError.internal('An unknown error occurred', 'unknown error', error);
}
