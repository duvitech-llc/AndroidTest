package com.example.androidtest;

import com.six15.ardrawing.R;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.CompoundButton.OnCheckedChangeListener;



public class SettingsActivity extends Activity {
	
	SharedPreferences prefs;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_settings);
		prefs = this.getSharedPreferences("com.six15.ardrawing", Context.MODE_PRIVATE);
		CheckBox showConsole = (CheckBox)findViewById(R.id.chkShowConsole);
		showConsole.setChecked(prefs.getBoolean("showconsole", false));
		showConsole.setOnCheckedChangeListener(new OnCheckedChangeListener() {
			@Override
			public void onCheckedChanged(CompoundButton buttonView,
					boolean isChecked) {
				SharedPreferences.Editor ed = prefs.edit();
				ed.putBoolean("showconsole", isChecked);
				ed.commit();
			}
		});
		
	}
}
