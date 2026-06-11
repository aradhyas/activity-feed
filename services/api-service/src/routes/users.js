const express = require('express')
const router = express.Router()
const pool = require('../db/postgres')
const { publishEvent } = require('../kafka/producer')
const { v4: uuidv4 } = require('uuid')

router.post('/', async (req, res) => {
  const { name, email } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' })
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (id, name, email) VALUES ($1, $2, $3) RETURNING *',
      [uuidv4(), name, email]
    )

    const user = result.rows[0]

    res.status(201).json({
      userId: user.id,
      name: user.name,
      email: user.email
    })

  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'email already exists' })
    }
    console.error(err)
    res.status(500).json({ error: 'something went wrong' })
  }
})

module.exports = router