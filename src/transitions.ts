/**
 * element:     target element for transition
 * duration:    duration for all transitions in seconds
 * properties:  the properties that are transitioned (will be fed to '-webkit-transition-property')
 * from:        optional list of initial property values to match properties passed as .properties
 * to:          list of final property values to match properties passed as .properties
 */
export interface ICSSTransitionOptions {
    element: HTMLElement;
    duration: number;
    properties: string[];
    from?: string[];
    to?: string[];
}

/**
 * Allows to create a set of transitions that can be grouped and performed together.
 */
export class CSSTransition {
    /** 
     * Core defaults for the transitions, you can update these members so that all
     * calls to .add() from that point on use this duration and set of properties
     */
    protected static DEFAULTS = {
        duration: 1,    // default to 1 second
        properties: []
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
    public add(params: ICSSTransitionOptions) {
        let style = params.element.style;
        // set up properties
        let properties = (params.properties) ? params.properties : CSSTransition.DEFAULTS.properties;
        // set up durations
        let duration = ((params.duration !== undefined) ? params.duration : CSSTransition.DEFAULTS.duration) + "s";
        let durations = [];
        for (let i = 0; i < properties.length; i++) {
            durations.push(duration);
        }
        // from/to animation
        if (params.from) {
            this.addInstantOperation(() => {
                style.webkitTransitionProperty = "none";
                for (let i = 0; i < properties.length; i++) {
                    style.setProperty(properties[i], params.from[i], "");
                }
            });
            this.addDeferredOperation(() => {
                style.webkitTransitionProperty = properties.join(", ");
                style.webkitTransitionDuration = durations.join(", ");
                for (let i = 0; i < properties.length; i++) {
                    style.setProperty(properties[i], params.to[i], "");
                }
            });
        }
        // to-only animation
        else {
            this.addDeferredOperation(() => {
                style.webkitTransitionProperty = properties.join(", ");
                style.webkitTransitionDuration = durations.join(", ");
                for (let i = 0; i < properties.length; i++) {
                    style.setProperty(properties[i], params.to[i], "");
                }
            });
        }
    }

    /** Called in order to launch the current group of transitions */
    public apply() {
        this.instantOperations();
        setTimeout(this.deferredOperations, 0);
    }

    /** Adds a new operation to the set of instant operations */
    protected addInstantOperation(newOperation) {
        let previousInstantOperations = this.instantOperations;
        this.instantOperations = () => {
            if (previousInstantOperations)
                previousInstantOperations();
            newOperation();
        };
    }

    /** Adds a new operation to the set of deferred operations */
    protected addDeferredOperation(newOperation) {
        let previousDeferredOperations = this.deferredOperations;
        this.deferredOperations = () => {
            if (previousDeferredOperations)
                previousDeferredOperations();
            newOperation();
        };
    }
}
