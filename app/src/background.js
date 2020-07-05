async function getDownloadLink({lessonID, lessonName}, echo360Domain, downloadHD) {
  const regex = /(?:\(\")(?:.*)(?:\"\))/;
  const lessonHTMLPageRequest = new Request(`${echo360Domain}/lesson/${lessonID}/classroom`, { method: 'GET', credentials: 'include' });
  const lessonHTMLPageResponse = await fetch(lessonHTMLPageRequest)
  const lessonHTMLPageText = await lessonHTMLPageResponse.text();
  const dummyEl = document.createElement('html')
  dummyEl.innerHTML = lessonHTMLPageText;

  const videoDataString = dummyEl.getElementsByTagName('script')[11].innerText.match(regex)[0]
  const cleanString = videoDataString.substring(1, videoDataString.length - 1);
  const videoDataObject = JSON.parse(JSON.parse(cleanString));

  let totalSoruces = 0;

  if (!videoDataObject.video) {
    return null;
  }

  videoDataObject.video.playableMedias.forEach((media) => {
    if (media.sourceIndex > totalSoruces) {
      totalSoruces = media.sourceIndex;
    }
  })

  const downloadArray = [];
  for (let i = 1; i <= totalSoruces; i++) {
    const quality = downloadHD ? `hd${i}.mp4` : `sd${i}.mp4`;
    const videoName = `video_source_${i}_${quality}`
    const templateUrl = new URL(videoDataObject.video.playableMedias[0].uri);
    templateUrl.search = '';
    templateUrl.pathname = templateUrl.pathname.replace(/\/[^\/]*$/, `/${quality}`)

    downloadArray.push({
      url: templateUrl.href,
      lessonName,
      videoName,
    });
  }

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
