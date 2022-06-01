const fs = require("fs")
const config = require('./parser')
const Error = require('./error')
const Parser = require('./parser')

const asmFileUrl = './kr2.asm'
const lstFileUrl = './lst0.txt'
const lst1FileUrl = './lst1.txt'
const lst2FileUrl = './lst2.txt'

const content = fs.readFileSync(asmFileUrl)

const str = content.toString()
let parsed = str.split('\n')
    .filter(item => item !== '' && item !== ' ')
    .map(str => str.replaceAll(/[\t]/g, ' '))

const topContent = 'Assembly translator STEP 1\nWritten by Zhovtaniuk Maksym KV-03\nFilename: lst1.txt\n'
const description = '1-line, 2-address, 3-size, 4-assembly operator\n\n'
const segmentSize = 'Segment\tSize\n'

let lstRes = ''
let lst2Res = ''

fs.writeFileSync(lst1FileUrl, topContent + description)
parsed.forEach((row, index) => {
    let tmp = row.split(/[ ](?=[^\]]*?(?:\[|$))/g).filter(str => str !== '')
    lstRes += config.getInfo(tmp)
})

const [dataSegmentSize, dataSegment1Size, codeSegmentSize] = config.lstWriter(str)

let lst1Errors = `\nErrors: ${Error.errorCount}`
fs.writeFileSync(lstFileUrl, lstRes)
fs.appendFileSync(lst1FileUrl, '\n' + segmentSize
    + dataSegmentSize.toString(16).toUpperCase()
    + '\n' + dataSegment1Size.toString(16).toUpperCase()
    + '\n' + codeSegmentSize.toString(16).toUpperCase() + '\n')
fs.appendFileSync(lst1FileUrl, lst1Errors)
fs.writeFileSync(lst2FileUrl, lst2Res)

// todo jnb and jmp instruction