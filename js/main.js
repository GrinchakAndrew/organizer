var Accordeon = function (wrapper, numberOfTitles, titlesHeight, tabsNumberByKey) {
    'use strict';
    this.wrapper = wrapper;
    this.numberOfTitles = numberOfTitles;
    this.titlesHeight = titlesHeight || 30;
	this.tabsNumberByKey = tabsNumberByKey;
}

Accordeon.prototype.scroller = function () {
  var config = {
    mousewheelEvt: (/Firefox/i.test(navigator.userAgent)) ? 'DOMMouseScroll' : 'mousewheel',
    myDiv: function () {
      $(document.body).append($('<div>', {
        'id': 'myDiv',
		'position' : 'static'
      }));
    },
    columniser: $('.columniser'),
    redLining: $('.red-lining'),
    redLiningCalculatedWidth: 0,
    vertical_position: 0,
    scrollTop: function () {
      return $(document.body).scrollTop();
    },
    scrollUpTo: function () {
		var ff = ~navigator.userAgent.indexOf('Firefox'),
			macOS = ~navigator.userAgent.indexOf('Mac OS') || ~navigator.userAgent.indexOf('Mobile') || ~navigator.userAgent.indexOf('Tablet');
      if (ff) {
        return $(document.body).scrollTop() >= 288;
      } else if(macOS) {
        return parseInt(this.vertical_position) > 0;
      }else {
		return parseInt(this.vertical_position) >= 200;  
	  }
    },
    scrollDownTo: function () {
		var macOS = ~navigator.userAgent.indexOf('Mac OS') || ~navigator.userAgent.indexOf('Mobile') || ~navigator.userAgent.indexOf('Tablet');
		if(macOS) {
			return this.vertical_position < 0;
		}else {
			return this.vertical_position >= 109;	
		}
    },
    append: function () {
      $('#myDiv').append(config.columniser);
      $('#myDiv').append(config.redLining);
	  /*the fix is added to rectify the width of the config.redLining to suite 100% upon appending and hoisting:*/
	  config.redLining.css({
        'margin': '',
        'margin-left': '205px'
      });
    },
    calibrate: function () {
      $('.tabs-li').each(function () {
        if ($(this).css('display') !== 'none') {
          config.redLiningCalculatedWidth += $(this).outerWidth();
        }
      });
	  $('.scrolling-left').css({'left': $('#myDiv').length && $('#myDiv').children().length ? $('.scrolling-left').css('left', $('.columniser-text').width() - 12 + 'px') : '430px'});
      $('.header').first().css('background-color', '#FFF');	
		$('#myDiv').css({
        'position': 'fixed'
      });
    },
    restore: function () {
      $('.left-right-container').before(config.columniser);
      $('.left-right-container').before(config.redLining);
      config.columniser.css('margin', '');
      config.redLining.css({
        'margin': '',
        'margin-left': '205px'
      });
      $('.header').first().css({'background-color' : '#F0F0F0', 'top' : '0px'});
	  $('.scrolling-left').css({'left': $('#myDiv').length && $('#myDiv').children().length ? $('.scrolling-left').css('left', $('.columniser-text').width() - 12 + 'px') : '430px'});
	  $('#myDiv').css({
        'position': 'static'
      });
	},
	offsetData : {x : 0, y : 0, xOffset : 0, yOffset : 0},
	
	offSetStart : function() {
			config.offsetData.x = event.touches[0].pageX;
			config.offsetData.y = event.touches[0].pageY;
		},
		
	offsetEnd : function() {
			config.offsetData.xOffset = config.offsetData.x - event.touches[0].pageX;
			config.offsetData.yOffset = config.offsetData.y - event.touches[0].pageY;
	},
	
    scroller: function (e, iOS, android) {
      var _config = {
        initScrollTop: 0,
        event: window.event || e,
        delta: (window.event || e).detail ? (window.event || e).detail * ( - 120)  : (window.event || e).wheelDelta,
        whichView: $('.titles-column-left').css('display') == 'none',
        upwards: function () {
          return this.delta >= 120 && config.columniser.children().eq(1).children().length;
        },
		iOSupwards : function() {
			return config.offsetData.yOffset > 0; 
		},
        downwards: function () {
          return this.delta <= - 120 && config.columniser.children().eq(1).children().length;
        },
		iOSdownwards : function() {
			return config.offsetData.yOffset < 0;
		},
        notEmpty: function () {
          var _target = this.event.srcElement ? this.event.srcElement : this.event.target, 
			  returnable = $('.details-body-description').html() ? $(_target).closest('#main').length : $('.details-body-pre code .linenums .L0 span').length > 1;
			return returnable;
        },
        srollerDo: function () {
          config.append();
          config.calibrate();
        }
      };
      subRoutine = function () {
        if (_config.delta && !iOS) {
				!$('#myDiv').length ? config.myDiv()  : '';
				config.vertical_position = 0;
				config.vertical_position = (_config.event.offsetY ? _config.event.offsetY : _config.event.clientY) + config.scrollTop();
				(_config.whichView && _config.upwards() && _config.notEmpty() && (_config.event.offsetY ? _config.event.offsetY : _config.event.clientY)) ? (config.scrollUpTo() ? _config.srollerDo()  : config.restore())  : '';
				(_config.whichView && _config.downwards() && _config.notEmpty() && (_config.event.offsetY ? _config.event.offsetY : _config.event.clientY)) ? (config.scrollDownTo() ? _config.srollerDo()  : config.restore())  : '';
		} else if(iOS) { //iOS Tablet Mobile
			config.vertical_position = config.offsetData.yOffset;
			(_config.whichView && _config.iOSupwards()) ? (config.scrollUpTo() ? _config.srollerDo() : config.restore()) : '';
			(_config.whichView && _config.iOSdownwards()) ? (config.scrollDownTo() ? config.restore() : _config.srollerDo()) : '';
		}
      };
      subRoutine();
      return false;
    },
    eventsBinder: function (El, event, handler) {
      if (El && El.addEventListener) {
        El.addEventListener(event, handler);
      } else if (El && El.attachEvent) {
        El.attachEvent('on' + event, handler);
      }
    }
  };
	$(document).ready(function() {
	 config.eventsBinder(document, config.mousewheelEvt, function(e){config.scroller(e);});
	 /*somehow the 'mousedown' works for android*/
	 config.eventsBinder(document, 'mousedown', function(e) {
		 config.scroller(e);
	});
		 
	 if ('ontouchstart' in document.createElement('div')) {
			config.eventsBinder(window, 'touchstart', function(e) {
					config.offSetStart();
			});
			/*android does not fire the 'touchmove' event*/
			config.eventsBinder(window, 'touchmove', function(e){
					config.offsetEnd();
					if(config.offsetData.yOffset){
						config.scroller(e, true);
					}
			});
		}
  });
};

