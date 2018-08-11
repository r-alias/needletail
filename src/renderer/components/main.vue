<template>
  <div id="wrapper">
    <textarea 
      class="textarea"
      :class="textAreaClass"
      :style="{
        height: height-20 + 'px',
        width: width + 'px',
        minWidth: 0 + '%',
        resize: 'none',
        fontSize: '11pt'
      }"
      :disabled='this.tweeting'
      v-model="textarea"
      @keydown="inputHandler"
      rows="2"
      placeholder="What's happening?">
    </textarea>
  </div>
</template>

<script>
  export default {
    name: 'main-page',
    props: ['width', 'height', 'attachments', 'tweeting'],
    data () {
      return {
        maxChar: 140,
        textarea: ''
      }
    },
    methods: {
      inputHandler (e) {
        if (this.textarea.length > this.maxChar) return
        if (e.keyCode === 13 && ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey))) {
          e.preventDefault()
          if (this.textarea === '') return
          this.$emit('submit', this.textarea)
        }
      }
    },
    computed: {
      textAreaClass () {
        let elmClass = {}
        if (this.textarea.length > this.maxChar) {
          elmClass['is-danger'] = true
        } else if (this.textarea.length > this.maxChar - 10) {
          elmClass['is-warning'] = true
        }
        if (this.sendingTweet) {
          elmClass['is-loading'] = true
        }
        return elmClass
      }
    },
    created: function () {
      this.$electron.ipcRenderer.on('res-twitter-tweet', (event, args) => {
        this.textarea = ''
      })
    }
  }
</script>
<style>
textarea {
  -webkit-app-region: no-drag;
  min-width: 0%;
}
</style>
