<template>
  <transition name="toast">
    <div v-if="visible" class="toast" :class="type">
      {{ toastMessage }}
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    type: {
      type: String,
      default: 'error',
      validator: value => ['error', 'success', 'warning', 'info'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  data() {
    return {
      visible: false,
      toastMessage: ''
    }
  },
  methods: {
    show(message) {
      this.toastMessage = message
      this.visible = true
      if (this.duration > 0) {
        setTimeout(() => {
          this.hide()
        }, this.duration)
      }
    },
    hide() {
      this.visible = false
    }
  }
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
  max-width: 80%;
}

.toast.error {
  background-color: #ff4d4f;
}

.toast.success {
  background-color: #52c41a;
}

.toast.warning {
  background-color: #faad14;
}

.toast.info {
  background-color: #b37feb;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter, .toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style> 