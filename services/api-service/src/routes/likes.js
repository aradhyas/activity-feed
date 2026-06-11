const express = require('express')
const router = express.Router()
const pool = require('../db/postgres')
const { publishEvent } = require('../kafka/producer')

router.post('/', async (req, res) => {
  const { userId, postId } = req.body

  if (!userId || !postId) {
    return res.status(400).json({ error: 'userId and postId are required' })
  }

  try {
    // Get the post so we know who the author is
    const postResult = await pool.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [postId]
    )

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'post not found' })
    }

    const postAuthorId = postResult.rows[0].user_id

    await pool.query(
      'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
      [userId, postId]
    )

    await publishEvent('post.liked', {
      eventType: 'post.liked',
      postId,
      likedBy: userId,
      postAuthorId,
      timestamp: new Date().toISOString()
    })

    res.status(200).json({ message: 'liked successfully' })

  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'already liked' })
    }
    console.error(err)
    res.status(500).json({ error: 'something went wrong' })
  }
})

module.exports = router