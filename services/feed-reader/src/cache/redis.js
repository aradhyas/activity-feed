const Redis = require('ioredis')

const redis = new Redis({
  host: 'localhost',
  port: 6379
})

const getCachedFeed = async (userId) => {
  const cached = await redis.get(`feed:${userId}`)
  if (cached) {
    return JSON.parse(cached)
  }
  return null
}

const cacheFeed = async (userId, feed) => {
  await redis.set(
    `feed:${userId}`,
    JSON.stringify(feed),
    'EX',
    60
  )
}

module.exports = { getCachedFeed, cacheFeed }
