const data = require('./data')

class config {
    table =
        `
=========================================================================================
| No |              Lexeme                  |     Length    |         Type              |
=========================================================================================`

    getInfo(row) {
        let parsedInTable = ''
        row.forEach((word, index) => {
            word = word.toLowerCase().replace(/,/g, '')
            let type = data.findOne(word)
            let tableRow =
                `|  ${index} |\t\t${word}\t\t\t\t\t\t${word.length <= 3 ? '\t' : ''}${word.length < 8 ? '\t' : ''}|\t\t${word.length}\t\t|\t${type}\t\t\t${type.length <= 7 ? '\t\t' : ''}${type.length > 7 && type.length <= 11 ? '\t' : ''}|`
            parsedInTable += '\n' + tableRow
        })
        return row.join(' ') + this.table + parsedInTable + '\n'
            + '=========================================================================================\n\n'
    }
}

module.exports = new config()