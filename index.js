const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync } = require('fs')

const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')
const resolvers = require('./resolvers')

var _id = 0
var photos = [
	{
		id: '1',
		name: 'one',
		description: 'this is one',
		category: 'ACTION',
		githubUser: 'gPlake',
		created: "3-28-1899"
	},
	{
		id: '2',
		name: 'two',
		description: 'this is two',
		category: 'LANDSCAPE',
		githubUser: 'sSchmidt',
		created: '1-2-1985'
	},
	{
		id: '3',
		name: 'three',
		description: 'this is three',
		category: 'SELFIE',
		githubUser: 'mHattrup',
		created: '2021-08-11T19:00:13'
	}
]

var users = [
	{
		githubLogin: 'mHattrup',
		name: 'Mike Hattrup'
	},
	{
		githubLogin: 'gPlake',
		name: 'Glen Plake'
	},
	{
		githubLogin: 'sSchmidt',
		name: 'Scot Schmidt'
	}
]

var tags = [
	{ photoID: '1', userID: 'gPlake' },
	{ photoID: '2', userID: 'sSchmidt' },
	{ photoID: '2', userID: 'mHattrup' },
	{ photoID: '2', userID: 'gPlake' }
]

async function start() {
	//express app 생성
	var app = express()

	// 서버 인스턴스 새로 생성
	// typeDefs(스키마)와 리졸버를 객체에 넣어 전달
	const server = new ApolloServer({ typeDefs, resolvers })


	//미들웨어가 같은 경로에 마운트되도록 함
	server.applyMiddleware({ app })

	//홈 라우트
	app.get('/', (req, res) => res.end('welcome PhotoShare API'))

	//플레이 그라운드 라우트
	app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

	// 웹 서버를 구동하기 위해 listen 메서드를 호출
	app.listen({ port: 4000 }, () =>
		console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`)
	)
}

start()