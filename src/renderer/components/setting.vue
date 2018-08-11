<template>
  <div id="wrapper" style="font-size:10px">
    <div class="columns is-mobile is-gapless">
      <div class="column"></div>
      <div class="column is-half-mobile is-two-fifths-tablet">
        Authentication
        <button class="tag" @click="authenticate">Auth</button>
      </div>
      <div class="column is-one-third-mobile">
        {{authState}}:{{userName}}
      </div>
      <div class="column"></div>
    </div>
    <div class="columns is-mobile is-gapless">
      <div class="column"></div>
      <div class="column is-half-mobile is-two-fifths-tablet">
        Always on top
      </div>
      <div class="column is-one-third-mobile">
        <input type="checkbox" v-model="alwaysOnTop" @click="$emit('set-always-on-top',!alwaysOnTop)">
      </div>
      <div class="column"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'main-page',
    props: ['alwaysOnTopParent'],
    data () {
      return {
        authState: '',
        userName: '',
        alwaysOnTop: false
      }
    },
    methods: {
      authenticate () {
        this.$electron.ipcRenderer.send('twitter-authenticate')
        this.$electron.ipcRenderer.removeAllListeners('res-twitter-authenticate')
        this.$electron.ipcRenderer.on('res-twitter-authenticate', (event, args) => {
          console.log('res-twitter-authenticate')
          this.$electron.ipcRenderer.send('twitter-getSetting')
        })
      }
    },
    created () {
      this.alwaysOnTop = this.alwaysOnTopParent
      // get authenticate info
      this.$electron.ipcRenderer.send('twitter-getSetting')
      this.$electron.ipcRenderer.removeAllListeners('res-twitter-getSetting')
      this.$electron.ipcRenderer.on('res-twitter-getSetting', (event, args) => {
        console.log('res-twitter-getSetting')
        this.authState = args.isAuth ? 'authenticated' : 'none'
        this.userName = args.userName
      })
    }
  }
</script>
<style>
textarea {
  border: 1px solid;
  border-radius: 1em;
  font-size: 1em;
}
</style>
