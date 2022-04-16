class Data {
    // todo byte ptr
    // todo short far
    // todo mnemocode
    // todo add prefix change segment
    // todo syntax error handler
    data = [
        {bit8: ['al', 'bl', 'cl', 'dl', 'ah', 'bh', 'ch', 'dh'], value: '8-bit register'},
        {bit16: ['ax', 'bx', 'cx', 'dx'], value: '16-bit register'},
        {bit32: ['eax', 'ebx', 'ecx', 'edx'], value: '32-bit register'},
        {
            instructions: ['nop', 'mov', 'imul', 'mul', 'idiv', 'adc', 'or', 'sub', 'jmp', 'cmp', 'jnb'],
            value: 'instruction'
        },
        {directive: ['.386', '.486', "end", "assume", 'segment', 'use16'], value: 'directive'},
        {type: ["db"], value: 'type byte'},
        {type: ['dw'], value: 'type 2 bytes'},
        {type: ['dd'], value: 'type 4 bytes'},
        {segmentReg: ['ds', 'cs' , 'ss', 'es', 'gs'], value: 'segment register'}
    ]

    findOne(word) {
        if (/^\'(.*?)\'$/g.test(word)) {
            return 'string'
        }
        if (/^\[(.*?)\]*$/g.test(word)) {
            return 'address lexeme'
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
                            type = item["value"]
                        }
                    })
                }
            }
        })
        if (type !== null) return type

        return 'user identifier'
    }
}

module.exports = new Data()