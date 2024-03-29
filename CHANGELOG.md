# MiniReel Player

## v1.15.1 (March 9, 2015)
* *[v1.15.1.rc1]*
  * [FIX]: Fix for an issue that caused the Table of Contents animation
    to appear broken
* *[/v1.15.1.rc1]*

## v1.15.0 (February 26, 2015)
* *[v1.15.0.rc1]*
  * [FIX]: Fixed bug where solo player templates would occasionally play video
    in the bg when user navigated to the recap card.
  * [FIX]: Fix for an issue that could cause the player to not load on
    slow internet connections
  * [FIX]: Fix for an issue that could cause the player to never load a
    sponsored VAST card on a slow internet connection
* *[/v1.15.0.rc1]*

## v1.14.0 (February 18, 2015)
* *[v1.14.0.rc2]*
  * [FIX]: Fix for an issue that caused the "Replay Video" button to
    appear on a card in mobile even if there was no display ad shown
* *[/v1.14.0.rc2]*

* *[v1.14.0.rc1]*
  * [FEATURE]: Added support for display ads to sponsored cards running
    on mobile
* *[/v1.14.0.rc1]*

## v1.13.0 (February 12, 2015)
* *[v1.13.0.rc1]*
  * [FEATURE]: Add ability to fire multiple campaign-tracking pixels
  * [FEATURE]: Add ability to fire tracking pixels when a minireel
    launches
  * [FIX]: Fix for an issue where the skip disabler would briefly
    display "Skip in null"
  * [FEATURE]: Add ability to extract data from branding A/B tests
* *[/v1.13.0.rc1]*

## v1.12.0 (February 3, 2015)
* *[v1.12.0.rc1]*
  * fixed css to auto-resize MR iframe inside of container div
* *[/v1.12.0.rc1]*

## v1.11.0 (January 22, 2015)
* *[v1.11.0.rc2]*
  * Changed VAST-only ad tags to fix a Safari redirect error
* *[/v1.11.0.rc2]*

