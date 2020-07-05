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

/**
 * @description checks if there are any media to download based on medias object and mediaType === "Video"
 * @param {*} param0
 * @returns {boolean} 
 */
function canDownload(lesson) {
  if (lesson.medias.length <= 0) {
    return false;
  }

  return lesson.medias.some((media) => media.mediaType === "Video")
}

function getVideoFileName(lesson) {
  const { updatedAt } = lesson.lesson;
  return updatedAt.slice(0, updatedAt.indexOf("T"));
}

/**
 * @description Gets the course name for the current course page
 * @param {string} courseSectionId - The course Id which represents the current course
 * @returns {Promise<string>} The course name 
 */
async function getCourseName(courseSectionId) {
  const courseDataRequest = new Request(`${echo360Domain}/user/enrollments`, { method: 'GET', credentials: 'include' });
  const courseDataResponse = await fetch(courseDataRequest);
  const courseDataJson = await courseDataResponse.json();

  const courseMatch = courseDataJson.data[0].userSections.find((userSection) => userSection.sectionId === courseSectionId)

  return courseMatch ? courseMatch.courseName.replace(/[/\\?%*:|"<>]/g, ' ') : 'unknown course';
}

/**
 * @description // Now perform the request again ourselves and download files.
 * @returns {Promise<object>}
 */
async function getMediaData({ url }) {
  const getMediaLessonsRequest = new Request(url, { method: 'GET', credentials: 'include' });
  const getMediaLessonsResponse = await fetch(getMediaLessonsRequest);
  return getMediaLessonsResponse.json();
}

function getLessons(mediaLessonsJson) {
  const lessons = [];
  mediaLessonsJson.data.forEach((mediaLessonData) => {
    if (mediaLessonData.lessons) {
      mediaLessonData.lessons.forEach((lesson) => lessons.push(lesson.lesson));
    }
    else {
      lessons.push(mediaLessonData.lesson);
    }
  })

  return lessons;
}

// Job of this function is to listen init mediaLessons once per click.
async function webRequestOnComplete(xhrRequest) {
  console.log("Media Lessons obtained!");
  _gaq.push(['_trackEvent', 'webReqFunc', 'loaded']);
  if (mediaLessons === undefined) {
    mediaLessons = xhrRequest;

    const getMediaLessonsJson = await getMediaData(mediaLessons);
    const lessons = getLessons(getMediaLessonsJson);
    const courseSectionId = lessons[0].lesson.sectionId;
    courseName = await getCourseName(courseSectionId);

    console.log(getMediaLessonsJson);
    downloadables = lessons.filter((dataItem) => {
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
      const name = courseName + "_" + getVideoFileName(downloadable);

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
    const domainOrigin = new URL(tabs[0].url).origin;
    const domainHostName = new URL(tabs[0].url).hostname;
    debugger;
    if (echo360BaseURIs.indexOf(domainHostName) === -1) {
      document.getElementById("load").setAttribute("disabled", true);
      document.getElementById("downloadHD").setAttribute("disabled", true);
      document.getElementById("mainBlock").setAttribute("hidden", true);
      document.getElementById("invalidMsg").removeAttribute("hidden")
      echo360Domain = domainOrigin;
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
      if (option.selected) {
        toDownload.push({
          lessonID: downloadables[i].lesson.id,
          lessonName: getVideoFileName(downloadables[i]),
        })
      }
    });

    // link to background.js
    const port = chrome.runtime.connect();

    port.postMessage({ toDownload, echo360Domain, downloadHD, courseName });
    downloadButton.disabled = true;
    $("#lectureSelect").empty();
    mediaLessons = undefined;

    return;
  }, false);

}, false);
