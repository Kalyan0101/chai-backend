class ApiError extends Error{
    constructor(
        statusCoded,
        message = "Something Went Wrong",
        errors = [],
        statck = ""
    ){
        super(message)
        this.statusCoded = statusCoded
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (statck) {
            this.stack = statck
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }