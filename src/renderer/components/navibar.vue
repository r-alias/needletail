<template>
  <div id="navibar">
    <div class="tags has-addons" style="margin-left: 10px" >
      <a class="tag" @click="$emit('state-change')" style="-webkit-app-region: no-drag">
        <figure class="image is-16x16">
          <img src="~@/assets/_ionicons_svg_md-settings.svg">
        </figure>
      </a>
      <a class="tag" @click="$emit('screen-shot')" style="-webkit-app-region: no-drag">
        <figure class="image is-16x16">
          <img src="~@/assets/_ionicons_svg_md-camera.svg">
        </figure>
      </a>
      <span class="tag is-primary">Att >></span>
      <a v-for="(attachment, filename) in attachments" :key="filename" class="tag is-primary" @click="$emit('show-attachment',attachment.mediaId)" style="-webkit-app-region: no-drag">
        <figure class="image is-16x16">
          <img src="~@/assets/_ionicons_svg_md-image.svg">
        </figure>
      </a>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'navi-page',
    props: ['attachments']
  }
</script>
<style>
</style>
