const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'feeduser',
  password: 'feedpass',
  database: 'activityfeed'
})

module.exports = pool