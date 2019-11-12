package com.semapos;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.swmansion.rnscreens.RNScreensPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.swmansion.reanimated.ReanimatedPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import io.realm.react.RealmReactPackage;
import com.reactcommunity.rnlanguages.RNLanguagesPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;
import com.oblador.vectoricons.VectorIconsPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          	new MainReactPackage(),
            new RNScreensPackage(),
            new RNGestureHandlerPackage(),
            new ReanimatedPackage(),
            new NetInfoPackage(),
            new RNDeviceInfo(),
            new RealmReactPackage(),
            new RNLanguagesPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
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
