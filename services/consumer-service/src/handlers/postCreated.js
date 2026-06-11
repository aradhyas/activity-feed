const pool = require('../db/postgres')
const { getFeedsCollection } = require('../db/mongo')
const { invalidateFeedCache } = require('../cache/redis')

const handlePostCreated = async (event) => {
  const { postId, authorId, content, timestamp } = event

  console.log(`Processing post.created — postId: ${postId}, author: ${authorId}`)

  // Step 1: Find everyone who follows the author
  const result = await pool.query(
    'SELECT follower_id FROM follows WHERE following_id = $1',
    [authorId]
  )

  const followers = result.rows.map(row => row.follower_id)
  console.log(`Found ${followers.length} followers for author ${authorId}`)

  if (followers.length === 0) return

  const feedsCollection = getFeedsCollection()

  // Step 2: Write feed item to each follower's MongoDB document
  for (const followerId of followers) {

    // Idempotency check — skip if this post already exists in their feed
    const existing = await feedsCollection.findOne({
      userId: followerId,
      'items.postId': postId
    })

    if (existing) {
      console.log(`Skipping duplicate — postId ${postId} already in feed for ${followerId}`)
      continue
    }

    // Write the feed item
    await feedsCollection.updateOne(
      { userId: followerId },
      {
        $push: {
          items: {
            $each: [{
              type: 'post',
              postId,
              from: authorId,
              content,
              timestamp
            }],
            $sort: { timestamp: -1 },
            $slice: 100
          }
        }
      },
      { upsert: true }
    )

    // Step 3: Bust Redis cache for this follower
    await invalidateFeedCache(followerId)

    console.log(`Feed updated for follower ${followerId}`)
  }
}

module.exports = handlePostCreated