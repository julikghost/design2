/**
 * Created by tingyuan on 15/12/29.
 */
;
(function ($) {
    if ($ === undefined) {
        return;
    }

    var defaultConfig = {
        num: 3, 
        maxWidth: 780,
            maxHeight: 595,
       
        autoPlay: true, //是否自动滚动播放
        showTime: 1000, //autoPlay为true时这个属性才有用
        animationTime: 300, //
        scale: 0.8,
        distance: 50
    };


    function getzIndexValue(num, direction) {
        var zIndexs = [];
        for (var i = 0; i < num; i++) {
            if (i <= (num - 1) / 2) {
                zIndexs.push(i);
            } else {
                zIndexs.push((num - 1) / 2 - i);
            }
        }
        if (direction === 'left') {
            zIndexs.reverse();
            return zIndexs;
        }
        if (direction === 'right') {
            return zIndexs;
        }

    }

    function scroll($slider, direction) {
        if ($slider.data('isanimating')) {
            return;
        }
        var config = $slider.data('config');
        var halfShowNum = (config.num - 1) / 2;
        var scales, i, newIndex;
        var totalNum = $slider.data('totalNum');
        var targetCss;
        var firstIndexBeforeScroll, lastIndexBeforeScroll;
        if (direction === 'left') {
            newIndex = ($slider.data('index') - 1 + totalNum) % totalNum;
        } else if (direction === 'right') {
            newIndex = ($slider.data('index') + 1) % $slider.data('totalNum');
        } else {
            return;
        }
        // $slider.find('ul li').stop(true, true);
        var tempIndexsInfo = getShowIndexs($slider);
        firstIndexBeforeScroll = tempIndexsInfo.indexs[0];
        lastIndexBeforeScroll = tempIndexsInfo.indexs[config.num - 1];
        $slider.data('index', newIndex);
        var showIndexsInfo = getShowIndexs($slider);
        var zIndexs = getzIndexValue(config.num, direction);
        if (totalNum === config.num) {
            animationTimeForEdge = 0
        } else if (totalNum - config.num === 2) {
            animationTimeForEdge = config.animationTime / 2;
        } else {
            animationTimeForEdge = config.animationTime;
        }

        /*
         showIndexsInfo = {
         indexs: [5, 6, 0, 1, 2]
         hashIndexs: {
         '5': 0,
         '6': 1,
         '0': 2,
         '1': 3,
         '2': 4
         }
         }
         */
        $slider.find('ul li').each(function (index, element) {

            i = showIndexsInfo.hashIndexs[index];

            if (i !== undefined) {
                scales = Math.pow(config.scale, Math.abs(i - halfShowNum));
                $slider.data('isanimating', true);
                $(element).css({
                    display: 'block',
                    'z-index': zIndexs[i] + 9999
                }).animate({
                    width: scales * config.maxWidth,
                    height: scales * config.maxHeight,
                    left: i * config.distance + (1 - scales) * config.maxWidth * Number(i > halfShowNum),
                    top: (1 - scales) * config.maxHeight / 2
                }, config.animationTime, function () {
                    $slider.data('isanimating', false);
                });

            } else {
                scales = Math.pow(config.scale, halfShowNum);
                //if(direction === 'right' && index === firstIndexBeforeScroll){
                //    console.log('right' + index);
                //} else if(direction === 'left' && index === lastIndexBeforeScroll) {
                //    console.log('left' + index);
                //}

                targetCss = {
                    display: 'none',
                    left: halfShowNum * config.distance + (1 - scales) * config.maxWidth / 2,
                    top: 0
                };
                if (direction === 'left' && index === lastIndexBeforeScroll) {

                    $(element).css('z-index', -1).animate({
                        left: "-=" + config.distance + "px"
                    }, config.animationTime, function () {
                        $(element).css(targetCss);
                    });
                } else if (direction === 'right' && index === firstIndexBeforeScroll) {

                    $(element).css('z-index', -1).animate({
                        left: "+=" + config.distance + "px"
                    }, config.animationTime, function () {
                        $(element).css(targetCss);
                    });
                } else {
                    $(element).css({
                        display: 'none',
                        width: scales * config.maxWidth,
                        height: scales * config.maxHeight,
                        left: halfShowNum * config.distance + (1 - scales) * config.maxWidth / 2,
                        top: 0
                    });
                }
            }

        });
    }

    function getConfig(newConfig) {
        var config = null;
        if (typeof newConfig === 'object' && newConfig !== null) {
            config = {};
            for (var prop in defaultConfig) {
                if (defaultConfig.hasOwnProperty(prop)) {
                    config[prop] = defaultConfig[prop];
                }
            }
            for (prop in newConfig) {
                if (newConfig.hasOwnProperty(prop) && config.hasOwnProperty(prop)) {
                    config[prop] = newConfig[prop];
                }
            }
        }
        return config;
    }

    function getShowIndexs($slider) {
        var showIndexs = [];
        var temp;
        var halfShowNum = ($slider.data('config').num - 1) / 2;
        var currentIndex = $slider.data('index') || 0;
        var totalNum = $slider.data('totalNum') || 0;
        for (var i = -halfShowNum; i <= halfShowNum; i++) {
            temp = currentIndex + i;
            showIndexs.push((temp < 0 ? (temp + totalNum) : temp) % totalNum);
        }
        var hashIndexs = {};
        for (i = 0; i < showIndexs.length; i++) {
            hashIndexs[showIndexs[i]] = i;
        }
        return {
            indexs: showIndexs,
            hashIndexs: hashIndexs
        };
    }

    function initStyle($slider) {
        var showIndexsInfo = getShowIndexs($slider);

        var zIndex = 9999;
        var scales;
        var config = $slider.data('config');
        var halfShowNum = (config.num - 1) / 2;
        var listWidth = halfShowNum * config.distance * 2 + config.maxWidth;
        var sliderWidth = $slider.width();
        var sliderHeight = $slider.height();
        if (sliderWidth < listWidth) {
            $slider.width(listWidth);
        }
        if (sliderHeight < config.maxHeight) {
            $slider.height(config.maxHeight);
        }
        
        $slider.find('ul').css({
            position: 'relative',
            width: listWidth,
            height: config.maxHeight,
            'list-style': 'none',
            padding: 0,
            margin: 0,
            marginLeft: '50%',
            left: -listWidth / 2,
            top: ($slider.height() - config.maxHeight) / 2
        });

        $slider.find('.left').css({
            position: 'absolute',
            left: 10,
            top: '50%',
            'z-index': 9999 + $slider.data('totalNum') + 1
        });

        $slider.find('.right').css({
            position: 'absolute',
            right: 10,
            top: '50%',
            'z-index': 9999 + $slider.data('totalNum') + 1
        });

        $slider.find('ul li').each(function (index, element) {
            var i = showIndexsInfo.hashIndexs[index];
            if (i !== undefined) {
                scales = Math.pow(config.scale, Math.abs(i - halfShowNum));
                zIndex = 9999 + (i > halfShowNum ? (config.num - 1 - i) : i);
                $(element).css({
                    display: 'block',
                    position: 'absolute',
                    'z-index': zIndex,
                    overflow: 'hidden',
                    width: scales * config.maxWidth,
                    height: scales * config.maxHeight,
                    left: i * config.distance + (1 - scales) * config.maxWidth * Number(i > halfShowNum),
                    top: (1 - scales) * config.maxHeight / 2
                });
            } else {
                scales = Math.pow(config.scale, halfShowNum);
                $(element).css({
                    display: 'none',
                    position: 'absolute',
                    overflow: 'hidden',
                    width: scales * config.maxWidth,
                    height: scales * config.maxHeight,
                    left: halfShowNum * config.distance + (1 - scales) * config.maxWidth / 2,
                    top: 0
                });
            }

        });
    }


    $.fn.carousel = function (param) {
        var config;
        var totalNum;
        var $target;
        $(this).each(function(index, target) {
            $target = $(target);
            if (typeof param === 'object' && param !== null) {
                config = getConfig(param);
                totalNum = $target.find('ul li').length;
                if (totalNum <= 0 || totalNum % 2 === 0) {
                    return;
                }
                if (config.num <= 0 || config.num > totalNum) {
                    config.num = totalNum;
                }
                $target.data('config', config);
                $target.data('index', 0);
                $target.data('totalNum', totalNum);
                initStyle($target);

                $target.find('.left').off('click').on('click', (function($target) {
                    return function() {
                        scroll($target, 'left');
                    }
                })($target));
                $target.find('.right').off('click').on('click',(function($target) {
                    return function() {
                        scroll($target, 'right');
                    }
                })($target));

                (function($target) {
                    var autoPlay;
                    clearInterval($target.data('auto'));
                    if($target.data('config').autoPlay) {
                        autoPlay = setInterval(function() {
                            scroll($target, 'right');
                        }, $target.data('config').showTime);
                        $target.data('auto', autoPlay);
                        $target.find('ul').off('mouseenter').on('mouseenter', function() {
                            clearInterval($target.data('auto'));
                        }).off('mouseleave').on('mouseleave', function() {
                            autoPlay = setInterval(function() {
                                scroll($target, 'right');
                            }, $target.data('config').showTime);
                            $target.data('auto', autoPlay);
                        });
                    } else {
                        $target.find('ul').off('mouseenter').off('mouseleave');
                    }
                })($target);
            }

        });

    };

})(jQuery);
