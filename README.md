# Gecko420
<div>
	<img src="/images/qtpi.png" width="100" >
</div>
Make Echo360 great again

## Supported Institutions
Here's a list of institutions which are currently supported by Gecko420

| Institution | Echo360 Version | Status | Notes |
|-------------|-----------------|--------| ------ |
| ![Monash University](http://www.monash.edu/__data/assets/git_bridge/0006/509343/deploy/mysource_files/monash-logo-mono.svg) | 2017 | Working | Releasing in v0.1.0 on 20/4/2017 |
| ![The University of Melbourne](https://upload.wikimedia.org/wikipedia/en/1/10/University_of_Melbourne_logo.png) | N/A | Not Working (LMS Not Supported) | Awaiting potential solution and need verification |
| ![RMIT](http://mams.rmit.edu.au/pydyrxvec44m.png) | N/A | Not Yet tested | N/A |
| ![Deakin](https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Deakin_University_Logo.png/200px-Deakin_University_Logo.png) | N/A | Not Yet Tested | N/A |

## Objective

Make a chrome extension that allows students to download all their lectures (that they probably won't watch anyway) with the click of a single button.

## Usage

### 1. Go to the Echo download link provided by your institution.
<img src="/screenshots/screenshot-dl_link.png" >

### 2. Load the Echo page (via the link), click on the Gecko extension.
- Click on load Lectures.
- Select Lectures to download.
- Click on download.

<img src="/screenshots/screenshot-usecase.png" >

### 3. Downloading lectures.
<img src="/screenshots/screenshot-downloading.png" >

### 4. On Disk.
<img src="/screenshots/screenshot-datastore.png" >

## TODO
- [x] Figure out how to download stuff
- [x] ~~Handle download limits i.e. Can only download 6 files at a time.~~ I think Chrome handles this.
- [x] GUI
- [x] Specify download path (filesystem can only be used on Chrome apps, can have option to insert path via GUI?)
- [x] Name files downloaded
- [ ] Support incognito?
- [ ] Differentiate between recordings on the same day?
- [ ] Migrate to MDL (Material Design Lite)

## Known Issues
- downloading many files in a short snap sometimes leads to Echo360 graying out lectures (blocks download), swapping to incognito seems to fix this but we don't support that yet.

<img src="/screenshots/screenshot-blocked.png" >