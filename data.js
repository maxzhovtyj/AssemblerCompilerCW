const Error = require('./error')

class Data {
    data = [
        {bit8: ['al', 'bl', 'cl', 'dl', 'ah', 'bh', 'ch', 'dh'], value: '8-bit register', type: "operand"},
        {bit32: ['eax', 'ebx', 'ecx', 'edx'], value: '32-bit data register', type: "operand"},
        {bit32: ['esi', 'edi', 'ebp', 'esp'], value: 'general purpose registers', type: "operand"},
        {
            instructions: ['nop', 'mov', 'imul', 'mul', 'idiv', 'adc', 'or', 'sub', 'jmp', 'cmp', 'jnb'],
            value: 'instruction',
            type: "mnemonic code"
        },
        {directive: ['.386', '.486', "assume", 'use16'], value: 'directive'},
        {directive: ["assume"], value: 'assume'},
        {directive: ['use16'], value: 'segment encoding'},
        {directive: ["end", "ends"], value: 'end directive'},
        {directive: ['segment'], value: 'segment directive'},
        {type: ["db"], value: 'type byte'},
        {type: ['dw'], value: 'type 2 bytes'},
        {type: ['dd'], value: 'type 4 bytes'},
        {type: ["byte"], value: 'identifier type byte'},
        {type: ['word'], value: 'identifier type 2 bytes'},
        {type: ['dword'], value: 'identifier type 4 bytes'},
        {defType: ['ptr'], value: 'identifier type definition'},
        {distance: ['short', 'far'], value: 'distance definition'},
        {segmentReg: ['ds', 'cs', 'ss', 'es', 'gs'], value: 'segment register'},
        {characters: [',', ':', '[', ']', '+'], value: 'character'},
        {segmentEnd: ['ends'], value: 'end of segment'}
    ]

    dataRowType = {
        segmentInit: [['user identifier'], ['segment directive', 'end of segment']],
        varInit: [['user identifier'], ['type byte', 'type 2 bytes', 'type 4 bytes'], ['decimal', 'binary', 'hexadecimal', 'string']]
    }

    static varDefinitions = []

    dataRowHandler(row, segmentName, address) {
        let typeArr = []
        let type = ''
        row = row.split(' ')
        row.forEach(word => {
            typeArr.push(this.findOne(word))
        })
        if (this.dataRowType.varInit[0].includes(typeArr[0])
            && this.dataRowType.varInit[1].includes(typeArr[1])
            && this.dataRowType.varInit[2].includes(typeArr[2])) {
            let size = 0
            if (typeArr[1] === 'type byte') {
                type = 'BYTE'
                if (row[2].startsWith("'") && row[2].endsWith("'")) {
                    size = row[2].length - 2
                } else size = 1
            }
            if (typeArr[1] === 'type 2 bytes') {
                size = 2
                type = 'WORD'
            }
            if (typeArr[1] === 'type 4 bytes') {
                size = 4
                type = 'DWORD'
            }
            this.addVarDefinition(row[0], type, address, segmentName)
            return [type, size]
        }
        if (this.dataRowType.segmentInit[0].includes(typeArr[0])
            && this.dataRowType.segmentInit[1].includes(typeArr[1])) {
            return [type, 0]
        }
        console.log(row)
        console.log(typeArr)
        Error.errorCall()
        return null
    }

