const {ApolloServer} = require('apollo-server-express')
const express = require('express')
const {GraphQLScalarType} = require('graphql')

const typeDefs = `
	scalar DateTime

	type Query {
		totalPhotos: Int!
		allPhotos(after: DateTime): [Photo!]!
	}

	type Mutation {
		postPhoto(input: PostPhotoInput!): Photo!
	}

	type Photo {
		id: ID!
		url: String!
		name: String!
		description: String
		category: PhotoCategory!
		postedBy: User!
		taggedUsers: [User!]!
		created: DateTime!
	}

	type User {
		githubLogin: ID!
		name: String
		avatar: String
		postedPhotos: [Photo!]!
		inPhotos: [Photo!]!
	}

	enum PhotoCategory {
		SELFIE
		PORTRAIT
		ACTION
		LANDSCAPE
		GRAPHIC
	}

	input PostPhotoInput {
		name: String!
		category: PhotoCategory=PORTRAIT
		description: String
	}
`
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
	{ photoID: '1', userID: 'gPlake'},
	{ photoID: '2', userID: 'sSchmidt'},
	{ photoID: '2', userID: 'mHattrup'},
	{ photoID: '2', userID: 'gPlake'}
]


const resolvers = {
	Query: {
		totalPhotos: () => photos.length,
		allPhotos: (parent, args) => photos.filter(photo => new Date(photo.created) > args.after)
	},

	Mutation: {
		postPhoto (parent, args) {
			var newPhoto = {
				id: _id++,
				created: new Date(),
				...args.input
			}
			photos.push(newPhoto)
			return newPhoto
		}
	},

	Photo: {
		url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
		postedBy: parent => users.find(user => user.githubLogin === parent.githubUser),
		taggedUsers: parent => tags.filter(tag => tag.photoID === parent.id)
									.map(tag => users.find(u => u.githubLogin === tag.userID))							
	},

	User: {
		postedPhotos: parent => photos.filter(photo => photo.githubUser === parent.githubLogin),
		inPhotos: parent => tags.filter(tag => tag.userID === parent.githubLogin)
								.map(tag => photos.find(photo => photo.id === tag.photoID))
	},

	DateTime: new GraphQLScalarType({
		name: 'DateTime',
		description: 'A valid date time value.',
		parseValue: value => new Date(value),
		serialize: value => new Date(value).toISOString(),
		parseLiteral: ast => new Date(ast.value)
	})
}

//express app 생성
var app = express()

// 서버 인스턴스 새로 생성
// typeDefs(스키마)와 리졸버를 객체에 넣어 전달
const server = new ApolloServer({typeDefs,resolvers})

async () => {
	(await server.start())

	//미들웨어가 같은 경로에 마운트되도록 함
	server.applyMiddleware({app})
}

//홈 라우트 생성
app.get('/', (req, res) => res.end('welcome PhotoShare API'))

// 웹 서버를 구동하기 위해 listen 메서드를 호출
app.listen({port: 4000}, () => 
	console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`)
)