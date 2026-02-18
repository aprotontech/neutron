// file-merge.js
import { registerPlugin } from '@capacitor/core';


export interface FileMergePlugin {
  mergeFiles(options: { inputFiles: string[], outputPath: string }): Promise<{ outputPath: string, success: boolean }>
  version(): Promise<{ version: string }>
}

const FileMerge = registerPlugin<FileMergePlugin>('FileMerge');

export class FileMergeService {
    /**
     * 合并多个文件
     * @param {string[]} inputFiles - 输入文件路径数组
     * @param {string} outputPath - 输出文件路径
     * @returns {Promise<{success: boolean, outputPath: string}>}
     */
    static async mergeFiles(inputFiles: string[], outputPath: string) {
        try {
            console.log("mergeFiles:", JSON.stringify(inputFiles), ", output=", outputPath)
            for (let i = 0; i < inputFiles.length; i ++ ) {
                if (inputFiles[i].startsWith('file:///')) {
                    inputFiles[i] = inputFiles[i].substring('file://'.length);
                }
            }
            if (outputPath.startsWith('file:///')) {
                outputPath =  outputPath.substring('file://'.length)
            }
            const result = await FileMerge.mergeFiles({
                inputFiles: inputFiles,
                outputPath: outputPath
            });
            console.log("merge result: ", JSON.stringify(result))
            return result;
        } catch (error) {
            console.error('文件合并失败:', error);
            throw error;
        }
    }
}