* *[v1.11.0.rc1]*
  * Changed video quartile tracking logic so skipping to a quartile will
    result in all previous quartiles being fired
  * [FEATURE]: Adding context,container,group to ga reporting
  * [FIX]: Removing unnecessary duplicate GA reports for votes (#631).
  * [FIX]: Fix for an issue that caused videos not to play in a
    UIWebView running on a device with iOS 7 (or less)
  * [FIX]: Fix for an issue where dynamic ad cards weren't tracked
    correctly in GA.
* *[/v1.11.0.rc1]*

## v1.10.1 (December 30, 2014)
* *[v1.10.1.rc1]*
  * [FIX]: Fix for an issue that could cause VAST videos not to autoplay
    in UIWebViews on iOS 7
* *[/v1.10.1.rc1]*

## v1.10.0 (December 29, 2014)
* *[v1.10.0.rc1]*
  * [FEATURE]: Added support for optional controls via card data
  * [FEATURE]: Added GA timing event for how long it takes c6ui to
    download
  * [FEATURE]: Add GA timing event for how long it takes a video to
    start playing (after being autoplayed.)
* *[/v1.10.0.rc1]*

## v1.9.7 (December 23, 2014)
* *[v1.9.7.rc2]*
  * [FEATURE]: Added GA Video events when a player is ready, and when
    the player attempts to autoplay the video
* *[/v1.9.7.rc2]*

* *[v1.9.7.rc1]*
  * [FEATURE]: An error event is sent to GA if a video takes a long time
    to start playing
* *[/v1.9.7.rc1]*

## v1.9.6 (December 22, 2014)
* *[v1.9.6.rc1]*
  * [FEATURE]: Events are sent to GA if the VAST/VPAID/YouTube player
    encounters an error
* *[/v1.9.6.rc1]*

## v1.9.5 (December 20, 2014)
* *[v1.9.5.rc1]*
  * Update c6ui: v3.5.6
* *[/v1.9.5.rc1]*

## v1.9.4 (December 19, 2014)
* *[v1.9.4.rc1]*
  * [FIX]: Fix for an issue that caused a never-ending negative skip
    countdown to happen on a video with a skip timer if the user returns
    to that video having never initally played it.
* *[/v1.9.4.rc1]*

## v1.9.3 (December 19, 2014)
* *[v1.9.3.rc1]*
  * Disabled clickthrough on VAST video (non-preroll) cards
* *[/v1.9.3.rc1]*

## v1.9.2 (December 19, 2014)
* *[v1.9.2.rc1]*
  * [FIX]: Remove controls from vast player
  * [FEATURE]: Add countdown controls to mobile player
* *[/v1.9.2.rc1]*

## v1.9.1 (December 19, 2014)
* *[v1.9.1.rc1]*
  * [FIX]: Stop telling VPAID player to pause when error is detected,
    the VPAID player directive handles it internally
  * [FIX]: Update c6ui: v3.5.4
* *[v1.9.1.rc1]*

## v1.9.0 (December 18, 2014)
* *[v1.9.0.rc1]*
  * [FEATURE]: Light templates (embedded) now support branding
  * Started sending error events to GA when scripts fail to load
  * [FIX]: Fix for an issue where skipping to a video far away would
    cause the play button to flash if that video had been played
    previously
  * The native video play button is now used in click-to-play videos
  * Allow cards to disable navigation on mobile
  * Added additional GA event tracking for debugging purposes
* *[v1.9.0.rc1]*

## v1.8.1 (December 17, 2014)
* *[v1.8.1.rc1]*
  * [FIX]: Update c6ui
* *[/v1.8.1.rc1]*

## v1.8.0 (December 11, 2014)
* *[v1.8.0.rc2]*
  * [FIX]: Fix for an issue that could cause autoplaying HTML5 ad units
    to start playing after the MiniReel has been closed on mobile
* *[/v1.8.0.rc2]*

* *[v1.8.0.rc1]*
  * [FIX]: Fixed styling issue where clicking on blue ballot buttons would show
    a red border
  * [FEATURE]: Added support for for autoplaying HTML5 ad units on the
    first slide in mobile
* *[/v1.8.0.rc1]*

## v1.7.5 (December 8, 2014)
* *[v1.7.5.rc1]*
  * The first card in a MR is no longer loaded before the MR is launched
* *[/v1.7.5.rc1]*

## v1.7.4 (December 5, 2014)
* *[v1.7.4.rc2]*
  * [FIX]: Fix for an issue that could maybe cause the AdCount pixel
    used for billing to be fired too many times
* *[/v1.7.4.rc2]*

* *[v1.7.4.rc1]*
  * [FIX]: In Mobile, fixed issue of video playing when off screen
  * [FIX]: In Mobile, fixed post modules appearing on wrong cards
  * [FIX]: In Mobile, fixed rendering of post modules so that they fit on screen
* *[/v1.7.4.rc1]*

## v1.7.3 (December 4, 2014)
* *[v1.7.3.rc2]*
  * [FIX]: Fix for an issue that caused a phantom play button to appear
    in MiniReels with Vimeo videos running on an iPhone with iOS < 8
* *[/v1.7.3.rc2]*

* *[v1.7.3.rc1]*
  * [FIX]: Fix for an issue that caused rendering issues and strange
    behavior on iOS < 8 if the first card was a VAST AdUnit
  * [FIX]: Fix for an issue that caused the "complete" pixel to be fired
    too many times by VAST videos on mobile devices
  * [FEATURE]: Made it possible to send the "minViewTime" billing pixel
    after a video (no matter its duration) has been completely played
* *[/v1.7.3.rc1]*

## v1.7.2 (December 3, 2014)
* *[v1.7.2.rc1]*
  * [FIX]: Update c6ui
* *[/v1.7.2.rc1]*

## v1.7.1 (December 3, 2014)
* *[v1.7.1.rc1]*
  * [FIX]: Enable native video controls on vast player in all video card templates
* *[/v1.7.1.rc1]*

## v1.7.0 (December 3, 2014)
* *[v1.7.0.rc1]*
  * [FIX]: lightbox templates media queries updated for small screens
  * [FEATURE]: Added support for Rumble videos
  * [FIX]: lightbox template - removed css transitions on width property
  * [FEATURE]: Added GA event tracking to voteing
* *[/v1.7.0.rc1]*

## v1.6.1 (November 21, 2014)
* *[v1.6.1.rc2]*
  * [FIX]: fix for lightbox templates where MR titles were being cut off just below the baseline
* *[/v1.6.1.rc2]*

* *[v1.6.1.rc1]*
  * [FIX]: CSS hacks for AOL mobile player added
* *[/v1.6.1.rc1]*

## v1.6.0 (November 20, 2014)
* *[v1.6.0.rc2]*
  * [FIX]: Fix for an issue that caused sponsored card surveys not to be
    persisted in the database
  * [FIX]: Fix for an issue that caused video sources not to appear in
    the mobile table of contents
  * [FIX]: Fix for an issue where YouTube videos would play in the
    background
* *[/v1.6.0.rc2]*

* *[v1.6.0.rc1]*
  * [FIX]: Media Queries optimized for small (13 inch) screens
  * [FEATURE]: new embedded templates added
  * [FIX]: consolidated player styles to work with single video card directive
  * [FIX]: Post module is enabled on a video card whenever video is paused
  * [FIX]: Allow for overriding an election ID when saving a vote
  * [FIX]: Removed VAST and VPAID cards and replaced with a single Ad Card directive
* *[/v1.6.0.rc1]*

## v1.5.2
* *[v1.5.2.rc2]*
  * Updated c6ui library to v3.3.1
* *[/v1.5.2.rc2]*

* *[v1.5.2.rc1]*
  * [FIX]: for solo templates, fixed button positioning of sponsor action button
  * Updated c6ui library to v3.3.0
* *[/v1.5.2.rc1]*

## v1.5.1
* *[v1.5.1.rc1]*
  * [FIX]: Fixed an issue where the vast player did not fill the content area
* *[/v1.5.1.rc1]*

## v1.5.0
* *[v1.5.0.rc6]*
  * [FIX]: Ensure Ad Skip countdown doesn't cover card text and features below video
* *[/v1.5.0.rc6]*

* *[v1.5.0.rc5]*
  * [FIX]: Responsive adjustments for templates added
  * [FIX]: On mobile, removed nav when player is solo
* *[/v1.5.0.rc5]*

* *[v1.5.0.rc4]*
  * [FEATURE]: lightbox soloMR support added
  * [FEATURE]: Fire clickUrl and countUrl for sponsored cards
  * [FIX]: Fix for an issue that caused Sponsored MiniReel social links
    not to appear in the MR Studio preview
* *[/v1.5.0.rc4]*

* *[v1.5.0.rc3]*
  * [FIX]: ballot results styles added
  * [FIX]: Media queries for large screens added for lightbox, lightbox-playlist, and full
* *[/v1.5.0.rc3]*

* *[v1.5.0.rc2]*
  * [FIX]: Fix for an issue that caused the page navigation not to
    appear in the lightbox mode
* *[/v1.5.0.rc2]*

* *[v1.5.0.rc1]*
  * [FEATURE]: added styles for branded MiniReels in mobile, lightbox, and full templates
  * [FIX]: lightbox-playlist template updated for companion ad fixes
  * [FIX]: ad unit card styling added
* *[/v1.5.0.rc1]*

## v1.4.0 (October 29, 2014)
* *[v1.4.0.rc2]*
  * [FEATURE]: Added support for Pinterest social links
  * Content card skip controls are no longer linked to the amount of the
    video that was watched, the are linked to the amount of time the user
    spends on the card
* *[/v1.4.0.rc2]*

* *[v1.4.0.rc1]*
  * [FEATURE]: Solo player templates and styles, with and without ads, added.
    Solo players are MRs with a single video card.
  * [FEATURE]: Allow for display ads, card autoplaying, and card
    autoadvancing to be overridden on a card-by-card basis
  * [FEATURE]: Add ```<ad-unit-card>``` for playing back ad units as
    content
  * [FEATURE]: Allow custom thumbnails for all card types
* *[/v1.4.0.rc1]*

## v1.3.0 (October 16, 2014)
* *[v1.3.0.rc1]*
  * [FEATURE]: Full page player with ads styles added
  * [FEATURE]: Removed cover image from text only cards
  * [FEATURE]: Custom templates can now be specified for a MiniReel card
* *[/v1.3.0.rc1]*

## v1.2.0 (October 8, 2014)
* *[v1.2.0.rc2]*
  * [FIX]: Fix for an issue that could allow the MR to be closed in
    standalone mode using the previous button on the first slide
* *[/v1.2.0.rc2]*

* *[v1.2.0.rc1]*
  * [FIX]: Player properly handles a dynamic ad card in the first position
  * [FEATURE]: full page MiniReel player added.
* *[/v1.2.0.rc1]*

## v1.1.0 (September 25, 2014)
* *[v1.1.0.rc2]*
  * [FIX]: Fix for an issue that could cause display ads not to appear
    from within an MR2 widget
* *[/v1.1.0.rc2]*

* *[v1.1.0.rc1]*
  * Player now uses AdTech placementId from experience to avoid calling
  AdTech more than once
* *[/v1.1.0.rc1]*

## v1.0.0 (September 12, 2014)
* *[v1.0.0.rc1]*
  * Player has been updated with new Ad Tags from Adap.tv
* *[/v1.0.0.rc1]*

## Beta25 (August 29, 2014)
* *[Beta25.rc1]*
  * [FIX]: Fix for an issue that could cause a custom splash image not
    to appear when previewing a MiniReel from the MiniReel Studio
  * [PERFORMANCE]: Removed code that is no longer being used, further
    optimized the mobile build to increase load speeds, reduced the
    amount of library code being downloaded
* *[/Beta25.rc1]*

## Beta24 (August 26, 2014)
* *[Beta24.rc1]*
  * [FIX]: Hide Adtech placement container so that default Adtech ad doesn't
    show up erroneously when a publisher is not in the Adtech system
  * [FIX]: Fixed bug where Next button wasn't being hidden on ad cards in lighbox mode
  * [FIX]: Safari animation fixed for text intro start button
  * [FEATURE]: lightbox intro card styles updated
  * [FIX]: Ensure that whenever we skip/advance past an ad card our VPAID player knows not
    to show an ad if it eventually loads
* *[Beta24.rc1]*

## Beta23 (August 15, 2014)
* *[Beta23.rc2]*
  * [FIX]: In Lightbox + ads mode, display ads do not display on text only cards.
  * [FIX]: In Lightbox mode, display ad docked to bottom of player
* *[/Beta23.rc2]*

* *[Beta23.rc1]*
  * [FEATURE]: Text card now features buttons for starting the MiniReel
    in the lightbox view modes
* *[/Beta23.rc1]*

## Beta22 (August 6, 2014)
* *[Beta22.rc2]*
  * [FIX]: VPAID ads pause if ad is loaded after auto-advancing to next card
* *[/Beta22.rc2]*

* *[Beta22.rc1]*
  * [FIX]: VPAID ads now work in Internet Explorer
  * [FIX]: If dynamic ad configuration has a "first ad" setting of -1 it will disable all ads from playing,
    if the ad "frequency" is set to 0 then only the ad in first position will be shown
  * [FIX]: Fixed an issue that caused ads to hang on Firefox on the Mac
    when flash is not installed
  * [FIX]: VPAID card will now automatically advance if an ad does not start
    playing in 3 seconds
* *[/Beta22.rc1]*

## Beta21 (July 28, 2014)
* *[Beta21.rc1]*
  * [FEATURE]: Added place for publisher logo in Lightbox MiniReels
* *[/Beta21.rc1]*

## Beta20 (July 24, 2014)
* *[Beta20.rc3]*
  * [FIX]: (Mobile) Tapping the "Previous" button when on the first card
    of the MiniReel no longer activates the element underneath where the
    previous button was when the MiniReel closes
* *[/Beta20.rc3]*

* *[Beta20.rc2]*
  * [FIX]: "Via" is no longer shown in the recap card for non-video
    cards
* *[/Beta20.rc2]*

* *[Beta20.rc1]*
  * Collateral assets now live in their own GH repo
  * [FEATURE]: Added support for text cards
  * [FIX]: The same YouTube video can now be embedded multiple times
    with different start/end times
* *[/Beta20.rc1]*

## Beta19 (July 22, 2014)
* *[Beta19.rc6]*
  * Made txt on fallback display ad easier to read
* *[/Beta19.rc6]*

* *[Beta19.rc5]*
  * [FIX]: Reset 'preloaded' property on static ad cards when MR is reset
* *[/Beta19.rc5]*

* *[Beta19.rc4]*
  * [FIX]: Lightbox-ads player headers now span full width of modal
  * [FIX]: Lightbox-ads Ad placement now correctly re-aligns with media queries
  * [FIX]: Light text ad player is now vertically taller to minimize unused space.
  * [THEME]: Digital Journal created
  * [FIX]: Light text player ad doesn't render when there is no height value for container box. Fixed via min-height.
  * [FIX]: Uses existing ad cards if they're included in the experience and uses dynamic/relative ad cards when they're not
* *[/Beta19.rc4]*

* *[Beta19.rc3]*
  * [FIX]: Fix malformed base tag in build
* *[/Beta19.rc3]*

* *[Beta19.rc2]*
  * [FIX]: Upload player to the "rumble" folder again
* *[/Beta19.rc2]*

* *[Beta19.rc1]*
  * All view modes are now using multiple decks (to allow for dynamic ad
    placements)
  * [FEATURE]: Ads are now loaded dynamically based on the experience ad config
    but experiences with ad cards in the deck already are still supported
  * All JS files are now AMD modules to simplify dependency management
    and improve performance.
    * **New versions of c6Embed and the MR Editor must be deployed prior
      to this being deployed.**
  * [FIX]: MR Player will still load even if the user is using an ad
    blocker
* *[/Beta19.rc1]*

## Beta18 (July 17, 2014)
* *[Beta18.rc1]*
  * Tweaks to GA tracking
* *[/Beta18.rc1]*

## Beta17 (July 15, 2014)
* *[Beta17.rc3]*
  * [FIX]: transition animation bug fixed
  * [FIX]: c6ad theme namespaced
* *[/Beta17.rc3]*

* *[Beta17.rc2]*
  * [FIX]: fixed responsive json padding typo
* *[/Beta17.rc2]*

* *[Beta17.rc1]*
  * [FIX]: New styles added for light text embedded player
  * [FEATURE]: Added ga session reset when first slide of MR is visited.
  * [FEATURE]: Added theme for c6 ad MiniReels
  * [FIX]: ballot close behavior bug fixed  
* *[/Beta17.rc1]*

## Beta16 (July 2, 2014)
* *[Beta16.rc1]*
  * Added infrastructure needed for dynamic ad placements (only being
    used in light mode right now)
  * [FIX]: Fix for an issue that caused YT videos to continue playing
    after leaving their cards
  * [FEATURE]: Video cards will now auto-advance to the next card when
    they are done playing (if there is no voting)
* *[/Beta16.rc1]*

## Beta15.3 (July 1, 2014)
* *[Beta15.3.rc1]*
  * [FIX]: Fix for an issue where the light text version of the player
    appeared cut-off in Firefox
* *[/Beta15.3.rc1]*

## Beta15.2 (July 1, 2014)
* *[Beta15.2.rc1]*
  * [FIX]: Fix for an issue where the recap card of the light text version of the player
    cut-off the navigation
* *[/Beta15.2.rc1]*

## Beta15.1 (July 1, 2014)
* *[Beta15.1.rc1]*
  * [FIX]: Fix for an issue where the light text version of the player
    appeared cut-off
* *[/Beta15.1.rc1]*

## Beta15 (June 25, 2014)
* *[Beta15.rc2]*
  * [FIX]: VAST card (mobile) now auto advances when ad is complete
* *[/Beta15.rc2]*

* *[Beta15.rc1]*
  * [FIX]: Updates to google analytics video duration, adding href custom dimension
  * [FIX]: (Mobile): Ad cards are not included in the progress indicator
  * [FEATURE]: VPAID ad timer will advance to the next card if no ad has started within 3 seconds of the card becoming active
  * [FEATURE]: VAST ad timer will advance to the next card if no videoSrc is found within 3 seconds of the card becoming active
  * [REDESIGN]: Updated light text embedded templates to remove 'hover to reveal text' feature.
* *[/Beta15.rc1]*

## Beta14 (June 25, 2014)
* *[Beta14.rc2]*
  * [FIX]: Always advance ad cards when ad ends
  * [FIX]: Only load an ad the first time an ad card is onDeck or active
* *[/Beta14.rc2]*

* *[Beta14.rc1]*
  * Preloading of videos has been disabled to improve stability
* *[/Beta14.rc1]*

## Beta13 (June 24, 2014)
* *[Beta13.rc1]*
  * [FIX]: VPAID and VAST ads are now loaded when onDeck and/or when jumped to directly
  * [FIX]: VPAID and VAST cards will advance to the next card if there is no ad returned
* *[/Beta13.rc1]*

## Beta12.1 (June 16, 2014)
* *[Beta12.1.rc3]*
  * If a companion is shown at the same time as a video ad, and the ad
    has already been viewed, the ad card is skipped
  * [FIX]: Fixes positioning bug in vast cards for chrome browser
  * [FIX]: Added play buttons to all ad cards (vast and vpaid)
  * [FIX]: Change when display ads are shown, based on availability of inline video and if ad has ended
* *[/Beta12.1.rc3]*

* *[Beta12.1.rc2]*
  * [FIX]: Clean up ad view in lightbox without display ads
  * [FIX]: Added adtech secure property to ad calls
* *[/Beta12.1.rc2]*

* *[Beta12.1.rc1]*
  * [FIX]: Lightbox, no-ad player styles updated
* *[/Beta12.1.rc1]*

## Beta12 (June 11, 2014)
* *[Beta12.rc5]*
  * [FIX]: Splash screens are now hidden when the embed version is
    greater than 0
  * [FIX]: Recap card in Lightbox w/ Display Ad view mode now shows a
    display ad
* *[/Beta12.rc5]*

* *[Beta12.rc4]*
  * [FIX]: Mobile: "via" is no longer shown for recap card in the ToC
  * [FIX]: It is now impossible for the controls to be stuck in a
    "disabled" state
* *[/Beta12.rc4]*

* *[Beta12.rc3]*
  * [FIX]: prev/next min-width units fixed to rem from em
  * [FIX]: lightbox display ad properly shows next to video ad
* *[/Beta12.rc3]*

* *[Beta12.rc2]*
  * [FIX]: VPAID ads are loaded when the ad card is onDeck and also if
    it is jumped-to
* *[/Beta12.rc2]*

* *[Beta12.rc1]*
  * [FEATURE]: Add AdTechService for loading display ads on Video Embed cards in lightbox-ads mode
  * [FEATURE]: Added ga displayfeatures
  * [FIX]: Add $rootScope.$apply in Adtech callback
* *[/Beta12.rc1]*

## Beta11 (June 9, 2014)
* *[Beta11.rc5]*
  * [FIX]: add c6touch play handler to click-to-play mobile video embed thumbnails
  * [FIX]: changed splash template hierarchy so that ratio styles always take priority over base styles
  * [FIX]: Splash play button added
* *[/Beta11.rc5]*

* *[Beta11.rc4]*
  * [FIX]: Account for fact that $http cache may not be created yet
* *[/Beta11.rc4]*

* *[Beta11.rc3]*
  * [FIX]: Fix typo "runs" to "run"
* *[/Beta11.rc3]*

* *[Beta11.rc2]*
  * There are now two responsive.json. One for the new embed and one for
    the old embed
  * Responsive.json is now included in the build (it will not be fetched
    via AJAX)
  * [FIX]: removed splash fade in animation
  * [FIX]: $broadcast a thumbnail resize event when recap card is $destroyed so thumbnails don't get cut off in lightbox mode
* *[/Beta11.rc2]*

* *[Beta11.rc1]*
  * [FIX]: changed splash page templates so that they are no longer stand alone html files; using snippets instead.
  * [FIX]: splash template : horizontal stack : preloader hidden by default
  * [FIX]: splash template : text only : created separate template snippets for all sizes to preserve convention
  * [FIX]: splash template : updates for content flow vertical sizing
* *[/Beta11.rc1]*

## Beta10 (June 6, 2014)
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
