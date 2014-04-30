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
* [FIX]: Add trailing slash for passing query params to preview player
* [FIX]: Use preview player src to trigger refresh for mode/device changes
* *[Beta1.rc7]*
* [FIX]: Remove "viewChangeStart" event handler when c6-view is destroyed, prevent memory leak
* [FIX]: Copy autoplay settings when opening MiniReel
* [FEATURE]: Add blank card to deck when user has not created one
* [FIX]: Fix issue where start/end trimmers would leap if returned to
  original position after drag
* *[Beta1.rc8]*
* [FIX]: Use "ng-style" instead of normal style attribute when setting card video thumbnail to prevent 404 on uncompiled template
* [FIX]: Add autoplay query param to preview player src to trigger refresh
* [FIX]: Add kEnvUrlRoot query param to preview player to fix vote service path in the player
* [FIX]: Disable lightbox-ads mode choice. **REQUIRED STEPS: MiniReelinator experience must be updated in the Content Service**