class Data {
    // todo mnemocode
    // todo add prefix change segment
    // todo syntax error handler
    data = [
        {bit8: ['al', 'bl', 'cl', 'dl', 'ah', 'bh', 'ch', 'dh'], value: '8-bit register', type: "operand"},
        {bit16: ['ax', 'bx', 'cx', 'dx'], value: '16-bit register', type: "operand"},
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
        if (/^[\d]+d?$/g.test(word)) {
            return 'decimal'
        }
        if (/^code/g.test(word)) {
            return 'code segment'
        }
        if (/^data/g.test(word)) {
            return 'data segment'
        }
        let type = null

        this.data.forEach(item => {
            for (let key in item) {
                if (Array.isArray(item[key])) {
                    item[key].forEach(char => {
                        if (word === char) {
                            if (item["value"] === '32-bit data register' && Data.fl) {
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
    findType(word, index) {

    }
}

module.exports = new Data()