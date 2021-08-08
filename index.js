// 1. 'apollo-server'를 불러옴
const {ApolloServer} = require('apollo-server')

const typeDefs = `
	type Query {
		totalPhotos: Int!
		allPhotos: [Photo!]!
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
	}

	type User {
		githubLogin: ID!
		name: String
		avatar: String
		postedPhotos: [Photo!]!
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
		githubUser: 'gPlake'
	},
	{
		id: '2',
		name: 'two',
		description: 'this is two',
		category: 'LANDSCAPE',
		githubUser: 'sSchmidt'
	},
	{
		id: '3',
		name: 'three',
		description: 'this is three',
		category: 'SELFIE',
		githubUser: 'mHattrup'
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


const resolvers = {
	Query: {
		totalPhotos: () => photos.length,
		allPhotos: () => photos
	},

	Mutation: {
		postPhoto (parent, args) {
			var newPhoto = {
				id: _id++,
				...args.input
			}
			photos.push(newPhoto)

			return newPhoto
		}
	},

	Photo: {
		url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
		postedBy: parent => users.find(user => user.githubLogin === parent.githubUser)
	},

	User: {
		postedPhotos: parent => photos.filter(photo => photo.githubUser === parent.githubLogin)
	}
}

// 서버 인스턴스 새로 생성
// typeDefs(스키마)와 리졸버를 객체에 넣어 전달
const server = new ApolloServer({
	typeDefs,
	resolvers
})

// 웹 서버를 구동하기 위해 listen 메서드를 호출
server
	.listen()
	.then(({url}) => console.log(`GraphQL Service running on ${url}`))