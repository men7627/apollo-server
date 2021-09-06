const { GraphQLScalarType } = require('graphql')

module.exports = {
	Photo: {
		id: parent => parent._id,
		url: parent => `/img/photos/${parent._id}.jpg`,
		postedBy: (parent, args, { db }) => db.collection('users').findOne({ githubLogin: parent.userID }),
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
	}),
}