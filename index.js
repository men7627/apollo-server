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
var photos = []


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
		url: parent => `http://yoursite.com/img/${parent.id}.jpg`
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