    codeRowType = {
        imulInstruction: [['instruction'], ['8-bit register', '32-bit data register']],
        idivInstruction: [['instruction'], ['8-bit register', '32-bit data register']],
        jmpInstruction: [['instruction'], ['user identifier']],
        jmpShortInstruction: [['instruction'], ['distance definition'], ['user identifier']],
        jnbInstruction: [['instruction'], ['user identifier']],
        mulInstruction: [
            ['instruction'],
            ['identifier type byte', 'identifier type 2 bytes', 'identifier type 4 bytes'],
            ['identifier type definition'],
            ['character'],
            ['32-bit address register'],
            ['character'],
            ['32-bit address register'],
            ['character'],
        ],
        mulInstructionPrefix: [
            ['instruction'],
            ['identifier type byte', 'identifier type 2 bytes', 'identifier type 4 bytes'],
            ['identifier type definition'],
            ['segment register'],
            ['character'],
            ['character'],
            ['32-bit address register'],
            ['character'],
            ['32-bit address register'],
            ['character'],
        ],
        orInstruction: [
            ['instruction'],
            ['identifier type byte', 'identifier type 2 bytes', 'identifier type 4 bytes'],
            ['identifier type definition'],
            ['segment register'],
            ['character'],
            ['character'],
            ['32-bit address register'],
            ['character'],
            ['32-bit address register'],
            ['character'],
            ['character'],
            ['binary', 'decimal', 'hexadecimal']
        ],
        subInstruction: [
            ['instruction'],
            ['identifier type byte', 'identifier type 4 bytes'],
            ['identifier type definition'],
            ['character'],
            ['32-bit address register'],
            ['character'],
            ['32-bit address register'],
            ['character'],
            ['character'],
            ['8-bit register', '32-bit data register']
        ],
        subInstructionPrefix: [
            ['instruction'],
            ['identifier type byte', 'identifier type 4 bytes'],
            ['identifier type definition'],
            ['segment register'],
            ['character'],
            ['character'],
            ['32-bit address register'],
            ['character'],
            ['32-bit address register'],
            ['character'],
            ['character'],
            ['8-bit register', '32-bit data register']
        ],
        adcInstruction: [
            ['instruction'], // adc
            ['8-bit register', '32-bit data register', 'general purpose registers'], // al || eax || ebi...
            ['character'], // ,
            ['identifier type byte', 'identifier type 4 bytes'], // byte || dword
            ['identifier type definition'], // ptr
            ['character'], // [
            ['32-bit address register'], // ebx
            ['character'], // +
            ['32-bit address register'], // ecx
            ['character'], // ]
        ],
        adcInstructionPrefix: [
            ['instruction'], // adc
            ['8-bit register', '32-bit data register', 'general purpose registers'], // al || eax
            ['character'], // ,
            ['identifier type byte', 'identifier type 4 bytes'], // byte || dword
            ['identifier type definition'], // ptr
            ['segment register'], // cs || gs || es
            ['character'], // :
            ['character'], // [
            ['32-bit address register'], // ebx
            ['character'], // +
            ['32-bit address register'], // ecx
            ['character'], // ]
        ]
    }

    labelPos = {}

    static existingLabels = new Set()
    static usedLabels = new Set()

