import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

interface Props {
  onMessage: (event: WebViewMessageEvent) => void;
}

export const MLWebView = forwardRef<WebView, Props>(({ onMessage }, ref) => {
  return (
    <View style={{ position: 'absolute', top: -1000, width: 10, height: 10 }}>
      <WebView
        ref={ref}
        source={{ uri: 'file:///android_asset/webview.html' }}
        javaScriptEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        onMessage={onMessage}
        originWhitelist={['*']}
      />
    </View>
  );
});
