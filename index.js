const express = require('express');
const app = express();
const path = require('path')

const server = app.listen(3000, () => {
  console.log('server started')
})
const ioOptions = {
  cors: true,
  origins: '*' // fuq da police
}
const io = require('socket.io')(server, ioOptions)

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(express.static(path.join(__dirname, 'public')))

let numUsers = 0
let users = {}

let generateUsername = () => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)

io.on('connection', socket => {
  ++numUsers
  io.sockets.emit('user joined', {
    numUsers
  })

  socket.username = generateUsername()
  socket.emit('assign id', { id: socket.username })

  socket.on('disconnect', () => {
    --numUsers
    socket.broadcast.emit('user left', {
      numUsers,
      id: socket.username
    })
  })

  socket.on('move user', ({x, y, ts}) => {
    if (!socket.lastMove || socket.lastMove < (ts+10)) {
      socket.lastMove = ts
      socket.broadcast.emit('user moved', {
        ts, // put a timestamp on it so clients can ignore outdated broadcasts
        id: socket.username,
        x,
        y,
      })
    }
  })
})
