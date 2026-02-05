
import TransferClient from './transfer.js';
import { RuntimeVariables } from './helpers.js'

export default class UserAPI {
    constructor() {
    }

    static isLogined() {
        return !!RuntimeVariables.getToken()
    }

    static async login(username, password, storageServerID, rememberPassword = false) {
        try {
            const login_api_path = RuntimeVariables.getHttpAPIPrefix() + '/api/login'
            const resp = await fetch(login_api_path, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    clientID: RuntimeVariables.getClientID(),
                    storageServerID: storageServerID
                })
            })

            if (resp.status === 200) {
                const data = await resp.json()
                if (data && data.token) {
                    // 根据rememberPassword参数决定是否保存密码
                    const passwordToSave = rememberPassword ? password : ""
                    RuntimeVariables.updateAfterLogin(username, storageServerID, data.token, passwordToSave)
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
        RuntimeVariables.cleanup()
    }

    static async refreshToken() {
        try {
            const token_api_path = RuntimeVariables.getHttpAPIPrefix() + '/api/token'
            const resp = await fetch(token_api_path, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RuntimeVariables.getToken()}`
                }
            })

            if (resp.status === 200) {
                const data = await resp.json()
                if (data && data.token) {
                    RuntimeVariables.updateAfterLogin(
                        RuntimeVariables.getUserName(),
                        RuntimeVariables.getStorageServerID(),
                        data.token
                    )
                    return true
                }
                RuntimeVariables.cleanup()
                return '刷新成功，但未返回 token'
            } else {
                RuntimeVariables.cleanup()
                const text = await resp.text()
                return '刷新失败: ' + (text || resp.status)
            }
        } catch (e) {
            RuntimeVariables.cleanup()
            return '网络错误: ' + e.message
        }
    }
}