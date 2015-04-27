package com.emmoco.framework.android;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.cordova.Config;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

public class EmGapActivity extends Activity implements CordovaInterface {

    private static final String TAG = "Em-Gap";
    
    private CordovaWebView cwv;
    private final ExecutorService threadPool = Executors.newCachedThreadPool();

    @Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		Log.i(TAG, "onCreate");
	    Config.init(this);
	    cwv = new CordovaWebView(this, null);
	    cwv.loadUrl(Config.getStartUrl());
	    Em.ConnectionMgr = (Em.IConnectionMgr)cwv.pluginManager.getPlugin("Command");
	}
    
    @Override
    protected void onDestroy() {
    	super.onDestroy();
    	cwv.handleDestroy();
    }

    // CordovaInterface
	
	@Override
	public Activity getActivity() {
        return this;
	}

	@Override
	public ExecutorService getThreadPool() {
		return threadPool;
	}

	@Override
	public Object onMessage(String arg0, Object arg1) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setActivityResultCallback(CordovaPlugin arg0) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void startActivityForResult(CordovaPlugin arg0, Intent arg1, int arg2) {
		// TODO Auto-generated method stub
		
	}
}
