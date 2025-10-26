const http = require("http");
const PORT = process.env.PORT || 8888;

http.createServer((req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end("Hello world!")
}).listen(PORT);

console.log(`Server is running and listening to port ${PORT}`)