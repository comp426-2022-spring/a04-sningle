// import {coinFlip, coinFlips, countFlips, flipACoin} from "./coin.mjs"
const minimist = require('minimist')
args["port", "debug", "log", "help"]

const port = args.port || 5000
const debug = args.debug || false
const log = args.log || true
const help = args.help


const express = require('express')
const app = express()
//const db = require('./database')
const morgan = require('morgan')
const errorhandler = require('errorhandler')
const fs = require('fs')


const database = require('better-sqlite3')
const Database = require('better-sqlite3/lib/database')
const { append } = require('express/lib/response')
const db = new Database('log.db')

const helpMSG= (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(helpMSG)
    process.exit(0)
}

app.use((req, res, next) => {
    let logData = {
            remoteaddr: req.ip,
            remoteuser: req.user,
            time: Date.now(),
            method: req.method,
            url: req.url,
            protocol: req.protocol,
            httpversion: req.httpVersion,
            secure: req.secure,
            status: res.statusCode,
            referer: req.headers['referer'],
            useragent: req.headers['user-agent']
        }
        console.log(logData)
        const stmt = db.prepare('INSERT INTO access (remoteaddr, remoteuser, time, method, url, protocol, httpversion, secure, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        const info = stmt.run(logData.remoteaddr, logData.remoteuser, logData.time, logData.method, logData.url, logData.protocol, logData.httpversion, logData.secure, logData.status, logData.referer, logData.useragent)
        next()
    })


if (debug == true) {
    app.get('/app/log/access', (req, res) => {
        res.statusCode = 200;
        res.writeHead(res.statusCode, {"Content-Type" : "text/json"});
        const stmt = db.prepare('SELECT * FROM accesslog').all();
    })

    app.get('/app/error', (req, res) => {
        throw new Error('Error test successful.')
    })
}

if (log == true) {
    const WRITESTREAM = fs.createWriteStream('access.log', { flags: 'a' })
    app.use(morgan('combined', {steam: accessLog}))
} else {
    console.log("No log written.")
}


app.get('/app/', (req, res) => {
    res.statusCode = 200;
    res.statusMessage = "OK";
    res.writeHead(res.statusCode, {"Content-Type" : "text/plain"});
    res.end(res.statusCode + " " + res.statusMessage)
})

app.get('/app/flip/', (req, res) => {
    res.statusCode = 200;
    res.writeHead(res.statusCode, {"Content-Type" : "text/plain"});
    res.send('{"flip":"' + coinFlip() + '"}');
})

app.get('/app/flips/:number', (req, res) => {
    res.statusCode = 200;
    res.writeHead(res.statusCode, {"Content-Type" : "text/plain"});
    const flip_array = coinFlips(req.params.number);
    const sum = countFlips(flip_array)
    res.send('{"raw":\n[' + flip_array + '],"summary":{tails":' + sum.get("tails") + ',"heads":' + sum.get("heads") + '}}')
})

app.get('/app/flip/call/heads', (req, res) => {
    res.statusCode = 200;
    res.writeHead(res.statusCode, {"Content-Type" : "text/plain"});
    const map = flipACoin("heads");
    res.send('{"call":"' + map.get("call") + '","flip":"' + map.get("flip") + '","result":"' + map.get("result") + " }")
})

app.get('/app/flip/call/tails', (req, res) => {
    res.statusCode = 200;
    res.writeHead(res.statusCode, {"Content-Type" : "text/plain"});
    const map = flipACoin("tails");
    res.send('{"call":"' + map.get("call") + '","flip":"' + map.get("flip") + '","result":"' + map.get("result") + " }")
})

app.use(function(req, res){
    res.statusCode = 404;
    res.writeHead(res.statusCode, {"Content-Type" : "text/plain"});
    res.status(404).send("404 NOT FOUND")
});

const server = app.listen(port, () => {
    console.log("App listening on port " + port)
})