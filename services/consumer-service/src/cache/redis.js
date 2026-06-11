const Redis = require('ioredis')

const redis = new Redis({
  host: 'localhost',
  port: 6379
})

const invalidateFeedCache = async (userId) => {
  await redis.del(`feed:${userId}`)
}

module.exports = { invalidateFeedCache }