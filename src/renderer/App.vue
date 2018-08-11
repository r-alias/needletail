<template>
  <div id="app">
    <div class="column" :style="styleMain">
      <main-page v-if="state===0" :width="width" :height="height" :tweeting='tweeting' @submit="onSubmit"></main-page>
      <setting-page v-else :alwaysOnTopParent="alwaysOnTop" @set-always-on-top="setAlwaysOnTop"></setting-page>
    </div>
    <NaviBar @state-change="onSetting()" @screen-shot="onScreenShot()" @show-attachment="onClickAttachment" :attachments="attachments"></NaviBar>
  </div>
</template>

<script>
  import MainPage from '@/components/main'
  import SettingPage from '@/components/setting'
  import NaviBar from '@/components/navibar'
  import fs from 'fs'
  import os from 'os'
  import path from 'path'
  import jimp from 'jimp'
  export default {
    name: 'wotweet',
    components: {
      MainPage,
      SettingPage,
      NaviBar
    },
    data () {
      return {
        state: 0,
        alwaysOnTop: true,
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth,
        width: 0,
        height: 0,
        attachments: [],
        isAuth: false,
        userName: '',
        tweeting: false
      }
    },
    methods: {
      onClickAttachment (mediaId) {
        this.attachments.forEach((att, index) => {
          if (att.mediaId === mediaId) {
            this.attachments.splice(index, 1)
          }
        })
      },
      authCheck () {
        if (!this.isAuth) {
          this.$electron.remote.dialog.showErrorBox('unauthenticated', 'Please authenticate first.')
        }
        return this.isAuth
      },
      onSubmit (text) {
        if (!this.authCheck()) return
        let mediaIds = ''
        let comma = false
        for (let attachment of this.attachments) {
          if (comma) {
            mediaIds += ','
          }
          comma = true
          mediaIds = mediaIds + attachment.mediaId
        }
        this.$electron.ipcRenderer.send('twitter-tweet', {tweet: text, medias: mediaIds})
        this.tweeting = true
      },
      onScreenShot () {
        if (!this.authCheck()) return
        // 画面キャプチャ
        let screenshotPath = null
        let screenShotPng = null
        let size = this.$electron.screen.getPrimaryDisplay().size
        this.$electron.desktopCapturer.getSources({
          types: ['screen'],
          thumbnailSize: {
            width: size.width,
            height: size.height
          }},
        (error, sources) => {
          if (error) throw error
          for (let source of sources) {
            screenshotPath = path.join(os.tmpdir(), 'screenshot.png')
            screenShotPng = source.thumbnail.toPNG()
            fs.writeFileSync(screenshotPath, screenShotPng)
            console.log(screenshotPath)
            break
          }
        })
        // 最前面設定を一時的に解除
        this.$electron.ipcRenderer.send('electron-setAlwaysOnTop', false)
        // 範囲選択ウィンドウ作成
        const {BrowserWindow} = this.$electron.remote
        let ssWindow = new BrowserWindow({
          fullscreen: true,
          webPreferences: {
            webSecurity: false,
            allowRunningInsecureContent: true
          }})
        let url = process.env.NODE_ENV === 'development'
          ? `http://localhost:9080/screenshot.html`
          : `file://${__dirname}/screenshot.html`
        ssWindow.loadURL(url)
        ssWindow.setAlwaysOnTop(true)
        ssWindow.on('closed', () => {
          // 最前面設定をもとに戻す
          this.$electron.ipcRenderer.send('electron-setAlwaysOnTop', this.alwaysOnTop)
        })
        // 選択完了時のデータ受け取り準備
        this.$electron.ipcRenderer.removeAllListeners('screenshot-select-rect')
        this.$electron.ipcRenderer.on('screenshot-select-rect', (event, args) => {
          // 渡された座標でスクリーン画像をクロップ
          let filename = Date.now() + '.png'
          let sspath = path.join(os.tmpdir(), filename)
          jimp.read(screenShotPng).then((img) => {
            img.crop(args.x, args.y, args.width, args.height).write(sspath, (_) => {
              // twitterにアップロード
              this.$electron.ipcRenderer.send('twitter-upload', {filename: filename, path: sspath})
              this.$electron.ipcRenderer.removeAllListeners('res-twitter-upload')
              this.$electron.ipcRenderer.on('res-twitter-upload', (event, args) => {
                // 添付データにスクショを追加
                this.attachments.push({filename: filename, path: sspath, mediaId: args})
              })
            })
          })
        })
      },
      onSetting () {
        let state = this.state
        state++
        if (state > 1) {
          state = 0
        }
        this.state = state
      },
      setAlwaysOnTop (newAttr) {
        this.alwaysOnTop = newAttr
        this.$electron.ipcRenderer.send('electron-setAlwaysOnTop', this.alwaysOnTop)
      },
      setWindowSize () {
        this.windowHeight = window.innerHeight
        this.windowWidth = window.innerWidth
      },
      getAuthState () {
        this.$electron.ipcRenderer.send('twitter-getSetting')
        this.$electron.ipcRenderer.removeAllListeners('res-twitter-getSetting')
        this.$electron.ipcRenderer.on('res-twitter-getSetting', (event, args) => {
          this.isAuth = args.isAuth
          this.userName = args.userName
        })
      }
    },
    computed: {
      styleMain () {
        this.height = this.windowHeight - 20 - 15
        this.width = this.windowWidth - 10
        return {
          height: this.height + 'px',
          width: this.width + 'px',
          minWidth: 0 + '%',
          margin: 'auto',
          padding: 10 + 'px',
          overflow: 'scroll'
        }
      }
    },
    created: function () {
      // ウィンドウサイズ取得
      window.removeEventListener('resize', this.setWindowSize, false)
      window.addEventListener('resize', this.setWindowSize, false)
      // ツイート完了時に添付ファイルを削除
      this.$electron.ipcRenderer.on('res-twitter-tweet', (event, args) => {
        this.tweeting = false
        if (args) {
          this.attachments = []
        }
      })
      // 認証状態の取得
      this.getAuthState()
    }
  }
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
