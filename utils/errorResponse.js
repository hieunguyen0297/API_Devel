const { static } = require("express");
const errorHandler = require("../middleware/error");

class ErrorResponse extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode
    }
}

module.exports = ErrorResponse