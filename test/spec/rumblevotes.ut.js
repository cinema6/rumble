(function(){
    'use strict';
    
    define(['rumble'], function() {
        var $log, $timeout, $q, rumbleVotes;
               
        describe('rumbleVotes',function(){
            
            beforeEach(function(){
                module('c6.rumble');
                
                inject(['$log','$q','$timeout', function(_$log, _$q, _$timeout) {
                    $q           = _$q;
                    $log         = _$log;
                    $timeout     = _$timeout;
                    $log.context = function() { return $log; };
                }]);
                
                inject(['rumbleVotes',function(_rv) {
                    rumbleVotes = _rv;
                    rumbleVotes.init('r-123');
                }]);
                
            });

            it('can return votes from mock data',function(){
                var successSpy = jasmine.createSpy('success'),
                    failureSpy = jasmine.createSpy('failure');
                rumbleVotes.mockReturnsData('r-123','i-1',[10,20,70],100);
                rumbleVotes.getReturnsForItem('i-1').then(successSpy,failureSpy);
               
                $timeout.flush();
                expect(successSpy).toHaveBeenCalledWith([10,20,70]);
                expect(failureSpy).not.toHaveBeenCalled();
            });

            it('returns an error with bad id', function(){
                var successSpy = jasmine.createSpy('success'),
                    failureSpy = jasmine.createSpy('failure');
                rumbleVotes.getReturnsForItem('i-1').then(successSpy,failureSpy);
               
                $timeout.flush();
                expect(successSpy).not.toHaveBeenCalled();
                expect(failureSpy).toHaveBeenCalledWith({ message : 'Unable to locate rumble [r-123]' });
            });
        });
    });
}());
