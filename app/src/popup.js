// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
var rawr = false;
chrome.webRequest.onBeforeSendHeaders.addListener(
	function(details) {
		if (rawr) {
			console.log("RAwr");
			return;
		}
		rawr = true;
		var media_lessons_request = new XMLHttpRequest();
		media_lessons_request.addEventListener("load", function(event){
				var lessons = JSON.parse(media_lessons_request.responseText);
				lessons.data.forEach(function(dataItem) {
					dataItem.lessons.forEach(function(lesson) {
						try {
							console.log(lesson);
							var media = lesson.video.media;
							var primaryFiles = media.media.current.primaryFiles;
							primaryFiles.forEach(function(primary_file, file_index) {
								var download_url = primary_file.s3Url;
								var file_name = media.name;
								if(primaryFiles.length > 1) {
									file_name += "_" + (file_index + 1);
								}
								file_name = file_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
								chrome.downloads.download({
									url: download_url
								}, function(download_response) {
									console.log("Finished download");
									console.log(download_response);
								});
								console.log("Donwloading: " + file_name);
							});
						} catch(ex) {
							console.log("Failed to download primary files");
							console.log(ex.stack);
						}
					});
				});
				//console.log(lessons);
		});
		media_lessons_request.open(details.method, details.url);
		media_lessons_request.withCredentials = true;
		media_lessons_request.send();
	},
	{
		urls: ["*://echo360.org.au/section/*/media_lessons"]
	},
	["requestHeaders"]
);