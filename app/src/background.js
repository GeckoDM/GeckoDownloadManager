function getVideoFileName({ lesson }) {
  const dateObj = new Date(lesson.startTimeUTC);
  const month = dateObj.getUTCMonth() + 1; //months from 1-12
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();
  
  const startTimeDateObj = new Date(lesson.lesson.timing.start);
  const startTime = startTimeDateObj.toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute:'2-digit'
  });


  const endTimeDateObj = new Date(lesson.lesson.timing.end);
  const endTime = endTimeDateObj.toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute:'2-digit'
  });

  const name = year + "-" + month + "-" + day + ' ' + startTime + '-' + endTime;

  return name.replaceAll(':', '\ua789');
}

async function getDownloadLink({ lesson }, downloadHD) {
  const regex = /(?:\(\")(?:.*)(?:\"\))/;
  const lessonHTMLPageRequest = new Request(`https://echo360.org.uk/lesson/${lesson.lesson.id}/classroom`, { method: 'GET', credentials: 'include' });
  const lessonHTMLPageResponse = await fetch(lessonHTMLPageRequest)
  const lessonHTMLPageText = await lessonHTMLPageResponse.text();
  const dummyEl = document.createElement('html')
  dummyEl.innerHTML = lessonHTMLPageText;

  const videoDataString = dummyEl.getElementsByTagName('script')[11].innerText.match(regex)[0]
  const cleanString = videoDataString.substring(1, videoDataString.length - 1);
  const videoDataObject = JSON.parse(JSON.parse(cleanString));

  let totalSoruces = 0;

  if (!videoDataObject.video)
  {
    return null;
  }

  videoDataObject.video.playableMedias.forEach((media) => {
    if (media.sourceIndex > totalSoruces)
    {
      totalSoruces = media.sourceIndex;
    }
  })

  const downloadArray = [];
  for (let i = 1; i <= totalSoruces; i++)
  {
    const quality = downloadHD ? `hd${i}.mp4` : `sd${i}.mp4`;
    const videoName = `video_source_${i}_${quality}`
    const templateUrl = new URL(videoDataObject.video.playableMedias[0].uri);
    templateUrl.search = '';
    templateUrl.pathname = templateUrl.pathname.replace(/\/[^\/]*$/, `/${quality}`)

    downloadArray.push({
      url: templateUrl.href,
      name: videoName,
    });
  }

  if (downloadArray.length === 0) debugger;

  return downloadArray;
}

chrome.extension.onConnect.addListener(function (port) {
  console.log("Connected .....");
  port.onMessage.addListener(function ({toDownload, downloadHD, courseName}) {

    toDownload.forEach((downloadable) => {
      const saveFileAs = getVideoFileName(downloadable, downloadHD);

      getDownloadLink(downloadable, downloadHD)
        .then((downloadArray) => {
          if (!downloadArray)
          {
            return;
          }
          
          downloadArray.forEach((downloadData) => {
            chrome.downloads.download({
              url: downloadData.url,
              filename: `Echo360_Lectures/${courseName}/${saveFileAs}/${downloadData.name}`
            })
          })
        });
    });
  });
})
