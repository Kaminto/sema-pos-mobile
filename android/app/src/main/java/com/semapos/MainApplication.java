package com.semapos;

import android.app.Application;

import com.facebook.react.ReactApplication;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.reactcommunity.rnlocalize.RNLocalizePackage;
import com.reactcommunity.rnlanguages.RNLanguagesPackage;
// import com.reactcommunity.rnlocalize.RNLocalizePackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import io.realm.react.RealmReactPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;

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
            new SplashScreenReactPackage(),
            new RNLocalizePackage(),
            new RNLanguagesPackage(),
            // new RNLocalizePackage(),
            new RNGestureHandlerPackage(),
            new VectorIconsPackage(),
            new RealmReactPackage()
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
	// long size = 500L * 1024L * 1024L;
	// com.facebook.react.modules.storage.ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(size);
  }
}
