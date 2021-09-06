const fetch = require('node-fetch')
const fs = require('fs')

//auth and get userinfo
const authorizeWithGithub = async credentials => {
    const { access_token } = await requestGithubToken(credentials)
    const githubUser = await requestGithubUserAccount(access_token)
    return { ...githubUser, access_token }
}

//credential (client_id, client_secret, client_code)
const requestGithubToken = credentials =>
    fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(credentials)
    })
        .then(res => res.json())

//return : user information
const requestGithubUserAccount = token =>
    fetch(`https://api.github.com/user`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: `token ${token}`
        },
    })
        .then(res => res.json())

const uploadStream = (stream, path) =>
    new Promise((resolve, reject) => {
        stream.on('error', error => {
            if (stream.truncated) {
                fs.unlinkSync(path)
            }
            reject(error)
        }).on('end', resolve)
            .pipe(fs.createWriteStream(path))
    })

module.exports = { authorizeWithGithub, uploadStream }