package tech.aproton.neutron;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import tech.aproton.neutron.FileMergePlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(FileMergePlugin.class);

        super.onCreate(savedInstanceState);
    }
}
