const { server } = require('./server.js')

const hostname = '127.0.0.1'
const port = 3001

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`)
})