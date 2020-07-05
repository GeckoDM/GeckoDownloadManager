let mediaLessons = undefined;
const shouldDownload = true;
let downloadHD = false;
let courseName = null;
let downloadables = [];
let filtered = [];
let echo360Domain = '';

const GA_ACCOUNT_CODE = 'VUEtMTIxMzY2NDY1LTE='

// Google Analytics setup
var _gaq = _gaq || [];
_gaq.push(['_setAccount', atob(GA_ACCOUNT_CODE)]);
_gaq.push(['_trackPageview']);

(function () {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
const echo360BaseURIs = [
  'echo360.org.au',
  'echo360.org.uk',
  'echo360.org'
]

function canDownload({ lesson }) {
  return lesson.isPast && lesson.hasVideo;
}

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

// Returns only unit code.
function getUnitCode({ lesson }) {
  const lectureName = lesson.lesson.name;
  var unitCodeTrailing = lectureName.slice(0, lectureName.indexOf("/"));
  try {
    // So UNSW uses ' ' instead of '_'.
    // This is a hack(kinda) to get it working for UNSW but should think of a better way to do it after some sleep.
    if (unitCodeTrailing.includes(" ")) {
      // Assume can split by space.
      return unitCodeTrailing.split(" ")[0];
    }
    // Monash uses underscores.
    return unitCodeTrailing.split("_")[0];
  } catch (err) {
    // Some Universities may have weird formats.
    return unitCodeTrailing;
  }
}

// Job of this function is to listen init mediaLessons once per click.
async function webRequestOnComplete(xhrRequest) {
  console.log("Media Lessons obtained!");
  _gaq.push(['_trackEvent', 'webReqFunc', 'loaded']);
  if (mediaLessons === undefined) {
    mediaLessons = xhrRequest;
    // Now perform the request again ourselves and download files.
    const getMediaLessonsRequest = new Request(mediaLessons.url, { method: 'GET', credentials: 'include' });
    const getMediaLessonsResponse = await fetch(getMediaLessonsRequest);
    const getMediaLessonsJson = await getMediaLessonsResponse.json();

    const courseDataRequest = new Request('https://echo360.org.uk/user/enrollments', { method: 'GET', credentials: 'include' });
    const courseDataResponse = await fetch(courseDataRequest);
    const courseDataJson = await courseDataResponse.json();

    const courseMatch = courseDataJson.data[0].userSections.find((userSection) => userSection.sectionId === getMediaLessonsJson.data[0].lesson.lesson.sectionId)    
    courseName = courseMatch.courseName.replace(/[/\\?%*:|"<>]/g, ' ')

    console.log(getMediaLessonsJson);
    downloadables = getMediaLessonsJson.data.filter((dataItem) => {
      return canDownload(dataItem);
    });

    // sort downloadables
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
      const name = getUnitCode(downloadable) + "_" + getVideoFileName(downloadable);

      option.innerHTML = name;
      lectureSelect.appendChild(option);
    });

    var downloadButton = document.getElementById('download');
    downloadButton.disabled = false;
  }
}

function pageSetup() {
  document.getElementById("versionLabel").innerText = chrome.runtime.getManifest().version;
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    var currentTab = tabs[0].url;
    console.log(currentTab);
    var domain = currentTab.match(/^[\w-]+:\/{2,}\[?([\w\.:-]+)\]?(?::[0-9]*)?/)[1];
    if (echo360BaseURIs.indexOf(domain) === -1) {
      document.getElementById("load").setAttribute("disabled", true);
      document.getElementById("downloadHD").setAttribute("disabled", true);
      document.getElementById("mainBlock").setAttribute("hidden", true);
      document.getElementById("invalidMsg").removeAttribute("hidden")
      echo360Domain = domain;
    }
  });
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    enableHD: false,
  }, function (items) {
    document.getElementById('downloadHD').checked = items.enableHD;
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // Add load button onclick. To refresh page to populate
  var loadButton = document.getElementById('load');
  let echo360Domain;
  pageSetup()

  loadButton.addEventListener('click', function () {

    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      echo360Domain = new URL(tabs[0].url).origin;

      downloadHD = (document.getElementById("downloadHD").checked) ? true : false;
      console.log("echo360loaded", echo360Domain)
      chrome.webRequest.onCompleted.addListener(webRequestOnComplete, { urls: [`${echo360Domain}/*/syllabus`] });

      chrome.tabs.getSelected(null, function (tab) {
        var code = 'window.location.reload();';
        chrome.tabs.executeScript(tab.id, { code: code });
      });
    });

  }, false);

  document.getElementById("optionsBtn").addEventListener('click', function () {
    chrome.runtime.openOptionsPage();
  });
  // Add download button onclick.
  var downloadButton = document.getElementById('download');
  downloadButton.disabled = true;
  downloadButton.addEventListener('click', function () {
    downloadHD = (document.getElementById("downloadHD").checked) ? true : false;

    const lectureSelect = document.getElementById("lectureSelect");
    const options = Array.from(lectureSelect.options);

    const toDownload = [];
    options.forEach((option, i) => {
      if (option.selected)
      {
        toDownload.push({
          lessonID: downloadables[i].lesson.lesson.id,
          lessonName: getVideoFileName(downloadables[i]),
        })
      }
    });

    // link to background.js
    const port = chrome.runtime.connect();

    port.postMessage({toDownload, echo360Domain, downloadHD, courseName});
    downloadButton.disabled = true;
    $("#lectureSelect").empty();
    mediaLessons = undefined;

    return;
  }, false);

}, false);
