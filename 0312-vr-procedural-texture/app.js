
console.log('node.js server is running')

let express = require('express')

let app = express()

let server = app.listen(3000)

app.use(express.static('public'))

console.log('express server is running')