Accordeon.prototype.build = function (taskNames) {
    'use strict';
    var that = this,
        elements = {
            columniser: $('<div>', {
                class: 'columniser'
            }),
            columniserText: $('<div>', {
                class: 'columniser-text'
            }),
            redLining: $('<div>', {
                class: 'red-lining'
            }),
            titlesColumnLeft: !$('.titles-column-left').length ? $('<div>', {
                class: 'titles-column-left'
            }) : $('.titles-column-left'),
            title: !$('.title').length ? $('<div>', {
                class: 'title'
            }) : $('.title'),
            detailsBody: !$('.details-body').length ? $('<div>', {
                class: 'details-body'
            }) : $('.details-body'),
			 detailsBodyEntrails: !$('.details-body-entrails').length ? $('<div>', {
      class: 'details-body-entrails'
    })  : $('.details-body-entrails'),
	
    detailsBodyDescription: !$('.details-body-description').length ? $('<div>', {
      class: 'details-body-description'
    })  : $('.details-body-description'),
	
    detailsBodyPre: !$('.details-body-pre').length ? $('<pre>', {
      class: 'details-body-pre'
    })  : $('.details-body-pre'),
	
    detailsBodyCode: !$('.details-body-code').length ? $('<code>', {
      class: 'details-body-code prettyprint lang-js linenums'
    })  : $('.details-body-code'),

		leftRightContainer: $('<div>', {
                class: 'left-right-container'
            }),
            span: $('<span>'),
            subParent: $('<div>', {
                class: 'subParent'
            }).css('overflow', 'hidden'),
            subParentArrowRight: $('<div>', {
                class: 'subparentarrowright'
            }).css({'pointer-events': 'none'}),
			collapsible : !$('.collapsible').length ? $('<div>', {class : 'collapsible'}).text('[Expand]') : $('.collapsible'),
            scrollingForAnimatedColumnView: function() {
			},
			animate: function (el, speed, parent, subParentArrow2Change, scrollingForAnimatedColumnView) {
				$(el).css('pointer-events', 'none');
				$(parent).css('pointer-events', 'none');
					var interval, 
						_toggleSubParentArrowChange  = function(subParentArrow2Change) {
							if(subParentArrow2Change) {
								if(subParentArrow2Change.className === 'subparentarrowright') {
									subParentArrow2Change.className = 'subparentarrowdownward'	
								} else if(subParentArrow2Change.className === 'subparentarrowdownward') {
									subParentArrow2Change.className = 'subparentarrowright';
								}
							}
						};
                if (parseInt(el.style.opacity) < 1 || parseInt(el.style.opacity) === 0) {
                    el.style.display = '';
                    interval = setInterval(function () {
                        if(parseFloat(el.style.opacity) < 1) {
							el.style.opacity = parseFloat(el.style.opacity) + 0.1;
						}else {
							clearInterval(interval);
							$(el).css('pointer-events', '');
							_toggleSubParentArrowChange(subParentArrow2Change);							 
							$(parent).css('pointer-events', '');
							$(parent).css('overflow', '');	
							if(typeof scrollingForAnimatedColumnView === 'function') {
								scrollingForAnimatedColumnView();
							}
						}														
                    }, speed);

                } else if (parseInt(el.style.opacity) === 1 || parseInt(el.style.opacity) > 1) {
                    interval = setInterval(function () {
						if((parseFloat(parseFloat(el.style.opacity).toFixed(2))) > 0) {
							el.style.opacity = parseFloat(parseFloat(el.style.opacity).toFixed(2)) - 1 / 10;
						} else {
                            clearInterval(interval);
							$(el).css('pointer-events', '');
                            el.style.display = 'none';
							_toggleSubParentArrowChange(subParentArrow2Change);
							$(parent).css('overflow', 'hidden');
							$(parent).css('pointer-events', '');
							if(typeof scrollingForAnimatedColumnView === 'function') {
								scrollingForAnimatedColumnView();
							}
                    }}, speed);
                }
            },
			subParentBuild: function (i) {
                var _this = this,
                    subParents = {},
                    subParentsIndexed = {},
                    children = {},
                    _subParent,
                    subParentsArrayed = [],
                    _subParentFinalize = function (El) {
                        El.css('height', parseInt(El.children().first().css('padding-top') ? El.children().first().css('padding-top').match(/\d+/)[0] : 0) +
                            parseInt(El.children().first().css('padding-bottom') ? El.children().first().css('padding-bottom').match(/\d+/)[0] : 0) +
                            Math.ceil(parseFloat(El.children().first().css('height').match(/\d+[\\.]?\d+/) ? El.children().first().css('height').match(/\d+[\\.]?\d+/)[0] : 0)) + 'px');

                        El.on('click', function (e) {
                            if (e.target.className === 'series' || e.target.className === 'title') {
                                var _subRoutine = function (_El, parent, subParentArrow2Change) {
                                        if (_El.className === 'subParent') {
                                            _El.style.display = 'inline';
                                            
											if (!_El.firstChild.style.opacity || parseInt(_El.firstChild.style.opacity) < 1) {
                                                _El.firstChild.style.opacity = 0;
                                            } else {
                                                _El.firstChild.style.opacity = 1;
                                            }
                                            _this.animate(_El.firstChild, 60, parent, subParentArrow2Change);
											
                                        } else {
                                            if (!_El.style.opacity || parseInt(_children[i].style.opacity) < 1) {
                                                _El.style.opacity = 0;
                                            } else {
                                                _El.style.opacity = 1;
                                            }
                                            _El.style.display = '';
                                            _this.animate(_El, 60, parent, subParentArrow2Change);
                                        }
                                    },
                                    _children = [],
                                    firstSubParent, 
									parent = this,
									subParentArrow2Change, 
									_router;

                                if ((e.target.className === 'series' &&
                                        e.target['innerText' in e.target ? 'innerText' : 'innerHTML'] ===
                                        this.firstElementChild.getElementsByTagName('span')[0]
                                        ['innerText' in this.firstElementChild.getElementsByTagName('span')[0] ? 'innerText' : 'innerHTML']
                                    ) ||
                                    (e.target.className === 'title' &&
                                        e.target.getElementsByTagName('span')[0]['innerText' in e.target.getElementsByTagName('span')[0] ? 'innerText' : 'innerHTML'] ===
                                        this.firstElementChild.getElementsByTagName('span')[0]['innerText' in this.firstElementChild.getElementsByTagName('span')[0] ? 'innerText' : 'innerHTML']
                                    )) {
									subParentArrow2Change = this.firstChild.querySelector('div');
									_children = _children.concat(Array.prototype.slice.call(this.children));
									_children.splice(0, 1);
									if(_children[0].querySelector('.series') && _children[0].querySelector('.series')['innerText' in  _children[0].querySelector('.series') ? 'innerText' : 'innerHTML'].match(/[:]$/) || 
										$(_children).first().children().first().text().match(/:$/)) {
										if(_children[0].firstChild.firstChild.className === 'subparentarrowright' 
										&& _children[0].firstChild.lastChild['innerText' in _children[0].firstChild.lastChild ? 'innerText' : 'innerHTML'].match(/[:]$/)){
											_children[0].firstChild.firstChild.className = 'subparentarrowdownward';
											_children[0].firstChild.style.opacity = 0;
											
										} else if(_children[0].firstChild.firstChild.className === 'subparentarrowdownward'
										&& _children[0].firstChild.lastChild['innerText' in _children[0].firstChild.lastChild ? 'innerText' : 'innerHTML'].match(/[:]$/)){
											_children[0].firstChild.firstChild.className = 'subparentarrowright';
										}
										_router = function(arr) {
											for(var i = arr.length; i-- ; )	 {
												if(arr[i].className === 'subParent') {
													if(arr[i].firstChild.firstChild.className === 'subparentarrowdownward') {
														var _a = Array.prototype.slice.call(arr[i].children);
														    Array.prototype.shift.call(_a);
															_children = _children.concat(_a);
													}
													_children.push(arr[i]);
													_router(arr[i].children);
												}
											}
										};
									}else {
										_router = function(arr) {
											arr.forEach(function(i, j){
												if(i.className === 'subParent') {
													arr.splice(j, 1);
												}
											});
											_children = arr;
										};
									}
									_router(_children);
									
									for (var i = 0; i < _children.length; i += 1) {
                                        _subRoutine(_children[i], parent);
										if( i === _children.length-1) {
											_subRoutine(_children[i], parent, subParentArrow2Change);
										}
                                    }
                                    _children = [];
                                }
                            }
                        });
                    },
                    divideSubParents = function (arr, counter, prevParent, mainParentToBeMadeBold) {
                        if (!counter) {
                            var counter = 0;
                        }
                        for (var i = 0; i < arr.length; i++) {
                            if (typeof arr[i] === 'string' && ({}).toString.call(arr[i + 1]) === '[object Array]') {
                                counter++;
                                var subParent = arr[i];
                                subParentsIndexed[subParent] = counter;
                                subParents[subParent] = $('<div>', {
                                    class: 'subParent'
                                }).css('overflow', 'hidden').css('display', 'inline');
								if(mainParentToBeMadeBold && that.tabsNumberByKey[mainParentToBeMadeBold[0]] === 0) {
									subParents[subParent].append(_this.title.clone().css("padding-bottom", 8 + 'px').css('padding-left', 8 + 'px').css('padding-top', 8 + 'px').append(_this.subParentArrowRight.clone()).append(_this.span.clone().text(mainParentToBeMadeBold[0]).addClass('series').css({'font-weight' : 'bold'})));
								}else {
									subParents[subParent].append(_this.title.clone().css("padding-bottom", 8 + 'px').css('padding-left', 8 + 'px').css('padding-top', 8 + 'px').append(_this.subParentArrowRight.clone().css('margin-left', '15px')).append(_this.span.clone().text(subParent).addClass('series')));
								}
								
                            } else if (({}).toString.call(arr[i]) === '[object Array]') {
                                if (subParent) {
                                    if (!children[subParent]) {
                                        children[subParent] = [];
                                    }
                                    if (arr[i].length === 1 || typeof arr[i][1] === 'string') {
                                        children[subParent].push(_this.title.clone().css('display', 'none').css("padding-bottom", 4 + 'px').css('padding-top', 4 + 'px').css('padding-left', 8 + 'px').append(_this.span.clone().css('margin-left', '15px').text(arr[i][0]))); 
                                    }
                                }
                                divideSubParents(arr[i], counter, subParent);
                            } else if (typeof arr[i] === 'string' && prevParent) {
                                if (!(arr[i] in subParents)) {
                                    if ((function (El) {
                                        for (var i = children[prevParent].length; i--;) {
                                            if (children[prevParent][i].text() === El) {
                                                return false;
                                            } else {
                                                continue;
                                            }
                                        }
                                        return true;
                                    })(arr[i])) {
										children[prevParent].push(_this.title.clone().css('display', 'none').css("padding-bottom", 4 + 'px').css('padding-top', 4 + 'px').css('padding-left', 8 + 'px').append(_this.span.clone().css('margin-left', '15px').text(arr[i])));
                                    }
                                }
                            }
                        }
                    },
                    _subRoutine = function () {
                        if (children) {
                            for (var key in children) {
                                if (key in subParents) {
                                    if (({}).toString.call(children[key]) === '[object Array]') {
                                        for (var i = 0; i < children[key].length; i += 1) {
                                            subParents[key].append(children[key][i]);
                                        }
                                    }
                                }
                            }
                        }
                        children = null;
                        for (var key in subParentsIndexed) {
                            subParentsArrayed.splice(subParentsIndexed[key], 0, key);
                        }
                        for (var i = subParentsArrayed.length; i--;) {
                            if (subParentsArrayed[i] in subParents) {
                                if (subParents[subParentsArrayed[i - 1]]) {
                                    subParents[subParentsArrayed[i]].css('display', 'none');
                                    subParents[subParentsArrayed[i - 1]].append(subParents[subParentsArrayed[i]]);
                                    _subParentFinalize(subParents[subParentsArrayed[i]]);
                                    delete subParents[subParentsArrayed[i]];
                                }
                            }
                        }
                        _subParentFinalize(subParents[Object.keys(subParents)[0]]);
                        _this.titlesColumnLeft.append(subParents[Object.keys(subParents)[0]]);
                    };
                if (({}).toString.call(taskNames[i]) === '[object Array]') {
                    divideSubParents(taskNames[i], null, null, taskNames[i]);
                    _subRoutine();
                }
            },
			
			uncollapseAll : function(_t) {			
				if(!$('.collapsible').length) {
					$('.title:first .subparentarrowright').after(_t.collapsible);
					$('.collapsible').on('click', function(e) {
						$(this).css('display', 'none');
						$(this).on('makeCollapsibleVisibleAgain', function(){
							$(this).css('display', '');
						});
					if($('.collapsible').text() === '[Expand]') {
							$('.subParent').each(function(){
								$(this).css({'display' : 'inline', 'overflow' : '', 'opacity' : ''});
							});
							$('.subParent .title').not(':first').each(function(){
								$(this).css({'display': '', 'opacity' : 1, })
							});
							$('.subParent .subparentarrowright').each(function(){
								$(this).removeClass().addClass('subparentarrowdownward');
							});
							$('.collapsible').text('[Uncollapse]').trigger('makeCollapsibleVisibleAgain');
							_t.scrollingForAnimatedColumnView();
					 } else if($('.collapsible').text() === '[Uncollapse]') {
						$('.subParent .subparentarrowdownward').closest('.subParent .title').each(function(){$(this).trigger('click')});
							$(this).css('display', 'none');
							$('.collapsible').text('[Expand]').trigger('makeCollapsibleVisibleAgain');
							$('.subParent .title').not(':first').not(':contains("Front-end Themes")').
							not(':contains("JavaScript, Miscellanea")').
							each(function(){
								$(this).css({'display' : 'none'});
							});
								if($('.title .subparentarrowdownward').length) {
								setTimeout(function(){
										$('.title .subparentarrowdownward').each(function(){
											this.className = 'subparentarrowright';
									});
								}, 500);								
							}							
						}
					});
				}
			},
            fn: function () {
                that.wrapper.append(this.columniser);
                $('.columniser').append(this.columniserText.text('Entries'));
                $('.columniser').append(this.columniserText.clone().text(''));
                that.wrapper.append(this.redLining);
                that.wrapper.append(this.leftRightContainer);
                $('.left-right-container').append(this.titlesColumnLeft);
                $('.left-right-container').append(this.detailsBody);
				
				this.detailsBody.append(this.detailsBodyEntrails);
				this.detailsBodyEntrails.append(this.detailsBodyPre);
				this.detailsBodyPre.append(this.detailsBodyCode);
                this.detailsBody.append(this.detailsBodyDescription);
				
                if (that.numberOfTitles) {
                    var __length = taskNames.length;
                    for (var i = 0; i < __length; i += 1) {
                        if (({}).toString.call(taskNames[i]) === '[object String]') {
                            this.titlesColumnLeft.append(this.title.clone().css("padding-bottom", 8 + 'px').css('padding-top', 4 + 'px').css('padding-left', 8 + 'px').append(this.span.clone().text(taskNames[i])));
                        } else if (({}).toString.call(taskNames[i]) === '[object Array]') {
                            this.subParentBuild(i);
                        }
                    }
                }
				this.uncollapseAll(this);
            }
        };
    elements.fn();
}

