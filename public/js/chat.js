const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
  const $newMessage = $messages.lastElementChild
  const newMessagesStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessagesStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight = newMessageMargin
  const visibleHeight = $messages.offsetHeight
  const containerHeight = $messages.scrollHeight
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight < scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on('message', message => {
  const html = Mustache.render(messageTemplate,
    {
      username: message.username,
      message: message.text,
      createdAt: moment(message.createdAt).format('h:mm:ss a')
    })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

$messageForm.addEventListener('submit', e => {
  e.preventDefault()
  $messageFormButton.setAttribute('disabled', 'disabled')
  const msg = e.target.elements.message.value

  socket.emit('sendMessage', msg, (err) => {
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

    if (err) return console.log(err)

    console.log('Message delivered')
  })
})

$locationButton.addEventListener('click', () => {
  if (!navigator.geolocation) return alert('Geolocation isn\'t supported by your browser')

  $locationButton.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition(({ coords }) => {
    socket.emit('sendLocation',
      {
        latitude: coords.latitude,
        longitude: coords.longitude
      },
      () => $locationButton.removeAttribute('disabled'))
  }, undefined, { enableHighAccuracy: true })
})

socket.on('locationMessage', url => {
  const html = Mustache.render(locationMessageTemplate,
    {
      username: url.username,
      url: url.url,
      createdAt: moment(url.createdAt).format('h:mm:ss a')
    })

  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate,
    {
      room,
      users
    })
  document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})