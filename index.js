const express = require('express')
const { ApolloServer, PubSub } = require('apollo-server-express')
const { MongoClient } = require('mongodb')
const { readFileSync } = require('fs')
const expressPlayground = require('graphql-playground-middleware-express').default
const resolvers = require('./resolvers')
const { createServer } = require('http')
const path = require('path')
const depthLimit = require('graphql-depth-limit')

require('dotenv').config()
var typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')

async function start() {
	const app = express()
	const MONGO_DB = process.env.DB_HOST
	let db

	try {
		const client = await MongoClient.connect(MONGO_DB, { useNewUrlParser: true })
		db = client.db()
	} catch (error) {
		console.log(`
    
      Mongo DB Host not found!
      please add DB_HOST environment variable to .env file
      exiting...
       
    `)
		process.exit(1)
	}

	const pubsub = new PubSub()

	const server = new ApolloServer({
		typeDefs,
		resolvers,
		validationRules: [depthLimit(3)],
		context: async ({ req, connection }) => {

			//Mutation, Query는 HTTP를 사용하므로 이들 요청은 request 인자를 그대로 사용
			//Subscription 요청은 websocket을 사용하므로 req가 null
			//Subscription 정보는 클라이언트가 웹소켓에 연결할 때 전송됨
			//웹소켓 connection 인자가 컨텍스트 함수로 전송됨
			const githubToken = req ? req.headers.authorization :
										connection.context.Authorization

			const currentUser = await db.collection('users').findOne({ githubToken })

			return { db, currentUser, pubsub }
		}
	})

	server.applyMiddleware({ app })

	app.get('/playground', expressPlayground({ 
		endpoint: '/graphql',
		subscriptionEndpoint: '/graphql'
	}))

	app.use(
		'/img/photos',
		express.static(path.join(__dirname, 'assets', 'photos'))
	)

	// app.get('/', (req, res) => {
	// 	let url = `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user`
	// 	res.end(`<a href="${url}">Sign In with Github</a>`)
	// })

	// app.listen({ port: 4000 }, () =>
	// 	console.log(`GraphQL Server running at http://localhost:4000${server.graphqlPath}`)
	// )

	//app 사용해 httpSever 새로 하나 만듬
	//express 설정에 의해 처리해야 하는 모든 HTTP 요청이 httpServer로 들어옴
	//웹소켓용 서버 인스턴스 
	const httpServer = createServer(app)

	//웹소켓 구동
	//웹소켓 subscription 기능 사용할 때 필요한 핸들러가 아폴로 서버에 추가
	server.installSubscriptionHandlers(httpServer)

	httpServer.timeout = 5000

	httpServer.listen({ port: 4000 }, () =>
		console.log(`GraphQL Server running at localhost:4000${server.graphqlPath}`)
	)
}

start()

