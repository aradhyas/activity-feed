const express = require('express')
const { connectMongo, getFeedsCollection } = require('./db/mongo')
const { getCachedFeed, cacheFeed } = require('./cache/redis')

const app = express()
app.use(express.json())

app.get('/feed/:userId', async (req, res) => {
  const { userId } = req.params
  const limit = parseInt(req.query.limit) || 20

  try {
    // Step 1: Check Redis first
    const cached = await getCachedFeed(userId)

    if (cached) {
      return res.json({
        userId,
        feed: cached,
        source: 'cache'
      })
    }

    // Step 2: Cache miss — read from MongoDB
    const feedsCollection = getFeedsCollection()
    const doc = await feedsCollection.findOne({ userId })

    if (!doc || !doc.items || doc.items.length === 0) {
      return res.json({ userId, feed: [], source: 'db' })
    }

    const feed = doc.items.slice(0, limit)

    // Step 3: Populate Redis cache
    await cacheFeed(userId, feed)

    return res.json({ userId, feed, source: 'db' })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'something went wrong' })
  }
})

const start = async () => {
  await connectMongo()
  app.listen(3001, () => {
    console.log('Feed Reader running on port 3001')
  })
}

start()