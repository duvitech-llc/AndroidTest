package com.emmoco.framework.android;

public class Em {

	public static class DeviceDescriptor {
		public String deviceName;
		public String schemaName;
		public String schemaHash;
		public int rssi;
		public Object broadcast;
		public String toString() {
			return String.format("%s-%s!%s", schemaName, schemaHash, deviceName);
		}
	}
	
	public static interface AddSchemaCallback {
		void exec(String err);
	}
	
	public static interface OnDisconnectCallback {
		void exec();
	}
	
	public static interface OnIndicatorCallback {
		void exec(String name, Object value);
	}
	
	public static interface OpenDeviceCallback {
		void exec(String err);
	}
	
	public static interface ReadResourceCallback {
		void exec(String err, Object value);
	}
	
	public static interface ScanDevicesCallback {
		void exec(DeviceDescriptor... devs);
	}
	
	public static interface StartCallback {
		void exec();
	}
	
	public static interface WriteResourceCallback {
		void exec(String err);
	}
	
	public static interface IConnectionMgr {
		void addSchema(String name, AddSchemaCallback cb);
		void closeDevice();
		void onDisconnect(OnDisconnectCallback cb);
		void onIndicator(OnIndicatorCallback cb);
		void openDevice(DeviceDescriptor dev, OpenDeviceCallback cb);
		void readResource(String name, ReadResourceCallback cb);
		void scanDevices(int duration, ScanDevicesCallback cb);
		void start(StartCallback cb);
		void writeResource(String name, Object value, WriteResourceCallback cb);
	};
	
	public static IConnectionMgr ConnectionMgr = null;

}
