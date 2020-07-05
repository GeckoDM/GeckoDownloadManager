async function getDownloadLink({lessonID, lessonName}, echo360Domain, downloadHD) {
  const classroomAppRegex = new RegExp('(classroomApp)');
  const dataRegex = /(?:\(\")(?:.*)(?:\"\))/;
  const lessonHTMLPageRequest = new Request(`${echo360Domain}/lesson/${lessonID}/classroom`, { method: 'GET', credentials: 'include' });
  const lessonHTMLPageResponse = await fetch(lessonHTMLPageRequest)
  const lessonHTMLPageText = await lessonHTMLPageResponse.text();
  const dummyEl = document.createElement('html')
  dummyEl.innerHTML = lessonHTMLPageText;
  const videoDataScript = Array.from(dummyEl.getElementsByTagName('script')).filter((script) => classroomAppRegex.test(script.innerText));

  if (videoDataScript.length === 0)
  {
    return null;
  }

  const videoDataString = videoDataScript[0].innerText.match(dataRegex)[0];
  
  const cleanString = videoDataString.substring(1, videoDataString.length - 1);
  const videoDataObject = JSON.parse(JSON.parse(cleanString));

  const videosData =  videoDataObject.video.playableMedias.filter((videoData) => {
    const includesAudio = videoData.trackType.includes('Audio') 
    const includesVideo = videoData.trackType.includes('Video')
    const wantedQuality = downloadHD ? videoData.quality.includes(1) : videoData.quality.includes(0)
    return includesAudio && includesVideo && wantedQuality;
  })

  if (videosData.length === 0) {
    return null;
  }

  const downloadArray = videosData.map((videoData) => {
    const quality = downloadHD ? `hd` : `sd`;
    const videoName = `video_source_${videoData.sourceIndex}_${quality}.mp4`

    if (videoData.isHls)
    {
      // here i am guessing what the url is since hls video are different format
      const templateUrl = new URL(videoData.uri);
      templateUrl.search = '';
      templateUrl.pathname = templateUrl.pathname.replace(/\/[^\/]*$/, `/${quality}${videoData.sourceIndex}.mp4`)

      return {
        url: templateUrl.href,
        lessonName,
        videoName,
      }
    }

    const templateUrl = new URL(videoData.uri);
    templateUrl.search = '';

    return {
      url: templateUrl.href,
      lessonName,
      videoName,
    }

  });

  return downloadArray;
}

chrome.extension.onConnect.addListener(function (port) {
  console.log("Connected .....");
  port.onMessage.addListener(function ({toDownload, echo360Domain, downloadHD, courseName}) {

    toDownload.forEach((downloadable) => {
      getDownloadLink(downloadable, echo360Domain, downloadHD)
        .then((downloadArray) => {
          if (!downloadArray)
          {
            return;
          }
          
          downloadArray.forEach((downloadData) => {
            chrome.downloads.download({
              url: downloadData.url,
              filename: `Echo360_Lectures/${courseName}/${downloadData.lessonName}/${downloadData.videoName}`
            })
          })
        });
    });
  });
})
