
import TransferClient from './transfer.js';

export default class UserAPI {
    constructor() {
    }

    static getToken() {
        const token = localStorage.getItem('token')
        return token
    }

    static isLogined() {
        return !!UserAPI.getToken()
    }

    static getAPIHost() {
        // 'http://' + window.API_HOST
        return ''
    }

    static async login(username, password) {
        try {
            const login_api_path = this.getAPIHost() + '/api/login'
            const resp = await fetch(login_api_path, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.value, password: password.value })
            })

            if (resp.status === 200) {
                const data = await resp.json()
                if (data && data.token) {
                    localStorage.setItem('token', data.token)
                    return true
                }
                return '登录成功，但未返回 token'
            } else if (resp.status === 401) {
                return '用户名或密码错误'
            } else {
                const text = await resp.text()
                return '登录失败: ' + (text || resp.status)
            }
        } catch (e) {
            return '网络错误: ' + e.message
        }
    }

    static async logout() {
        localStorage.removeItem('token')
    }

    static async refreshToken() {
        try {
            const token_api_path = this.getAPIHost() + '/api/token'
            const resp = await fetch(token_api_path, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${UserAPI.getToken()}`
                }
            })

            if (resp.status === 200) {
                const data = await resp.json()
                if (data && data.token) {
                    localStorage.setItem('token', data.token)
                    return true
                }
                localStorage.removeItem('token')
                return '刷新成功，但未返回 token'
            } else {
                localStorage.removeItem('token')
                const text = await resp.text()
                return '刷新失败: ' + (text || resp.status)
            }
        } catch (e) {
            localStorage.removeItem('token')
            return '网络错误: ' + e.message
        }
    }
}