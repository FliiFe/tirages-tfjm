const http = require('http')
const httpProxy = require('http-proxy')

const tournois = process.env.TOURNOIS.split(',')
console.log(tournois)

const proxy = httpProxy.createProxyServer({})

const server = http.createServer(function (req, res) {
    const { url } = req
    let matched = false
    tournois.forEach((tournoi, i) => {
        if (url.startsWith('/' + tournoi + '/')) {
            // Si la requête correspond à un tournoi connu, alors un passe la requête au bon tournoi
            // console.log('Matched url', req.url)
            proxy.web(req, res, { target: 'http://localhost:' + (8081 + i) })
            matched = true
        }
    })
    if (matched) return
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.write('test')
    res.end()
})

server.on('upgrade', function (req, socket, head) {
    console.log(req.url)
    const { url } = req
    console.log('Socket connected')
    tournois.forEach((tournoi, i) => {
        if (url.startsWith('/' + tournoi + '/')) {
            proxy.ws(req, socket, head, {target: 'http://localhost:' + (8081 + i)})
        }
    })
})

console.log('listening on port 8080')
server.listen(8080)
