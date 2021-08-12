module.exports = {
    postPhoto(parent, args) {
        var newPhoto = {
            id: _id++,
            created: new Date(),
            ...args.input
        }
        photos.push(newPhoto)
        return newPhoto
    }
}