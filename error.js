class Error {
    static errorCount = 0

    static errorCall() {
        console.log("ERROR")
        Error.errorCount += 1
    }
}

module.exports = Error