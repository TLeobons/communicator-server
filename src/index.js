const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const cors = require('cors')
const { getUsersList, getUser, addUser, removeUser, serializeMessage, serializeWelcomeMessage, serializeLocation } = require('./helpers')

const PORT = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = socketio(server)
app.use(cors())

app.get('/', (req, res) => res.send('Server running'))

io.on('connection', socket => {
    console.log(`Socket ${socket.id} connected`)

    socket.on('join', ({ chatId, username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, chatId, username, room })
        if (error) return callback(error)

        socket.join(user.room)
        socket.emit('message', serializeWelcomeMessage(`Welcome to the ${user.room} room, ${user.username}`))

        socket.broadcast.to(user.room).emit('message', serializeWelcomeMessage(`${user.username} has joined`))
        io.to(user.room).emit('roomData', { users: getUsersList(user.room) })
        callback()
    })

    socket.on('message', (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', serializeMessage(user.chatId, message, user.username))
        callback()
    })

    socket.on('location', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('location', serializeLocation(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`, user.username))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', serializeWelcomeMessage(`${user.username} has left the room`))
            io.to(user.room).emit('roomData', { users: getUsersList(user.room) })
        }
    })
})

server.listen(PORT, () => console.log(`server running on port ${PORT}`, new Date().toLocaleTimeString()))