class Error {
    static errorCount = 0

    static errorCall() {
        Error.errorCount += 1
    }
}

module.exports = Error