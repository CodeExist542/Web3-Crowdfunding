"use strict";
// src/utils/response.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.newErrorResponse = newErrorResponse;
exports.newSuccessResponse = newSuccessResponse;
exports.newSuccessGetResponse = newSuccessGetResponse;
function newErrorResponse(message, additionalData) {
    return {
        error: message,
        ...additionalData, // Tambahkan data tambahan jika ada
    };
}
function newSuccessResponse(msg, data) {
    return {
        success: true,
        message: msg,
        data: data,
    };
}
function newSuccessGetResponse(message, data, page, limit, totalItems) {
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
