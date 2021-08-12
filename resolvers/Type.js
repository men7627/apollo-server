const { GraphQLScalarType } = require('graphql')

module.exports = {
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