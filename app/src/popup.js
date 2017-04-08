let mediaLessons = undefined;
const shouldDownload = true;
let downloadHD = false;
let downloadables = [];
let filtered = [];

function canDownload(lesson) {
  return lesson.isFuture !== true;
}

function getVideoFileName(lesson) {
  const {createdAt} = lesson.lesson;
  const quality = (downloadHD) ? "_HD" : "_SD";
  return createdAt.slice(0, createdAt.indexOf("T")) + quality + ".mp4";
}

function getUnitCode(lesson) {
  const lectureName = lesson.lesson.name;
  return lectureName.slice(0, lectureName.indexOf("/"));
}

function getDownloadLink(lesson) {
  const {primaryFiles} = lesson.video.media.media.current;
  if (downloadHD) {
    const {s3Url, width, height} = primaryFiles[1];
    return "https://echo360.org.au/media/download?s3Url=" + s3Url + "&fileName=hd1.mp4&resolution=" + width.toString() + "x" + height.toString();
  } else {
    const {s3Url, width, height} = primaryFiles[0];
    return "https://echo360.org.au/media/download?s3Url=" + s3Url + "&fileName=sd1.mp4&resolution=" + width.toString() + "x" + height.toString();
  }
}

// job of this function is to listen init mediaLessons once per click.
function webRequestOnComplete(xhrRequest) {
  console.log("Media Lessons obtained!");

  if (mediaLessons === undefined) {
    mediaLessons = xhrRequest;
    // now perform the request again ourselves and download files
    var getMediaLessonsRequest = new Request(mediaLessons.url, {method: 'GET'});
    fetch(
      getMediaLessonsRequest,
      {
        method: 'GET',
            credentials: 'include'
      })
      .then((getMediaLessonsResponse) => getMediaLessonsResponse.json())
      .then((getMediaLessonsJson) => {
        console.log(getMediaLessonsJson);
        getMediaLessonsJson.data.forEach((dataItem) => {
          var lessons = dataItem.lessons;
          downloadables = lessons.filter((lesson) => {
            return canDownload(lesson);
          });
          downloadables.sort((a, b) => {
            const nameA = getVideoFileName(a), nameB = getVideoFileName(b);
            if (nameA < nameB) return -1;
            else if (nameA == nameB) return 0;
            else return 1;
          });

          const lectureSelect = document.getElementById("lectureSelect");
          downloadables.forEach((downloadable) => {
            const option = document.createElement("option");
            option.defaultSelected = true;
            const name = getVideoFileName(downloadable);

            option.innerHTML = name;
            lectureSelect.appendChild(option);
          });

          var downloadButton = document.getElementById('download');
          downloadButton.disabled = false;
        });
      });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // add load button onclick
  var loadButton = document.getElementById('load');
  loadButton.addEventListener('click', function () {
    downloadHD = (document.getElementById("downloadHD").checked) ? true : false;
    chrome.webRequest.onCompleted.addListener(webRequestOnComplete, {urls: ["*://echo360.org.au/*/media_lessons"]});

    chrome.tabs.getSelected(null, function (tab) {
      var code = 'window.location.reload();';
      chrome.tabs.executeScript(tab.id, {code: code});
    });
  }, false);

  /*
  chrome.tabs.getCurrent(function(tab){
        console.log(tab.url);
        if(/^https?:\/\/([a-zA-Z\d-]+\.){0,}echo360\.org.au$/.test(tab.url)){
          $("#main").css("visibility", "visible")
          $("#warning").css("visibility", "visible")
        } else {
          $("#main").css("visibility", "visible")
          $("#warning").css("visibility", "visible")
        }
    }
  );
  */

  // add download button onclick
  var downloadButton = document.getElementById('download');
  downloadButton.disabled = true;
  downloadButton.addEventListener('click', function () {
    downloadHD = (document.getElementById("downloadHD").checked) ? true : false;


    const lectureSelect = document.getElementById("lectureSelect");
    const options = lectureSelect.options;

    let selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected)
        selected.push(i);
    }

    // using index as unique ID, since dates are not unique
    let toDownload = [];
    for (let i = 0; i < downloadables.length; i++) {
      if (selected.indexOf(i) != -1)
        toDownload.push(downloadables[i]);
    }

    toDownload.forEach((downloadable) => {
      console.log(getDownloadLink(downloadable));
      console.log(getVideoFileName(downloadable));
      if (shouldDownload) {
        console.log("Downloading");
        chrome.downloads.download({
          url: getDownloadLink(downloadable),
          filename: "MULO Lectures/" + getUnitCode(downloadable) + "/" + getVideoFileName(downloadable)
        });
      }
    });
    downloadButton.disabled = true;
    mediaLessons = undefined;
  }, false);

}, false);
