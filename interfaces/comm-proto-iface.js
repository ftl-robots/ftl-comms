const logger = require('winston');
const EventEmitter = require('events');

const ALLOWED_EVENTS = [
    'digitalOutput',
    'analogOutput', // Even though this really isn't supported quite yet
    'pwmOutput',
    'robotCommand',
    'systemMessage',
    'enableRobot',
    'disableRobot',
];

/**
 * Interface/Abstract class for a FTLComms Protocol
 * This sits between a client and a robot host
 * 
 * Client --[outputs to robot] --> protocol --> Robot
 * Robot --[inputs from robot] --> protocol --> Event/getter
 */
class FTLCommsProtocol extends EventEmitter {
    constructor(type) {
        super();
        this.d_type = type;
    }

    get protocolType() {
        return this.d_type;
    }

    /**
     * Start the protocol
     */
    start() {
        throw new Error("Abstract 'start()' called!");
    }

    /**
     * Stop the protocol
     */
    stop() {
        throw new Error("Abstract 'stop()' called!");
    }

    /**
     * Overriden version of emit to perform verification
     */
    emit() {
        if (ALLOWED_EVENTS.indexOf(arguments[0]) !== -1) {
            super.emit.apply(this, arguments);
        }
        else {
            throw new Error("Invalid event '" + arguments[0] + "' fired");
        }
    }

    /**
     * === Client to Robot Communication ===
     * These are protocol dependent, but in effect, we fire
     * an event here so that our host application can pick it up 
     * and transmit it to the robot
     */
    /**
     * Event List
     * - digitalOutput (port, value)
     * - pwmOutput (port, value)
     * - robotCommand (send raw commands to the robot)
     * - systemMessage (send text messages to the robot for display)
     */

    /**
     * === Robot to Client Communication ===
     * We provide a set of methods to allow a robot host to send
     * messages about robot status back to the client
     */

    setAnalogInput(port, value) {
        throw new Error("Abstract 'setAnalogInput()' called!");
    }

    setDigitalInput(port, val) {
        throw new Error("Abstract 'setDigitalInput()' called!");
    }

    sendStatus(type, msg) {
        throw new Error("Abstract 'sendStatus()' called");
    }

    /**
     * Send a raw buffer to the client
     * @param {Buffer} buf 
     */
    sendRaw(buf) {
        throw new Error("Abstract 'sendRaw()' called");
    }
}

module.exports = FTLCommsProtocol;