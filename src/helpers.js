const serializeWelcomeMessage = (message) => (
  {
    message,
    createdAt: new Date().getTime(),
    username: 'admin'
  }
)

const serializeMessage = (chatId, message, username) => (
  {
    chatId,
    message,
    username,
    createdAt: new Date().getTime()
  }
)

const serializeLocation = (url, username) => (
  {
    username,
    url,
    createdAt: new Date().getTime()
  }
)

const users = []

const format = input => input.trim().toLowerCase()

const addUser = ({ id, chatId, username, room }) => {
  if (!username || !room) return { error: 'Please input username and room to chat on Communicator' }

  username = format(username)
  room = format(room)

  const taken = users.find(user => user.room === room && user.username === username)
  if (taken) return { error: 'Username is taken! Please choose another one' }

  const user = { id, chatId, username, room }
  users.push(user)
  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex(user => user.id === id)
  if (index !== -1) return users.splice(index, 1)[ 0 ]
}

const getUser = (id) => users.find(user => user.id === id)

const getUsersList = (room) => users.filter(user => user.room === room)

module.exports = { addUser, removeUser, getUser, getUsersList, serializeMessage, serializeWelcomeMessage, serializeLocation }

