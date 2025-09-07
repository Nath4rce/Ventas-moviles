<template>
  <img 
    :src="imageSrc" 
    :alt="alt"
    :class="imgClass"
    @error="handleError"
    @load="handleLoad"
  />
</template>

<script>
import { createFallbackImage } from '../utils/imageFallback.js'

export default {
  name: 'ImageWithFallback',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Imagen'
    },
    imgClass: {
      type: String,
      default: ''
    },
    fallbackText: {
      type: String,
      default: 'Imagen no disponible'
    },
    width: {
      type: Number,
      default: 300
    },
    height: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      imageSrc: this.src,
      hasError: false
    }
  },
  watch: {
    src(newSrc) {
      this.imageSrc = newSrc
      this.hasError = false
    }
  },
  methods: {
    handleError() {
      this.hasError = true
      this.createFallbackImage()
    },
    
    handleLoad() {
      this.hasError = false
    },
    
    createFallbackImage() {
      this.imageSrc = createFallbackImage({
        width: this.width,
        height: this.height,
        text: this.fallbackText
      })
    }
  }
}
</script>

<style scoped>
img {
  transition: opacity 0.3s ease;
}

img:hover {
  opacity: 0.9;
}
</style>
