<template>
  <div v-if="visible" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>🎉 恭喜你！</h2>
      </div>
      <div class="modal-body">
        <p>{{ nickname }}，简直太棒了！</p>
        <p>你成功解开了这个谜题！</p>
      </div>
      <div class="modal-footer">
        <button class="close-btn" @click="close">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SuccessModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    nickname: {
      type: String,
      required: true
    }
  },
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  animation: modalIn 0.3s ease;
}

.modal-header {
  text-align: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.modal-body {
  text-align: center;
  margin-bottom: 24px;
}

.modal-body p {
  margin: 8px 0;
  font-size: 16px;
  color: #666;
}

.modal-footer {
  text-align: center;
}

.close-btn {
  background: #000;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #333;
  transform: translateY(-1px);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 