    codeRowHandler(row, segmentName, address) {
        let size = 0;
        let typeArr = []
        row = row.split(' ')
        row.forEach(word => {
            typeArr.push(this.findOne(word))
        })
        if (typeArr[1] === 'segment directive'
            || typeArr[1] === 'end of segment'
            || row[0].toLowerCase() === 'assume') {
            return size
        }

        if (typeArr[0] === 'user identifier' && typeArr[1] === 'character') {
            this.labelPos[row[0].toString()] = 1
            Data.existingLabels.add(row[0])
            this.addVarDefinition(row[0], "NEAR", address, segmentName)
            return size
        }

        if (row.length === 1 && row[0] === 'nop' && typeArr[0] === 'instruction') {
            return 1
        }

        if (typeArr[0] === 'instruction') {
            switch (row[0]) {
                case 'imul':
                    if (this.codeRowType.imulInstruction[1].includes(typeArr[1])
                        && row.length === this.codeRowType.imulInstruction.length) {
                        return 2
                    }
                    Error.errorCall()
                    break;
                case 'idiv':
                    if (this.codeRowType.idivInstruction[1].includes(typeArr[1])
                        && row.length === this.codeRowType.idivInstruction.length) {
                        return 2
                    }
                    Error.errorCall()
                    break;
                case 'jmp':
                    if (row.length === 3 && row[1] === 'short') {
                        for (let i = 0; i < typeArr.length; i++) {
                            if (!this.codeRowType.jmpShortInstruction[i].includes(typeArr[i])) {
                                console.log(row)
                                console.log(typeArr)
                                Error.errorCall()
                                return 0
                            }
                        }
                        if (typeArr[1] === 'user identifier') {
                            Data.usedLabels.add(row[1])
                        } else if (typeArr[2] === 'user identifier') {
                            Data.usedLabels.add(row[2])
                        }
                        return 2
                    }
                    if (row.length === 2) {
                        for (let i = 0; i < typeArr.length; i++) {
                            if (!this.codeRowType.jmpInstruction[i].includes(typeArr[i])) {
                                console.log(row)
                                console.log(typeArr)
                                Error.errorCall()
                                return 0
                            }
                        }
                        Data.usedLabels.add(row[1])
                        if (this.labelPos[row[1]] === 1) {
                            return 2
                        } else return 5
                    }
                    Error.errorCall()
                    break;
                case 'jnb':
                    for (let i = 0; i < typeArr.length; i++) {
                        if (!this.codeRowType.jnbInstruction[i].includes(typeArr[i])) {
                            console.log(row)
                            console.log(typeArr)
                            Error.errorCall()
                            return 0
                        }
                    }
                    Data.usedLabels.add(row[1])
                    if (this.labelPos[row[1]] === 1) {
                        return 2
                    } else return 6
                case 'mul':
                    if (typeArr.length === 10) {
                        for (let i = 0; i < typeArr.length; i++) {
                            if (!this.codeRowType.mulInstructionPrefix[i].includes(typeArr[i])) {
                                Error.errorCall()
                            }
                        }
                        if (row[3] === 'ss') return 3
                        return 4
                    } else if (typeArr.length === 8) {
                        for (let i = 0; i < this.codeRowType.mulInstruction.length - 2; i++) {
                            if (!this.codeRowType.mulInstruction[i].includes(typeArr[i])) {
                                console.log(typeArr)
                                console.log(row)
                                Error.errorCall();
                                return 0
                            }
                        }
                        if (row[1] === 'byte' || row[2] === 'dword' && ['ebp', 'esp'].includes(row[6])) {
                            return 3
                        }
                        if (row[1] === 'word' && ['ebp', 'esp'].includes(row[6])) {
                            return 4
                        }
                        if (row[1] === 'word') {
                            return 3
                        }
                        return 2
                    }
                    Error.errorCall()
                    return 0
                case 'cmp':
                    if (row[1] === 'al' && row[3].endsWith('b')) {
                        return 2
                    }
                    if (['bl', 'cl', 'dl'].includes(row[1]) && row[3].endsWith('b')) {
                        return 3
                    }
                    if (row[1] === 'eax') {
                        if (row[3].endsWith('h') || row[3].endsWith('d') || (row[3].startsWith('\'') && row[3].endsWith('\''))) {
                            return 5
                        }
                        if (row[3].endsWith('b')) return 3
                        Error.errorCall()
                        return 0
                    }
                    if (['ebx', 'ecx', 'edx'].includes(row[1])) {
                        if (row[3].endsWith('h') || row[3].endsWith('d') || (row[3].startsWith('\'') && row[3].endsWith('\''))) {
                            return 6
                        }
                        if (row[3].endsWith('b')) return 3

                        Error.errorCall()
                        return 0
                    }
                    console.log(row)
                    Error.errorCall()
                    break;
                case 'or':
                    for (let i = 0; i < typeArr.length; i++) {
                        if (!this.codeRowType.orInstruction[i].includes(typeArr[i])) {
                            Error.errorCall()
                            return 0
                        }
                    }
                    if (row[1] === 'byte') {
                        if (!row[11].endsWith('b')) {
                            Error.errorCall()
                            return 0
                        } else return 4
                    }
                    if (row[1] === 'dword') {
                        if (row[11].endsWith('d')) return 7
                        return 4
                    }
                    if (row[1] === 'word') {
                        if (row[11].endsWith('d') && row[11] < 1000) return 5
                        if (row[11].endsWith('d') || row[11].endsWith('h')) return 6
                        return 5
                    }
                    Error.errorCall()
                    break;
                case 'sub':
                    if (row.length === 12) {
                        for (let i = 0; i < typeArr.length; i++) {
                            if (!this.codeRowType.subInstructionPrefix[i].includes(typeArr[i])) {
                                Error.errorCall()
                                return 0
                            }
                        }
                        return 4
                    }
                    if (row.length === 10) {
                        for (let i = 0; i < typeArr.length; i++) {
                            if (!this.codeRowType.subInstruction[i].includes(typeArr[i])) {
                                Error.errorCall()
                                return 0
                            }
                        }
                    }
                    if (row[0] === 'word') return 4
                    return 3
                case 'adc':
                    if (typeArr.length === 10 && row.length === 10) {
                        if (row[3] === 'word') {
                            console.log("operands types must match")
                            Error.errorCall()
                            return 0
                        }
                        for (let i = 0; i < typeArr.length; i++) {
                            if (!this.codeRowType.adcInstruction[i].includes(typeArr[i])) {
                                console.log(row)
                                console.log(typeArr)
                                Error.errorCall()
                                return 0
                            }
                        }
                        if (this.data[0].bit8.includes(row[1]) || this.data[1].bit32.includes(row[1])) {
                            if (typeArr[3] === 'identifier type byte' || typeArr[3] === 'identifier 4 type bytes') {
                                return 3
                            } else {
                                console.log("Operands types must match")
                                Error.errorCall()
                            }
                        }
                        return 0
                    }
                    if (typeArr.length === 12 && row.length === 12) {
                        if (row[3] === 'word') {
                            console.log("operands types must match")
                            Error.errorCall()
                            return 0
                        }
                        for (let i = 0; i < typeArr.length; i++) {
                            if (!this.codeRowType.adcInstructionPrefix[i].includes(typeArr[i])) {
                                console.log(row)
                                console.log(typeArr)
                                Error.errorCall()
                                return 0
                            }
                        }
                        if (this.data[0].bit8.includes(row[1]) || this.data[1].bit32.includes(row[1])) {
                            if (typeArr[3] === 'identifier type byte' || typeArr[3] === 'identifier type 4 bytes') {
                                return 4
                            } else {
                                console.log("Operands types must match")
                                Error.errorCall()
                            }
                        }
                        return 0
                    }
                    console.log(row)
                    console.log(typeArr)
                    Error.errorCall()
                    return 0
                default:
                    break;
            }
        }

        console.log(row)
        console.log(typeArr)
        Error.errorCall()
        return 0
    }

