<template>
  <div class="chat-wrapper">
    <Toast ref="toast" />
    <SuccessModal :visible="showSuccessModal" :nickname="nickname" @close="showSuccessModal = false" />
    <FailModal :visible="showFailModal" :nickname="nickname" @close="showFailModal = false" />
    <div class="chat-window" ref="chatBox">
      <div v-for="(msg, index) in chatList" :key="index"
        :class="['chat-item', msg.role === 'user' ? 'from-user' : 'from-system']">
        <div class="avatar">
          <img v-if="msg.role === 'system'" src="@/assets/wugui.png" alt="乌龟" class="avatar-img">
          <img v-else src="@/assets/logo.png" alt="用户" class="avatar-img">
        </div>
        <div class="bubble" :class="msg.role === 'user' ? 'user' : 'system'">
          <template v-if="msg.isThinking">
            乌龟正在思考<span class="dots"><span>.</span><span>.</span><span>.</span></span>
          </template>
          <template v-else>
            <div v-html="msg.content"></div>
            <span v-if="num !== null && msg.role === 'system'"
              style="display: block; font-size: 12px; color: #666; margin-top: 4px; font-style: italic;">
              剩余次数：{{ num }}
            </span>
          </template>
        </div>
      </div>
    </div>

    <div class="input-area">
      <input v-model="userInput" type="text" class="input" placeholder="输入你的推理..." @keyup.enter="submit"
        :disabled="isGameOver" />
      <button class="send-btn" @click="submit" :disabled="isGameOver">发送</button>
    </div>
  </div>
</template>

<script>
import { getTitle, submitAnswer } from '@/api/chat'
import Toast from '@/components/Toast.vue'
import SuccessModal from '@/components/SuccessModal.vue'
import FailModal from '@/components/FailModal.vue'

