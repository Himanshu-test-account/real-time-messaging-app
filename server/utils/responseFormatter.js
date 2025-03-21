class ResponseFormatter {
    // Success response format
    static success(data = null, message = 'Request successful') {
      return {
        status: 'success',
        message: message,
        data: data
      };
    }
  
    // Error response format
    static error(message = 'Something went wrong', code = 500, errors = []) {
      return {
        status: 'error',
        message: message,
        code: code,
        errors: errors
      };
    }
  
    // Standard response format for API success or failure
    static formatResponse(isSuccess, data = null, message = '') {
      if (isSuccess) {
        return this.success(data, message);
      } else {
        return this.error(message);
      }
    }
  }
  
  module.exports = ResponseFormatter;
  