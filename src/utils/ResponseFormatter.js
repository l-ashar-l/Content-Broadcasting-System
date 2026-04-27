/**
 * ResponseFormatter - Standardizes API responses
 * Follows SRP: Only responsible for response formatting
 * Enables consistent API response structure
 */
export default class ResponseFormatter {
  /**
   * Format success response
   * @param {*} data - Response data
   * @param {string} message - Response message
   * @param {number} statusCode - HTTP status code
   * @returns {Object} Formatted response
   */
  static success(data = null, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  }

  /**
   * Format error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {*} errors - Additional error details
   * @returns {Object} Formatted response
   */
  static error(message = 'Error', statusCode = 500, errors = null) {
    return {
      success: false,
      statusCode,
      message,
      errors,
    };
  }

  /**
   * Format paginated response
   * @param {Array} data - Response data
   * @param {number} total - Total count
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {string} message - Response message
   * @returns {Object} Formatted paginated response
   */
  static paginated(data, total, page, limit, message = 'Success') {
    return {
      success: true,
      statusCode: 200,
      message,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
