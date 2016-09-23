/**
 Allows to create a set of transitions that can be grouped and performed together.
 */
export class CSSTransition {
    static cssSlideHorizontal(direction) {
        return (direction === 0) ? [1, 'translate3d(0,0,0)'] : [0, 'translate3d(' + (direction * 100) + '%,0,0)'];
    }
    static cssSlideVertical(direction) {
        return (direction === 0) ? [1, 'translate3d(0,0,0)'] : [0, 'translate3d(0, ' + (direction * 100) + '%,0)'];
    }
    static cssRotateX(direction) {
        return (direction === 0) ? [1, 'rotateX(0deg)'] : [0, 'rotateX(' + (direction * 180) + 'deg)'];
    }
    static cssRotateY(direction) {
        return (direction === 0) ? [1, 'rotateY(0deg)'] : [0, 'rotateY(' + (direction * 180) + 'deg)'];
    }
    static cssFadeInOut(direction) {
        return (direction === 0) ? [1] : [0];
    }

    static slideHorizontal = {
        transition: CSSTransition.cssSlideHorizontal,
        properties: ['opacity', '-webkit-transform'],
        duration: 0.5
        // we may additionally specify To transition
        // transitionTo: transitionSlideHorizontal,
        // propertiesTo: ['opacity', '-webkit-transform'],
    };
    static slideVertical = {
        transition: CSSTransition.cssSlideVertical,
        properties: ['opacity', '-webkit-transform'],
        duration: 0.5
    };
    static fadeInOut = {
        transition: CSSTransition.cssFadeInOut,
        properties: ['opacity'],
        duration: 0.5
    };
    static rotateY = {
        transition: CSSTransition.cssRotateY,
        properties: ['opacity', '-webkit-transform'],
        duration: 0.5
    };
    static rotateX = {
        transition: CSSTransition.cssRotateX,
        properties: ['opacity', '-webkit-transform'],
        duration: 0.5
    };


    /** 
     * Callback for the first batch of operation, where we set the default properties
     * for the transition (transition-property and transition-duration) as well as
     * the "from" property value if explicitely passed as a param to .add()
     */
    protected instantOperations: () => void;

    /** Callback for the second batch of operation, where we set the "to" property value */
    protected deferredOperations: () => void;

    /** 
     * Core defaults for the transitions, you can update these members so that all
     * calls to .add() from that point on use this duration and set of properties
     */
    static DEFAULTS = {
        duration: 1,    // default to 1 second
        properties: []
    };

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
    public add(params) {
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
        // to-only animation
        else {
            this.addDeferredOperation(function () {
                style.webkitTransitionProperty = properties.join(', ');
                style.webkitTransitionDuration = durations.join(', ');
                for (var i = 0; i < properties.length; i++) {
                    style.setProperty(properties[i], params.to[i], '');
                }
            });
        }
    }

    /** Adds a new operation to the set of instant operations */
    public addInstantOperation(newOperation) {
        var previousInstantOperations = this.instantOperations;
        this.instantOperations = function () {
            previousInstantOperations();
            newOperation();
        };
    }

    /** Adds a new operation to the set of deferred operations */
    public addDeferredOperation(new_operation) {
        var previousDeferredOperations = this.deferredOperations;
        this.deferredOperations = function () {
            previousDeferredOperations();
            new_operation();
        };
    }

    /** Called in order to launch the current group of transitions */
    public apply() {
        var _this = this;
        this.instantOperations();
        setTimeout(_this.deferredOperations, 0);
    }
}
