const express = require('express');
const cors = require('cors');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
  
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
      console.log(response.status);
      if (response.status === 200) {
        const responseData = await response.json();
        const playbackUrls = responseData.data.playbackUrls;
        let playbackObj = playbackUrls.find((obj) => obj.streamtype === 'hls');
        if (playbackObj && playbackObj.url) {
          // Redirect to the video_token URL
          console.log(playbackObj.url);
          fs.writeFileSync('url.json', JSON.stringify({videoUrl: playbackObj.url}));
        } else {
          return 'No playback URL found';
        }
      } else {
        return 'Error in response:', response.status;
      }
    } catch (error) {
      console.log(error);
    }
}
    
app.get('/api/events/:id',async (req, res) => {
    const id = req.params.id;
    await handleEvent(id);
    const url = fs.readFileSync('url.json', 'utf8');
    console.log(url);
    if (url) {
        res.send({
            url: JSON.parse(url).videoUrl
        });
    } else {
        res.status(404).send('Event not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});