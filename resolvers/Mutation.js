const { authorizeWithGithub } = require("../lib")
const fetch = require('node-fetch')

module.exports = {
    async postPhoto(parent, args, { db, currentUser }) {
        if (!currentUser) {
            throw new Error("only an authorized user can post a photo");
        }

        const newPhoto = {
            ...args.input,
            userID: currentUser.githubLogin,
            created: new Date(),

        }

        await db.collection("photos").insert(newPhoto)

        return newPhoto
    },

    async githubAuth(parent, { code }, { db }) {
        //1. auth request
        let {
            message,
            access_token,
            avatar_url,
            login,
            name
        } = await authorizeWithGithub({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code
        })

        if (message) {
            throw new Error(message)
        }

        //2. mapping userinfo
        let latestUserInfo = {
            name,
            githubLogin: login,
            githubToken: access_token,
            avatar: avatar_url
        }

        //3. update db
        const {
            ops: [user]
        } = await db
            .collection('users')
            .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true })

        return { user, token: access_token }
    },

    async addFakeUsers(root, { count }, { db }) {
        var randomUserApi = `http://randomuser.me/api/?results=${count}`

        var { results } = await fetch(randomUserApi).then(res => res.json())

        var users = results.map(r => ({
            githubLogin: r.login.username,
            name: `${r.name.first} ${r.name.last}`,
            avatar: r.picture.thumbnail,
            githubToken: r.login.sha1
        }))

        db.collection('users').insert(users)

        return users
    },

    async fakeUserAuth(parent, { githubLogin }, { db }) {
        var user = await db.collection('users').findOne({ githubLogin })

        if (!user) {
            throw new Error(`Cannot find user with githubLogin ${githubLogin}`)
        }

        return { token: user.githubToken, user }
    }
}