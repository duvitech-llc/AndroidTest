package com.example.androidtest;

import java.util.ArrayList;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.provider.ContactsContract;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;

import com.emmoco.framework.android.ConsoleView;
import com.emmoco.framework.android.Em;
import com.emmoco.framework.android.EmGapActivity;
import com.six15.ardrawing.R;

public class MainActivity extends EmGapActivity {
	public String TAG = "SMSReceiver";
	static Activity context;
	ConsoleView mConsole;
	Em.DeviceDescriptor mDevice;
	SharedPreferences prefs;
	
	ArrayList<String> wq; // this is the messag write queue
	
	Button sendButton;
	EditText txtEntry;
	public Handler mHandler = new Handler();
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		mConsole = (ConsoleView) findViewById(R.id.console);
		Log.i("Em-Gap", "console = " + mConsole);
		context = this;
		
		prefs = this.getSharedPreferences("com.six15.ardrawing", Context.MODE_PRIVATE);

		wq = new ArrayList<String>();
		
		txtEntry = (EditText)findViewById(R.id.text);
		
		sendButton = (Button)findViewById(R.id.send);
		sendButton.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				String msg = txtEntry.getEditableText().toString();
				if (msg != null && msg.length() > 0) {
					MainActivity.updateMessageBox("local", msg);
				}
			}
			
		});
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.main, menu);
		return true;
	}
	
	@Override
	public void onStart() {
		super.onStart();
		mConsole.printf("starting...\n");
		Em.ConnectionMgr.onDisconnect(new Em.OnDisconnectCallback() {
			public void exec() {
				onDisconnect();
			}
		});
		Em.ConnectionMgr.onIndicator(new Em.OnIndicatorCallback() {
			public void exec(String name, Object value) {
				onIndicator(name, value);
			}
		});
		Em.ConnectionMgr.start(new Em.StartCallback() {
			public void exec() {
				doAddSchema();
			}
		});
	}
	
	
	
	@Override
	protected void onResume() {
		// TODO Auto-generated method stub
		super.onResume();
		boolean showConsole = prefs.getBoolean("showconsole", false);
		if (showConsole) {
			mConsole.setVisibility(View.VISIBLE);
		}
		else {
			mConsole.setVisibility(View.GONE);
		}
	}

	
	
	
	
	@Override
	public boolean onMenuItemSelected(int featureId, MenuItem item) {
		// TODO Auto-generated method stub
		doClose();
	    Intent intent = new Intent(this, SettingsActivity.class);
	    startActivity(intent);
		return super.onMenuItemSelected(featureId, item);
	}

	public String getContactName(String number) {

	    String name = number;

	    // define the columns I want the query to return
	    String[] projection = new String[] {
	            ContactsContract.PhoneLookup.DISPLAY_NAME,
	            ContactsContract.PhoneLookup._ID};

	    // encode the phone number and build the filter URI
	    Uri contactUri = Uri.withAppendedPath(ContactsContract.PhoneLookup.CONTENT_FILTER_URI, Uri.encode(number));

	    // query time
	    Cursor cursor = context.getContentResolver().query(contactUri, projection, null, null, null);

	    if(cursor != null) {
	        if (cursor.moveToFirst()) {
	            name =      cursor.getString(cursor.getColumnIndex(ContactsContract.PhoneLookup.DISPLAY_NAME));
	            Log.v(TAG, "Started uploadcontactphoto: Contact Found @ " + number);            
	            Log.v(TAG, "Started uploadcontactphoto: Contact name  = " + name);
	        } else {
	            Log.v(TAG, "Contact Not Found @ " + number);
	        }
	        cursor.close();
	    }
	    return name;
	}	
	
    public static void updateMessageBox(String sender,String msg)
    {
    	final MainActivity ma = (MainActivity)context;
    	//messageBox.append(msg);
    	
    	final String theSender = sender.equals("local")?sender:ma.getContactName(sender);
    	final String theMsg  = msg;
    	
		context.runOnUiThread(new Runnable() {

			@Override
			public void run() {
				ma.enqueueMessage(String.format("\"%s\",\"%s\"",theSender,theMsg));
			}
			
		});
		
    }
    
    public void enqueueMessage(String msg)
    {
    	synchronized(wq) {
    		wq.add(String.format("dsms %s",msg));
    	}
    	
    	if (mDevice == null) doScan();
    	else {
    		sendNextMessage();
    	}
    }
    
    public void sendNextMessage()
    {
    	mHandler.removeCallbacksAndMessages(null);
		String msg = null;
		synchronized(wq) {
			if (wq.size() > 0) {
				msg = wq.get(0);
				wq.remove(0);
			}
		}
		if (msg != null) { 
			doWrite(msg);
		}
		else
			doWait();
    }
	
	private void doAddSchema() {
		mConsole.printf("adding schema...\n");
		Em.ConnectionMgr.addSchema("Six15ARDrawing", new Em.AddSchemaCallback() {
			public void exec(String err) {
				doScan();
			}
		});
	}
	
	private void doScan() {
		mConsole.printf("scanning...\n");
		Em.ConnectionMgr.scanDevices(500, new Em.ScanDevicesCallback() {
			public void exec(Em.DeviceDescriptor... devs) {
				mDevice = null;
				for (Em.DeviceDescriptor d : devs) {
					if (d.schemaName != null) {
						mConsole.printf("found device: %s\n", d);
						mDevice = d;
						break;
					}
				}
//				doScan();
			
				if (mDevice == null) {
					mConsole.printf("*** no device found\n");
				}
				else {
					mConsole.printf("device found\n");
					doOpen();
				}
				
			}
		});
	}
	
	private void doOpen() {
		Em.ConnectionMgr.openDevice(mDevice, new Em.OpenDeviceCallback() {
			public void exec(String err) {
				mConsole.printf("connected to %s\n", mDevice.deviceName);
				if (mDevice.schemaName.equals("Six15ARDrawing")) {
					mHandler.postDelayed(new Runnable() {
						public void run() {
							sendNextMessage();
						}
 					}, 1);
				}
				else {
					doWait();
				}
			}
		});
	}
	
	private void doWait() {
		mHandler.postDelayed(new Runnable() {
			public void run() {
				doClose();
			}
		}, 10000);
	}
	
	private void doRead() {
		Em.ConnectionMgr.readResource("trackerState", new Em.ReadResourceCallback() {
			public void exec(String err, Object value) {
				mConsole.printf(String.format("Read object %s : %s",value.toString(),err));
			}
		});
	}
	
	private void doWrite(String val) {
		final String inVal = val;
		mHandler.removeCallbacksAndMessages(null);
		Em.ConnectionMgr.writeResource("drawingStream", val, new Em.WriteResourceCallback() {
			public void exec(String err) {
				mConsole.printf(String.format("wrote new value %s\n",inVal));
				mHandler.postDelayed(new Runnable() {
					public void run() {
						sendNextMessage();
					}
					}, 1);				
			}
		});
	}
	
	private void doClose() {
		Em.ConnectionMgr.closeDevice();
		mConsole.printf("closed()\n");
	}
	
	private void onDisconnect() {
		if (mDevice != null) {
			mConsole.printf("disconnected from %s\n", mDevice.deviceName);
		}
		mDevice = null;
	}
	
	private void onIndicator(String name, Object val) {
		mConsole.printf("indicator: %s = %s\n", name, val);
		//doRead();
	}
}
