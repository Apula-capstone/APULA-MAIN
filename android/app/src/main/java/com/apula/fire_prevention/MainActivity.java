package com.apula.fire_prevention;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyCallback;
import android.telephony.TelephonyManager;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.util.Log;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import java.util.ArrayList;

public class MainActivity extends BridgeActivity {

    private static final String CHANNEL_ID = "fire_alert_channel";
    private static final int PERMISSIONS_REQUEST_CODE = 123;
    private String emergencyNumber = "000";
    private String userNumber;
    private boolean isEmergencyCall = false;
    private WebAppInterface webAppInterface;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Add Global Exception Handler for debugging
        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            @Override
            public void uncaughtException(@NonNull Thread t, @NonNull Throwable e) {
                Log.e("APULA_CRASH", "Uncaught Exception in thread " + t.getName(), e);
            }
        });

        createNotificationChannel();
    }

    @Override
    public void onStart() {
        super.onStart();
        WebView webView = getBridge().getWebView();
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);

        webView.setWebViewClient(new BridgeWebViewClient(getBridge()) {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String path = request.getUrl().getPath();
                                                            if (path != null && (path.endsWith(".ttf") || path.endsWith(".woff2") || path.endsWith(".css") || path.endsWith(".js") || path.endsWith(".html"))) {
                    try {
                        String assetPath = "public" + path;
                        if (path.equals("/")) {
                            assetPath = "public/index.html";
                        }
                        return new WebResourceResponse(
                            request.getUrl().getScheme(),
                            "UTF-8",
                            getAssets().open(assetPath)
                        );
                    } catch (Exception e) {
                        // Asset not found, let the default loader handle it
                    }
                }
                return super.shouldInterceptRequest(view, request);
            }
        });

        webAppInterface = new WebAppInterface(this);
        webView.addJavascriptInterface(webAppInterface, "Android");

        requestPermissions();
    }

    private boolean isServiceRunning = false;

    private void startBackgroundService() {
        if (isServiceRunning) return;
        
        Intent serviceIntent = new Intent(this, FireAlertService.class);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }
            isServiceRunning = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void requestPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            ArrayList<String> permissionsToRequest = new ArrayList<>();
            if (checkSelfPermission(Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.READ_PHONE_STATE);
            }
            if (checkSelfPermission(Manifest.permission.READ_PHONE_NUMBERS) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.READ_PHONE_NUMBERS);
            }
            if (checkSelfPermission(Manifest.permission.CALL_PHONE) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.CALL_PHONE);
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS);
                }
            }

            if (!permissionsToRequest.isEmpty()) {
                ActivityCompat.requestPermissions(this, permissionsToRequest.toArray(new String[0]), PERMISSIONS_REQUEST_CODE);
            } else {
                initializeTelephony();
            }
        } else {
            initializeTelephony();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSIONS_REQUEST_CODE) {
            boolean allPermissionsGranted = true;
            for (int grantResult : grantResults) {
                if (grantResult != PackageManager.PERMISSION_GRANTED) {
                    allPermissionsGranted = false;
                    break;
                }
            }
            if (allPermissionsGranted) {
                initializeTelephony();
            }
        }
    }

    private void initializeTelephony() {
        getUserPhoneNumber();
        TelephonyManager telephonyManager = (TelephonyManager) getSystemService(Context.TELEPHONY_SERVICE);
        if (telephonyManager != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                // For Android 12+
                Executor executor = Executors.newSingleThreadExecutor();
                telephonyManager.registerTelephonyCallback(executor, new CallStateCallback(webAppInterface));
            } else {
                // For older versions
                telephonyManager.listen(new CallStateListener(webAppInterface), PhoneStateListener.LISTEN_CALL_STATE);
            }
        }
        startBackgroundService();
    }

    @RequiresApi(api = Build.VERSION_CODES.S)
    private class CallStateCallback extends TelephonyCallback implements TelephonyCallback.CallStateListener {
        private final WebAppInterface webAppInterface;

        CallStateCallback(WebAppInterface webAppInterface) {
            this.webAppInterface = webAppInterface;
        }

        @Override
        public void onCallStateChanged(int state) {
            if (state == TelephonyManager.CALL_STATE_IDLE && isEmergencyCall) {
                isEmergencyCall = false;
                webAppInterface.makePhoneCall(emergencyNumber);
            }
        }
    }

    private void getUserPhoneNumber() {
        TelephonyManager telephonyManager = (TelephonyManager) getSystemService(Context.TELEPHONY_SERVICE);
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.READ_PHONE_NUMBERS) == PackageManager.PERMISSION_GRANTED) {
            userNumber = telephonyManager.getLine1Number();
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Fire Alert";
            String description = "Channel for fire alerts";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.sound);
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .build();
            channel.setSound(soundUri, audioAttributes);
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private class CallStateListener extends PhoneStateListener {
        private WebAppInterface webAppInterface;

        public CallStateListener(WebAppInterface webAppInterface) {
            this.webAppInterface = webAppInterface;
        }

        @Override
        public void onCallStateChanged(int state, String incomingNumber) {
            if (state == TelephonyManager.CALL_STATE_IDLE && isEmergencyCall) {
                isEmergencyCall = false;
                webAppInterface.makePhoneCall(emergencyNumber);
            }
        }
    }

    public class WebAppInterface {
        Context mContext;

        WebAppInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public void showFireNotification(String title, String message) {
            try {
                NotificationCompat.Builder builder = new NotificationCompat.Builder(mContext, CHANNEL_ID)
                        .setSmallIcon(R.mipmap.ic_launcher)
                        .setContentTitle(title)
                        .setContentText(message)
                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                        .setAutoCancel(true);

                NotificationManager notificationManager = (NotificationManager) mContext.getSystemService(Context.NOTIFICATION_SERVICE);
                if (notificationManager != null) {
                    notificationManager.notify(1, builder.build());
                }
            } catch (Exception e) {
                Log.e("APULA_JS", "Error showing notification", e);
            }
        }

        @JavascriptInterface
        public void makePhoneCall(String phoneNumber) {
            try {
                Intent intent = new Intent(Intent.ACTION_CALL);
                intent.setData(Uri.parse("tel:" + phoneNumber));
                if (intent.resolveActivity(mContext.getPackageManager()) != null) {
                    if (ActivityCompat.checkSelfPermission(mContext, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
                        mContext.startActivity(intent);
                    }
                }
            } catch (Exception e) {
                Log.e("APULA_JS", "Error making call", e);
            }
        }

        @JavascriptInterface
        public void checkAndDial(String message) {
            try {
                if (message.contains("FIRE_DETECTED")) {
                    if (ActivityCompat.checkSelfPermission(mContext, Manifest.permission.READ_PHONE_NUMBERS) == PackageManager.PERMISSION_GRANTED &&
                        ActivityCompat.checkSelfPermission(mContext, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
                        isEmergencyCall = true;
                        if (userNumber != null && !userNumber.isEmpty()) {
                            makePhoneCall(userNumber);
                        } else {
                            makePhoneCall(emergencyNumber);
                        }
                    } else {
                        // Request permissions from the activity context on UI thread
                        if (mContext instanceof MainActivity) {
                            ((MainActivity) mContext).runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    ((MainActivity) mContext).requestPermissions();
                                }
                            });
                        }
                    }
                }
            } catch (Exception e) {
                Log.e("APULA_JS", "Error in checkAndDial", e);
            }
        }

        @JavascriptInterface
        public void simulateFireAlert() {
            showFireNotification("Fire Detected", "A fire has been detected in your area.");
            checkAndDial("FIRE_DETECTED");
        }
    }
}
