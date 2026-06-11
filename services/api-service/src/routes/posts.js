const express = require('express')
const router = express.Router()
const pool = require('../db/postgres')
const { publishEvent } = require('../kafka/producer')
const { v4: uuidv4 } = require('uuid')

router.post('/', async (req, res) => {
  const { userId, content } = req.body

  if (!userId || !content) {
    return res.status(400).json({ error: 'userId and content are required' })
  }

  try {
    const result = await pool.query(
      'INSERT INTO posts (id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [uuidv4(), userId, content]
    )

    const post = result.rows[0]

    await publishEvent('post.created', {
      eventType: 'post.created',
      postId: post.id,
      authorId: userId,
      content: content,
      timestamp: new Date().toISOString()
    })

    res.status(201).json({ postId: post.id })

  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'user does not exist' })
    }
    console.error(err)
    res.status(500).json({ error: 'something went wrong' })
  }
})

module.exports = router