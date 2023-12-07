function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

  // Check if the request URL endpoint is "index.m3u8"
if (window.location.pathname.endsWith("index.m3u8")) {
    // Get the value of the "id" query parameter
    const idValue = getQueryParam("id");

    // Call the handleEvent function with the "id" as an argument
    handleEvent(idValue);
}
async function getAccessToken() {
    try {
      const response = await fetch('https://auth-jiocinema.voot.com/tokenservice/apis/v4/guest', {
        method: 'POST',
        body: JSON.stringify({"appName":"RJIL_JioCinema","deviceType":"phone","os":"ios","deviceId":"7c3726fd-c014-4109-a695-b165b7e28726","freshLaunch":false,"adId":"7c3726fd-c014-4109-a695-b165b7e28726"})
      });

      const data = await response.json();

      return data.authToken;
    } catch (error) {
      console.log(error);
    }
  }

async function handleEvent(id) {
    try {
        const payload = JSON.stringify({
            "4k": false,
            "ageGroup": "18+",
            "appVersion": "3.4.0",
            "bitrateProfile": "xhdpi",
            "capability": {
              "drmCapability": {
                "aesSupport": "yes",
                "fairPlayDrmSupport": "yes",
                "playreadyDrmSupport": "none",
                "widevineDRMSupport": "yes"
              },
              "frameRateCapability": [{"frameRateSupport": "30fps", "videoQuality": "1440p"}]
            },
            "continueWatchingRequired": false,
            "dolby": false,
            "downloadRequest": false,
            "hevc": false,
            "kidsSafe": false,
            "manufacturer": "Windows",
            "model": "Windows",
            "multiAudioRequired": true,
            "osVersion": "10",
            "parentalPinValid": true,
            "x-apisignatures": "o668nxgzwff"
          });
      const token = await getAccessToken();
      const response = await fetch(`https://apis-jiovoot.voot.com/playbackjv/v4/${id}`, {
        method: 'POST',
        headers: {
          "Accesstoken": token,
          "X-Platform": "androidweb"
        },
        body: payload
      });

      if (response.status === 200) {
        const responseData = await response.json();
        const playbackUrls = responseData.data.playbackUrls;
        let playbackObj = playbackUrls.find((obj) => obj.streamtype === 'hls');
        if (playbackObj && playbackObj.url) {
          // Redirect to the video_token URL
          window.location.replace(playbackObj.url);
        } else {
          console.log('No playback URL found');
        }
      } else {
        console.log('Error in response:', response.status);
      }
    } catch (error) {
      console.log(error);
    }
}


    