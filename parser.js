const data = require('./data')

class Parser {
    frame = '='.repeat(89)
    table = `\n${this.frame}\n|\tNo\t|\t\t\tLexeme\t\t\t\t\t|\tLength\t\t|\t\tType\t\t\t\t|\n${this.frame}`

    lexemeCount = `\n| Label |\t\t\tMnemonic code\t\t\t|\tOperand 1\t|\t\tOperand 2\t\t\t|\n${this.frame}\n`

    rowAnalyser(row) {
        return row.map(str => str
            .split(/([,:\+\[\]])/)
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
                let wordTabs = Math.round((36 - len) / 4)
                return `${'\t'.repeat(wordTabs)}`
            case "type":
                let typeTabs = Math.round((28 - len) / 4)
                if (word.length >= 23) return `\t`
                return `${'\t'.repeat(typeTabs)}`
        }
    }

    mnemonicAnalyze(row) {
        let rowPattern = {
            label: 0,
            mnemocode: {
                index: 0,
                length: 0
            },
            operand1: {
                index: 0,
                length: 0
            },
            operand2: {
                index: 0,
                length: 0
            }
        }
        const mnemonicCalc = (obj) => {
            rowPattern.mnemocode.index = obj.index
            rowPattern.mnemocode.length++
        }
        const operand1Calc = (obj) => {
            rowPattern.operand1.index = obj.index
            rowPattern.operand1.length++
        }
        const operand2Calc = (obj) => {
            rowPattern.operand2.index = obj.index
            rowPattern.operand2.length++
        }
        let operandBackup = {index: 0, length: 0}
        if (row[0].word === 'jmp' || row[0].word === 'jnb') {
            console.log('hi')
            for (const rowObj of row) {
                switch (rowObj.type) {
                    case 'instruction':
                        mnemonicCalc(rowObj)
                        break;
                    case 'distance definition':
                        rowPattern.operand1.index = rowObj.index
                        rowPattern.operand1.length++
                        break;
                    case 'user identifier':
                        if (rowPattern.operand1.index) {
                            rowPattern.operand1.length++
                        }
                        else operand1Calc(rowObj)
                        break;
                }
            }
            return rowPattern
        }
        if (row.length === 3 && row[1].type.startsWith('type')) {
            for (const rowObj of row) {
                switch (rowObj.type) {
                    case 'user identifier':
                        mnemonicCalc(rowObj)
                        break;
                    case 'type byte':
                    case 'type 2 bytes':
                    case 'type 4 bytes':
                        operand1Calc(rowObj)
                        break;
                    case 'string':
                    case 'binary':
                    case 'hexadecimal':
                    case 'decimal':
                        operand2Calc(rowObj)
                        break;
                }
            }
            return rowPattern
        }
        for (const rowObj of row) {
            switch (rowObj.type) {
                case 'identifier type byte':
                case 'identifier type 2 bytes':
                case 'identifier type 4 bytes':
                    let comaIndex = 0
                    row.forEach((item, index) => {
                        if (item.word === ',') {
                            comaIndex = index + 1
                        }
                    })
                    operandBackup.index = rowObj.index
                    for (let i = rowObj.index; i <= row.length; i++) {
                        operandBackup.length++
                        if (i === comaIndex - 1) break
                    }
                    if (rowPattern.operand1.length === 0 && rowPattern.operand1.index === 0) {
                        rowPattern.operand1 = operandBackup
                    } else {
                        rowPattern.operand2 = operandBackup
                    }
                    break;
                case 'user identifier':
                    if (rowPattern.mnemocode.index !== 0 && rowPattern.mnemocode.length !== 0) {
                        operand1Calc(rowObj)
                    }
                    else {
                        rowPattern.label++
                    }
                    break;
                case 'assume':
                    return rowPattern
                case 'type byte':
                case 'type 2 bytes':
                case 'type 4 bytes':
                case 'directive':
                case 'instruction':
                case 'end directive':
                case 'segment directive':
                case 'end of segment':
                    mnemonicCalc(rowObj)
                    break;
                case '8-bit register':
                case '16-bit register':
                case '32-bit data register':
                case 'decimal':
                case 'binary':
                case 'hexadecimal':
                case 'segment encoding':
                case 'string':
                    if (rowPattern.operand1.index === 0 && rowPattern.operand1.length === 0) {
                        operand1Calc(rowObj)
                    } else operand2Calc(rowObj)
                    break;
                // case 'string':
                //     rowPattern.operand1.index = rowObj.index
                //     rowPattern.operand1.length++
                //     break;
            }
        }
        return rowPattern
    }

    getInfo(row) {
        row = this.rowAnalyser(row)
        let parsedInTable = ''
        let rows = []
        row.forEach((word, index) => {
            word = word.toLowerCase()
            let type = data.findOne(word)
            rows.push({index: index + 1, word, type})
            let tableRow =
                `|\t${index + 1}\t|${word}${this.tabCount(word)}|\t\t${word.length}\t\t|${type}${this.tabCount(type, 'type')}|`
            parsedInTable += '\n' + tableRow
        })
        const {label, mnemocode, operand1, operand2} = this.mnemonicAnalyze(rows)
        let tableBottom = `|\t${label}\t|\t\t${mnemocode.index}\t\t\t|\t\t${mnemocode.length}\t\t|\t${operand1.index}\t|\t${operand1.length}\t|\t${operand2.index}\t\t\t|\t${operand2.length}\t\t|`
        let rowTop = row.join(' ') + this.table + parsedInTable + '\n' + this.frame
        let rowBottom = this.lexemeCount + tableBottom + '\n' + this.frame + '\n\n'
        return rowTop + rowBottom
    }
}

module.exports = new Parser()