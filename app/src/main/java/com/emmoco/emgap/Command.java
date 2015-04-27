package com.emmoco.emgap;

import android.util.Log;

import com.emmoco.framework.android.Em;
import com.emmoco.framework.android.Em.DeviceDescriptor;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Command extends CordovaPlugin implements Em.IConnectionMgr {

    private static final String TAG = "Em-Gap";

    private static enum Action {
    	ADD_SCHEMA,
    	CLOSE_DEVICE,
    	OPEN_DEVICE,
    	READ_RESOURCE,
    	SCAN_DEVICES,
    	START,
    	WRITE_RESOURCE,
    };
    
    private Action mCurAction;
    private CallbackContext mCordovaCb;
    private Object mCurEmCb;
    private Em.OnDisconnectCallback mOnDisconnect;
    private Em.OnIndicatorCallback mOnIndicator;
    
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext cbCtx) throws JSONException {
        mCordovaCb = cbCtx;
    	if (action.equals("finish")) {
            finish(args);
            return true;
        }
    	if (action.equals("onDisconnect")) {
    		handleDisconnect();
    		return true;
    	}
    	if (action.equals("onIndicator")) {
    		handleIndicator(args);
    		return true;
    	}
        return false;
    }
    
    private void finish(JSONArray args) throws JSONException {
    	String err = args.length() > 0 ? args.getString(0) : null;
    	Object cb = mCurEmCb;
    	Action act = mCurAction;
    	mCurEmCb = null;
    	mCurAction = null;
    	if (cb != null) {
    		Log.i(TAG, "finish " + act);
    		switch (act) {
	    		case ADD_SCHEMA:
	    			((Em.AddSchemaCallback)cb).exec(err);
	    			break;
	    		case OPEN_DEVICE:
	    			((Em.OpenDeviceCallback)cb).exec(err);
	    			break;
	    		case READ_RESOURCE:
	    			((Em.ReadResourceCallback)cb).exec(err, args.get(1));
	    			break;
	    		case SCAN_DEVICES:
	    			JSONArray darr = args.getJSONArray(1);
	    			Em.DeviceDescriptor devs[] = new DeviceDescriptor[darr.length()];
	    			for (int i = 0; i < devs.length; i++) {
	    				Em.DeviceDescriptor dst = devs[i] = new DeviceDescriptor();
	    				JSONObject src = darr.getJSONObject(i);
	    				dst.deviceName = src.getString("deviceName");
	    				dst.schemaHash = src.getString("schemaHash");
	    				dst.schemaName = src.get("schemaName") == JSONObject.NULL ? null : src.getString("schemaName");
	    				dst.rssi = src.getInt("rssi");
		    			Log.d(TAG, "before");
		    			if (!src.has("broadcast")) {
		    				continue;
		    			}
	    				dst.broadcast = src.get("broadcast") == JSONObject.NULL ? null : src.get("broadcast");
		    			Log.d(TAG, "after");
	    			}
	    			((Em.ScanDevicesCallback)cb).exec((Em.DeviceDescriptor[])devs);
	    			break;
	    		case START:
	    			((Em.StartCallback)cb).exec();
	    			break;
	    		case WRITE_RESOURCE:
	    			((Em.WriteResourceCallback)cb).exec(err);
	    			break;
	    		default:
	    			break;
    		}
    	}
    }
    
    private void handleDisconnect() {
    	if (mOnDisconnect != null) {
    		mOnDisconnect.exec();
    	}
    }
    
    private void handleIndicator(JSONArray args) throws JSONException {
    	if (mOnIndicator != null) {
    		mOnIndicator.exec((String)args.get(0), args.get(1));
    	}
    }
    
    // IConnectionMgr methods
	
    @Override
	public void addSchema(String name, Em.AddSchemaCallback cb) {
    	mCurAction = Action.ADD_SCHEMA;
		mCurEmCb = cb;
    	try {
			JSONObject jobj = new JSONObject();
			jobj.put("command", "addSchema");
			jobj.put("name", name);
			mCordovaCb.success(jobj);
		}
		catch (JSONException e) {}
	}

	@Override
	public void scanDevices(int duration, Em.ScanDevicesCallback cb) {
    	mCurAction = Action.SCAN_DEVICES;
		mCurEmCb = cb;
    	try {
			JSONObject jobj = new JSONObject();
			jobj.put("command", "scanDevices");
			jobj.put("duration", duration);
			mCordovaCb.success(jobj);
		}
		catch (JSONException e) {}
	}

	@Override
	public void closeDevice() {
    	mCurAction = Action.CLOSE_DEVICE;
    	try {
			JSONObject jobj = new JSONObject();
			jobj.put("command", "closeDevice");
			mCordovaCb.success(jobj);
		}
		catch (JSONException e) {}
	}

	@Override
	public void onDisconnect(Em.OnDisconnectCallback cb) {
		mOnDisconnect = cb;
	}

	@Override
	public void onIndicator(Em.OnIndicatorCallback cb) {
		mOnIndicator = cb;
	}

	@Override
	public void openDevice(DeviceDescriptor dev, Em.OpenDeviceCallback cb) {
    	mCurAction = Action.OPEN_DEVICE;
		mCurEmCb = cb;
    	try {
			JSONObject jobj = new JSONObject();
			jobj.put("command", "openDevice");
			jobj.put("deviceId", dev.toString());
			mCordovaCb.success(jobj);
		}
		catch (JSONException e) {}
	}

	@Override
	public void readResource(String name, Em.ReadResourceCallback cb) {
    	mCurAction = Action.READ_RESOURCE;
		mCurEmCb = cb;
    	try {
			JSONObject jobj = new JSONObject();
			jobj.put("command", "readResource");
			jobj.put("name", name);
			mCordovaCb.success(jobj);
		}
		catch (JSONException e) {}
	}

    @Override
    public void start(Em.StartCallback cb) {
    	mCurAction = Action.START;
    	mCurEmCb = cb;
    }
    
	@Override
	public void writeResource(String name, Object value, Em.WriteResourceCallback cb) {
    	mCurAction = Action.WRITE_RESOURCE;
		mCurEmCb = cb;
    	try {
			JSONObject jobj = new JSONObject();
			jobj.put("command", "writeResource");
			jobj.put("name", name);
			jobj.put("value", value);
			mCordovaCb.success(jobj);
		}
		catch (JSONException e) {}
	}
}
