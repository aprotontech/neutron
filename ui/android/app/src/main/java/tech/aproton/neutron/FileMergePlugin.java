// FileMergePlugin.java
package tech.aproton.neutron;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;

@CapacitorPlugin(name = "FileMerge")
public class FileMergePlugin extends Plugin {

     public FileMergePlugin() {
        Log.d("FileMergePlugin", "FileMergePlugin instance created!");
    }

    @Override
    public void load() {
        Log.d("FileMergePlugin", "FileMergePlugin instance created!");
    }

    @PluginMethod
    public void mergeFiles(PluginCall call) {
        String outputPath = call.getString("outputPath");
        JSONArray inputFiles = call.getArray("inputFiles");
        
        if (outputPath == null || inputFiles == null) {
            call.reject("必须提供输出路径和输入文件列表");
            return;
        }

        try {
            // 转换为字符串数组
            String[] filePaths = new String[inputFiles.length()];
            for (int i = 0; i < inputFiles.length(); i++) {
                filePaths[i] = inputFiles.getString(i);
            }

            // 执行合并操作
            boolean success = mergeFilesInternal(filePaths, outputPath);
            
            if (success) {
                JSObject result = new JSObject();
                result.put("success", true);
                result.put("outputPath", outputPath);
                call.resolve(result);
            } else {
                call.reject("文件合并失败");
            }
        } catch (JSONException e) {
            call.reject("解析文件列表失败: " + e.getMessage());
        } catch (IOException e) {
            call.reject("文件操作失败: " + e.getMessage());
        }
    }

    @PluginMethod
    public void version(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("version", "0.0.1");
        call.resolve(ret);
    }

    private boolean mergeFilesInternal(String[] inputFiles, String outputPath) 
            throws IOException {
        File outputFile = new File(outputPath);
        
        // 确保输出目录存在
        File outputDir = outputFile.getParentFile();
        if (outputDir != null && !outputDir.exists()) {
            outputDir.mkdirs();
        }

        // 使用FileChannel进行高效文件合并
        try (FileOutputStream fos = new FileOutputStream(outputFile);
             FileChannel outputChannel = fos.getChannel()) {
            
            for (String inputPath : inputFiles) {
                File inputFile = new File(inputPath);
                
                if (!inputFile.exists()) {
                    throw new IOException("文件不存在: " + inputPath);
                }

                // 复制当前文件到输出文件
                try (FileInputStream fis = new FileInputStream(inputFile);
                     FileChannel inputChannel = fis.getChannel()) {
                    
                    // 将输入文件内容追加到输出文件
                    inputChannel.transferTo(0, inputChannel.size(), outputChannel);
                }

                // 成功合并后删除原文件
                if (inputFile.delete()) {
                    System.out.println("已删除文件: " + inputPath);
                } else {
                    System.out.println("警告: 无法删除文件: " + inputPath);
                }
            }
        }
        
        return outputFile.exists() && outputFile.length() > 0;
    }
}