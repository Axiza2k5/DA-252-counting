import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { getWebviewHtml } from '../../WebviewTemplate';

// @ts-ignore
const modelData = require('../../modelBase64.json');
const MODEL_B64 = modelData.base64;

interface Props {
  onMessage: (event: WebViewMessageEvent) => void;
}

export const MLWebView = forwardRef<WebView, Props>(({ onMessage }, ref) => {
  return (
    <View style={{ position: 'absolute', top: -1000, width: 10, height: 10 }}>
      <WebView 
        ref={ref}
        source={{ html: getWebviewHtml(MODEL_B64) }} 
        javaScriptEnabled={true}
        onMessage={onMessage}
        originWhitelist={['*']}
      />
    </View>
  );
});
