/**
 * Save Options
 */
function saveOptions() {
  var enableHD = document.getElementById('hdenable').value;
  chrome.storage.sync.set({
      enableHD: enableHD,
  }, function() {
    // Update status to let user know options were saved.
    displayFinished('Saved Settings!');
  });
}

/**
 * Resets Options to default sttings
 */
function resetOptions(){
  // Set Chrome Values
  chrome.storage.sync.set({
      enableHD: false
  }, function() {
    // Update status to let user know options were saved.
    displayFinished('Resetted Settings to Default!');
  });
  document.getElementById('hdenable').checked = false;
  location.reload();
}

/**
 * reloads currently saved options into values
 */
function restoreOptions() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
      enableHD: false,
  }, function(items) {
    document.getElementById('hdenable').checked = items.enableHD;
  });
}

function displayFinished(showMessage){
    var snackbarContainer = document.querySelector('#demo-toast-example');
    var data = {message: showMessage};
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
}


document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveOptions').addEventListener('click',
    saveOptions);

document.getElementById('resetOptions').addEventListener('click',
    resetOptions);