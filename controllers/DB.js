require('dotenv').config();

const {Client} = require('pg');
const client = new Client({
    host : process.env.PGHOST,
    user : process.env.PGUSER,
    port : process.env.PGPORT,
    database : process.env.PGDATABASE,
    password : process.env.PGPASSWORD 
});


module.exports = client;