package com.emmoco.framework.android;

import android.content.Context;
import android.util.AttributeSet;
import android.view.View;
import android.widget.ScrollView;
import android.widget.TextView;

public class ConsoleView extends ScrollView {

	private TextView mTv;
	
	public ConsoleView(Context context, AttributeSet attrs) {
		super(context, attrs);
		mTv = new TextView(context, attrs);
		this.addView(mTv);
	}

	public void clear() {
		mTv.post(new Runnable() {
			public void run() {
				mTv.setText("");
				ConsoleView.this.fullScroll(View.FOCUS_DOWN);
			}
		});
	}
	
	public void printf(final String fmt, final Object... args) {
		mTv.post(new Runnable() {
			public void run() {
				mTv.append(String.format(fmt, args));
				ConsoleView.this.fullScroll(View.FOCUS_DOWN);
			}
		});
	}
	
}
