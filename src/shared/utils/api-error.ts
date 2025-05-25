import { HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { CustomLogger } from './custom-logger';

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
    functionCalled?: string,
    logger?: CustomLogger,
  ): ApiError {
    if (logger) {
      logger.error(`Bad request: ${logMsg}`, functionCalled);
    }
    return new ApiError(400, respMsg, logMsg, error);
  }

  static notFound(
    respMsg: string,
    logMsg: string,
    error?: unknown,
    functionCalled?: string,
    logger?: CustomLogger,
  ): ApiError {
    if (logger) {
      logger.error(`Not found: ${logMsg}`, functionCalled);
    }
    return new ApiError(404, respMsg, logMsg, error);
  }

  static internal(
    respMsg: string,
    logMsg: string,
    error?: unknown,
    functionCalled?: string,
    logger?: CustomLogger,
  ): ApiError {
    if (logger) {
      logger.error(`Internal: ${logMsg}`, functionCalled);
    }
    return new ApiError(500, respMsg, logMsg, error);
  }
}

export function catchAndFormatInternalError(
  error: unknown,
  functionCalled?: string,
  logger?: CustomLogger,
): ApiError {
  if (error instanceof ApiError) {
    throw error;
  }
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;

    const responseMessage =
      typeof error.response?.data === 'object' &&
      error.response?.data !== null &&
      'message' in error.response.data &&
      typeof (error.response.data as { message?: unknown }).message === 'string'
        ? (error.response.data as { message?: string }).message
        : undefined;

    const errorMessage = responseMessage ?? error.message;

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
      'Internal Server Error',
      logMessage,
      error,
      functionCalled,
      logger,
    );
  }

  if (error instanceof Error) {
    throw ApiError.internal(
      'An unknown error occurred',
      error.message,
      error,
      functionCalled,
      logger,
    );
  }
  throw ApiError.internal(
    'An unknown error occurred',
    'unknown error',
    error,
    functionCalled,
    logger,
  );
}
