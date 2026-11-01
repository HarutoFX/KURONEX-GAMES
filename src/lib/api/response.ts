import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: unknown;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  const payload: ApiResponse<T> = {
    success: true,
    ...(message ? { message } : {}),
    data,
  };
  return NextResponse.json(payload, { status });
}

export function apiPaginated<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  status = 200
) {
  const totalPages = Math.ceil(total / (limit || 1)) || 1;
  const payload: PaginatedResponse<T> = {
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
  return NextResponse.json(payload, { status });
}

export function apiError(
  message: string,
  status = 500,
  code = "INTERNAL_ERROR",
  details?: unknown
) {
  const payload: ApiResponse = {
    success: false,
    error: message,
    code,
    ...(details ? { details } : {}),
  };
  return NextResponse.json(payload, { status });
}

