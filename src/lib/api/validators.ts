import { ValidationError } from "./errors";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface SortParams {
  field: string;
  order: "asc" | "desc";
}

export function parsePagination(
  source: URLSearchParams | { searchParams: URLSearchParams } | { url: string },
  defaultLimit = 20,
  maxLimit = 100
): PaginationParams {
  let searchParams: URLSearchParams;
  if ("searchParams" in source && source.searchParams instanceof URLSearchParams) {
    searchParams = source.searchParams;
  } else if ("url" in source && typeof source.url === "string") {
    searchParams = new URL(source.url).searchParams;
  } else if (source instanceof URLSearchParams) {
    searchParams = source;
  } else {
    searchParams = new URLSearchParams();
  }

  const pageRaw = searchParams.get("page");
  const limitRaw = searchParams.get("limit");

  const page = Math.max(1, parseInt(pageRaw || "1", 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(limitRaw || `${defaultLimit}`, 10) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function parseSorting(
  searchParams: URLSearchParams,
  allowedFields: string[],
  defaultField: string,
  defaultOrder: "asc" | "desc" = "asc"
): SortParams {
  const sortBy = searchParams.get("sortBy") || defaultField;
  const orderRaw = searchParams.get("order")?.toLowerCase();

  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  const order = orderRaw === "desc" || orderRaw === "asc" ? orderRaw : defaultOrder;

  return { field, order };
}

export function validateEmail(email: unknown): string {
  if (typeof email !== "string") {
    throw new ValidationError("Email must be a valid text string");
  }
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new ValidationError("Please provide a valid email address");
  }
  return trimmed;
}

export function validateUsername(username: unknown): string {
  if (typeof username !== "string") {
    throw new ValidationError("Gamertag must be a string");
  }
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 32) {
    throw new ValidationError("Gamertag must be between 3 and 32 characters");
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    throw new ValidationError("Gamertag may only contain alphanumeric characters, underscores, and dashes");
  }
  return trimmed;
}

export function validatePassword(password: unknown, minLength = 6): string {
  if (typeof password !== "string" || password.length < minLength) {
    throw new ValidationError(`Password must be at least ${minLength} characters long`);
  }
  return password;
}

export function sanitizeString(val: unknown, maxLength = 255): string {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLength);
}
