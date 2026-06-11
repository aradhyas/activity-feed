// Kafka — creates a Kafka client pointing at our local broker on port 9092
// producer — the thing that publishes events. Think of it like a mailman — you hand it a message and a topic, 
// it delivers it to Kafka
// connectProducer — opens the connection to Kafka. Must be called once when the service starts
// publishEvent — the function we'll call every time something happens. Takes a topic name (post.created) 
// and a message object, serializes it to JSON, sends it

const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'api-service',
  brokers: ['localhost:9092']
})

const producer = kafka.producer()

const connectProducer = async () => {
  await producer.connect()
  console.log('Kafka producer connected')
}

const publishEvent = async (topic, message) => {
  await producer.send({
    topic,
    messages: [
      {
        key: message.authorId || message.userId || message.followingId,
        value: JSON.stringify(message)
      }
    ]
  })
}

module.exports = { connectProducer, publishEvent }