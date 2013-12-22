var ladder = angular.module('ladder', ['ladderShared']);

ladder.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.
        when('/general-settings', { templateUrl: chrome.extension.getURL('partials/general-settings.html'), controller: 'GeneralSettings' }).
        when('/shortcut-management', { templateUrl: chrome.extension.getURL('partials/shortcut-management.html'), controller: 'ShortcutManagement' }).
        when('/forum-activation', { templateUrl: chrome.extension.getURL('partials/forum-activation.html'), controller: 'ForumActivation' }).
        when('/media-settings', { templateUrl: chrome.extension.getURL('partials/media-settings.html'), controller: 'MediaSettings' }).
        otherwise({ redirectTo: '/general-settings' });
}]);

ladder.run(['$rootScope', function ($rootScope) {
    $rootScope.restartFoundation = function () {
        $(document).foundation();
    };
    $rootScope.blur = function (e) {
        e.target.blur();
    };
}]);

ladder.controller('Options', ['$scope', '$location', function ($scope, $location) {
    $scope.optionsTabActive = function (page) {
        if (page === $location.path()) {
            return true;
        } else {
            return false;
        } 
    };
}]);

ladder.controller('ShortcutManagement', ['$scope', 'ladderStorage', function ($scope, ladderStorage) {
    var keypressRecorderBind = 'none',
        isWatchingShortcuts = true;

    var choices = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
                'shift','ctrl','alt','backspace','tab','enter','space','left','up','down','right'];

    var keypressRecorderOn = function (appendShortcut) {
        var setup = {};
        for (var i=0; i<choices.length; i++) {
           setup[choices[i]] = function(choice) { return function(e) { appendShortcut(e, choice) } }(choices[i]);
        }
        Mousetrap.bind(setup, 'keydown');
    };

    var keypressRecorderOff = function () {
        Mousetrap.unbind(choices);
    };

    var appendShortcut = function (e, letter) {
        e.preventDefault();
        if ($scope.shortcuts[keypressRecorderBind].value.length > 0) {
            letter = '+'+letter;
        }
        $scope.shortcuts[keypressRecorderBind].value += letter;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };

    var getShortcuts = function () {
        isWatchingShortcuts = false;
        ladderStorage.getValues('shortcuts', function (obj) {
            $scope.shortcuts = obj;
            $scope.isReady = true;
            $scope.isSynced = true;
            if (!$scope.$$phase) {
                $scope.$digest();
            }
            isWatchingShortcuts = true;
        });
    };

    $scope.switchKeypressRecorder = function (key) {
        if (keypressRecorderBind === key) {
            keypressRecorderBind = 'none';
            keypressRecorderOff();
        } else {
            if (keypressRecorderBind === 'none') {
                keypressRecorderOn(appendShortcut);
            }
            keypressRecorderBind = key; 
            $scope.shortcuts[key].value = '';
        }
    };

    $scope.isKeypressRecorderActive = function (key) {
        if (keypressRecorderBind === key) {
            return true;
        } else {
            return false;
        }
    };

    $scope.$watch('shortcuts', function (newValue, oldValue) {
        if (angular.isDefined(oldValue) && isWatchingShortcuts) {
            $scope.isSynced = false;
        }
    }, true);


    $scope.saveChanges = function () {
        if (keypressRecorderBind != 'none') {
            keypressRecorderBind = 'none';
            keypressRecorderOff();
        }
        ladderStorage.setValues($scope.shortcuts, function () {
            $scope.isSynced = true;
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        });
    };

    $scope.cancelChanges = function () {
        if (keypressRecorderBind != 'none') {
            keypressRecorderBind = 'none';
            keypressRecorderOff();
        }
        getShortcuts();
    };

    $scope.restoreDefaults = function () {
        if (keypressRecorderBind != 'none') {
            keypressRecorderBind = 'none';
            keypressRecorderOff();
        }
        ladderStorage.removeValues('shortcuts', function() {
            getShortcuts();
        }); 
    };

    $scope.getRepeaterHeight = function () {
        var size = ladderStorage.getTemplateSize('shortcuts')
        return size*48; 
    };

    $scope.isReady = false;
    $scope.isSynced = true;

    getShortcuts();
}]);

ladder.controller('ForumActivation', ['$scope', '$rootScope', 'ladderStorage', function ($scope, $rootScope, ladderStorage) {
    var getForums = function () {
        ladderStorage.getValues('forums', function (obj) {
            $scope.forums = obj;
            $scope.isReady = true;
            if (!$scope.$$phase) {
                $scope.$digest();
            }
            $rootScope.restartFoundation();
        });
    };

    $scope.switchForumValue = function (key) {
        if ($scope.forums[key].value) {
            $scope.forums[key].value = false;
        } else {
            $scope.forums[key].value = true; 
        }
        ladderStorage.setValues($scope.forums, function () {
            console.log('Forums saved');
        });
    };

    $scope.restoreDefaults = function () {
        ladderStorage.removeValues('forums', function() {
            getForums();
        }); 
    };

    $scope.getRepeaterHeight = function () {
        var size = ladderStorage.getTemplateSize('forums')
        return Math.ceil(size/3)*56; 
    };
    
    $scope.isReady = false;

    getForums();
}]);

ladder.controller('GeneralSettings', ['$scope', '$rootScope', 'ladderStorage', function ($scope, $rootScope, ladderStorage) {
    var getGeneralSettings = function () {
        ladderStorage.getValues('settings', function (obj) {
            $scope.settings = obj;
            $scope.isReady = true;
            if (!$scope.$$phase) {
                $scope.$digest();
            }
            $rootScope.restartFoundation();
        });
    };
    getGeneralSettings();
    
    $scope.switchSettingValue = function (key) {
        if ($scope.settings[key].value) {
            $scope.settings[key].value = false;
        } else {
            $scope.settings[key].value = true; 
        }
        $scope.saveChanges();
    };

    $scope.saveChanges = function () {
        ladderStorage.setValues($scope.settings, function () {
            console.log('Settings saved');    
        });
    };

    $scope.isReady = false;
}]);

ladder.controller('MediaSettings', ['$scope', 'ladderStorage', function ($scope, ladderStorage) {
  
}]);

ladder.filter('toArray', function() { return function(obj) {
    if (!(obj instanceof Object)) return obj;
    return $.map(obj, function(val, key) {
        return Object.defineProperty(val, '$key', {__proto__: null, value: key});
    });
}});
