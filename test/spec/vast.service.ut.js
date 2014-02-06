(function() {
    'use strict';

    define(['services'], function() {
        describe('VASTService', function() {
            var VASTService,
                VASTServiceProvider,
                $rootScope,
                $q,
                $window;

            var $httpBackend;

            var _provider,
                _service;

            var XML;

            beforeEach(function() {
                XML = [
                    '<?xml version="1.0" encoding="UTF-8"?>',
                    '',
                    '<VideoAdServingTemplate version="1.11">',
                    '   <Ad>',
                    '       <InLine>',
                    '           <Impression>',
                    '               <URL><![CDATA[http://qlog.adap.tv/log?3a=adSuccess&51=ZX4madbHHCc_&50=ZX4madbHHCc_&72=&8=&d=&b=-2&53=&2c=&6c=&6d=&28=qUsI3M4M68M_&a8=1zwJCAUlQOU_&25=9228&4b=185&b6=2c727e3792554883daed2e15cc40a3543746769af7e4788a865aa24973099f23&5=185&14=&2=&37=-2&a=&65=preroll&6a=-2&6b=-2&4f=&3=-2&c=&55=true&5c=integration_test&5b=&18=5464&2e=&2f=&30=&31=&32=&90=&86=&83=&82=&af=&80=3922791298847480813&42=false&8f=&41=&21=&1b=&76=&77=402051622&67=&d6=&bf=0&74=at&d5=1&d8=m2-47&ae=&8e=-1&d7=&c0=&c4=0&c5=0&92=&93=&91=ONLINE_VIDEO&45=54.208.255.4&b5=-1&33=19573511&a.cv=1]]></URL>',
                    '',
                    '               <URL><![CDATA[http://b.scorecardresearch.com/b?c1=1&c2=6034979&c3=integration_test&c4=&c5=090200&c6=185]]></URL>',
                    '',
                    '               <URL><![CDATA[http://secure-us.imrworldwide.com/cgi-bin/m?ci=us-305284&c6=vc,b01&cg=&tl=dav0-%5B%5D&cc=1&rnd=19573511&c3=st,a]]></URL>',
                    '',
                    '               <URL><![CDATA[http://pixel.quantserve.com/seg/r;a=p-c9d_b-0iR8pjg;redirect=http://segments.adap.tv/data?p=quantcast-adaptv&type=gif&segment=!qcsegs&add=true]]></URL>',
                    '',
                    '               <URL><![CDATA[http://conversions.adap.tv/conversion/wc?adSourceId=185&bidId=&afppId=&creativeId=9228&exSId=-2&key=integration_test&a.pvt=0&a.rid=&eov=19573511]]></URL>',
                    '           </Impression>',
                    '',
                    '           <TrackingEvents>',
                    '               <Tracking event="start">',
                    '                   <URL><![CDATA[http://log.adap.tv/log?3a=progressDisplay0&25=9228&5=185&14=&2=&37=-2&a=&65=preroll&6a=-2&6b=-2&4f=&3=-2&c=&55=true&5c=integration_test&5b=&18=5464&2e=&2f=&30=&31=&32=&90=&86=&83=&82=&af=&80=3922791298847480813&42=false&8f=&41=&21=&1b=&76=&77=402051622&67=&d6=&bf=0&74=at&d5=1&d8=m2-47&ae=&8e=-1&d7=&c0=&c4=0&c5=0&92=&93=&91=ONLINE_VIDEO&45=54.208.255.4&b5=-1&33=19573511&a.cv=1]]></URL>',
                    '               </Tracking>',
                    '',
                    '               <Tracking event="firstQuartile">',
                    '                   <URL><![CDATA[http://log.adap.tv/log?3a=progressDisplay25&25=9228&5=185&14=&2=&37=-2&a=&65=preroll&6a=-2&6b=-2&4f=&3=-2&c=&55=true&5c=integration_test&5b=&18=5464&2e=&2f=&30=&31=&32=&90=&86=&83=&82=&af=&80=3922791298847480813&42=false&8f=&41=&21=&1b=&76=&77=402051622&67=&d6=&bf=0&74=at&d5=1&d8=m2-47&ae=&8e=-1&d7=&c0=&c4=0&c5=0&92=&93=&91=ONLINE_VIDEO&45=54.208.255.4&b5=-1&33=19573511&a.cv=1]]></URL>',
                    '               </Tracking>',
                    '',
                    '               <Tracking event="midpoint">',
                    '                   <URL><![CDATA[http://log.adap.tv/log?3a=progressDisplay50&25=9228&5=185&14=&2=&37=-2&a=&65=preroll&6a=-2&6b=-2&4f=&3=-2&c=&55=true&5c=integration_test&5b=&18=5464&2e=&2f=&30=&31=&32=&90=&86=&83=&82=&af=&80=3922791298847480813&42=false&8f=&41=&21=&1b=&76=&77=402051622&67=&d6=&bf=0&74=at&d5=1&d8=m2-47&ae=&8e=-1&d7=&c0=&c4=0&c5=0&92=&93=&91=ONLINE_VIDEO&45=54.208.255.4&b5=-1&33=19573511&a.cv=1]]></URL>',
                    '               </Tracking>',
                    '',
                    '               <Tracking event="thirdQuartile">',
                    '                   <URL><![CDATA[http://log.adap.tv/log?3a=progressDisplay75&25=9228&5=185&14=&2=&37=-2&a=&65=preroll&6a=-2&6b=-2&4f=&3=-2&c=&55=true&5c=integration_test&5b=&18=5464&2e=&2f=&30=&31=&32=&90=&86=&83=&82=&af=&80=3922791298847480813&42=false&8f=&41=&21=&1b=&76=&77=402051622&67=&d6=&bf=0&74=at&d5=1&d8=m2-47&ae=&8e=-1&d7=&c0=&c4=0&c5=0&92=&93=&91=ONLINE_VIDEO&45=54.208.255.4&b5=-1&33=19573511&a.cv=1]]></URL>',
                    '               </Tracking>',
                    '',
                    '               <Tracking event="complete">',
                    '                   <URL><![CDATA[http://log.adap.tv/log?3a=progressDisplay100&25=9228&5=185&14=&2=&37=-2&a=&65=preroll&6a=-2&6b=-2&4f=&3=-2&c=&55=true&5c=integration_test&5b=&18=5464&2e=&2f=&30=&31=&32=&90=&86=&83=&82=&af=&80=3922791298847480813&42=false&8f=&41=&21=&1b=&76=&77=402051622&67=&d6=&bf=0&74=at&d5=1&d8=m2-47&ae=&8e=-1&d7=&c0=&c4=0&c5=0&92=&93=&91=ONLINE_VIDEO&45=54.208.255.4&b5=-1&33=19573511&a.cv=1]]></URL>',
                    '               </Tracking>',
                    '           </TrackingEvents>',
                    '',
                    '           <Video>',
                    '               <Duration><![CDATA[00:00:15]]></Duration>',
                    '',
                    '               <VideoClicks>',
                    '                   <ClickThrough>',
                    '                       <URL><![CDATA[http://qlog.adap.tv/log?3a=click&d3=&72=&25=9228&6c=&5=185&14=&2=&37=-2&a=&65=preroll&6a=-2&6b=-2&4f=&3=-2&c=&55=true&5c=integration_test&5b=&18=5464&2e=&2f=&30=&31=&32=&90=&86=&83=&82=&af=&80=3922791298847480813&42=false&8f=&41=&21=&1b=&76=&77=402051622&67=&d6=&bf=0&74=at&d5=1&d8=m2-47&ae=&8e=-1&d7=&c0=&c4=0&c5=0&92=&93=&91=ONLINE_VIDEO&45=54.208.255.4&b5=-1&33=19573511&a.cv=1&rUrl=http%3A%2F%2Fadap.tv]]></URL>',
                    '                   </ClickThrough>',
                    '               </VideoClicks>',
                    '',
                    '               <MediaFiles>',
                    '                   <MediaFile delivery="progressive" width="400" height="300" bitrate="400" type="video/x-flv">',
                    '                       <URL><![CDATA[http://cdn.adap.tv/integration_test/Vincent-081110124715584-13503_1-122011141453375-82609.flv]]></URL>',
                    '                   </MediaFile>',
                    '',
                    '                   <MediaFile delivery="progressive" width="480" height="360" bitrate="1024" type="video/mp4">',
                    '                       <URL><![CDATA[http://cdn.adap.tv/integration_test/Vincent-081110124715584-13503_1-122011141453375-82609_8-121712132719332-36500.MP4]]></URL>',
                    '                   </MediaFile>',
                    '               </MediaFiles>',
                    '           </Video>',
                    '',
                    '           <CompanionAds>			</CompanionAds>',
                    '',
                    '           <Extensions>',
                    '               <Extension type="OneSource creative">',
                    '                   <CreativeId><![CDATA[9228]]></CreativeId>',
                    '               </Extension>',
                    '',
                    '               <Extension type="revenue" currency="USD"><![CDATA[k5mgaP2rGobD+CQJsjLNAw==]]></Extension>',
                    '           </Extensions>',
                    '       </InLine>',
                    '   </Ad>',
                    '</VideoAdServingTemplate>'
                ].join('\n');

                module('c6.rumble.services', function($injector) {
                    VASTServiceProvider = $injector.get('VASTServiceProvider');

                    _provider = VASTServiceProvider._private;
                });

                inject(function($injector) {
                    VASTService = $injector.get('VASTService');
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    $httpBackend = $injector.get('$httpBackend');
                    $window = $injector.get('$window');

                    _service = VASTService._private;
                });
            });

            describe('the provider', function() {
                it('should exist', function() {
                    expect(VASTServiceProvider).toEqual(jasmine.any(Object));
                });

                it('should publish its _private object under test', function() {
                    expect(_provider).toEqual(jasmine.any(Object));
                });

                describe('@public', function() {
                    describe('methods', function() {
                        describe('adServerUrl(url)', function() {
                            beforeEach(function() {
                                VASTServiceProvider.adServerUrl('http://www.foo.com/test');
                            });

                            it('should set _private.serverUrl to the provided URL', function() {
                                expect(_provider.serverUrl).toBe('http://www.foo.com/test');
                            });
                        });
                    });
                });
            });

            describe('the service', function() {
                it('should exist', function() {
                    expect(VASTService).toEqual(jasmine.any(Object));
                });

                it('should publish its _private object under test', function() {
                    expect(_service).toEqual(jasmine.any(Object));
                });

                describe('@public', function() {
                    describe('methods', function() {
                        describe('getVAST()', function() {
                            var result,
                                vast;

                            beforeEach(function() {
                                vast = {
                                    duration: 30,
                                    mediaFiles: []
                                };

                                spyOn(_service, 'getXML').andCallThrough();
                                spyOn(_service, 'VAST').andReturn(vast);

                                _provider.serverUrl = 'http://ads.adap.tv/a/t/integration_test';

                                $httpBackend.expectGET('http://ads.adap.tv/a/t/integration_test')
                                    .respond(200, XML);

                                result = VASTService.getVAST();
                            });

                            it('should make a request to the ad server', function() {
                                $httpBackend.flush();
                            });

                            it('should convert the response to an XML DOM', function() {
                                $httpBackend.flush();

                                expect(_service.getXML).toHaveBeenCalledWith(XML, jasmine.any(Function));
                            });

                            it('should return a promise', function() {
                                expect(result.then).toEqual(jasmine.any(Function));
                            });

                            describe('when the promise resolves', function() {
                                var promiseSpy;

                                beforeEach(function() {
                                    promiseSpy = jasmine.createSpy();

                                    result.then(promiseSpy);

                                    $httpBackend.flush();
                                });

                                it('should resolve to a VAST object', function() {
                                    expect(_service.VAST).toHaveBeenCalled();
                                    expect(promiseSpy).toHaveBeenCalledWith(vast);
                                });
                            });
                        });
                    });
                });

                describe('@private', function() {
                    describe('contructors', function() {
                        describe('VAST', function() {
                            var vast;

                            beforeEach(function() {
                                vast = new _service.VAST(_service.getXML(XML));
                            });

                            describe('properties', function() {
                                it('should contain information about the video', function() {
                                    expect(vast.video).toEqual({
                                        duration: 15,
                                        mediaFiles: [
                                            {
                                                delivery: 'progressive',
                                                width: '400',
                                                height: '300',
                                                bitrate: '400',
                                                type: 'video/x-flv',
                                                url: 'http://cdn.adap.tv/integration_test/Vincent-081110124715584-13503_1-122011141453375-82609.flv'
                                            },
                                            {
                                                delivery: 'progressive',
                                                width: '480',
                                                height: '360',
                                                bitrate: '1024',
                                                type: 'video/mp4',
                                                url: 'http://cdn.adap.tv/integration_test/Vincent-081110124715584-13503_1-122011141453375-82609_8-121712132719332-36500.MP4'
                                            }
                                        ],
                                    });
                                });
                            });

                            describe('methods', function() {
                                describe('getVideoSrc(type)', function() {
                                    it('should get the url for the specified type', function() {
                                        expect(vast.getVideoSrc('video/x-flv')).toBe('http://cdn.adap.tv/integration_test/Vincent-081110124715584-13503_1-122011141453375-82609.flv');
                                        expect(vast.getVideoSrc('video/mp4')).toBe('http://cdn.adap.tv/integration_test/Vincent-081110124715584-13503_1-122011141453375-82609_8-121712132719332-36500.MP4');
                                    });

                                    it('should return null if the type is not found', function() {
                                        expect(vast.getVideoSrc('video/webm')).toBeNull();
                                    });
                                });
                            });
                        });
                    });

                    describe('methods', function() {
                        describe('getSecondsFromTimestamp(timestamp)', function() {
                            it('should convert a timestamp to seconds', function() {
                                var getSecs = _service.getSecondsFromTimestamp.bind(_service);

                                expect(getSecs('00:00:14')).toBe(14);
                                expect(getSecs('01:15:00')).toBe(4500);
                                expect(getSecs('00:01:30')).toBe(90);
                            });
                        });

                        describe('getXML(string)', function() {
                            var parser,
                                xmlDOM;

                            beforeEach(function() {
                                xmlDOM = {};
                                parser = {
                                    parseFromString: jasmine.createSpy('parser.parseFromString()')
                                        .andReturn(xmlDOM)
                                };

                                spyOn($window, 'DOMParser').andCallFake(function() {
                                    return parser;
                                });
                            });

                            it('should convert the string to an XML DOM object', function() {
                                var result = _service.getXML(XML);

                                expect(parser.parseFromString).toHaveBeenCalledWith(XML.replace(/\n/g, '').replace(/>\s+</g, '><'), 'text/xml');
                                expect(result).toBe(xmlDOM);
                            });
                        });
                    });
                });
            });
        });
    });
}());