Accordeon.prototype.tabulator = function (tabsNum, tabsNames, jsonObject, clickedTitleText) {
    'use strict';
    var that = this,
        elements = {
            wrapper: $('<div>', {
                class: 'tabulator-wrapper'
            }),
            ul: $('<ul>', {
                class: 'tabulator-ul'
            }),
            li: $('<li>', {
                class: 'tabs-li'
            }),
            span: $('<span>'),
            div: $('<div>', {
                class: 'tabulator-div'
            }),
            scrollingLeft: !$('.scrolling-left').length ? $('<div>', {
                class: 'scrolling-left'
            }) : $('.scrolling-left'),
            scrollingRight: !$('.scrolling-right').length ? $('<div>', {
                class: 'scrolling-right'
            }) : $('.scrolling-left'),
            arrowLeft: $('<div>', {
                class: 'arrow-left'
            }),
            arrowRight: $('<div>', {
                class: 'arrow-right'
            }),
            tabsOverallWidth: 0,
            _i: tabsNum,
            arrOverflowingTabs: [],
            arrOverflowingTabsWidth: 0,
            TabsBeforeOverflowingTab: [],
            overFlowIndex: [],
            clicksCount: 0,
            _width: 0,
            overFlow: function (arr) {
                if (!this.TabsBeforeOverflowingTab.length) {
                    var allTabs = $('.tabulator-div'),
                        prevTabBeforeOverflowingTab;
                    for (var i = allTabs.length; arr.length && i--;) {
                        if (i && ~allTabs[i]['innerText' in $('.tabulator-div')[0] ? 'innerText' : 'innerHTML'].indexOf(arr[0]['innerText' in arr[0] ? 'innerText' : 'innerHTML'])) {
                            prevTabBeforeOverflowingTab = i > 0 ? allTabs[i - 1] : allTabs[i];
                        }
                        if (i && prevTabBeforeOverflowingTab) {
                            this.TabsBeforeOverflowingTab.push(allTabs[i - 1]);
                        }
                    }
                }
            },
            buildTabs: function () {
                $('.columniser-text').eq(1).append(this.wrapper);
                this.wrapper.append(this.ul);
                while (this._i--) {
                    this.ul.append(this.li.clone().append(this.div.clone().append(this.span.clone().text(tabsNames[this._i]))));
                    this.tabsOverallWidth += ($('.tabulator-div').last().outerWidth());

                    if (this.tabsOverallWidth > $('.tabulator-wrapper').outerWidth()) {
                        this.arrOverflowingTabs.push($('.tabulator-div').last()[0]);
                        this.arrOverflowingTabsWidth += $('.tabulator-div').last().outerWidth();
                    }
                }
                $(this.arrOverflowingTabs).each(function () {
                    $(this).css('display', 'none');
                })
            },
            scrollingArrows: function () {
                if (!$('.scrolling-right').length) {
                    $('.columniser-text').eq(1).after(this.scrollingRight.append(this.arrowRight));
                }
                if (!$('.scrolling-left').length) {
                    $('.columniser-text').eq(0).after(this.scrollingLeft.css('z-index', 1000));
                    this.scrollingLeft.append(this.arrowLeft);
                }
            },
            correctingScrollingArrowsMarginLeft: function () {
                var _right = 220 +
                    (function () {
                        var _r = 0;
                        $('.columniser-text').each(function () {
                            _r += $(this).outerWidth();
                        })
                        _r += parseInt(!!$('.accordeon-wrapper').css('marginLeft') ? $('.accordeon-wrapper').css('marginLeft').match(/\d+/g)[0] : 0);
                        return _r;
                    })(),
                    _left = parseInt(!!$('.accordeon-wrapper').css('marginLeft') ? $('.accordeon-wrapper').css('marginLeft').match(/\d+/g)[0] : 0) + $('.columniser-text').first().outerWidth();

                $('.scrolling-right').css('left', _right + 'px');
                $('.scrolling-left').css('left', _left + 215 + 'px');
            },
            correctingOverflowingContainerWidth: function () {				
                this.tabsOverallWidth += (10 * tabsNum) + $('.scrolling-left').outerWidth() + $('.scrolling-right').outerWidth();
                $('.tabulator-ul').width(this.tabsOverallWidth + 'px');
            },
            overFlowIndexCalculate: function () {
                if (!this.overFlowIndex.length) {
                    for (var i = 0; i < this.arrOverflowingTabs.length; i++) {
                        this._width += this.arrOverflowingTabs[i].parentNode.offsetWidth;
                        if (this._width + (this.arrOverflowingTabs[i + 1] ? this.arrOverflowingTabs[i + 1].parentNode.offsetWidth : this.arrOverflowingTabs[i].parentNode.offsetWidth) > $('.tabulator-wrapper').outerWidth()) {
                            this.overFlowIndex.push(i);
                            this._width = 0;
                        } else if (this._width < $('.tabulator-wrapper').outerWidth() && i === this.arrOverflowingTabs.length - 1) {
                            this.overFlowIndex.push(i + 1);
                            this._width = 0;
                        }
                        if (i === this.arrOverflowingTabs.length - 1 && this.overFlowIndex[this.overFlowIndex.length - 1] !== i + 1) {
                            this.overFlowIndex.push(i + 1);
                        }
                    }
                }
            },
            correctingTabsBeforeOverflowingTabWidth: function () {
                if (this.TabsBeforeOverflowingTab.length) {
                    var TabsBeforeOverflowingTabOverallWidth = 0,
                    dif,
                    difPerEach,
                    rounding;
					$(this.TabsBeforeOverflowingTab).each(function () {
                        TabsBeforeOverflowingTabOverallWidth += $(this).outerWidth();
                    });
					
					dif = ($('.tabulator-wrapper').outerWidth() - TabsBeforeOverflowingTabOverallWidth);
					if(dif <=2) {
						$('.tabulator-ul').width($('.tabulator-ul').width() + dif + 1);
					}else if (dif == 0) {
					   dif = 1.5 * this.TabsBeforeOverflowingTab.length;
					   difPerEach = 0.5;
					   rounding = difPerEach - (difPerEach | 0);
					   $(this.TabsBeforeOverflowingTab).each(function () {
							$(this).parent().css('width', parseFloat(difPerEach.toPrecision(3)) + $(this).outerWidth() + 'px');
						});
					   $('.tabulator-ul').width($('.tabulator-ul').width() + dif + Math.ceil(rounding) + 2 + 'px');
					} else if((dif + TabsBeforeOverflowingTabOverallWidth) > $('.tabuator-wrapper').outerWidth()) {
						difPerEach = ($('.tabulator-wrapper').outerWidth() - TabsBeforeOverflowingTabOverallWidth) / (this.TabsBeforeOverflowingTab.length);
						 $(this.TabsBeforeOverflowingTab).each(function () {
							$(this).parent().css('width', parseFloat(difPerEach.toPrecision(3)) + $(this).outerWidth() + 'px');
						});
					}
                }
            },
            posting: function (path) {
			'use strict'
                if (Object.prototype.toString.call(path) === "[object String]") {
					var _request = new XMLHttpRequest(), 
						_text = '';
                    	_request.overrideMimeType("application/json");
						_request.open('GET', path);
						_request.setRequestHeader("Cache-Control", "no-cache");
						_request.onload = function () {
							_text = _request.responseText;
			 if (_text) {
              if (path.match(/code/i) || path.match(/description/i) || path.match(/induction/i)) {
                $('body').trigger('posting', [
                  _text,
                  (path.match(/code/i) ? path.match(/code/i)[0] : null) || (path.match(/induction/i) ? path.match(/induction/i) [0] : null) || (path.match(/description/i) ? path.match(/description/i) [0] : null)
                ]);
              } else {
                $('body').trigger('posting', _text);
              }
            }
						};
						_request.send();
              }
            },
            runOnce: false,
            rightClickFn: function (_this) {
                $(_this.arrOverflowingTabs).each(function () {
                    $(this).parent().css('display', '');
					$(this).css('display', '');
                })
				
                _this.clicksCount += 1;
                if (_this.arrOverflowingTabsWidth < $('.tabulator-wrapper').outerWidth()) {
                    $(_this.TabsBeforeOverflowingTab).each(function () {
                        $(this).parent().css('display', 'none');
                    })

                } else if (_this.clicksCount === 1) {
                    $(_this.TabsBeforeOverflowingTab).each(function () {
                        $(this).parent().css('display', 'none');
                    })
                    _this.overFlowIndexCalculate();

                    for (var i = _this.overFlowIndex[_this.clicksCount - 1] + 1; i < _this.arrOverflowingTabs.length; i++) {
                        _this.arrOverflowingTabs[i].parentNode.style.display = 'none';
                    }

                    (function () {
                        if (!_this.runOnce) {
                            return (function () {
                                _this.runOnce = true;
                                for (var i = _this.overFlowIndex[_this.clicksCount - 1] + 1; i--;) {
                                    if (_this.arrOverflowingTabs[i]) {
                                        _this._width += _this.arrOverflowingTabs[i].offsetWidth;
                                    }
                                }
                                var _dif = ($('.tabulator-wrapper').outerWidth() - _this._width),
                                    _difPerEach = _dif / (_this.overFlowIndex[_this.clicksCount - 1] + 1),
                                    rounding = _difPerEach - (_difPerEach | 0);
                                for (var i = _this.overFlowIndex[_this.clicksCount - 1] + 1; i--;) {
                                    if (_this.arrOverflowingTabs[i] && _this.arrOverflowingTabs[i].parentNode) {
                                        _this.arrOverflowingTabs[i].parentNode.style.width = _this.arrOverflowingTabs[i].parentNode.offsetWidth + (_difPerEach | 0) + (Math.ceil(rounding) / 2) + "px";
                                    }
                                }
                                $('.tabulator-ul').width($('.tabulator-ul').width() + _this.width + _dif + Math.ceil(rounding) + 'px');
                            })();
                        }
                    })()

                } else if (_this.clicksCount > 1 && !!_this.overFlowIndex[_this.clicksCount - 1]) {
                    if (_this.overFlowIndex[_this.clicksCount - 2] + 1 !== _this.overFlowIndex[_this.clicksCount - 1]) {
                        for (var i = _this.overFlowIndex[_this.clicksCount - 2] + 1; i--;) {
                            _this.arrOverflowingTabs[i].parentNode.style.display = 'none';
                        }
                        for (var i = _this.overFlowIndex[_this.clicksCount - 2] + 1; i < _this.overFlowIndex[_this.clicksCount - 1] + 1; i++) {
                            _this.arrOverflowingTabs[i] ? _this.arrOverflowingTabs[i].parentNode.style.display = '' : null;
                        }
                    }

                    (function () {
                        var _width = 0,
                            _dif = 0,
                            _difPerEach = 0,
                            rounding = 0,
                            count = 0,
                            checkSum;

                        return (function () {						
                            for (var i = _this.overFlowIndex[_this.clicksCount - 2] + 1; i < _this.overFlowIndex[_this.clicksCount - 1] + 1; i++) {
                                if (_this.arrOverflowingTabs[i] && !_this.arrOverflowingTabs[i].className.match(/calibrated/)) {
                                    _width += _this.arrOverflowingTabs[i].offsetWidth;
                                    _this.arrOverflowingTabs[i].className = _this.arrOverflowingTabs[i].className + ' calibrated';
                                    count++;
                                }
                            }
                            _dif = $('.tabulator-wrapper').outerWidth() - _width;
                            _difPerEach = count && _dif ? _dif / count : 0;
                            rounding = _difPerEach ? _difPerEach - (_difPerEach | 0) : 0;
                            checkSum = _width + ((_difPerEach | 0) + (Math.ceil(rounding) ? Math.ceil(rounding)/ 2 : 0)) * count;

                            for (var i = _this.overFlowIndex[_this.clicksCount - 2] + 1; i < _this.overFlowIndex[_this.clicksCount - 1] + 1; i++) {
                                if (_this.arrOverflowingTabs[i]) {
                                    if (checkSum > $('.tabulator-wrapper').outerWidth()) {
                                        _this.arrOverflowingTabs[i].parentNode.style.width = 
										_this.arrOverflowingTabs[i].parentNode.offsetWidth + (_difPerEach | 0) + "px";
                                    } else {
                                        _this.arrOverflowingTabs[i].parentNode.style.width = _this.arrOverflowingTabs[i].parentNode.offsetWidth + (_difPerEach | 0) + (Math.ceil(rounding) ?  Math.ceil(rounding)/ 2 : 0) + "px";
                                    }
                                }
                            }
                            $('.tabulator-ul').width($('.tabulator-ul').width() + _width + _dif + Math.ceil(rounding) + 'px');
                        })();
                    })();

                }
                if (_this.clicksCount > 1 && !_this.overFlowIndex[_this.clicksCount]) {
                    $('.scrolling-right').css('display', 'none');
                    $('.scrolling-left').css('display', '');
                }
            },
            leftClickFn: function (_this) {
                $(_this.TabsBeforeOverflowingTab).each(function () {
                    $(this).parent().css('display', '');
                });

                $(_this.arrOverflowingTabs).each(function () {
                    $(this).parent().css('display', 'none');
                });
                $('.scrolling-right').css('display', '');
                $('.scrolling-left').css('display', 'none');
                _this.clicksCount = 0;
				$('.scrolling-left div').first().css({
						'border-top': '10px solid rgba(0, 0, 0, 0)',
						'border-bottom': '10px solid rgba(0, 0, 0, 0)',
						'border-right': '10px solid #C51F00'
					});

                $('.scrolling-right div').first().css({
                    'border-top': '10px solid rgba(0, 0, 0, 0)',
                    'border-bottom': '10px solid rgba(0, 0, 0, 0)',
                    'border-left': '10px solid #C51F00'
                });
				return _this.TabsBeforeOverflowingTab;
            },
            tabsClickAndPostingCall: function (_this, THIS) {
                var clickedTabTitle,
                    ClickedTabTitlePathText = "",
                    _subRoutine = function (arr, clickedTabTitle) {
                        for (var i = arr.length; !ClickedTabTitlePathText && i--;) {
                            if (({}).toString.call(arr[i]) === '[object Object]') {
                                for (var q in arr[i]) {
                                    if (({}).toString.call(arr[i][q]) === '[object Array]') {
                                        _subRoutine(arr[i][q], clickedTabTitle);
                                    } else if (({}).toString.call(arr[i][q]) === '[object Object]') {
                                        if (clickedTitleText in arr[i]) {
                                            if (({}).toString.call(arr[i][clickedTitleText]) === '[object Object]') {
                                                if (clickedTabTitle in arr[i][clickedTitleText]) {
                                                    ClickedTabTitlePathText = arr[i][clickedTitleText][clickedTabTitle];
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                if ('innerText' in THIS) {
                    clickedTabTitle = THIS['innerText'].replace(/\s+$/, '');
                } else if ('innerHTML' in THIS) {
                    clickedTabTitle = THIS['innerHTML'].match(/<span>.*<\/span>/)[0].match(/<span>(.*)<\/span>/)[1];
                }

                for (var i in jsonObject) {
                    if (({}).toString.call(jsonObject[i]) === '[object Object]' && i === clickedTitleText && jsonObject[i][clickedTabTitle]) {
                        ClickedTabTitlePathText = jsonObject[i][clickedTabTitle];
                        break;
                    } else if (({}).toString.call(jsonObject[i]) === '[object Array]' && !ClickedTabTitlePathText) {
                        _subRoutine(jsonObject[i], clickedTabTitle);
                        if (ClickedTabTitlePathText) {
                            break;
                        }
                    }
                }
                _this.posting(ClickedTabTitlePathText);
            },
            arrowsHover4iOSnMS: function () {
                if ('ontouchstart' in document.createElement('div')) {
                    $('.scrolling-left').on('touchstart', function () {
                        var el = $(this.firstChild);
							$(this).css('left', '195px');
							el.css('border-top', '25px solid rgba(0, 0, 0, 0)');
							el.css('border-bottom', '25px solid rgba(0, 0, 0, 0)');
							el.css('border-right', '25px solid #C51F00');
                    });
                    $('.scrolling-right').on('touchstart', function () {
                        var el = $(this.firstChild);
                        el.css('border-top', '25px solid rgba(0, 0, 0, 0)');
                        el.css('border-bottom', '25px solid rgba(0, 0, 0, 0)');
                        el.css('border-left', '25px solid #C51F00');
                    });
                } else {
						$('.scrolling-left').on('mouseover', function () {
							var el = $(this.firstChild);
							$(this).css('left', '195px');
							el.css('border-top', '25px solid rgba(0, 0, 0, 0)');
							el.css('border-bottom', '25px solid rgba(0, 0, 0, 0)');
							el.css('border-right', '25px solid #C51F00');
                    });
					
                    $('.scrolling-left').on('mouseleave', function () {
                        var el = $(this.firstChild);
						$(this).css('left', '210px');
                        el.css('border-top', '10px solid rgba(0, 0, 0, 0)');
                        el.css('border-bottom', '10px solid rgba(0, 0, 0, 0)');
                        el.css('border-right', '10px solid #C51F00');
                    });
					
                    $('.scrolling-right').on('mouseover', function () {
                        var el = $(this.firstChild);
                        el.css('border-top', '25px solid rgba(0, 0, 0, 0)');
                        el.css('border-bottom', '25px solid rgba(0, 0, 0, 0)');
                        el.css('border-left', '25px solid #C51F00');
                    });

                    $('.scrolling-right').on('mouseleave', function () {
                        var el = $(this.firstChild);
                        el.css('border-top', '10px solid rgba(0, 0, 0, 0)');
                        el.css('border-bottom', '10px solid rgba(0, 0, 0, 0)');
                        el.css('border-left', '10px solid #C51F00');
                    });
                }
            },
			
            fn: function (rightClickFn, leftClickFn, tabsClickAndPostingCall) {
                $('body').off('title-change');
                $('body').on('title-change', function () {
					
					if($('#clickableTitleArrow').length) {
						$('#clickableTitleArrow').parent().css('color', '#C51F00');
						$('#clickableTitleArrow').parent().css('background-color', '')
						$('#clickableTitleArrow').remove();
					}
                    _this.clicksCount = 0;
                    this.overFlowIndex = [];
                    this.TabsBeforeOverflowingTab = [];
					
					if ('ontouchstart' in document) {
						$('.scrolling-left div').first().css({
                        left: '202px', 
                        'border-top': '10px solid rgba(0, 0, 0, 0)',
                        'border-bottom': '10px solid rgba(0, 0, 0, 0)',
                        'border-left': '10px solid #C51F00',
                        'border-style': ''
                    });
				}else {
					$('.scrolling-left div').first().css({
                        left: '210px',
                        'border-top': '10px solid rgba(0, 0, 0, 0)',
                        'border-bottom': '10px solid rgba(0, 0, 0, 0)',
                        'border-left': '10px solid #C51F00',
                        'border-style': ''
                    });
				}
				
                });
                var _this = this,
                    eventName;
                if ('ontouchstart' in document) {
                    eventName = 'touchstart';
                } else {
                    eventName = 'click';
                }
				_this.buildTabs();
                if (this.tabsOverallWidth > $('.tabulator-wrapper').outerWidth()) {
                    _this.scrollingArrows();
                    _this.overFlow(_this.arrOverflowingTabs);
                    _this.correctingOverflowingContainerWidth();
                    _this.correctingScrollingArrowsMarginLeft();
					var tabsLiCol = document.querySelectorAll('.tabs-li'), 
								tabsLiColwidth = 0, 
								index = 0, 
								_w = 0;
                    $('.arrow-left').on(eventName, function (e) {
                        
						_this.correctingTabsBeforeOverflowingTabWidth();
                });
                    $('.arrow-right').on(eventName, function () {
                        rightClickFn(_this);
                    });
                    _this.arrowsHover4iOSnMS();
                }
                _this.correctingTabsBeforeOverflowingTabWidth();
				
				$('.tabs-li').on(eventName, function () {
                    tabsClickAndPostingCall(_this, this);
					if($('.tabs-li').length > 1) {
						if($('.tabs-li').first().children().first().css('background-color') === 'rgb(197, 31, 0)' && 
						    $('.tabs-li').first().children().first().children().first().css('color') === 'rgb(255, 255, 255)') {
								$('.tabs-li').first().children().first().css('background-color', '');
								$('.tabs-li').first().children().first().children().first().css('color', '');
						}
						$('.tabs-li').not(':first').each(function(){
								$(this).children().first().css('background-color', '');
								$(this).children().first().children().first().css('color', '');
						});
						if($('.tabs-li').first()[0] !== this) {
							this.firstChild.style.backgroundColor = 'rgb(197, 31, 0)';
							this.firstChild.firstChild.style.color = 'rgb(255, 255, 255)';
						}
					}
					$('.accordeon-wrapper .details-body').css('width', document.documentElement.clientWidth);
                });
				if($('.tabs-li').length) {
					$('.tabs-li').first().trigger('click').trigger('mouseenter').trigger('touchstart');
					$('.tabs-li').first().children().first().css('background-color', '#C51F00').children().first().css('color', 'white');
				}
            }
        };
		elements.fn(elements.rightClickFn, elements.leftClickFn, elements.tabsClickAndPostingCall);
		return elements.arrOverflowingTabsWidth;
}

function POST(url) {
    'use strict';
    if (Object.prototype.toString.call(url) === "[object String]") {
        var request = new XMLHttpRequest();
        if (!~navigator.userAgent.indexOf('IE')) {
            request.overrideMimeType("application/json");
        }
        request.open('get', url, true);
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                var jsonObject = JSON.parse(request.responseText);
                if (jsonObject) {
                    $('body').trigger('post', jsonObject);
                }
            }
        };
        request.send();
    }
}

function getTabsNumber(jsonObject) {
    'use strict';
    var _tabsNumber = {},
        _length,
        _objectRouter = function (obj, flag) {
            if (!flag) {
                _length = Object.keys(obj).length;
                if (i in _tabsNumber) {
                    if (!({}).toString.call(_tabsNumber[i]) === '[object Array]') {
                        var _t = [];
                        _t.push(_tabsNumber[i]);
                        _t.push(_length);
                        _tabsNumber[i] = _t;
                    } else {
                        _tabsNumber[i].push(_length);
                    }
                } else {
                    _tabsNumber[i] = _length;
                }
            } else {
                for (var key in obj) {
                    if (({}).toString.call(obj[key] === '[object Object]')) {
                        _length = Object.keys(obj[key]).length;
                        if (_tabsNumber[key]) {
                            if (({}).toString.call(_tabsNumber[key]) !== '[object Array]') {
                                var _t = [];
                                _t.push(_tabsNumber[key]);
                                _t.push(_length);
                                _tabsNumber[key] = _t;
                            } else {

                                _tabsNumber[key].push(_length);
                            }
                        } else {
                            _tabsNumber[key] = _length;
                        }
                    }
                }
            }
        },
        _subRoutine = function (arr, flag) {
            for (var _i = arr.length; _i--;) {
                if (({}).toString.call(arr[_i]) === '[object Object]') {
                    for (var _key in arr[_i]) {
                        if (({}).toString.call(arr[_i][_key]) === '[object Object]' && !_tabsNumber[_key]) {
                            _objectRouter(arr[_i], true);
                        } else if (({}).toString.call(arr[_i][_key]) === '[object Array]') {

                            if (!_tabsNumber[_key]) {
                                _tabsNumber[_key] = 0;
                            }
                            _subRoutine(arr[_i][_key], true);
                        }
                    }
                }
            }
        };

    for (var i in jsonObject) {
        if (Object.prototype.toString.call(jsonObject[i]) === "[object Object]") {
            _objectRouter(jsonObject[i]);
        } else if (({}).toString.call(jsonObject[i]) === "[object Array]") {
            if (_tabsNumber[i]) {
                var _t = [];
                _t.push(_tabsNumber[i]);
                _t.push(0);
                _tabsNumber[i].push(_t);
            } else {
                _tabsNumber[i] = 0;
            }
            _subRoutine(jsonObject[i]);
        }
    }
    return _tabsNumber;
}

function getTasksNames(jsonObject) {
    'use strict';
    var _tasksNames = [],
        subRoutineArr = [],
        _subRoutine = function (arr, flag, _flag) {
            for (var i = 0; i < arr.length; i++) {
                if (({}).toString.call(arr[i]) === '[object Object]') {
                    for (var j in arr[i]) {
                        if (j && ({}).toString.call(j) === '[object String]' &&
                            ({}).toString.call(arr[i][j]) === '[object Object]') {
                            if (flag) {
                                if (!_t) {
                                    var _t = [];
                                    _t.push(j);
                                } else if (_t) {
                                    _t.push(j);
                                }
                                if (i === arr.length - 1 && _flag) {
									subRoutineArr.push(subRoutineArr.splice(subRoutineArr.length-1, 1));
									subRoutineArr[subRoutineArr.length-1].push(_t)
                                } else if (i === arr.length - 1) {
									subRoutineArr.push(_t);
								}
								
                            } else {
                                subRoutineArr.push(j);
                            }
                        } else if (({}).toString.call(j) === '[object String]' &&
                            ({}).toString.call(arr[i][j]) === '[object Array]') {
							typeof subRoutineArr[subRoutineArr.length-1]
                            subRoutineArr.push(j);
							if(typeof subRoutineArr[subRoutineArr.length-1] === 'string' && typeof subRoutineArr[subRoutineArr.length-2] === 'string') {
								_subRoutine(arr[i][j], true, true);
							} else {
								_subRoutine(arr[i][j], true);
							}
                        }
                    }
                }
            }
        };

    for (var i in jsonObject) {
        if (({}).toString.call(i) === '[object String]') {
            if (({}).toString.call(jsonObject[i]) === '[object Object]') {
                _tasksNames.push(i);
            } else if (({}).toString.call(jsonObject[i]) === '[object Array]') {
                var t = [];
                t.push(i);
                _subRoutine(jsonObject[i]);
                t.push(subRoutineArr);
                _tasksNames.push(t);
                subRoutineArr = [];
            }
        }
    }
    return _tasksNames;
}

var url,
    tasksNumber = false,
    tabsNumber,
    accordeon,
    taskNames,
    eventName;

if ('ontouchstart' in document) {
    eventName = 'touchstart';
} else {
    eventName = 'click';
}

$('document').ready(function () {
    'use strict';
	 $('body').on('posting', function (e, _text, description) {
    if (description) {
      $('.details-body-entrails').css('display', 'none');
      if (description.match(/induction/i)) {
        $('.details-body-description') [0]['innerText' in $('.details-body-code') [0] ? 'innerText' : 'innerHTML'] = '';
        $('.details-body-description').append(_text);
      } else if (description.match(/description/i)) {
        $('.details-body-description') [0]['innerText' in $('.details-body-code') [0] ? 'innerText' : 'innerHTML'] = _text;
        $('.details-body-code') [0]['innerText' in $('.details-body-code') [0] ? 'innerText' : 'innerHTML'] = '';
        $('.details-body-entrails').css('display', 'none');
      } else if (description.match(/code/i)) {
        $('.details-body-description') [0]['innerText' in $('.details-body-code') [0] ? 'innerText' : 'innerHTML'] = '';
        $('.details-body-entrails').css('display', '');
        $('.details-body-code') [0]['innerText' in $('.details-body-code') [0] ? 'innerText' : 'innerHTML'] = _text;
      }
      if ($('.prettyprinted').length) {
        $('.prettyprinted').removeClass('prettyprinted');
      }
      prettyPrint();
    }
  });

  $('body').on('post', function (e, jsonObject) {
        var tabsNumberByKey = getTabsNumber(jsonObject),
            tasksNumber = (function () {
                var returnable = 0;
                for (var i in tabsNumberByKey) {
                    if (i && ({}).toString.call(tabsNumberByKey[i]) === '[object Number]') {
                        returnable += 1;
                    } else if (i && ({}).toString.call(tabsNumberByKey[i]) === '[object Array]') {
                        returnable += tabsNumberByKey[i].length;
                    }
                }
                return returnable;
            })(),
            taskNames = getTasksNames(jsonObject),
            accordeon = new Accordeon($('.accordeon-wrapper'), tasksNumber, 30, tabsNumberByKey),
            text,
            tabsNames = [];
			accordeon.build(taskNames);
			accordeon.scroller();
        $('.title').on(eventName, function (e) {
            'use strict';
            tabsNames = [];
            $('body').trigger('title-change');
			$('.details-body-code') [0]['innerText' in $('.details-body-code') [0] ? 'innerText' : 'innerHTML'] ? $('.details-body-code') [0]['innerText' in $('.details-body-entrails') [0] ? 'innerText' : 'innerHTML'] = '' : null;
			$('.details-body-description') [0]['innerText' in $('.details-body-code') [0] ? 'innerText' : 'innerHTML'] ? $('.details-body-description') [0]['innerText' in $('.details-body-code') [0] ? 'innerText' : 'innerHTML'] = '' : null;
            if (e.target.tagName === 'DIV') {
                text = e.target.firstChild['innerText' in e.target.firstChild ? 'innerText' : 'innerHTML'];
                if (text) {
                    $(e.target).prepend($('<div>', {
                        id: 'clickableTitleArrow',
                        html: '&#10147;',
                        style: 'display : inline; margin-left: 9%; font-size: 17px;'
                    }));
					$('#clickableTitleArrow').parent().css('color', '#fff');
					$('#clickableTitleArrow').parent().css('background-color', '#C51F00');
                }
            } else {
                text = e.target['innerText' in e.target.firstChild ? 'innerText' : 'innerHTML'];
                if (text && tabsNumberByKey[text]) {
                    $(e.target.parentNode).prepend($('<div>', {
                        id: 'clickableTitleArrow',
                        html: '&#10147;',
                        style: 'display : inline; margin-left: 5%; font-size: 17px;'
                    }));
					$('#clickableTitleArrow').parent().css('color', '#fff');
					$('#clickableTitleArrow').parent().css('background-color', '#C51F00');
                }
            }
            if (text in tabsNumberByKey && tabsNumberByKey[text]) {
                if (Object.prototype.toString.call(jsonObject[text]) === '[object Object]') {
                    for (var j in jsonObject[text]) {
                        tabsNames.push(j);
                    }
                } else {
                    var _subRoutine = function (arr) {
                        for (var i = arr.length; i--;) {
                            if (({}).toString.call(arr[i]) === '[object Object]') {
                                for (var k in arr[i]) {
                                    if (({}).toString.call(arr[i][k]) === '[object Object]') {
                                        if (k === text) {
                                            for (var _k in arr[i][k]) {
                                                tabsNames.push(_k);
                                            }
                                        }
                                    } else if (({}).toString.call(arr[i][k]) === '[object Array]') {
                                        _subRoutine(arr[i][k]);
                                    }
                                }
                            }
                        }
                    };
                    for (var q in jsonObject) {
                        if (({}).toString.call(jsonObject[q]) === '[object Array]') {
                            _subRoutine(jsonObject[q]);
                        }
                    }
                }
                $('.tabulator-wrapper').remove();
                $('.arrow-left').off(eventName);
                $('.arrow-right').off(eventName);
                $('.tabs-li').off(eventName);
				
				var booleanToChangeWidthOfRedLineToPercentageOrToContainerWidth = accordeon.tabulator(tabsNumberByKey[text], tabsNames, jsonObject, text);
				
				$('.columniser-text').first().append($('<div></div>', {'style' : 'float: left;', 'class' : 'breadcrumb'}).
				append($('<div></div>', {'style' : "background-color : #6690BC; padding-top: 1px; padding-bottom: 1px; height: 17px; border-top: 1px solid #C7C7C7; border-bottom: 1px solid #C7C7C7; border-right: 1px solid #C7C7C7; padding-left: 5px; padding-right: 5px;font-family: 'Segoe UI'; font-size: 13px; cursor: pointer; color: #fff; float: left;", 'class' : 'arrowshaft'}).text($('.columniser-text').first().text())));
				$('.columniser-text').first().html($('.columniser-text').first().html().replace($('.columniser-text').first().html().match(/^(.*)<div/)[1], ''));
				$('.columniser-text:first').prepend($('<div></div>', {'style' : 'float: left; display: inline-block; width: 0; height: 0; border-top-width: 10px; border-top-style: solid; border-top-color: rgba(0, 0, 0, 0); border-bottom-width: 10px; border-bottom-style: solid; border-bottom-color: rgba(0, 0, 0, 0); border-right-width: 10px; border-right-style: solid; border-right-color: #6690BC;'}));
				$('.titles-column-left').css('display', 'none');
				
				
				if(document.documentElement.clientWidth < 400) { 
					
					$('.tabs-li .tabulator-div').each(function(){
						$(this).css({'display' : '', 'width' : document.documentElement.clientWidth});
					});
					$('.tabs-li .tabulator-div').last().css({'border-bottom' : '2px solid #C51F00'});
					$('.tabulator-wrapper').css({'overflow' : 'visible', 'width' : $('.tabs-li').first().outerWidth() + 'px'});
					$('.scrolling-left').css('display', 'none');
					$('.scrolling-right').css('display', 'none');
					$('.red-lining').css('visibility', 'hidden');
				}else {
					$('.red-lining').css({'margin-left' : '205px' /*, 'width' : (window.innerWidth - 205)*/});
					$('.columniser .columniser-text:nth-child(1)').css({'width' : '205px'});
						if ('ontouchstart' in document) {
							$('.scrolling-left').css({'left' : '202px'});
						}else {
							$('.scrolling-left').css({'left' : '210px'});
						}
						$('.scrolling-right').css({'left' : ''});
				}
				
			$('.columniser-text').first().on('mousedown', function(e) {
					$('.titles-column-left').css('display', '');
					$('.details-body').css({'margin-left' : ''});
					/*restore $('.columniser') to the original state before the scroll:*/
						$('.left-right-container').before($('.columniser'));
						$('.left-right-container').before($('.red-lining'));
						$('#myDiv').css({'position' : 'static'});
					/*-----------------------*/
					$('.columniser').prepend($('<div></div>', {'class' : 'columniser-text'}).text($('.columniser-text:first div').text()));
					$($('.columniser-text')[1]).remove();
					$('.columniser .columniser-text:nth-child(1)').css({'width' : '380px'});
					$('.red-lining').css({'margin-left' : ''});
					$('.scrolling-left').css({'left' : '392px'});
					$('.accordeon-wrapper .details-body .details-body-description').html('');
					$('.accordeon-wrapper .details-body .details-body-code').html('');
					$('.tabulator-wrapper').remove();
					$('.scrolling-right').remove();
					$('.scrolling-left').remove();
			});
	  }
            if (tabsNumberByKey[text] === 0 || !tabsNumberByKey[text]) {
                $('.tabulator-wrapper').remove();
                $('.arrow-left').off(eventName);
                $('.arrow-right').off(eventName);
                $('.tabs-li').off(eventName);
                $('.scrolling-left').css('display', 'none');
                $('.scrolling-right').css('display', 'none');
            } else if (document.documentElement.clientWidth > 360) {
                (function () {
                    var _width = 0;
                    $('.tabs-li div').each(function () {
						_width += $(this).outerWidth();
                    })
                    if (_width < $('.tabulator-wrapper').outerWidth()) {
                        $('.scrolling-left').css('display', 'none');
                        $('.scrolling-right').css('display', 'none');
                    } else {
                        $('.scrolling-left').css('display', '');
                        $('.scrolling-right').css('display', '');
                    }
                })();
            }
        }); //.title').on event name ending (!) 
    });
 url = 'data/tasks.js';
    POST(url);
});