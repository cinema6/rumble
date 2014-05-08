# MiniReel Player

## Beta3 (April 29, 2014)
* Add a Changelog.
* [FIX]: Use kMode query param for loading player
* [FIX]: Decode query params
* *[Beta3.rc4]*
  * [FIX]: Update percent filter to return 0 if input isNaN
  * [FIX]: Hide next/prev buttons on recap card
  * [FIX]: Queue a pause on the ad if ad is not loaded when user leaves card
  * [FIX]: Adds displayAd functionality to recap card in lightbox-ads mode **Need to update experiences in the content service**
  * [FIX]: Update percent filter to return 0 if input isNaN
  * [FIX]: Added default MiniReel theme
  * [FIX]: Clean up of unused style classes in theme files
  * [FIX]: Hide next/prev buttons on recap card
  * [FIX]: Queue a pause on the ad if ad is not loaded when user leaves card
  * [FIX]: Adds displayAd functionality to recap card in lightbox-ads mode **Need to update experiences in the content service**
* *[/Beta3.rc4]*
* *[Beta3.rc5]*
  * [FIX]: Ballot service is initialized with election id, not
    experience id **Need to update experiences in the content service**
  * [FIX]: Ballot service is only initialized if it has an associated
    election
  * [FIX]: Use protocol-relative URLs
  * [FIX]: Add listener to c6AppData to update the experience on mrPreview session ping
  * [FIX]: Update recap card controller to set/reset properties when active
* *[/Beta3.rc5]*
* *[Beta3.rc6]*
  * [FIX]: Default mobile theme added
* *[/Beta3.rc6]*
* *[Beta3.rc7]*
  * [FIX]: Lightbox, no ads - media query updated to properly center ballots at large screen sizes
  * [FIX]: Lightbox, no ads, white bg
  * [FIX]: Change YouTube, DailyMotion, Vimeo urls to be protocol-relative
* *[/Beta3.rc7]*
* *[Beta3.rc8]*
  * [FIX]: Make sure FireFox doesn't break when app is loaded in an
    iframe using the "javascript:" protocol
  * [FIX]: Use https for youtube iframe embeds
* *[/Beta3.rc8]*
* *[Beta3.rc9]*
  * [FIX]: Explicitly ask for SSL assets from dailymotion when on an
    HTTPS connection
* *[/Beta3.rc9]*
* *[Beta3.rc10]*
  * [FIX]: 'mr-pager__group--fullWidth' class added to lightbox, no-ad version of minireel player
  * [FIX]: Update thumb-paginator to recalculate width when recap-card broadcasts a resize event
  * [FIX]: Update thumb-paginator to monitor available width and change current page if necessary
  * [FIX]: Urban Times theme cleaned up
  * [FIX]: Updated cache times
  * [FIX]: Updated to pull all mr fields from data
* *[/Beta3.rc10]*
* *[Beta3.rc11]*
  * [FEATURE]: Show splash image as recap card thumbnail
* *[/Beta3.rc11]*
* *[Beta3.rc12]*
  * [FEATURE]: Thumb paginator: Don't fill the remaining width of the slider with
    the buttons if all of the thumbnails fit on one page
  * [FIX]: Firefox issue with hostname when sending to ga
* *[/Beta3.rc12]*
* *[Beta3.rc13]*
  * [FIX]: Moved branding collateral to branding directory on s3.
  * [FIX]: Update recap card to load data whenever it's active