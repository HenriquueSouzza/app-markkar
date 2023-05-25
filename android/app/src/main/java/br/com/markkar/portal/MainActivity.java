package br.com.markkar.portal;

import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;

import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int DARK_STATUS_BAR_COLOR = Color.parseColor("#1e1e1e");
    private static final int LIGHT_STATUS_BAR_COLOR = Color.parseColor("#e7e7e7");
    private static final int DARK_NAVIGATION_BAR_COLOR = Color.parseColor("#121212");
    private static final int LIGHT_NAVIGATION_BAR_COLOR = Color.parseColor("#f3f3f3");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        View decorView = window.getDecorView();
        WindowInsetsControllerCompat wic = new WindowInsetsControllerCompat(window, decorView);

        if (isDarkTheme()) {
            setStatusBarColor(window, DARK_STATUS_BAR_COLOR);
            setNavigationBarColor(window, DARK_NAVIGATION_BAR_COLOR);
            wic.setAppearanceLightStatusBars(false);
            wic.setAppearanceLightNavigationBars(false);
        } else {
            setStatusBarColor(window, LIGHT_STATUS_BAR_COLOR);
            setNavigationBarColor(window, LIGHT_NAVIGATION_BAR_COLOR);
            wic.setAppearanceLightStatusBars(true);
            wic.setAppearanceLightNavigationBars(true);
        }
    }

    private void setStatusBarColor(Window window, int color) {
        window.setStatusBarColor(color);
    }

    private void setNavigationBarColor(Window window, int color) {
        window.setNavigationBarColor(color);
    }

    private boolean isDarkTheme() {
        int nightModeFlags = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        return nightModeFlags == Configuration.UI_MODE_NIGHT_YES;
    }
}
