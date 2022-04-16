const data = require('./data')

class config {
    frame = '='.repeat(89)
    table = `\n${this.frame}\n| No |\t\t\t\tLexeme\t\t\t\t\t|\tLength\t\t|\t\tType\t\t\t\t|\n${this.frame}`

    rowAnalyser(row) {
        return row.map(str => str
            .split(/([,:])/)
            .map(el => el.trim()
                .split(" "))
            .flat())
            .flat()
            .filter(word => word !== '')
    }

    tabCount(word, type = "word") {
        let len = word.length
        switch (type) {
            case "word":
                let wordTabs = ((40 - len) / 4 % 1 === 0.5) ? Math.floor((40 - len) / 4) : Math.round((40 - len) / 4)
                 debugger;
                return `${'\t'.repeat(wordTabs)}`
            case "type":
                let typeTabs = Math.round((28 - len) / 4)
                if (word.length >= 23) return `\t`
                return `${'\t'.repeat(typeTabs)}`
        }
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
        let parsedInTable = ''
        let rowPattern = {
            label: 0,
            mnemocode: {
                index: 0,
                operand: 0
            },
            operand1: {
                index: 0,
                operand: 0
            },
            operand2: {
                index: 0,
                operand: 0
            }
        }
        row.forEach((word, index) => {
            word = word.toLowerCase()
            let type = data.findOne(word)
            let tableRow =
                `|  ${index} |${word}${this.tabCount(word)}|\t\t${word.length}\t\t|${type}${this.tabCount(type, 'type')}|`
            parsedInTable += '\n' + tableRow
        })
        return row.join(' ') + this.table + parsedInTable + `\n${(this.frame)}\n\n`
    }
}

module.exports = new config()