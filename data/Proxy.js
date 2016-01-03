function Observer(options) {
    options = options || {};
    var memory, fired, locked = false,
        list = [];
    this.bind = function (fn) {
        if (!locked) {
            if (fired) {
                fn.call({}, memory)
            } else {
                list.push(fn)
            }
        }
    };
    this.unbind = function (fn) {
        var i = 0;
        while (i < list.length) {
            if (list[i] === fn) {
                list.splice(i, 1)
            } else {
                i++
            }
        }
    };
    this.unbindAll = function () {
        list = []
    };
    this.lock = function () {
        locked = true;
        this.unbindAll()
    };
    this.isLocked = function () {
        return locked
    };
    this.trigger = function (data) {
        if (!locked) {
            if (options.memory) {
                memory = data
            }
            if (options.once) {
                fired = true
            }
            var t_list = list.slice();
            for (var i = 0; i < t_list.length; i++) {
                t_list[i].call({}, data)
            }
            if (options.once) {
                this.unbindAll()
            }
        }
    }
}
var withCashing = function () {
    mmcore.CGRequestProxy = (function (Observer, mmcore) { // первое замыкание: namespace с переданными ресурсами: MMCORE + класс Observer.
        var Request = function () { // создаём переменную proxy-класс
            var PROXY_TIME = 20,
                callbacksFunctions = new Observer(), // создаем instance класса Observer c присвоением переменной callbacksFunctions
                hTimeout = null; // handler of the Timeout, is used as a flag to check againt the launched timeout to initialize timeout at the first cg.request();
            return function (fn) {
                if (mmcore._async) {
                    callbacksFunctions.bind(fn);
                    if (hTimeout === null) {
                        hTimeout = setTimeout(function () { // timeout is overwritten
                            mmcore.CGRequest(function () {
                                console.log(">>> event trigger pre");
                                callbacksFunctions.trigger();
                                callbacksFunctions.unbindAll();
                                console.log(">>> event trigger post")
                            });
                            mmcore.CGRequestProxy = Request();
                        }, PROXY_TIME);
                    }
                } else {
                    mmcore.CGRequest(fn);
                }
            }
        };
        return Request();
    }(Observer, mmcore));

    /*--------------*/
    mmcore._async = true;
    mmcore.SetPageID("events");
    /*--------------*/
    var trackAction = function (n) {
        var strN = ("0" + n)
            .substr(-2);
        mmcore.SetAction("TestAction_" + strN, 1, "user_attr");
        mmcore.CGRequestProxy(function () {
            console.log("TestAction_" + strN + " completed")
        });
    };
    var testCashing = (function () {
        var TRACK_TIME = 30,
            n = 10;

        return function () {
            setTimeout(function () {
                if (n--) {
                    trackAction(n);
                    testCashing()
                }

            }, TRACK_TIME)
        }
    }());
    testCashing()


};
mmcore.AddDocLoadHandler(function () {
    console.clear();
    withCashing();
});