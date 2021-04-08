
console.log('my node.js server is running')

const express = require('express')
const app = express()
const server = app.listen(3000)

app.use(express.static('public'))

console.log('my socket server is running')