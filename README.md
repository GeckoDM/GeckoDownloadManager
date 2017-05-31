# Gecko420
<div>
	<img src="/images/qtpi.png" width="100" >
</div>
Make Echo360 great again

https://gecko420.github.io/

## Supported Institutions
To see supported institutions visit [https://github.com/darvid7/Gecko420/wiki/Supported-Institutions](https://github.com/darvid7/Gecko420/wiki/Supported-Institutions)

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