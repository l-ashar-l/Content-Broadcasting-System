export default class ResponseFormatter {
  static success(data = null, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  }

  static error(message = 'Error', statusCode = 500, errors = null) {
    return {
      success: false,
      statusCode,
      message,
      errors,
    };
  }

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
