<template>
  <div id="wrapper" style="font-size:10px">
    <div class="columns is-mobile is-gapless">
      <div class="column"></div>
      <div class="column is-half-mobile is-two-fifths-tablet">
        Authentication
        <button class="tag nodrag" @click="authenticate">Auth</button>
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
      <div class="column is-one-third-mobile nodrag">
        <input type="checkbox" v-model="alwaysOnTop" @click="$emit('set-always-on-top',!alwaysOnTop)">
      </div>
      <div class="column"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'main-page',
    props: ['alwaysOnTopParent', 'userName', 'isAuth'],
    data () {
      return {
        alwaysOnTop: false
      }
    },
    methods: {
      authenticate () {
        this.$electron.ipcRenderer.removeAllListeners('res-twitter-authenticate')
        this.$electron.ipcRenderer.on('res-twitter-authenticate', (event, args) => {
          console.log('res-twitter-authenticate')
          this.$electron.ipcRenderer.send('twitter-getSetting')
        })
        this.$electron.ipcRenderer.send('twitter-authenticate')
      }
    },
    computed: {
      authState () {
        return this.isAuth ? 'authenticated' : 'none'
      }
    },
    created () {
      this.alwaysOnTop = this.alwaysOnTopParent
      // get authenticate info
      this.$electron.ipcRenderer.send('twitter-getSetting')
    }
  }
</script>
<style>
.nodrag {
  -webkit-app-region:no-drag
}
</style>
