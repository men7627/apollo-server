// 1. 'apollo-server'를 불러옴
const {ApolloServer} = require('apollo-server')

const typeDefs = `
	type Query {
		totalPhotos: Int!
	}
`

const resolvers = {
	Query: {
		totalPhotos: () => 42
	}
}

// 2. 서버 인스턴스 새로 생성
// 3. typeDefs(스키마)와 리졸버를 객체에 넣어 전달
const server = new ApolloServer({
	typeDefs,
	resolvers
})

// 4. 웹 서버를 구동하기 위해 listen 메서드를 호출
server
	.listen()
	.then(({url}) => console.log(`GraphQL Service running on ${url}`))