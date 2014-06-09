# MiniReel Player

* *[Beta11.rc1]*
  * [FIX]: changed splash page templates so that they are no longer stand alone html files; using snippets instead.
  * [FIX]: splash template : horizontal stack : preloader hidden by default
  * [FIX]: splash template : text only : created separate template snippets for all sizes to preserve convention
  * [FIX]: splash template : updates for content flow vertical sizing


* *[Beta10.rc1]* (June 5, 2014)
  * [FIX]: Splash templates separated into css and html files.
  * [FIX]: Preloader added into Splash for display while MiniReel loads.
  * [FIX]: Rumble player can handle election fixes (#370)
* *[/Beta10.rc1]*

## Beta9 (May 27, 2014)
* *[Beta9.rc1]*
  * [FEATURE]: Prefetch VPAID ad when card is onDeck (updates VPAID swf file)
  * [FIX]: Advance to next card if VPAID ad fires any of these events: adError, adStopped, onAllAdsCompleted
  * [FIX]: Make sure VPAID ad is loaded before getting currentTime, otherwise errors are thrown
  * App is now using multiple production ad tags to fetch ads
* *[/Beta9.rc1]*

## Beta8 (May 20, 2014)
* *[Beta8.rc1]*
  * [FEATURE]: User is now show an ad if they try to skip to the card
    after an ad (if they haven't viewed the ad already)
  * [FIX]: In Lightbox mode, fixed bug where titles were getting cut off.
* *[/Beta8.rc1]*

## Beta7 (May 16, 2014)
* *[Beta7.rc1]*
  * [FEATURE]: Added 'Skip This Ad in...' countdown text for timer skippable ads
  * [FIX]: In Lightox with Ads, added height based media queries
  * [FEATURE]: Added new styles for urban times splash page
* *[/Beta7.rc1]*

## Beta6 (May 15, 2014)
* *[Beta6.rc2]*
  * [FIX]: VPAID card will no longer auto-advance to the next card if it
    has a companion ad to display
* *[/Beta6.rc2]*
* *[Beta6.rc1]*
  * [FIX]: The navigation is no longer disable-able on a device that
    does not support inline video
  * [FEATURE]: Added VPAID and VAST companion ad support
* *[/Beta6.rc1]*

## Beta5 (May 14, 2014)
* *[Beta5.rc1]*
  * [FIX]: First! MiniReel Player Media Queries not test for both height and width to best fit player inside browser window.
  * [FEATURE]: Show the poster of a click-to-play MiniReel before the
    user clicks to play it.
  * [FEATURE]: The VPAID card now reads a configuration that conditionally allows it to be skipped at certain time (or not at all)
  * [FIX]: The VPAID card now responds to autoplay configuration
* *[/Beta5.rc1]*

## Beta4 (May 13, 2014)
* *[Beta4.rc1]*
  * [FEATURE]: The VAST card (used for mobile ads) now reads a configuration that conditionally allows it to be skipped at certian times (or not at all)
  * [FIX]: Removed some hacks from the YouTube player twerk to make it more deterministic
* *[/Beta4.rc1]*

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
  * [FIX]: Lightbox: Increase width of prev/next buttons at large screen
    size so text isn't cut off
  * [FIX]: Makes sure Rumble controller emits all appropriate reel events when setting a new position
* *[/Beta3.rc13]*
* *[Beta3.rc14]*
  * [FIX]: MiniReel Lightbox, no Ads : titles are bigger and responsive.
  * [FIX]: Mobile : Title of MiniReel added above card
  * [FIX]: Mobile : added dynamic experience title to video embed card
* *[/Beta3.rc14]*
