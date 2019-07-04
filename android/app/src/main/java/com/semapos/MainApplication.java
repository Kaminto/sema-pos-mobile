package com.semapos;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.reactcommunity.rnlanguages.RNLanguagesPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;

import org.pgsqlite.SQLitePluginPackage; // Splash screen

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
            new SQLitePluginPackage(),   // register SQLite Plugin here
          	new MainReactPackage(),
			      new RNLanguagesPackage()   // Splash Screen plugin
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
	long size = 500L * 1024L * 1024L;
	com.facebook.react.modules.storage.ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(size);
  }
}
