package com.emmoco.emgap;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.emmoco.emgap.SerialPacket;

public class Mailbox extends CordovaPlugin {

    public static final String TAG = "Em-Gap";
    
    static public final int ADVERT_PKT_LEN = 31;
    
    static private final int ADVERT_UUID_BASE = 5;
    static private final int ADVERT_DATA_LEN = 7;
    static private final int ADVERT_DATA_BASE = 9;

    static private final int BLE_PACKET_COUNT = 4;
	static private final int BLE_PACKET_SIZE = 20;

	static final private UUID EMMOCO_SERVICE = UUID.fromString("0000FFE0-0000-1000-8000-00805f9b34fb");

	static private final int SCAN_DATA_LEN = 16;
	
	static private final int INDICATOR_CHAR = 0;
	static private final int READVAL_CHAR = 1;
	static private final int READREQ_CHAR = 2;
	static private final int WRITEREQ_CHAR = 3;

    private static class ScanInfo {
    	String addr;
    	int rssi;
    	byte[] data;
    }
    
    private static enum State {
    	IDLE, SCANNING, CONNECTING, CONNECTED, DISCONNECTING
    }
    
    private static BluetoothGattCharacteristic sCharIndicator;
	private static BluetoothGattCharacteristic sCharReadVal;
	private static BluetoothGattCharacteristic sCharReadReq;
	private static BluetoothGattCharacteristic sCharWriteReq;
    private static Context sContext;
	private static BluetoothDevice sDevice;
	private static boolean sDestroyed;
	private static int sFetchCnt;
    private static SerialPacket sFetchPkt = new SerialPacket();
    private static BluetoothGatt sGatt = null;
    private static SerialPacket.Header sSendHdr = new SerialPacket.Header();
    private static SerialPacket sSendPkt = new SerialPacket();
    private static BlockingQueue<SerialPacket> sRecvQueue;
    private static ArrayList<ScanInfo> sScanInfoList;
    private static HashSet<String> sScanAddrSet;
    private static State sState = State.IDLE;
    private static byte[] sStoreBuf;
    private static int sStoreCnt;
    private static int sStoreOff;
    
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext cbCtx) throws JSONException {
    	Log.i(TAG, "execute: " + action);
    	if (action.equals("open")) {
            execOpen(cbCtx);
            return true;
        }
        if (action.equals("read")) {
            execRead(cbCtx);
            return true;
        }
        if (action.equals("write")) {
            execWrite(args, cbCtx);
            return true;
        }
        return false;
    }
    
    @Override
    public void onNewIntent(Intent intent) {
    	Log.d(TAG, "onNewIntent");
    }

    @Override
    public void onDestroy() {
    	super.onDestroy();
    	reset();
    	sDestroyed = true;
    	Log.d(TAG, "onDestroy: state = " + sState);
    }

    @Override
    public void onPause(boolean multitasking) {
    	super.onPause(multitasking);
    	Log.d(TAG, "onPause");
    }

    @Override
    public void onResume(boolean multitasking) {
    	super.onResume(multitasking);
    	Log.d(TAG, "onResume");
    }

    @Override
    public void onReset() {
    	Log.d(TAG, "onReset");
    }
    
    /* -------- PRIVATE FXNS -------- */
    
	private void enableNotification(BluetoothGattCharacteristic charac) {
    	sGatt.setCharacteristicNotification(charac, true);
    	BluetoothGattDescriptor desc = (BluetoothGattDescriptor) charac.getDescriptors().get(0);
    	desc.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
    	sGatt.writeDescriptor(desc);
	}
	
    private void execOpen(final CallbackContext cbCtx) {
    	sContext = cordova.getActivity().getApplicationContext();
    	sRecvQueue = new LinkedBlockingQueue<SerialPacket>();
    	sDestroyed = false;
    	onDisconnect();
    	cbCtx.success();
    }
    
    private void execRead(final CallbackContext cbCtx) {
    	cordova.getThreadPool().execute(new Runnable() {
            public void run() {
               	try {
					SerialPacket pkt = sRecvQueue.take();
					byte[] bytes = pkt.getBytes();
					cbCtx.success(bytes);
				}
               	catch (InterruptedException e) {
               		Log.e(TAG, e.getMessage());
				}
           }
        });
    }
    
    private void execWrite(final JSONArray args, final CallbackContext cbCtx) throws JSONException {
    	if (sDestroyed) {
    		return;
    	}
    	sSendPkt.rewind();
    	for (int i = 0; i < args.length(); i++) {
    		sSendPkt.addInt8(args.getInt(i));
    	}
    	sSendPkt.rewind();
    	sSendPkt.scanHeader(sSendHdr);
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
            	Log.i(TAG, "write: " + sSendHdr.kind);
            	switch (sSendHdr.kind) {
            	case CONNECT:
            		connect();
            		break;
            	case DISCONNECT:
            		disconnect();
            		break;
        		case FETCH:
        			fetch();
        			break;
            	case SCAN:
            		scan();
            		break;
        		case STORE:
        			store();
        			break;
            	default:
            		Log.e(TAG, String.format("execWrite: kind = %s", sSendHdr.kind));
            	}
            	cbCtx.success();
            }
        });
    }
    
    private void finishRead(SerialPacket pkt) {
    	try {
    		sRecvQueue.put(pkt);
		}
    	catch (InterruptedException e) {
		}
    }
    
    private void reset() {
    	Log.i(TAG, "reset: state = " + sState);
    	sState = State.IDLE;
    	if (sGatt != null) {
        	sGatt.close();
        	sGatt = null;
    	}
    }
    
    /* -------- ACTIONS -------- */
    
    private void connect() {
    	sState = State.CONNECTING;
    	int devId = (int)sSendPkt.scanUns32();
    	ScanInfo si = sScanInfoList.get(devId);
    	sDevice = BluetoothAdapter.getDefaultAdapter().getRemoteDevice(si.addr);
        sGatt = sDevice.connectGatt(sContext, false, sGattCallbacks);
        sGatt.connect();
    }
    
    private void connectDone() {
    	sState = State.CONNECTED;
    	SerialPacket pkt = new SerialPacket();
    	pkt.addHeader(SerialPacket.Kind.CONNECT);
    	finishRead(pkt);
    }
    
    private void disconnect() {
    	if (sState == State.CONNECTED) {
        	sState = State.DISCONNECTING;
    		sGatt.disconnect();
    	}
    	else {
    		onDisconnect();
    	}
    }
    
    private void fetch() {
		sFetchPkt = new SerialPacket();
		sFetchPkt.addHeader(SerialPacket.Kind.FETCH_DONE, sSendHdr.resId);
		fetchNext();
    }
    
    private void fetchDone(byte[] bytes) {
		for (int i = 0; i < bytes.length; i++) {
			sFetchPkt.addInt8(bytes[i]);
		}
		if (bytes.length < BLE_PACKET_SIZE || sFetchPkt.getSize() >= SerialPacket.MAX_DATA_SIZE + SerialPacket.HDR_SIZE) {
			finishRead(sFetchPkt);
		}
		else if (--sFetchCnt == 0) {
			fetchNext();
		}
    }
    
    private void fetchNext() {
		sFetchCnt = BLE_PACKET_COUNT;
		byte[] data = new byte[] {(byte) sSendHdr.resId, (byte) sSendHdr.chan};
		sCharReadReq.setValue(data);
		sGatt.writeCharacteristic(sCharReadReq);
    }
    
    private void onDisconnect() {
    	Log.d(TAG, "onDisconnect");
		SerialPacket pkt = new SerialPacket();
    	pkt.addHeader(SerialPacket.Kind.DISCONNECT);
    	finishRead(pkt);
    	reset();
    }
    
    private void onIndicator(byte[] bytes) {
		SerialPacket pkt = new SerialPacket();
		pkt.addHeader(SerialPacket.Kind.INDICATOR, bytes[0]);
		for (int i = 2; i < bytes.length; i++) {
			pkt.addInt8(bytes[i]);
		}
		finishRead(pkt);
    }
    
    private void scan() {
    	sState = State.SCANNING;
    	sScanInfoList = new ArrayList<ScanInfo>();
    	sScanAddrSet = new HashSet<String>();
		sSendPkt.scanInt32();
		int duration = sSendPkt.scanInt16();
    	Log.i(TAG, "scan begin");
		BluetoothAdapter.getDefaultAdapter().startLeScan(sLeScanCallback);             
		new Timer().schedule(new TimerTask() {          
		    public void run() {
		    	scanDone();
		    	cancel();
		    }
		}, duration);
    }
    
    private void scanDone() {
    	Log.i(TAG, "scan done");
    	sState = State.IDLE;
		BluetoothAdapter.getDefaultAdapter().stopLeScan(sLeScanCallback);
		SerialPacket pkt = new SerialPacket();
		pkt.addHeader(SerialPacket.Kind.SCAN_DONE, sScanInfoList.size());
		int idx = 0;
		for (ScanInfo si : sScanInfoList) {
			pkt.addInt8(si.rssi);
			pkt.addInt32(idx++);
			pkt.addInt16(0);
			pkt.addInt8(si.data.length);
			for (byte b : si.data) {
				pkt.addInt8(b);
			}
			for (int i = 0; i < SCAN_DATA_LEN - si.data.length; i++) {
				pkt.addInt8(0);
			}
		}
		finishRead(pkt);
		
    }
    
    private void store() {
    	sStoreBuf = sSendPkt.getData();
		sStoreOff = 0;
		sStoreCnt = BLE_PACKET_COUNT;
		storeNext();
    }
    
    private void storeDone() {
    	if (sStoreOff > 0) {
			storeNext();
			return;
		}
		SerialPacket pkt = new SerialPacket();
		pkt.addHeader(SerialPacket.Kind.STORE_DONE, sSendHdr.resId);
		finishRead(pkt);
    }
    
    private void storeNext() {
    	sStoreCnt -= 1;
		int beg = sStoreOff;
		int end = sStoreOff = (sStoreOff == 0) ? (BLE_PACKET_SIZE - 1) : (sStoreOff + BLE_PACKET_SIZE);
		if (end >= sStoreBuf.length) {
			end = sStoreBuf.length;
			sStoreOff = 0;
		}
		int len = (end - beg) + (beg == 0 ? 1 : 0);
		byte[] data = new byte[len];
		int idx = 0;
		if (beg == 0) {
			data[idx++] = (byte) sSendHdr.resId;
		}
		for (int i = beg; i < end; i++) {
			data[idx++] = sStoreBuf[i];
		}
		sCharWriteReq.setValue(data);
		boolean respFlag = sStoreOff == 0 || sStoreCnt == 0;
    	sCharWriteReq.setWriteType(respFlag ? BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT : BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE);
		sGatt.writeCharacteristic(sCharWriteReq);
		if (respFlag) {
			sStoreCnt = BLE_PACKET_COUNT;
		}
    }
    
    /* -------- BLE CALLBACKS -------- */
    
    private BluetoothAdapter.LeScanCallback sLeScanCallback = new BluetoothAdapter.LeScanCallback() {
        public void onLeScan(final BluetoothDevice device, int rssi, byte[] rec) {
           	if (rec[ADVERT_UUID_BASE] != (byte)0xE0 || rec[ADVERT_UUID_BASE + 1] != (byte)0xFF) {
           		return;
           	}
           	String addr = device.getAddress();
           	if (sScanAddrSet.contains(addr)) {
           		return;
           	}
           	ScanInfo si = new ScanInfo();
           	si.addr = addr;
           	si.rssi = rssi;
           	si.data = Arrays.copyOfRange(rec, ADVERT_DATA_BASE, ADVERT_DATA_BASE + rec[ADVERT_DATA_LEN] - 1);
           	sScanInfoList.add(si);
           	sScanAddrSet.add(addr);
        	Log.i(TAG, String.format("found %s, rssi = %d, data.len = %d", si.addr, si.rssi, si.data.length));
        }
    };

    private BluetoothGattCallback sGattCallbacks = new BluetoothGattCallback() {
    	
    	public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
    		super.onCharacteristicChanged(gatt, characteristic);
    		if (characteristic == sCharIndicator) {
    			onIndicator(characteristic.getValue());
    		}
    		else {
    			fetchDone(characteristic.getValue());
    		}
    	}
    	
    	public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
    		super.onDescriptorWrite(gatt, descriptor, status);
        	if (descriptor.getCharacteristic() == sCharIndicator) {
	    		enableNotification(sCharReadVal);
	    	}
	    	else {
	    		connectDone();
	    	}
    	}
    	
    	public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
    	};
    	
    	public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
    		super.onCharacteristicWrite(gatt, characteristic, status);
        	if (characteristic == sCharWriteReq) {
        		storeDone();
        	}
    	}
    	
    	public void onServicesDiscovered(BluetoothGatt gatt, int status) {
        	List<BluetoothGattCharacteristic> cl = sGatt.getService(EMMOCO_SERVICE).getCharacteristics();
        	sCharIndicator = cl.get(INDICATOR_CHAR);
        	sCharReadVal = cl.get(READVAL_CHAR);
        	sCharReadReq = cl.get(READREQ_CHAR);
        	sCharWriteReq = cl.get(WRITEREQ_CHAR);
        	sCharReadReq.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE);
        	sCharWriteReq.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT);
        	enableNotification(sCharIndicator);
    	};
    	
    	@Override
    	public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
    		if (sGatt == null) {
    		   	Log.w(TAG, "onConnectionStateChange: sGatt == null");
    		   	return;
    		}
    		if (newState == BluetoothProfile.STATE_CONNECTED) {
            	sGatt.discoverServices();
            }
            if (newState == BluetoothProfile.STATE_DISCONNECTED) {
            	if (sState == State.CONNECTED) {
        			new Timer().schedule(new TimerTask() {          
        			    public void run() {
        			    	onDisconnect();
        			    	cancel();
        			    }
        			}, 1000);
            	}
            	else {
                	onDisconnect();
            	}
            }
    	};
    };

}
