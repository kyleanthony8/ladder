var ladderBackground = angular.module('ladderBackground', ['ladderShared']);
ladderBackground.run(function (ladderStorage) {
    var animation = false;
    var findPosition = function (elements, direction, isBottom, minHeight, delta) {
        var current = parseInt($(document).scrollTop()),
            result = -1,
            height = -1;
        $(elements).each(function (index) {
            var h = $(this).height(),
                offset;
            if (h >= minHeight) {
                offset = parseInt($(this).offset().top);
                if (isBottom) {
                    offset += h;
                }
                switch (direction) {
                    case 'next':
                        if (offset > current+delta) {
                            if (result === -1 || offset < result) {
                                result = offset; 
                                height = h;
                            } 
                        }
                        break;
                    case 'prev':
                        if (offset < current+delta) {
                            if (result === -1 || offset > result) {
                                result = offset; 
                                height = h;
                            } 
                        }
                        break;
                }
            }
        });
        return {
            'result': result,
            'height': height
        };
    };

    var perform = function (e, shortcut, settings, marks) {
        var destination, current, next, prev, link;
        e.preventDefault();
        if (!animation) {
            switch (shortcut) {
                case 'next_reply':
                    next = findPosition(marks.posts, 'next', false, 40, 0);
                    if (next.result != -1) {
                        animation = true;
                        $('html, body').animate({ scrollTop: next.result }, settings.transition.value, function () {
                            animation = false;
                        });
                    }
                    break;
                case 'prev_reply':
                    prev = findPosition(marks.posts, 'prev', false, 40, 0);
                    if (prev.result != -1) {
                        animation = true;
                        $('html, body').animate({ scrollTop: prev.result }, settings.transition.value, function () {
                            animation = false;
                        });
                    }
                    break;
                case 'in_reply_forward':
                    next = findPosition(marks.posts, 'next', true, 40, 0);
                    current = parseInt($(document).scrollTop());
                    destination = current + 200;
                    if (next.result != -1 && destination < next.result-100 && destination > next.result-next.height) {
                        animation = true;
                        $('html, body').animate({ scrollTop: destination }, settings.transition.value, function () {
                            animation = false;
                        });
                    }
                    break;
                case 'in_reply_backward':
                    prev = findPosition(marks.posts, 'prev', false, 40, 1);
                    current = parseInt($(document).scrollTop());
                    destination = current - 200;
                    if (prev.result != -1) {
                        if (destination < prev.result || destination === prev.result) {
                            destination = prev.result;
                        }
                        animation = true;
                        $('html, body').animate({ scrollTop: destination }, settings.transition.value, function () {
                            animation = false;
                        });
                    }
                    break;
                case 'next_page':
                    link = $(marks.next_page); 
                    if (link.length) {
                        link[0].click();
                    }
                    break;
                case 'prev_page':
                    link = $(marks.prev_page); 
                    if (link.length) {
                        link[0].click();
                    }
                    break;
            }
        }
    };
    
    ladderStorage.getValues('settings', function (settings) {
        if (settings.is_active.value) {
            ladderStorage.getValues('forums', function (forums) {
                var key, 
                    found = 'none';
                for (key in forums) {
                    if (forums.hasOwnProperty(key) &&
                        forums[key].value &&
                        $(forums[key].marks.brand).length) {
                        found = key;        
                        console.log('Found ' + forums[key].label);
                        break;
                    }
                };
                if (found != 'none') {
                    ladderStorage.getValues('shortcuts', function (shortcuts) {
                        var key,
                            setup = {};
                        for (key in shortcuts) {
                            if (shortcuts.hasOwnProperty(key)) {
                                setup[shortcuts[key].value] = function(key) { 
                                    return function(e) { perform(e, key, settings, forums[found].marks) } 
                                }(key);
                            }
                        }
                        Mousetrap.bind(setup, 'keydown');    
                    });
                }
            });
        }
    });
});
angular.bootstrap(document, ['ladderBackground']);
