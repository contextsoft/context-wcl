define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     Allows to create a set of transitions that can be grouped and performed together.
     */
    var CSSTransition = (function () {
        function CSSTransition() {
        }
        /**
         * Adds a CSS transition, parameters are :
         *
         * element:     target element for transition
         * duration:    duration for all transitions in seconds
         * properties:  the properties that are transitioned (will be fed to '-webkit-transition-property')
         * from:        optional list of initial property values to match properties passed as .properties
         * to:          list of final property values to match properties passed as .properties
         *
         * The .duration and .properties parameters are optional and can be defined once for
         * all upcoming transitions by over-riding the Transition.DEFAULTS properties
         *
         * Some operations need to be deferred so that the styles are currently set for the from state
         * of from / to operations
         */
        CSSTransition.prototype.add = function (params) {
            var style = params.element.style;
            // set up properties
            var properties = (params.properties) ? params.properties : CSSTransition.DEFAULTS.properties;
            // set up durations
            var duration = ((params.duration) ? params.duration : CSSTransition.DEFAULTS.duration) + 's';
            var durations = [];
            for (var i = 0; i < properties.length; i++) {
                durations.push(duration);
            }
            // from/to animation
            if (params.from) {
                this.addInstantOperation(function () {
                    style.webkitTransitionProperty = 'none';
                    for (var i = 0; i < properties.length; i++) {
                        style.setProperty(properties[i], params.from[i], '');
                    }
                });
                this.addDeferredOperation(function () {
                    style.webkitTransitionProperty = properties.join(', ');
                    style.webkitTransitionDuration = durations.join(', ');
                    for (var i = 0; i < properties.length; i++) {
                        style.setProperty(properties[i], params.to[i], '');
                    }
                });
            }
            else {
                this.addDeferredOperation(function () {
                    style.webkitTransitionProperty = properties.join(', ');
                    style.webkitTransitionDuration = durations.join(', ');
                    for (var i = 0; i < properties.length; i++) {
                        style.setProperty(properties[i], params.to[i], '');
                    }
                });
            }
        };
        /** Called in order to launch the current group of transitions */
        CSSTransition.prototype.apply = function () {
            this.instantOperations();
            setTimeout(this.deferredOperations, 0);
        };
        /** Adds a new operation to the set of instant operations */
        CSSTransition.prototype.addInstantOperation = function (newOperation) {
            var previousInstantOperations = this.instantOperations;
            this.instantOperations = function () {
                if (previousInstantOperations)
                    previousInstantOperations();
                newOperation();
            };
        };
        /** Adds a new operation to the set of deferred operations */
        CSSTransition.prototype.addDeferredOperation = function (new_operation) {
            var previousDeferredOperations = this.deferredOperations;
            this.deferredOperations = function () {
                if (previousDeferredOperations)
                    previousDeferredOperations();
                new_operation();
            };
        };
        /**
         * Core defaults for the transitions, you can update these members so that all
         * calls to .add() from that point on use this duration and set of properties
         */
        CSSTransition.DEFAULTS = {
            duration: 1,
            properties: []
        };
        return CSSTransition;
    }());
    exports.CSSTransition = CSSTransition;
});
//# sourceMappingURL=transitions.js.map