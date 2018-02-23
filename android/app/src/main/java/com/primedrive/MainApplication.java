package com.primedrive;

import android.app.Application;
import android.os.StrictMode;
import android.os.Build;
import android.os.Handler;

import com.facebook.react.ReactApplication;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerPackage;
import com.pinmi.react.printer.RNPrinterPackage;
import com.peel.react.TcpSocketsModule;
import com.microsoft.codepush.react.CodePush;
import dk.appified.verifone.RNVerifonePackage;
import com.imagepicker.ImagePickerPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import io.sentry.RNSentryPackage;
import com.reactlibrary.RNStarIoPackage;
import com.acrlibrary.RNAcrReaderPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.rnimmersive.RNImmersivePackage;
import io.fullstack.firestack.FirestackPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected String getJSBundleFile() {
        return CodePush.getJSBundleFile();
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new ReactNativeExceptionHandlerPackage(),
            new RNPrinterPackage(),
            new TcpSocketsModule(),
            new RNAcrReaderPackage(),
            //new RNSentryPackage(MainApplication.this),
            new CodePush(getResources().getString(R.string.reactNativeCodePush_androidDeploymentKey), getApplicationContext(), BuildConfig.DEBUG),
            new RNVerifonePackage(),
            new ImagePickerPackage(),
            new RNFetchBlobPackage(),
            new RNStarIoPackage(),
            new RNDeviceInfo(),
            new RNImmersivePackage(),
            new FirestackPackage(),
            new VectorIconsPackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
