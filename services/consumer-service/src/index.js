const { Kafka } = require('kafkajs')
const { connectMongo } = require('./db/mongo')
const pool = require('./db/postgres')

const handlePostCreated = require('./handlers/postCreated')
const handleUserFollowed = require('./handlers/userFollowed')

const kafka = new Kafka({
  clientId: 'consumer-service',
  brokers: ['localhost:9092']
})

const consumer = kafka.consumer({ groupId: 'activity-feed-consumer' })

const start = async () => {
  await connectMongo()

  await consumer.connect()
  console.log('Kafka consumer connected')

  await consumer.subscribe({ topics: ['post.created', 'user.followed'], fromBeginning: true })
  console.log('Subscribed to topics')

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const event = JSON.parse(message.value.toString())
      console.log(`Received event: ${event.eventType}`)

      if (topic === 'post.created') {
        await handlePostCreated(event)
      } else if (topic === 'user.followed') {
        await handleUserFollowed(event)
      }
    }
  })
}

start()