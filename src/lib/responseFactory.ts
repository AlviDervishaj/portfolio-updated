'use server'

import type { ApiError, ApiSuccess } from '#/types/api.ts'

export function createSuccessResponse<T>(data: T): ApiSuccess<T> {
	return { success: true, data }
}

export function createErrorResponse(error: string, code: string): ApiError {
	return { success: false, error, code }
}
