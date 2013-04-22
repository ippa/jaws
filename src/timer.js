var jaws = (function(jaws) {

    jaws.Timer = function(callbackFunction, timing) {
        var variableInterval = {
            interval: timing,
            callback: callbackFunction,
            stopped: false,
            runLoop: function() {
                if (variableInterval.stopped)
                    return;
                var result = variableInterval.callback.call(variableInterval);
                if (typeof result === 'number')
                {
                    if (result === 0)
                        return;
                    variableInterval.interval = result;
                }
                variableInterval.loop();
            },
            stop: function() {
                this.stopped = true;
                window.clearTimeout(this.timeout);
            },
            start: function() {
                this.stopped = false;
                return this.loop();
            },
            loop: function() {
                this.timeout = window.setTimeout(this.runLoop, this.interval);
                return this;
            }
        };
        return variableInterval.start();
    };
    
    return jaws;
})(jaws || {});

// Support CommonJS require()
if (typeof module !== "undefined" && ('exports' in module)) {
    module.exports = jaws.Timer;
}