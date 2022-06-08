const bracketSplit = new RegExp(/[ ](?=[^\]]*?(?:\[|$))/g)
const quotesSplit = new RegExp(/\s(?=(?:'[^']*'|[^'])*$)/g)
const stringRegex = new RegExp(/^\'(.*?)\'$/g)
const binaryRegex = new RegExp(/^[0-1]+b$/g)
const hexadecimalRegex = new RegExp(/^\d+[a-fA-F0-9]+h$/g)
const decimalRegex = new RegExp(/^-?[\d]+d?$/g)

module.exports = {bracketSplit, quotesSplit, stringRegex, binaryRegex, hexadecimalRegex, decimalRegex}