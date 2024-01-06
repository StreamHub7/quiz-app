const express = require('express');
const cors = require('cors');
const { CronJob } = require('cron');
// const fs = require('fs').promises;
const db = require('./db');
const StreamData = require('./models/Streamdata');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
// const channelIds = [
//   '0-9-zeecinemahd',
//   '0-9-tvpictureshd',
//   '0-9-209',
//   '0-9-zeecinema',
//   '0-9-pictures',
//   '0-9-zing',
//   '0-9-zeeanmolcinema',
//   '0-9-zeeclassic',
//   '0-9-176',
//   '0-9-zeetvhd',
//   '0-9-tvhd_0',
//   '0-9-channel_2105335046',
//   '0-9-privéhd',
// ];

// const job = new CronJob(
// 	'0 * * * * *', // cronTime
// 	updateUrl, // job
// 	null, // onComplete
// 	true, // start
// 	'Asia/Kolkata' // timeZone
// );

// job.start();


// function updateUrl() {
//   for(let i=0; i<channelIds.length; i++){
//     const channel_ID = channelIds[i];
//     handleEvent(channel_ID);
//   }
// }

async function handleEvent(channel_ID) {
  const apiUrl = `https://spapi.zee5.com/singlePlayback/getDetails/secure?channel_id=${channel_ID}&device_id=c6fafc73-81b2-4eb5-8da3-86be8bad14b5&platform_name=mobile_web&translation=en&user_language=en,hi,hr,pa&country=IN&state=DL&app_version=3.15.6&user_type=premium&check_parental_control=false&gender=Male&age_group=18-24&utm_source=GoogleSearch&uid=1ea72478-3faa-4e05-91ae-c67cfb9ae903&ppid=c6fafc73-81b2-4eb5-8da3-86be8bad14b5&version=12`;
    const token = {'x-access-token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF0Zm9ybV9jb2RlIjoiV2ViQCQhdDM4NzEyIiwiaXNzdWVkQXQiOiIyMDI0LTAxLTAzVDIyOjUxOjE1LjQyN1oiLCJwcm9kdWN0X2NvZGUiOiJ6ZWU1QDk3NSIsInR0bCI6ODY0MDAwMDAsImlhdCI6MTcwNDMyMjI3NX0.tnVsWqvHS9HpCPyBalUrt3Kgt7nf3OTbuKqVqOmfDHw','Authorization':'bearer eyJraWQiOiJlNmxfbGYweHpwYVk4VzBNcFQzWlBzN2hyOEZ4Y0trbDhDV0JaekVKT2lBIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJEMUI0NDk5Ny0wMjNCLTREQkYtQUIxMS04REEzRDY2MDIwNzUiLCJzdWJzY3JpcHRpb25zIjoiW3tcImlkXCI6XCIxNWZiMGQ5ZS1hOWEwLTExZWUtYWQ2Mi04NTQ4Y2M3MTJkMzRcIixcInVzZXJfaWRcIjpcImQxYjQ0OTk3LTAyM2ItNGRiZi1hYjExLThkYTNkNjYwMjA3NVwiLFwiaWRlbnRpZmllclwiOlwiQ1JNXCIsXCJzdWJzY3JpcHRpb25fcGxhblwiOntcImlkXCI6XCIwLTExLTIwNzNcIixcImFzc2V0X3R5cGVcIjoxMSxcInN1YnNjcmlwdGlvbl9wbGFuX3R5cGVcIjpcIlNWT0RcIixcInRpdGxlXCI6XCJQcmVwYWlkIENvZGUgUGFjayAtIDEyIG1vbnRoc1wiLFwib3JpZ2luYWxfdGl0bGVcIjpcIlByZXBhaWQgQ29kZSBQYWNrIC0gMTIgbW9udGhzXCIsXCJzeXN0ZW1cIjpcIlo1XCIsXCJkZXNjcmlwdGlvblwiOlwiUHJlbWl1bSAtIDEyIG1vbnRocyAtIHByZXBhaWQgY29kZXNcIixcImJpbGxpbmdfY3ljbGVfdHlwZVwiOlwiZGF5c1wiLFwiYmlsbGluZ19mcmVxdWVuY3lcIjozNjUsXCJwcmljZVwiOjY5OSxcImN1cnJlbmN5XCI6XCJJTlJcIixcImNvdW50cmllc1wiOltcIklOXCJdLFwic3RhcnRcIjpcIjIwMjItMDMtMTRUMTc6MDQ6MDBaXCIsXCJlbmRcIjpcIjIwMjQtMTItMzFUMjM6NTk6MDBaXCIsXCJvbmx5X2F2YWlsYWJsZV93aXRoX3Byb21vdGlvblwiOmZhbHNlLFwicmVjdXJyaW5nXCI6ZmFsc2UsXCJwYXltZW50X3Byb3ZpZGVyc1wiOlt7XCJuYW1lXCI6XCJaZWU1XCIsXCJwcm9kdWN0X3JlZmVyZW5jZVwiOm51bGx9XSxcInByb21vdGlvbnNcIjpbXSxcImFzc2V0X3R5cGVzXCI6WzAsNiw5XSxcImFzc2V0X2lkc1wiOltcIlwiXSxcImZyZWVfdHJpYWxcIjowLFwiYnVzaW5lc3NfdHlwZVwiOlwiZnJlZVwiLFwiYmlsbGluZ190eXBlXCI6XCJwcmVtaXVtXCIsXCJudW1iZXJfb2Zfc3VwcG9ydGVkX2RldmljZXNcIjoyLFwibW92aWVfYXVkaW9fbGFuZ3VhZ2VzXCI6W10sXCJ0dl9zaG93X2F1ZGlvX2xhbmd1YWdlc1wiOltdLFwiY2hhbm5lbF9hdWRpb19sYW5ndWFnZXNcIjpbXSxcImR1cmF0aW9uX3RleHRcIjpcIlwiLFwidmFsaWRfZm9yX2FsbF9jb3VudHJpZXNcIjp0cnVlLFwiYWxsb3dlZF9wbGF5YmFja19kdXJhdGlvblwiOjYsXCJvZmZlcl9pZFwiOjAsXCJjYXRlZ29yeVwiOlwiXCIsXCJhY3R1YWxfdmFsdWVcIjowLFwiYmVmb3JlVHZcIjp0cnVlfSxcInN1YnNjcmlwdGlvbl9zdGFydFwiOlwiMjAyNC0wMS0wMlQxODo1MjozMi4wMDBaXCIsXCJzdWJzY3JpcHRpb25fZW5kXCI6XCIyMDI1LTAxLTAxVDIzOjU5OjU5WlwiLFwic3RhdGVcIjpcImFjdGl2YXRlZFwiLFwicmVjdXJyaW5nX2VuYWJsZWRcIjpmYWxzZSxcInBheW1lbnRfcHJvdmlkZXJcIjpudWxsLFwiZnJlZV90cmlhbFwiOm51bGwsXCJjcmVhdGVfZGF0ZVwiOm51bGwsXCJpcF9hZGRyZXNzXCI6bnVsbCxcImNvdW50cnlcIjpcIklOXCIsXCJhZGRpdGlvbmFsXCI6e1wicmVnaW9uXCI6XCJNQUhBUkFTSFRSQVwiLFwiY291bnRyeVwiOlwiSU5cIixcInBhcnRuZXJcIjpcIlpFRTVcIixcInN1YnNfdHlwZVwiOlwiaW50ZXJuYWxfc3Vic1wiLFwiY291cG9uY29kZVwiOlwiWjVDUE1BMjNZU1gzMTJcIixcImlwX2FkZHJlc3NcIjpcIjEyNy4wLjAuNlwiLFwicGF5bWVudG1vZGVcIjpcIlByZXBhaWRDb2RlXCJ9LFwiYWxsb3dlZF9iaWxsaW5nX2N5Y2xlc1wiOjAsXCJ1c2VkX2JpbGxpbmdfY3ljbGVzXCI6MH1dIiwiYWN0aXZhdGlvbl9kYXRlIjoiMjAyMy0xMi0wM1QwODo1NTowMi4yMzFaIiwiYW1yIjpbImRlbGVnYXRpb24iXSwiaXNzIjoiaHR0cHM6Ly91c2VyYXBpLnplZTUuY29tIiwiY3VycmVudF9jb3VudHJ5IjoiSU4iLCJjbGllbnRfaWQiOiJyZWZyZXNoX3Rva2VuX2NsaWVudCIsImFjY2Vzc190b2tlbl90eXBlIjoiRGVmYXVsdFByaXZpbGVnZSIsInVzZXJfdHlwZSI6IlJlZ2lzdGVyZWQiLCJzY29wZSI6WyJ1c2VyYXBpIiwic3Vic2NyaXB0aW9uYXBpIiwicHJvZmlsZWFwaSJdLCJhdXRoX3RpbWUiOjE3MDM5NjE2MjAsImV4cCI6MTcwNjg1MTU1NiwiaWF0IjoxNzA0MjIxNTU2LCJqdGkiOiI0MzAxZjhhYS00ZjJiLTRkN2ItYjNjNy00YTlhM2M1NjU3NGEiLCJ1c2VyX2VtYWlsIjoiYmlldHdvcmtzaG9wN0BnbWFpbC5jb20iLCJkZXZpY2VfaWQiOiIwYjQzODEzNS1jNWJjLTQ2NDItYWUxYS0wNmY1MjE0MzY4ODQiLCJyZWdpc3RyYXRpb25fY291bnRyeSI6IklOIiwidmVyc2lvbiI6NSwiYXVkIjpbInVzZXJhcGkiLCJzdWJzY3JpcHRpb25hcGkiLCJwcm9maWxlYXBpIl0sInN5c3RlbSI6Ilo1IiwibmJmIjoxNzA0MjIxNTU2LCJpZHAiOiJsb2NhbCIsInVzZXJfaWQiOiJkMWI0NDk5Ny0wMjNiLTRkYmYtYWIxMS04ZGEzZDY2MDIwNzUiLCJjcmVhdGVkX2RhdGUiOiIyMDIzLTEyLTAzVDA4OjU1OjAyLjIzMVoiLCJhY3RpdmF0ZWQiOnRydWV9.TyEkIyN1undqyCNMc1B9rvmhRm12PjldTuZ_7uhP0Ufy8PMnMBhwNJAl5OpWmL4hMlAgoKbIvnp2k9Q3hQmbiynvn4r8kBk3CPcXTwLhcL-ZRseHrMg7OMK3SYUTGTrFWhtrVnbrERTWm1I9nvzcthT3Op0Gb-y_cky546j4IAFQdLPdM4xPpbmDKE88EU8535A0CqCIPV2knGytjBcibu8zyXU3FNBNtiea33GK8BhY1Sf3frtyRmiQqa2-l5FB0GFafwqM0g6nsSJSlvtmote3qJcMGyXsdeRqQvHat1oqcsHqVRCt__08lgxVqMGGwNLueaacEafBkw6_hEeHWw','x-dd-token':'eyJzY2hlbWFfdmVyc2lvbiI6IjEiLCJvc19uYW1lIjoiTi9BIiwib3NfdmVyc2lvbiI6Ik4vQSIsInBsYXRmb3JtX25hbWUiOiJDaHJvbWUiLCJwbGF0Zm9ybV92ZXJzaW9uIjoiMTA0IiwiZGV2aWNlX25hbWUiOiIiLCJhcHBfbmFtZSI6IldlYiIsImFwcF92ZXJzaW9uIjoiMi41Mi4zMSIsInBsYXllcl9jYXBhYmlsaXRpZXMiOnsiYXVkaW9fY2hhbm5lbCI6WyJTVEVSRU8iXSwidmlkZW9fY29kZWMiOlsiSDI2NCJdLCJjb250YWluZXIiOlsiTVA0IiwiVFMiXSwicGFja2FnZSI6WyJEQVNIIiwiSExTIl0sInJlc29sdXRpb24iOlsiMjQwcCIsIlNEIiwiSEQiLCJGSEQiXSwiZHluYW1pY19yYW5nZSI6WyJTRFIiXX0sInNlY3VyaXR5X2NhcGFiaWxpdGllcyI6eyJlbmNyeXB0aW9uIjpbIldJREVWSU5FX0FFU19DVFIiXSwid2lkZXZpbmVfc2VjdXJpdHlfbGV2ZWwiOlsiTDMiXSwiaGRjcF92ZXJzaW9uIjpbIkhEQ1BfVjEiLCJIRENQX1YyIiwiSERDUF9WMl8xIiwiSERDUF9WMl8yIl19fQ=='};
    try {

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(token)
      });
  
      if (response.status === 200) {
        const responseData = await response.json();
        const videoToken = responseData.keyOsDetails.video_token;
  
        if (videoToken) {
          // Redirect to the video_token URL
          return videoToken;
        }
      }
    } catch (error) {
      console.log('Error:', error);
    }
}

app.get('/index.php', async (req, res) => {
  try {
      const channel_ID = req.query.id;

      if (!channel_ID) {
        res.status(400).send('Missing channel ID');
        return;
      }
      else {
        const videoUrl = await handleEvent(channel_ID);
        res.redirect(videoUrl);
      }
  } catch(error) {
    console.log('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});