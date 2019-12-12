/**
 * Save Options
 */
function saveOptions() {
  var enableHD = $('#hdenable input')[0].checked;
  enableHD = !enableHD;
  chrome.storage.sync.set({
    enableHD: enableHD,
  }, function () {
    // Update status to let user know options were saved.
    displayFinished('Saved Settings!');
    updateCheckBox("hdenable", enableHD);
    console.log("Save: " + "enableHD:" + enableHD);
  });
}

/**
 * Resets Options to default sttings
 */
function resetOptions() {
  var enableHDDefault = true;
  // Set Chrome Values
  chrome.storage.sync.set({
    enableHD: enableHDDefault,
  }, function () {
    updateCheckBox("hdenable", enableHDDefault);
    displayFinished('Resetted Settings to Default!');
    console.log("Reset: " + "enableHD:true");
  });
}/*  */

/**
 * reloads currently saved options into values
 */
function restoreOptions() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get(
    ['enableHD'], function (items) {
      updateCheckBox("hdenable", items.enableHD);
      displayFinished('Config Loaded!');
      console.log("Restore: " + "enableHD:" + items.enableHD);
    });
}

function displayFinished(showMessage) {
  var snackbarContainer = document.querySelector('#demo-toast-example');
  var data = { message: showMessage };
  snackbarContainer.MaterialSnackbar.showSnackbar(data);
}

/**
 * Check and uncheck
 */
function updateCheckBox(id, checked) {
  var checkBox = document.getElementById(id);
  if (checked == true) {
    checkBox.MaterialCheckbox.check();
  } else {
    checkBox.MaterialCheckbox.uncheck();
  }
}

/**
 * Initialize or restore options
 */
document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.sync.get(
    ['enableHD'], function (items) {
      if (items.enableHD === undefined) {
        // initialize
        resetOptions();
      } else {
        // restore
        restoreOptions();
      }
    });
});

document.getElementById('resetOptions').addEventListener('click',
  resetOptions);

document.getElementById('hdenable').addEventListener('click',
  saveOptions);