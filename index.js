const fs = require("fs")
const data = require('./data.js')
const config = require('./parser')
const fileUrl = './kr.asm'
const resFile = './res.txt'

const content = fs.readFileSync(fileUrl)

const str = content.toString()
let parsed = str.split('\n')
    .filter(item => item !== '' && item !== ' ')
    .map(str => str.replaceAll(/[\t]/g, ' '))

let result = ''
parsed.forEach(row => {
    let tmp = row.split(/[ ](?=[^\]]*?(?:\[|$))/g).filter(str => str !== '')
    result += config.getInfo(tmp)
})

fs.writeFileSync(resFile, result)