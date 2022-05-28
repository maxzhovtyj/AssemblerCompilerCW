const lst1FileUrl = require('./index')
const fs = require('fs')
const data = require('./data')
const Error = require('./error')
const handler = require('./segmentHandler')

class Parser {
    frame = '='.repeat(61)
    table = `\n${this.frame}\nNo - Lexeme   - Length -  Type  \n${this.frame}`

    lexemeCount = `\n| Label | Mnemonic code | Operand 1 | Operand 2 | Operand 3 |\n${this.frame}\n`

    rowAnalyser(row) {
        return row.map(str => str
            .split(/([,:\+\[\]])/)
            .map(el => el.trim()
                .split(" "))
            .flat())
            .flat()
            .filter(word => word !== '')
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
            },
            operand3: {
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
                        } else operand1Calc(rowObj)
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
        if (row[0].type === 'assume') {
            mnemonicCalc(row[0])
            rowPattern.operand1.index = row[1].index;
            let fl = -1
            for (let i = 1; i < row.length; i++) {
                if (row[i].word === ',') {
                    if (fl === 0) {
                        rowPattern.operand3.index = row[i].index + 1
                        fl = 1
                    }
                    if (fl === -1) {
                        rowPattern.operand2.index = row[i].index + 1
                        fl = 0
                    }
                    continue
                }
                if (fl === -1) {
                    rowPattern.operand1.length++
                }
                if (fl === 0) {
                    rowPattern.operand2.length++
                }
                if (fl === 1) {
                    rowPattern.operand3.length++
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
                    } else {
                        rowPattern.label++
                    }
                    break;
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
                `${index + 1}. ${word} - Length: ${word.length} - Type: ${type}`
            parsedInTable += '\n' + tableRow
        })
        const {label, mnemocode, operand1, operand2, operand3} = this.mnemonicAnalyze(rows)
        let tableBottom = `|   ${label}   |   ${mnemocode.index}   |   ${mnemocode.length}   |  ${operand1.index}  |  ${operand1.length}  |  ${operand2.index}  |  ${operand2.length}  |  ${operand3.index}  |  ${operand3.length}  |`
        let rowTop = row.join(' ') + this.table + parsedInTable + '\n' + this.frame
        let rowBottom = this.lexemeCount + tableBottom + '\n' + this.frame + '\n\n'
        return rowTop + rowBottom
    }

    lstWriter(content) {
        let dataSegmentSize = 0
        let dataSegment1Size = 0
        content = content.split('\n')
            .filter(item => item !== '' && item !== ' ')
            .map(str => str.replaceAll(/[\t]/g, ' '))
        let filtered = []
        content.forEach((row) => {
            let tmp = row.split(/[ ](?=[^\]]*?(?:\[|$))/g)
            filtered.push(this.rowAnalyser(tmp))
        })
        let dataSegmentIndex = 0
        let size = 0
        let address = 0;
        let fl = 0
        filtered.forEach((row, index) => {
            let tableIndex = '';
            (index <= 9) ? tableIndex = `00${index}` : tableIndex = `0${index}`
            row = row.join(' ')
            if (fl === 0 && row.match(/data(\d)?\ssegment\b/gi)) {
                Number.isInteger(Number(row[4])) ? dataSegmentIndex = row[4] : dataSegmentIndex = 0
                fl = 1
            }
            if (fl === 1) {
                [, size] = data.rowHandler(row)
            }
            if (fl === 1 && row.match(/data(\d)?\sends\b/gi)) {
                if (row[4] !== dataSegmentIndex) {
                    Error.errorCall()
                }
                fl = 0
            }

            let hexAddress = address.toString(16)
            let hexStr = ''
            if (hexAddress.length === 1) hexStr = `000${hexAddress}`
            if (hexAddress.length === 2) hexStr = `00${hexAddress}`
            if (hexAddress.length === 3) hexStr = `0${hexAddress}`
            if (hexAddress.length === 4) hexStr = `${hexAddress}`
            const hexPrevNum = size.toString(16)
            let res = `${tableIndex}\t\t${hexStr}\t\t${hexPrevNum}\t\t${row}\n${row.includes('ends') ? '\n' : ''}`
            fs.appendFileSync('./lst1.txt', res)
            address += size
            if (row.startsWith('Data') && row.includes('ends')) {
                if (dataSegmentSize === 0) {
                    dataSegmentSize = `${row.slice(0, 5)}\t${address}`
                }
                else dataSegment1Size = `${row.slice(0, 5)}\t${address}`
                address = 0;
            }
        })
        return [dataSegmentSize, dataSegment1Size]
    }
}

module.exports = new Parser()