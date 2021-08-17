const fetch = require('node-fetch')

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

module.exports = { authorizeWithGithub }