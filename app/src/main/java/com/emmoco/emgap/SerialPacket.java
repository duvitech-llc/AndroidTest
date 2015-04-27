package com.emmoco.emgap;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;

public class SerialPacket {

    static public final int SYS_CHAN = 0x80;

    static public final int CLIENT_ADMIN_RESID = 0;
    static public final int CLIENT_ADDR_RESID = 1;
    static public final int CLIENT_SCAN_RESID = 2;
    static public final int CLIENT_SCANDUR_RESID = 3;
    static public final int CLIENT_SCANINFO_RESID = 4;

    public static enum Kind {
        NOP,
        FETCH,
        FETCH_DONE,
        STORE,
        STORE_DONE,
        INDICATOR,
        CONNECT,
        DISCONNECT,
        ECHO,
        PAIRING,
        PAIRING_DONE,
        OFFLINE,
        ACCEPT,
		START,
		ACTIVE_PARAMS,
		SCAN,
		SCAN_DONE,
		BEACON,
    }

    public static class Header {
        public int size;
        public Kind kind;
        public int resId;
        public int chan;
        public String toString() {
            return String.format("<%d,%s,%d,%02x>", size, kind, resId, chan);
        }
    }

    public static final int HDR_SIZE = 4;
    public static final int MAX_DATA_SIZE = 240;

    private final byte[] mBuffer;
    private int mCurIdx;
    private boolean mHdrFlag;

    public SerialPacket() {
        mBuffer = new byte[MAX_DATA_SIZE + HDR_SIZE];
    }

    public void addHeader(Header hdr) {
        rewind();
        addInt8(hdr.size + HDR_SIZE);
        addInt8(hdr.kind.ordinal());
        addInt8(hdr.resId);
        addInt8(hdr.chan);
    }

    public void addHeader(Kind kind) {
    	addHeader(kind, 0, 0);
    }
    
    public void addHeader(Kind kind, int resId) {
    	addHeader(kind, resId, 0);
    }
    
    public void addHeader(Kind kind, int resId, int chan) {
    	mHdrFlag = false;
        addInt8(HDR_SIZE);
        addInt8(kind.ordinal());
        addInt8(resId);
        addInt8(chan);
    	mHdrFlag = true;
    }
    
    public void addInt8(int d) {
        mBuffer[mCurIdx++] = (byte) (d & 0xFF);
        incSize(1);
    }

    public void addInt16(int d) {
        mBuffer[mCurIdx++] = (byte) (d & 0xFF);
        mBuffer[mCurIdx++] = (byte) ((d >> 8) & 0xFF);
        incSize(2);
    }

    public void addInt32(long d) {
        mBuffer[mCurIdx++] = (byte) (d & 0xFF);
        mBuffer[mCurIdx++] = (byte) ((d >> 8) & 0xFF);
        mBuffer[mCurIdx++] = (byte) ((d >> 16) & 0xFF);
        mBuffer[mCurIdx++] = (byte) ((d >> 24) & 0xFF);
        incSize(4);
    }

    public void alignTo(int align) {
        int off = mCurIdx % align;
        if (off != 0) {
        	int inc = align - off;
            mCurIdx += inc;
            incSize(inc);
        }
    }

    public void clear() {
        for (int i = 0; i < mBuffer.length; i++) {
            mBuffer[i] = 0;
        }
    }
    
    public byte[] getBytes() {
    	return Arrays.copyOf(mBuffer, mCurIdx);
    }
    
    public byte[] getBuffer() {
        return mBuffer;
    }
    
	public byte[] getData() {
    	return Arrays.copyOfRange(mBuffer, HDR_SIZE, mBuffer[0] & 0xFF);
	}
	
    public int getSize() {
        return mCurIdx;
    }
    
    private void incSize(int sz) {
    	if (mHdrFlag) {
    		mBuffer[0] += sz;
    	}
    }
    
    public void recv(InputStream in) throws Exception {
        rewind();
        clear();
        int size = in.read();
        if (size < 0) {
            return;
        }
        mBuffer[mCurIdx++] = (byte) size;
        while (mCurIdx < size) {
            int b = in.read();
            mBuffer[mCurIdx++] = (byte) b;
        }
    }

    public void rewind() {
        mCurIdx = 0;
    }

    public void scanHeader(Header hdr) {
        rewind();
        hdr.size = scanUns8();
        hdr.kind = Kind.values()[scanUns8()];
        hdr.resId = scanInt8();
        hdr.chan = scanUns8();
    }

    public int scanInt8() {
        return mBuffer[mCurIdx++];
    }

    public int scanInt16() {
        int b0 = mBuffer[mCurIdx++];
        b0 = b0 < 0 ? (b0 + 256) : b0;
        int b1 = mBuffer[mCurIdx++];
        return b0 + (b1 << 8);
    }

    public long scanInt32() {
        int b0 = mBuffer[mCurIdx++];
        b0 = b0 < 0 ? (b0 + 256) : b0;
        int b1 = mBuffer[mCurIdx++];
        b1 = b1 < 0 ? (b1 + 256) : b1;
        int b2 = mBuffer[mCurIdx++];
        b2 = b2 < 0 ? (b2 + 256) : b2;
        int b3 = mBuffer[mCurIdx++];
        return b0 + (b1 << 8) + (b2 << 16) + (b3 << 24);
    }

    public int scanUns8() {
        int b0 = mBuffer[mCurIdx++];
        return b0 < 0 ? (b0 + 256) : b0;
    }

    public int scanUns16() {
        int b0 = mBuffer[mCurIdx++];
        b0 = b0 < 0 ? (b0 + 256) : b0;
        int b1 = mBuffer[mCurIdx++];
        b1 = b1 < 0 ? (b1 + 256) : b1;
        return b0 + (b1 << 8);
    }

    public long scanUns32() {
        long b0 = mBuffer[mCurIdx++];
        b0 = b0 < 0 ? (b0 + 256) : b0;
        long b1 = mBuffer[mCurIdx++];
        b1 = b1 < 0 ? (b1 + 256) : b1;
        long b2 = mBuffer[mCurIdx++];
        b2 = b2 < 0 ? (b2 + 256) : b2;
        long b3 = mBuffer[mCurIdx++];
        b3 = b3 < 0 ? (b3 + 256) : b3;
        return b0 + (b1 << 8) + (b2 << 16) + (b3 << 24);
    }

    public void send(OutputStream out) throws Exception {
        out.write(mBuffer, 0, mCurIdx);
        out.flush();
        rewind();
    }
}
