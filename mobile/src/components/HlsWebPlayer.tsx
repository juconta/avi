import { useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { API_URL } from '../config'

const buildHtml = (logUrl: string) => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js"></script>
<style>
  html, body { margin: 0; padding: 0; background: #000; width: 100%; height: 100%; overflow: hidden; }
  #v { position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: contain; background: #000; }
</style>
</head>
<body>
<video id="v" muted playsinline autoplay preload="auto" controls></video>
<script>
  var video = document.getElementById('v');
  var hls = null;

  function sendLog(msg) {
    try { fetch('${logUrl}/debug/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ msg: msg }), keepalive: true }); } catch (e) {}
  }

  function init(url) {
    sendLog('PLAY url=' + url);
    if (hls) { hls.destroy(); hls = null; }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ debug: false, capLevelToPlayerSize: false, startLevel: -1 });
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () { sendLog('MANIFEST_PARSED ok'); });
      hls.on(window.Hls.Events.ERROR, function (e, data) {
        sendLog('HLS_ERROR ' + data.type + ' / ' + data.details + (data.fatal ? ' | fatal' : ''));
        if (data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
        }
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else {
      sendLog('NO_HLS');
      return;
    }
    video.addEventListener('loadeddata', function () {
      sendLog('LOADEDDATA w=' + video.videoWidth + ' h=' + video.videoHeight);
    });
    video.play().then(function () { sendLog('PLAYING ok'); }).catch(function (err) { sendLog('PLAY_ERROR ' + (err && err.message)); });
  }
</script>
</body>
</html>
`

interface Props {
  uri: string
}

export default function HlsWebPlayer({ uri }: Props) {
  const webRef = useRef<WebView>(null)

  return (
    <View style={styles.root}>
      <WebView
        ref={webRef}
        source={{ html: buildHtml(API_URL) }}
        style={styles.web}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        setSupportMultipleWindows={false}
        onLoadEnd={() => {
          webRef.current?.injectJavaScript(`init(${JSON.stringify(uri)}); true;`)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  web: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
})