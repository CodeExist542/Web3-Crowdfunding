// src/utils/response.ts

export interface ErrorResponse {
  error: string;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
  data?: any;
}

export function newErrorResponse(
  message: string,
  additionalData?: Record<string, any>
): ErrorResponse {
  return {
    error: message,
    ...additionalData, // Tambahkan data tambahan jika ada
  };
}

export function newSuccessResponse(msg: string, data?: any): SuccessResponse {
  return {
    success: true,
    message: msg,
    data: data,
  };
}

export function newSuccessGetResponse(
  message: string,
  data: any,
  page: number,
  limit: number,
  totalItems: number
) {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    success: true,
    message: message,
    details: {
      page: page,
      limit: limit,
      totalItems: totalItems,
      totalPages: totalPages,
    },
    data: data,
  };
}
