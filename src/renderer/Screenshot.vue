<template>
  <div id="app">
    <div id="rect" :style="styleRect"></div>
    <p id="filter" @mousedown="startDrag" @mousemove="mouseMove" @mouseup="endDrag"><img :src="'file://' + screenshotPath" id="filter-img"></p>
  </div>
</template>

<script>
  import os from 'os'
  import path from 'path'
  export default {
    name: 'sshot',
    data () {
      return {
        hold: false,
        sx: 0,
        sy: 0,
        x: 0,
        y: 0,
        height: 0,
        width: 0,
        screenshotPath: path.join(os.tmpdir(), 'screenshot.png')
      }
    },
    methods: {
      startDrag (event) {
        this.hold = true
        this.sx = event.pageX
        this.sy = event.pageY
        this.x = event.pageX
        this.y = event.pageY
      },
      mouseMove (event) {
        if (!this.hold) return
        if (event.pageX > this.sx) {
          if (event.pageY > this.sy) {
            this.x = this.sx
            this.y = this.sy
            this.width = event.pageX - this.sx
            this.height = event.pageY - this.sy
          } else {
            this.x = this.sx
            this.y = event.pageY
            this.width = event.pageX - this.sx
            this.height = this.sy - event.pageY
          }
        } else {
          if (event.pageY > this.sy) {
            this.x = event.pageX
            this.y = this.sy
            this.width = this.sx - event.pageX
            this.height = event.pageY - this.sy
          } else {
            this.x = event.pageX
            this.y = event.pageY
            this.width = this.sx - event.pageX
            this.height = this.sy - event.pageY
          }
        }
      },
      endDrag (event) {
        if (!this.hold) return
        this.hold = false
        this.$electron.ipcRenderer.send('screenshot-select-rect', {
          x: this.x,
          y: this.y,
          height: this.height,
          width: this.width})
        const window = this.$electron.remote.getCurrentWindow()
        window.close()
      }
    },
    computed: {
      styleRect () {
        return {
          top: this.y + 'px',
          left: this.x + 'px',
          height: this.height + 'px',
          width: this.width + 'px'
        }
      }
    }
  }
</script>

<style>
img {
  user-select:none;
  -webkit-user-select:none;
  -webkit-user-drag: none;
}
#filter {
  background:#000;
}
#filter-img {
  display:block;
  opacity:.6;
}
#rect {
  position: absolute;
  background:#FFF;
  opacity:.3;
}
</style>
