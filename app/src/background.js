function getVideoFileName(lesson, downloadHD) {
  // ES6 allows you to do this.
  // Old: const updatedAt = lesson.lesson.updatedAt;
  // Old: const age, name = person.age, person.name
  // New: const {age, name} = person;
  const {updatedAt} = lesson.video.media;
  const quality = (downloadHD) ? "_HD" : "_SD";
  return updatedAt.slice(0, updatedAt.indexOf("T")) + quality + ".mp4";
}

// Returns only unit code.
function getUnitCode(lesson) {
  const lectureName = lesson.lesson.name;
  var unitCodeTrailing = lectureName.slice(0, lectureName.indexOf("/"));
  try {
    return unitCodeTrailing.split("_")[0];
  } catch (err) {
    // Some Universities may have weird formats.
    return unitCodeTrailing;
  }
}

function getDownloadLink(lesson, downloadHD) {
  // Expected case: lesson.video.media.media.current gives array of downloadable links.
  // Unexpected case: no attribute current (see unkown issues).
  // TODO: Handle this.
  const {primaryFiles} = lesson.video.media.media.current;
  if (downloadHD) {
    const {s3Url, width, height} = primaryFiles[1];
    // TODO: URL for access outside of Australia.
    return "https://echo360.org.au/media/download?s3Url=" + s3Url + "&fileName=hd1.mp4&resolution=" + width.toString() + "x" + height.toString();
  } else {
    const {s3Url, width, height} = primaryFiles[0];
    return "https://echo360.org.au/media/download?s3Url=" + s3Url + "&fileName=sd1.mp4&resolution=" + width.toString() + "x" + height.toString();
  }
}

chrome.extension.onConnect.addListener(function(port) {
     console.log("Connected .....");
     port.onMessage.addListener(function(toDownload, downloadHD) {
       let unitCode = getUnitCode(toDownload[0]);

       toDownload.forEach((downloadable) => {
           console.log(getDownloadLink(downloadable, downloadHD));
           console.log(getVideoFileName(downloadable, downloadHD));
           let saveFileAs = unitCode + "_" + getVideoFileName(downloadable, downloadHD);
           console.log("Downloading " + saveFileAs);
           chrome.downloads.download({
               url: getDownloadLink(downloadable, downloadHD),
               filename: "Echo360_Lectures/" + unitCode + "/" + saveFileAs
               }, function callback(downloadId){
                   console.log(downloadId);
                   var currentDownload = {
                       id: downloadId
                   }
                   chrome.downloads.search(currentDownload, function test(result){
                       console.log(result[0]);
                   })
               }
           );
       });
     });
})