export default {
  name: "TurtleSoupFusion",
  components: {
    Toast,
    SuccessModal,
    FailModal
  },
  data() {
    return {
      userInput: "",
      isThinking: false,
      nickname: sessionStorage.getItem('turtleSoupNickname') || '游客',
      chatList: [],
      user_token: '',
      sess_token: '',
      title_data: {},
      input_flag: true,
      storyId: '',
      newStoryArr: [],
      showSuccessModal: false,
      showFailModal: false,
      isGameOver: false,
      num: null
    };
  },
  created() {
    // 从 localStorage 读取数据
    const savedChatList = localStorage.getItem('turtleSoupChatList')
    const savedNewStoryArr = localStorage.getItem('turtleSoupNewStoryArr')

    if (savedChatList) {
      this.chatList = JSON.parse(savedChatList)
    }
    if (savedNewStoryArr) {
      this.newStoryArr = JSON.parse(savedNewStoryArr)
    }
  },
  watch: {
    // 监听数组变化，保存到 localStorage
    chatList: {
      handler(newVal) {
        localStorage.setItem('turtleSoupChatList', JSON.stringify(newVal))
      },
      deep: true
    },
    newStoryArr: {
      handler(newVal) {
        localStorage.setItem('turtleSoupNewStoryArr', JSON.stringify(newVal))
      },
      deep: true
    },
    // 监听游戏状态变化
    isGameOver: {
      handler(newVal) {
        localStorage.setItem('turtleSoupGameOver', JSON.stringify(newVal))
      }
    },
    // 监听剩余次数变化
    num: {
      handler(newVal) {
        if (newVal !== null) {
          localStorage.setItem('turtleSoupRemainingTries', JSON.stringify(newVal))
        }
      }
    }
  },
  async mounted() {
    // 从 localStorage 恢复聊天记录
    const savedChatList = localStorage.getItem('turtleSoupChatList')
    const savedNewStoryArr = localStorage.getItem('turtleSoupNewStoryArr')
    const savedToken = localStorage.getItem('turtleSoupToken')
    const savedGameOver = localStorage.getItem('turtleSoupGameOver')
    const savedRemainingTries = localStorage.getItem('turtleSoupRemainingTries')
    
    if (savedChatList) {
      this.chatList = JSON.parse(savedChatList)
    } else {
      // 如果没有保存的聊天记录，则显示初始故事
      this.title_data = { ...this.$route.query }
      this.storyId = this.title_data.storyId
      this.chatList = [{
        role: 'system',
        content: this.title_data.surface
      }]
    }

    if (savedNewStoryArr) {
      this.newStoryArr = JSON.parse(savedNewStoryArr)
    }

    // 恢复 token
    if (savedToken) {
      this.title_data.token = savedToken
    } else if (this.$route.query.token) {
      // 如果是新进入的，保存 token
      this.title_data.token = this.$route.query.token
      localStorage.setItem('turtleSoupToken', this.$route.query.token)
    }

    // 恢复游戏状态
    if (savedGameOver) {
      this.isGameOver = JSON.parse(savedGameOver)
    }

    // 恢复剩余次数
    if (savedRemainingTries) {
      this.num = JSON.parse(savedRemainingTries)
    }

    // 滚动到底部
    this.$nextTick(() => {
      this.scrollToBottom()
    })
  },
  methods: {
    async submit() {
      if (!this.input_flag) {
        this.$refs.toast.type = 'info'
        this.$refs.toast.show('请等待乌龟思考完毕~')
        return
      }
      const text = this.userInput.trim();
      if (!text) return;

      // 用户消息入列
      this.chatList.push({ role: "user", content: text });
      this.newStoryArr.push({ role: "user", content: text });
      this.userInput = "";
      this.scrollToBottom();

      // 开始"思考"
      this.isThinking = true;
      this.input_flag = false;

      // 添加思考状态消息
      this.chatList.push({
        role: "system",
        content: "乌龟正在思考...",
        isThinking: true
      });
      this.scrollToBottom();

      const data = await submitAnswer({
        "sessionToken": this.title_data.token,
        "messages": [...this.newStoryArr]
      })

      this.input_flag = true;
      this.isThinking = false;

      if (data.code != 200) return this.$refs.toast.show(data.message)

      // 移除思考状态消息
      this.chatList = this.chatList.filter(msg => !msg.isThinking);
      this.num = data.data.remainingTries
      if (data.data.isCorrect) {
        this.showSuccessModal = true
        this.isGameOver = true  // 游戏结束，禁用输入
        this.newStoryArr.push({
          role: "system",
          content: data.data.reply
        });
        this.chatList.push({
          role: "system",
          content: data.data.reply
        });
      } else if (
        // 是否还有次数
        data.data.remainingAnswers == 0 && data.data.remainingTries == 0 && data.data.isCorrect == false
      ) {
        this.showFailModal = true
        this.isGameOver = true  // 游戏结束，禁用输入
        this.newStoryArr.push({
          role: "system",
          content: data.data.reply
        });
        this.chatList.push({
          role: "system",
          content: data.data.reply
        });
      }
      // 判断是否开启新的故事
      else if (data.data.newStoryId != 0) {
        // 清空数据
        this.newStoryArr = []
        this.chatList.push({
          role: "system",
          content: '开启新的故事'
        })
        this.chatList.push({
          role: "system",
          content: data.data.newSurface
        });
      } else {
        this.newStoryArr.push({
          role: "system",
          content: data.data.reply
        });
        this.chatList.push({
          role: "system",
          content: data.data.reply
        });
      }

      this.scrollToBottom();
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatBox;
        el.scrollTop = el.scrollHeight;
      });
    },
    clearChat() {
      this.chatList = []
      this.newStoryArr = []
      this.isGameOver = false
      this.num = null
      localStorage.removeItem('turtleSoupChatList')
      localStorage.removeItem('turtleSoupNewStoryArr')
      localStorage.removeItem('turtleSoupToken')
      localStorage.removeItem('turtleSoupGameOver')
      localStorage.removeItem('turtleSoupRemainingTries')
    }
  }
};
</script>

<style scoped>
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
  color: #334155;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 12px;
  box-sizing: border-box;
}

.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;
}

.chat-item {
  display: flex;
  align-items: flex-start;
  max-width: 90%;
  position: relative;
  animation: slideIn 0.2s ease;
}

.from-system {
  flex-direction: row;
  align-self: flex-start;
}

.from-user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.avatar {
  font-size: 20px;
  margin: 0 8px;
  width: 32px;
  height: 32px;
  min-width: 32px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 8px;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  position: relative;
}

.thinking-content,
.message-content {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.system {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.user {
  background: #818cf8;
  color: #ffffff;
}

/* 输入栏 */
.input-area {
  display: flex;
  gap: 8px;
  position: relative;
  z-index: 1;
  background: #ffffff;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.input {
  flex: 1;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.input:focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.1);
}

.input::placeholder {
  color: #94a3b8;
}

.input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.send-btn {
  background: #818cf8;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.send-btn:hover {
  background: #6366f1;
}

.send-btn:active {
  background: #4f46e5;
}

.send-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 打字动画样式 */
.dots {
  display: inline-block;
  margin-left: 2px;
}

.dots span {
  animation: blink 1.5s infinite;
  opacity: 0.3;
  margin-left: 2px;
}

.dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {

  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 自定义滚动条 */
.chat-window::-webkit-scrollbar {
  width: 4px;
}

.chat-window::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.chat-window::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.chat-window::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
