// file-merge.js
import { Plugins } from '@capacitor/core';

const { FileMerge } = Plugins;

export class FileMergeService {
    /**
     * 合并多个文件
     * @param {string[]} inputFiles - 输入文件路径数组
     * @param {string} outputPath - 输出文件路径
     * @returns {Promise<{success: boolean, outputPath: string}>}
     */
    static async mergeFiles(inputFiles, outputPath) {
        try {
            const result = await FileMerge.mergeFiles({
                inputFiles: inputFiles,
                outputPath: outputPath
            });
            return result;
        } catch (error) {
            console.error('文件合并失败:', error);
            throw error;
        }
    }

    /**
     * 批量处理文件合并
     * @param {Array<{files: string[], output: string}>} tasks - 合并任务列表
     */
    static async batchMerge(tasks) {
        const results = [];

        for (const task of tasks) {
            try {
                const result = await this.mergeFiles(task.files, task.output);
                results.push({
                    success: true,
                    output: task.output,
                    result: result
                });
            } catch (error) {
                results.push({
                    success: false,
                    output: task.output,
                    error: error.message
                });
            }
        }

        return results;
    }
}