# Gecko Download Manager (geckoDM) for Echo360
<div>
	<img src="/images/qtpi.png" width="100" >
</div>
Make Echo360 great again

<https://geckodm.github.io>

This project started because a 4 Monash kids were sick of downloading lectures individually and wanted to code instead of study during swotvac :laughing:we all failed :anguished:

[![](https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_340x96.png)](https://chrome.google.com/webstore/detail/pgkfjobhhfckamidemkddfnnkknomobe/)

## Supported Institutions
To see supported institutions visit [https://github.com/GeckoDM/GeckoDownloadManager/wiki/Supported-Institutions](https://github.com/GeckoDM/GeckoDownloadManager/wiki/Supported-Institutions)

### Supporting:

<a href="https://monash.edu">
	<img 
		src="https://www.monash.edu/__data/assets/git_bridge/0006/509343/deploy/mysource_files/monash-logo-mono.svg"
		height="60px" />
</a><br/>
<a href="https://www.unimelb.edu.au/">
	<img 
		src="https://brandhub.unimelb.edu.au/guidelines/logos/04_Logo_Vertical-Housed.jpg"
		height="100px" />
</a><br/>
<a href="https://unsw.edu.au/">
	<img 
		src="https://www.unsw.edu.au/sites/default/files/UNSW_0.png"
		height="60px" />
</a><br/>
<a href="https://www.ed.ac.uk/">
	<img 
		src="https://www.ed.ac.uk/sites/all/themes/uoe/assets/logo.png"
		height="60px" />
</a><br/>

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
- [ ] Fix download blocking (multiple downloads, slow internet)

## Known Issues
- Downloading many files in a short time span sometimes leads to Echo360 or Amazon S3 blocking downloads (sometimes it greys out lectures).

<img src="/screenshots/screenshot-blocked.png" >
