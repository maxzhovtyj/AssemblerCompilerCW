const data = require('./data')

class config {
    table =
        `
=========================================================================================
| No |              Lexeme                  |     Length    |         Type              |
=========================================================================================`

    rowAnalyser(row) {
        return row.map(str => str
            .split(/([,:])/)
            .map(el => el.trim()
                .split(" "))
            .flat())
            .flat()
            .filter(word => word !== '')
    }

    tabCount(word) {

    }

    getInfo(row) {
        row = this.rowAnalyser(row)
        row = row.map(str => str
            .split(/([,:])/)
            .map(el => el.trim()
                .split(" "))
            .flat())
            .flat()
            .filter(word => word !== '')
        console.log(row)
        let parsedInTable = ''
        row.forEach((word, index) => {
            word = word.toLowerCase()
            let type = data.findOne(word)
            let tableRow =
                `|  ${index} |\t\t${word}\t\t\t\t\t\t${word.length <= 3 ? '\t' : ''}${word.length < 8 ? '\t' : ''}|\t\t${word.length}\t\t|\t${type}\t\t\t${type.length <= 7 ? '\t\t' : ''}${type.length > 7 && type.length <= 11 ? '\t' : ''}|`
            debugger;
            parsedInTable += '\n' + tableRow
        })
        return row.join(' ') + this.table + parsedInTable + '\n'
            + '=========================================================================================\n\n'
    }
}

module.exports = new config()