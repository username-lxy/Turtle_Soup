<template>
    <div class="welcome-page" :class="{ 'fade-out': isTransitioning }">
        <Toast ref="toast" />
        <div class="welcome-content">
            <h1 class="title">乌龟汤</h1>
            <p class="subtitle">来解开这个谜题吧</p>

            <div class="input-container" :class="{ 'shake': showError }">
                <input v-model="nickname" type="text" placeholder="请输入你的昵称" @keyup.enter="startGame"
                    :disabled="isTransitioning">
                <div class="error-message" v-if="showError">请输入昵称</div>
            </div>

            <button class="start-btn" @click="startGame" :disabled="isTransitioning">
                开始游戏
            </button>
        </div>
    </div>
</template>

<script>
import Toast from '@/components/Toast.vue'
import { getTitle } from '@/api/chat'
export default {
    name: 'Welcome',
    components: {
        Toast
    },
    data() {
        return {
            nickname: '',
            showError: false,
            isTransitioning: false,
            queryData: {},
            isNewScan: false
        }
    },
    async mounted() {
        // 清空之前的聊天数据
        localStorage.removeItem('turtleSoupChatList')
        localStorage.removeItem('turtleSoupNewStoryArr')
        localStorage.removeItem('turtleSoupToken')
        localStorage.removeItem('turtleSoupGameOver')
        localStorage.removeItem('turtleSoupRemainingTries')
        
        // 检查是否是新的扫码
        this.isNewScan = !!this.$route.query.active_token
        
        // 检查是否已经存在昵称
        const existingNickname = sessionStorage.getItem('turtleSoupNickname')
        if (existingNickname) {
            // 如果是新的扫码，清空昵称
            if (this.isNewScan) {
                sessionStorage.removeItem('turtleSoupNickname')
                this.isTransitioning = false
                return
            }
            
            this.$refs.toast.show('请重新扫码获取新的游戏会话')
            this.isTransitioning = true
            return
        }
        
        // 检查URL参数
        this.checkUrlParams()
    },
    methods: {
        checkUrlParams() {
            const activeToken = this.$route.query.active_token
            console.log('URL参数:', this.$route.query)
            console.log('Token:', activeToken)

            if (activeToken) {
                // 将token存储到本地
                localStorage.setItem('active_token', activeToken)
                console.log('Token已保存到本地:', activeToken)
            } else {
                this.$refs.toast.show('请重新扫码')
            }
        },
        async startGame() {
            // 再次检查是否已经存在昵称
            const existingNickname = sessionStorage.getItem('turtleSoupNickname')
            if (existingNickname && !this.isNewScan) {
                this.$refs.toast.show('请重新扫码获取新的游戏会话')
                return
            }

            if (!this.nickname.trim()) {
                this.showError = true
                setTimeout(() => {
                    this.showError = false
                }, 500)
                return
            }

            // 保存昵称到 localStorage
            sessionStorage.setItem('turtleSoupNickname', this.nickname.trim())

            this.isTransitioning = true
            this.user_token = localStorage.getItem('active_token')
            const data = await getTitle({
                "activityToken": this.user_token
            })
            console.log(data);
            if (data.code != 200) return this.$refs.toast.show(data.message)
            this.queryData = data.data
            console.log(this.queryData);

            // 延迟跳转，等待动画完成
            setTimeout(() => {
                this.$router.replace({
                    path: '/chat',
                    query: {
                        ...this.queryData
                    }
                })
            }, 300)
        },
    },
    watch: {
        // 监听 active_token 的变化
        '$route.query.active_token': {
            handler(newToken) {
                if (newToken) {
                    localStorage.setItem('active_token', newToken)
                    console.log('Token已更新:', newToken)
                }
            },
            immediate: true
        }
    },
}
</script>

<style scoped>
.welcome-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    transition: opacity 0.8s ease;
}

.welcome-page.fade-out {
    opacity: 0;
}

.welcome-content {
    text-align: center;
    padding: 40px;
    background: #fafafa;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
    border: 1px solid #eaeaea;
    width: 90%;
    max-width: 400px;
}

.title {
    font-size: 36px;
    font-weight: 600;
    margin: 0 0 8px;
    color: #000000;
    letter-spacing: 2px;
}

.subtitle {
    font-size: 16px;
    color: #666666;
    margin: 0 0 32px;
}

.input-container {
    margin-bottom: 24px;
    position: relative;
}

input {
    width: 100%;
    padding: 14px 16px;
    font-size: 16px;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    outline: none;
    transition: all 0.3s ease;
    background: #ffffff;
}

input:focus {
    border-color: #000000;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

.error-message {
    position: absolute;
    bottom: -20px;
    left: 0;
    right: 0;
    text-align: center;
    color: #ff4d4f;
    font-size: 14px;
}

.shake {
    animation: shake 0.5s ease;
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-5px);
    }

    75% {
        transform: translateX(5px);
    }
}

.start-btn {
    width: 100%;
    padding: 14px;
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;
    background: #000000;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.start-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
}

.start-btn:hover {
    background: #333333;
    transform: translateY(-1px);
}

.start-btn:active {
    transform: translateY(0);
}

.start-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
</style>