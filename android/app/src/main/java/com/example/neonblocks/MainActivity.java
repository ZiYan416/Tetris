package com.example.neonblocks;

import android.annotation.SuppressLint;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Configure WebView
        WebView webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        
        // Ensure links open in the WebView
        webView.setWebViewClient(new WebViewClient());
        
        // ==========================================
        // 配置 WebView 加载的网址 (URL Configuration)
        // ==========================================
        // 
        // 1. 【本地开发/调试】 (Local Development/Debugging):
        // 使用 "http://10.0.2.2:8080" 来从 Android 模拟器访问你电脑上的 localhost。
        // 请确保你的 React/Vite 移动版项目在本地 8080 端口运行：
        // 进入 `mobile/` 目录并运行 `npm run dev`。
        // webView.loadUrl("http://10.0.2.2:8080");
        //
        // 2. 【生产环境/发布】 (Production Release):
        // 替换为你在 Netlify 上托管的在线网页地址 (例如: "https://your-app-name.netlify.app")
        // 当你把项目合并并重新在 Netlify 部署后，将此处的地址改为你的 Netlify 分发网址。
        // 
        webView.loadUrl("http://10.0.2.2:8080"); 

        // Hide System Bars for Immersive Mode
        hideSystemUI();
    }

    private void hideSystemUI() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            final Window window = getWindow();
            window.setDecorFitsSystemWindows(false);
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            // Legacy approach for older Android versions
            View decorView = getWindow().getDecorView();
            decorView.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_FULLSCREEN);
        }
    }
}
