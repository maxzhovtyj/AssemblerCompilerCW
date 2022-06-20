const fs = require("fs")
const {parser} = require('./parser')
const Error = require('./error')
const {existingLabels, usedLabels, varDefinitions} = require('./data')
const {bracketSplit, quotesSplit} = require("./regex");

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

fs.writeFileSync(lst1FileUrl, topContent + description)
parsed.forEach((row, index) => {
    let tmp
    if (row.includes("'")) tmp = row.split(quotesSplit).filter(str => str !== '')
    else tmp = row.split(bracketSplit).filter(str => str !== '')
    lstRes += parser.getInfo(tmp)
})
fs.writeFileSync(lstFileUrl, lstRes)

const [dataSegmentSize, dataSegment1Size, codeSegmentSize] = parser.lstWriter(str)
fs.appendFileSync(lst1FileUrl, '\n' + segmentSize
    + dataSegmentSize.toString(16).toUpperCase()
    + '\n' + dataSegment1Size.toString(16).toUpperCase()
    + '\n' + codeSegmentSize.toString(16).toUpperCase() + '\n')

if (!eqSet(existingLabels, usedLabels)) Error.errorCall()

let definitionsTable = `\nName\tType\tAddress\tSegment\n`
fs.appendFileSync(lst1FileUrl, definitionsTable)
for (let i = 0; i < varDefinitions.length; i++) {
    fs.appendFileSync(lst1FileUrl, `${varDefinitions[i] + '\n'}`)
}

let lst1Errors = `\nErrors: ${Error.errorCount}`
fs.appendFileSync(lst1FileUrl, lst1Errors)

function eqSet(existingSet, usedSet) {
    for (let a of usedSet) {
        if (!existingSet.has(a)) {
            return false
        }
    }
    return true
}