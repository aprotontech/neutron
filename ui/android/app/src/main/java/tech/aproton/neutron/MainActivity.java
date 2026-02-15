package tech.aproton.neutron;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import tech.aproton.neutron.FileMergePlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 注册自定义插件
        registerPlugin(FileMergePlugin.class);
    }
}
