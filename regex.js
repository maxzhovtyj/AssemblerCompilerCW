const bracketSplit = new RegExp(/[ ](?=[^\]]*?(?:\[|$))/g)
const quotesSplit = new RegExp(/\s(?=(?:'[^']*'|[^'])*$)/g)
const combinedSplit = new RegExp(bracketSplit.source + '|' + quotesSplit.source)


module.exports = {bracketSplit, quotesSplit, combinedSplit}