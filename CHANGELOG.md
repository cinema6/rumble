# MiniReelinator

## Beta1 (April 29, 2014)
* Added a changelog
* Initial release of MRinator
* [FEATURE]: Show lightbox MiniReel preview in fullscreen
* [FIX]: Query for minireels with minireel type
* [FIX]: Don't throw errors if MiniReelService.close() is called after MiniReelService.save() in the same event loop
* [FIX]: Show newly-created MiniReels in development
* [FIX]: Use min-safe DI in animation
* [FIX]: Add kMode and kDevice query params to preview player
* [FIX]: Remove "viewChangeStart" event handler when c6-view is destroyed, prevent memory leak
* [FIX]: Add trailing slash for passing query params to preview player
* [FIX]: Use preview player src to trigger refresh for mode/device changes
