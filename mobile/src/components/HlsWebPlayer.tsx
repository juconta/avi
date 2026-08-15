import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

const HLS_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js"></script>
<style>
  html, body { margin: 0; padding: 0; background: #000; width: 100%; height: 100%; overflow: hidden; }
  video { width: 100%; height: 100%; background: #000; }
</style>
</head>
<body>
<video id="v" controls playsinline autoplay></video>
<script>
  var video = document.getElementById('v');
  var hls = null;
  function play(url) {
    if (hls) { hls.destroy(); hls = null; }
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
    video.play().catch(function () {});
  }
  window.addEventListener('message', function (e) {
    if (e.data && e.data.url) play(e.data.url);
  });
</script>
</body>
</html>
`

interface Props {
  uri: string
}

export default function HlsWebPlayer({ uri }: Props) {
  return (
    <WebView
      source={{ html: HLS_HTML }}
      style={StyleSheet.absoluteFill}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback
      startInLoadingState
      injectedJavaScriptAfterLoad={`window.postMessage({ url: ${JSON.stringify(uri)} });`}
    />
  )
}
