/**
 * 原生平台专用工具类
 * 提供原生平台特有的功能和优化
 */

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

export class NativePlatform {
    static instance = null;

    constructor() {
        this.isNative = Capacitor.isNativePlatform();
        this.platform = Capacitor.getPlatform();
    }

    static getInstance() {
        if (!NativePlatform.instance) {
            NativePlatform.instance = new NativePlatform();
        }
        return NativePlatform.instance;
    }

    /**
     * 检查是否支持生物识别
     */
    async checkBiometricSupport() {
        if (!this.isNative) {
            return false;
        }

        try {
            // 这里可以集成实际的生物识别API
            // 暂时返回true用于测试
            return true;
        } catch (error) {
            console.warn('生物识别检查失败:', error);
            return false;
        }
    }

    /**
     * 安全存储凭据（使用原生安全存储）
     */
    async saveCredentialsSecurely(username, password, remember = false) {
        if (!this.isNative || !remember) {
            // 非原生平台或不需要记住密码，使用localStorage
            if (remember) {
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
            } else {
                localStorage.removeItem('username');
                localStorage.removeItem('password');
            }
            return;
        }

        try {
            // 使用原生安全存储
            await Preferences.set({
                key: 'username',
                value: username
            });

            await Preferences.set({
                key: 'password',
                value: password
            });

            console.log('凭据已安全保存');
        } catch (error) {
            console.error('安全存储凭据失败:', error);
            // 回退到localStorage
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
        }
    }

    /**
     * 从安全存储加载凭据
     */
    async loadCredentialsSecurely() {
        if (!this.isNative) {
            return {
                username: localStorage.getItem('username') || '',
                password: localStorage.getItem('password') || ''
            };
        }

        try {
            const [usernameResult, passwordResult] = await Promise.all([
                Preferences.get({ key: 'username' }),
                Preferences.get({ key: 'password' })
            ]);

            return {
                username: usernameResult.value || '',
                password: passwordResult.value || ''
            };
        } catch (error) {
            console.error('从安全存储加载凭据失败:', error);
            // 回退到localStorage
            return {
                username: localStorage.getItem('username') || '',
                password: localStorage.getItem('password') || ''
            };
        }
    }

    /**
     * 清除安全存储的凭据
     */
    async clearCredentials() {
        if (!this.isNative) {
            localStorage.removeItem('username');
            localStorage.removeItem('password');
            return;
        }

        try {
            await Promise.all([
                Preferences.remove({ key: 'username' }),
                Preferences.remove({ key: 'password' })
            ]);
            console.log('安全存储的凭据已清除');
        } catch (error) {
            console.error('清除安全存储凭据失败:', error);
            // 回退到localStorage
            localStorage.removeItem('username');
            localStorage.removeItem('password');
        }
    }

    /**
     * 获取设备信息
     */
    async getDeviceInfo() {
        if (!this.isNative) {
            return {
                platform: 'web',
                isNative: false,
                userAgent: navigator.userAgent
            };
        }

        return {
            platform: this.platform,
            isNative: true,
            userAgent: navigator.userAgent,
            // 可以添加更多设备信息
        };
    }

    /**
     * 设置状态栏样式（原生平台专用）
     */
    async setStatusBarForLogin() {
        if (!this.isNative) {
            return;
        }

        try {
            const { StatusBar, Style } = await import('@capacitor/status-bar');

            // 确保状态栏显示
            await StatusBar.show();

            // 设置不覆盖内容
            await StatusBar.setOverlaysWebView({ overlay: false });

            // 根据平台设置不同的背景色
            if (this.platform === 'ios') {
                // iOS: 浅色状态栏
                await StatusBar.setStyle({ style: Style.Light });
                await StatusBar.setBackgroundColor({ color: '#ffffff' });
            } else {
                // Android: 深色状态栏
                await StatusBar.setStyle({ style: Style.Dark });
                await StatusBar.setBackgroundColor({ color: '#667eea' });
            }

            console.log('登录页面状态栏设置完成');
        } catch (error) {
            console.error('设置状态栏失败:', error);
        }
    }

    /**
     * 禁用原生平台上的文本选择和上下文菜单
     */
    disableNativeTextSelection() {
        if (!this.isNative) {
            return;
        }

        // 添加CSS样式禁用文本选择
        const style = document.createElement('style');
        style.textContent = `
      .login-container.native-app * {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      /* 允许输入框的文本选择 */
      .login-container.native-app input,
      .login-container.native-app textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
        document.head.appendChild(style);
    }

    /**
     * 添加原生平台的手势支持
     */
    addNativeGestureSupport() {
        if (!this.isNative) {
            return;
        }

        // 添加滑动返回支持（仅iOS）
        if (this.platform === 'ios') {
            let startX = 0;
            let startY = 0;

            document.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                }
            }, { passive: true });

            document.addEventListener('touchend', (e) => {
                if (e.changedTouches.length === 1) {
                    const endX = e.changedTouches[0].clientX;
                    const endY = e.changedTouches[0].clientY;

                    const deltaX = endX - startX;
                    const deltaY = endY - startY;

                    // 检测从左侧滑动的返回手势
                    if (deltaX > 100 && Math.abs(deltaY) < 50 && startX < 50) {
                        console.log('检测到返回手势');
                        // 这里可以触发返回操作
                    }
                }
            }, { passive: true });
        }
    }

    /**
     * 优化原生平台的键盘行为
     */
    optimizeNativeKeyboard() {
        if (!this.isNative) {
            return;
        }

        // 监听输入框聚焦事件，优化键盘行为
        document.addEventListener('focusin', (e) => {
            if (e.target.matches('input, textarea')) {
                // 滚动到输入框可见
                setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        }, true);
    }

    /**
     * 初始化原生平台优化
     */
    async initializeNativeOptimizations() {
        if (!this.isNative) {
            return;
        }

        console.log('初始化原生平台优化...');

        // 设置状态栏
        await this.setStatusBarForLogin();

        // 禁用文本选择
        this.disableNativeTextSelection();

        // 添加手势支持
        this.addNativeGestureSupport();

        // 优化键盘行为
        this.optimizeNativeKeyboard();

        console.log('原生平台优化完成');
    }
}

// 导出单例实例
export const nativePlatform = NativePlatform.getInstance();