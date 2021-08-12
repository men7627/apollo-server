module.exports = {
	totalPhotos: () => photos.length,
	allPhotos: (parent, args) => photos.filter(photo => new Date(photo.created) > args.after)
}