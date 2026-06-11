const pool = require('../db/postgres')
const { getFeedsCollection } = require('../db/mongo')
const { invalidateFeedCache } = require('../cache/redis')

const handleUserFollowed = async (event) => {
  const { followerId, followingId, timestamp } = event

  console.log(`Processing user.followed — ${followerId} followed ${followingId}`)

  const feedsCollection = getFeedsCollection()

  // Idempotency check
  const existing = await feedsCollection.findOne({
    userId: followingId,
    'items.followerId': followerId,
    'items.type': 'follow'
  })

  if (existing) {
    console.log(`Skipping duplicate follow event`)
    return
  }

  // Write "X followed you" into the followee's feed
  await feedsCollection.updateOne(
    { userId: followingId },
    {
      $push: {
        items: {
          $each: [{
            type: 'follow',
            followerId,
            timestamp
          }],
          $sort: { timestamp: -1 },
          $slice: 100
        }
      }
    },
    { upsert: true }
  )

  await invalidateFeedCache(followingId)

  console.log(`Feed updated for user ${followingId}`)
}

module.exports = handleUserFollowed
