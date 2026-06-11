const express = require('express')
const router = express.Router()
const pool = require('../db/postgres')
const { publishEvent } = require('../kafka/producer')

router.post('/', async (req, res) => {
  const { followerId, followingId } = req.body

  if (!followerId || !followingId) {
    return res.status(400).json({ error: 'followerId and followingId are required' })
  }

  try {
    await pool.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
      [followerId, followingId]
    )

    await publishEvent('user.followed', {
      eventType: 'user.followed',
      followerId,
      followingId,
      timestamp: new Date().toISOString()
    })

    res.status(200).json({ message: 'followed successfully' })

  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'already following' })
    }
    if (err.code === '23503') {
      return res.status(400).json({ error: 'user does not exist' })
    }
    console.error(err)
    res.status(500).json({ error: 'something went wrong' })
  }
})

module.exports = router