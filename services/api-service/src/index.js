const express = require('express')
const { connectProducer } = require('./kafka/producer')

const usersRouter = require('./routes/users')
const followsRouter = require('./routes/follows')
const postsRouter = require('./routes/posts')
const likesRouter = require('./routes/likes')

const app = express()

app.use(express.json())

app.use('/users', usersRouter)
app.use('/follow', followsRouter)
app.use('/posts', postsRouter)
app.use('/likes', likesRouter)

const start = async () => {
  await connectProducer()
  app.listen(3000, () => {
    console.log('API Service running on port 3000')
  })
}

start()