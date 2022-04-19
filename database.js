const database = require('better-sqlite3')
const Database = require('better-sqlite3/lib/database')
const { append } = require('express/lib/response')
const db = new Database('log.db')

const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`)
let row = stmt.get();


if (row === undefined) {
    console.log('Log database appears to be empty. Creating log database...')

    const sqlInit = `
        CREATE TABLE accesslog ( 
            id INTEGER PRIMARY KEY, 
            remoteaddr VARCHAR, 
            remoteuser VARCHAR, 
            time VARCHAR, 
            method VARCHAR, 
            url VARCHAR, 
            protocol TEXT,
            httpversion NUMERIC, 
            status INTEGER, 
            referer VARCHAR, 
            useragent VARCHAR )
    `

    db.exec(sqlInit)
} else {
    console.log('Log database exists.')
}

module.exports = db