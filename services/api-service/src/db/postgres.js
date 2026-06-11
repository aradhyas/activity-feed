// Pool is a connection pool. Instead of opening and closing a fresh database connection every time a request 
// comes in (expensive), a pool keeps a set of connections open and reuses them.

const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'feeduser',
  password: 'feedpass',
  database: 'activityfeed'
})

module.exports = pool
