import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./errors";
import { apiError } from "./response";

type ApiHandler = (req: NextRequest) => Promise<NextResponse>;

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        return apiError(err.message, err.statusCode, err.code, err.details);
      }

      console.error(`[API UNHANDLED ERROR] ${req.method} ${req.nextUrl.pathname}:`, err);
      const message = err instanceof Error ? err.message : "An unexpected server error occurred";
      return apiError(message, 500, "INTERNAL_ERROR");
    }
  };
}

