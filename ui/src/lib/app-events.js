/**
 * 应用事件工具函数
 * 用于处理 Capacitor 应用状态变化相关功能
 */

// 应用状态变化事件名称
export const APP_RESUMED_EVENT = 'app-resumed'
export const APP_REFRESH_ERROR_EVENT = 'app-refresh-error'

/**
 * 监听应用恢复事件
 * @param {Function} callback - 回调函数
 * @returns {Function} 取消监听的函数
 */
export function onAppResumed(callback) {
    window.addEventListener(APP_RESUMED_EVENT, callback)
    return () => window.removeEventListener(APP_RESUMED_EVENT, callback)
}

/**
 * 监听应用刷新错误事件
 * @param {Function} callback - 回调函数
 * @returns {Function} 取消监听的函数
 */
export function onAppRefreshError(callback) {
    window.addEventListener(APP_REFRESH_ERROR_EVENT, callback)
    return () => window.removeEventListener(APP_REFRESH_ERROR_EVENT, callback)
}

/**
 * 触发应用恢复事件（用于测试）
 * @param {Object} detail - 事件详情
 */
export function triggerAppResumed(detail = {}) {
    const event = new CustomEvent(APP_RESUMED_EVENT, {
        detail: {
            timestamp: new Date().toISOString(),
            previousState: 'background',
            currentState: 'active',
            ...detail
        }
    })
    window.dispatchEvent(event)
}

/**
 * 触发应用刷新错误事件
 * @param {Error|string} error - 错误信息
 * @param {Object} detail - 额外详情
 */
export function triggerAppRefreshError(error, detail = {}) {
    const event = new CustomEvent(APP_REFRESH_ERROR_EVENT, {
        detail: {
            error: error instanceof Error ? error.message : error,
            timestamp: new Date().toISOString(),
            ...detail
        }
    })
    window.dispatchEvent(event)
}

/**
 * 创建应用状态变化处理器
 * @returns {Object} 包含监听和清理函数的对象
 */
export function createAppStateHandler() {
    let unsubscribeResume = null
    let unsubscribeError = null

    return {
        /**
         * 开始监听应用事件
         * @param {Object} options - 配置选项
         * @param {Function} options.onResumed - 应用恢复时的回调
         * @param {Function} options.onError - 刷新错误时的回调
         */
        startListening(options = {}) {
            const { onResumed, onError } = options

            if (onResumed) {
                unsubscribeResume = onAppResumed(onResumed)
            }

            if (onError) {
                unsubscribeError = onAppRefreshError(onError)
            }
        },

        /**
         * 停止监听应用事件
         */
        stopListening() {
            if (unsubscribeResume) {
                unsubscribeResume()
                unsubscribeResume = null
            }

            if (unsubscribeError) {
                unsubscribeError()
                unsubscribeError = null
            }
        }
    }
}

/**
 * 在组件中使用应用事件监听的示例
 * 
 * 示例用法：
 * 
 * import { createAppStateHandler } from './lib/app-events'
 * 
 * const appHandler = createAppStateHandler()
 * 
 * onMounted(() => {
 *   appHandler.startListening({
 *     onResumed: () => {
 *       console.log('App resumed, refreshing data...')
 *       refreshData()
 *     },
 *     onError: (event) => {
 *       console.error('App refresh error:', event.detail.error)
 *     }
 *   })
 * })
 * 
 * onUnmounted(() => {
 *   appHandler.stopListening()
 * })
 */