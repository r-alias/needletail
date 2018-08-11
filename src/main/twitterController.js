import {ipcMain} from 'electron'
import Twitter from 'twitter'
import OauthTwitter from 'electron-oauth-twitter'
import Config from 'electron-config'
import fs from 'fs'

const consumerKey = 'RhJQkLyWCE4vaOzsIDLoKHCo9'
const consumerSecret = 'q2nvEtLIHlG7rolbHYqmpUaFusjfq4kNtJQgaTzlqS6GNSr5A1'
const config = new Config({name: 'wom'})
let accessTokenKey = config.get('accessTokenKey', '')
let accessTokenSecret = config.get('accessTokenSecret', '')
let accountName = config.get('accountName', '')
const oauthTwitter = new OauthTwitter({
  key: consumerKey,
  secret: consumerSecret
})

ipcMain.on('twitter-authenticate', async (event, arg) => {
  console.log('twitter-authenticate')
  const options = {
    force_login: true
  }
  try {
    let result = await oauthTwitter.startRequest(options)
    accessTokenKey = result.oauth_access_token
    accessTokenSecret = result.oauth_access_token_secret
    config.set('accessTokenKey', accessTokenKey)
    config.set('accessTokenSecret', accessTokenSecret)

    let client = new Twitter({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token_key: accessTokenKey,
      access_token_secret: accessTokenSecret
    })
    let accountSettings = await client.get('account/settings', {})
    accountName = accountSettings['screen_name']
    config.set('accountName', accountName)
  } catch (error) {
    console.error(error, error.stack) // eslint-disable-line no-console
  }
  event.sender.send('res-twitter-authenticate')
})

ipcMain.on('twitter-tweet', (event, arg) => {
  console.log('twitter-tweet')
  let client = new Twitter({
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    access_token_key: accessTokenKey,
    access_token_secret: accessTokenSecret
  })
  client.post('statuses/update', {
    status: arg.tweet,
    media_ids: arg.medias
  }).then(_ => {
    event.sender.send('res-twitter-tweet', true)
  }).catch(error => {
    console.error(error)
    event.sender.send('res-twitter-tweet', false)
  })
})

ipcMain.on('twitter-upload', (event, arg) => {
  console.log('twitter-upload')
  let image = fs.readFileSync(arg.path)
  let client = new Twitter({
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    access_token_key: accessTokenKey,
    access_token_secret: accessTokenSecret
  })
  client.post('media/upload', {
    media: image
  }).then(media => {
    event.sender.send('res-twitter-upload', media.media_id_string)
  })
})

ipcMain.on('twitter-getSetting', (event) => {
  let isAuth = ((accessTokenKey !== '') && (accessTokenSecret !== ''))
  console.log('twitter-getSetting')
  event.sender.send('res-twitter-getSetting', {
    isAuth: isAuth,
    userName: accountName
  })
})
