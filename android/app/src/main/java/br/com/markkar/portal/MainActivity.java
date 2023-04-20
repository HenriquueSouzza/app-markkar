package br.com.markkar.portal;

import com.getcapacitor.BridgeActivity;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

public class MainActivity extends BridgeActivity {
  @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            String colorNavigationBar = "#141518";
            String colorStatusBar = "#222428";

            Window window = getWindow();
            int options = window.getDecorView().getSystemUiVisibility() | WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS;

            if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                options |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            } else {
                options &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            }

            window.getDecorView().setSystemUiVisibility(options);
            window.setNavigationBarColor(Color.parseColor(colorNavigationBar));
            window.setStatusBarColor(Color.parseColor(colorStatusBar));
        }
    }
}
