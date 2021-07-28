if (typeof io == 'undefined') {
  const script = document.createElement('script')
  script.src = 'https://cursor-chat-multiplayer.maxwofford.repl.co/socket.io/socket.io.js'
  document.head.append(script)
  script.onload = initMice

  const styles = document.createElement('link')
  document.head.append(styles)
  styles.rel = 'stylesheet';
  styles.href = 'https://cursor-chat-multiplayer.maxwofford.repl.co/style.css'
} else {
  initMice()
}

function initMice() {
  const socket = io('https://cursor-chat-multiplayer.maxwofford.repl.co')
  let userID
  let initialized = false
  
  socket.on('assign id', ({id}) => {
    userID = id
  })
  socket.on('user joined', ({numUsers}) => {
    console.log('another user joined, now at', numUsers)
  })
  socket.on('user left', ({numUsers, id}) => {
    console.log('another user left, now at', numUsers)
    let el = document.querySelector(`#${id}`)
    if (el) {
      el.remove()
    }
  })
  socket.on('user moved', ({id, x, y, ts}) => {
    let el = document.querySelector(`#${id}`)
    if (!el) {
      el = document.createElement('div')
      el.className = 'cursor'
      el.id = id
      document.body.appendChild(el)
    }
    if (!el.dataset.lastMove || el.dataset.lastMove < (ts + 50)) {
      el.dataset.lastMove = ts
      el.style.transform = `translate(${x*window.innerWidth/100}px, ${y*window.innerHeight/100}px)`
    }
  })
  
  const handleMouseMove = event => {
    if (userID) {
      let x = event.pageX / window.innerWidth * 100
      let y = event.pageY / window.innerHeight * 100
      data = {x, y, ts: Date.now()}
      socket.emit('move user', data)
    }
  }
  
  document.onmousemove = handleMouseMove
}