    addVarDefinition(name, type, address, segment) {
        address = address.toString(16).toUpperCase()

        if (address.length === 1) address = `000${address}`
        if (address.length === 2) address = `00${address}`
        if (address.length === 3) address = `0${address}`
        if (address.length === 4) address = `${address}`

        Data.varDefinitions.push(`${name}${name.length <= 3 ? '\t' : ''}\t${type}\t${address}\t${segment}`)
    }

    static fl

    findOne(word) {
        if (word === '[') Data.fl = 1
        if (word === ']') Data.fl = 0
        if (/^\'(.*?)\'$/g.test(word)) {
            return 'string'
        }
        if (/^[0-1]+b$/g.test(word)) {
            return 'binary'
        }
        if (/^(0x|0X)?[a-fA-F0-9]+h$/g.test(word)) {
            return 'hexadecimal'
        }
        if (/^-?[\d]+d?$/g.test(word)) {
            return 'decimal'
        }

        let type = null

        this.data.forEach(item => {
            for (let key in item) {
                if (Array.isArray(item[key])) {
                    item[key].forEach(char => {
                        if (word === char) {
                            if (item["value"] === '32-bit data register' && Data.fl) {
                                type = "32-bit address register"
                            } else if (item["value"] === 'general purpose registers' && Data.fl) {
                                type = "32-bit address register"
                            } else type = item["value"]
                        }
                    })
                }
            }
        })
        if (type !== null) return type

        return 'user identifier'
    }
}

let existingLabels = Data.existingLabels
let usedLabels = Data.usedLabels
let varDefinitions = Data.varDefinitions
data = new Data()

module.exports = {data, existingLabels, usedLabels, varDefinitions}