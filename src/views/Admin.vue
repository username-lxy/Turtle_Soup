<template>
    <div class="admin-container">
        <div v-if="showPasswordModal" class="password-modal">
            <div class="modal-content">
                <h2>请输入密码</h2>
                <input type="password" v-model="password" @keyup.enter="checkPassword" placeholder="请输入密码">
                <button @click="checkPassword">确认</button>
                <p v-if="showError" class="error-message">密码错误，请重试</p>
            </div>
        </div>
        <div v-else class="qr-container">
            <div class="qr-wrapper">
                <div ref="qrcode"></div>
                <div class="qr-overlay">
                    <img src="@/assets/logo.png" alt="Logo" class="qr-logo">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import QRCode from 'qrcodejs2'
import { getToken } from '@/api/chat'

export default {
    name: 'Admin',
    data() {
        return {
            showPasswordModal: true,
            password: '',
            showError: false,
            qrUrl: '',
            token: '',
        }
    },
    methods: {
        async checkPassword() {
            if (this.password === 'monad') {
                this.showPasswordModal = false;
                this.showError = false;
                // 获取token
                const data = await getToken()
                console.log(data)
                if (data.code != 200) return ''
                this.token = data.data.token
                this.qrUrl = location.href.split('#')[0] + `#/?active_token=${this.token}`
                console.log(this.qrUrl);

                // 使用 nextTick 确保 DOM 更新后再生成二维码
                this.$nextTick(() => {
                    this.generateQR()
                })
            } else {
                this.showError = true;
                this.password = '';
            }
        },
        generateQR() {
            if (!this.qrUrl || !this.$refs.qrcode) return;

            // 清除之前的二维码
            this.$refs.qrcode.innerHTML = '';

            // 生成新的二维码
            new QRCode(this.$refs.qrcode, {
                text: this.qrUrl,
                width: 200,
                height: 200,
                colorDark: "#1a1a1a",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }
}
</script>

<style scoped>
.admin-container {
    min-height: 100vh;
    background-image: url('@/assets/admin_bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
}

.password-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    text-align: center;
    min-width: 300px;
}

input {
    width: 100%;
    padding: 8px;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
}

button:hover {
    background-color: #45a049;
}

.error-message {
    color: red;
    margin-top: 10px;
}

.qr-container {
    position: fixed;
    bottom: 50px;
    left: 50%;
    padding: 15px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    transform: scale(0.8);
    transform: translateX(-50%);
    transform-origin: bottom right;
}

.qr-wrapper {
    position: relative;
    /* padding: 10px; */
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.qr-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    background: white;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.qr-logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

/* 美化二维码图片 */
:deep(img) {
    border-radius: 6px;
    padding: 8px;
    background: white;
}
</style>