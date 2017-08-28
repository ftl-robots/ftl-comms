const ProtocolInterface = require('../comm-proto-iface');
const net = require('net');

const DEFAULT_PORT = 6969;

/**
 * An implementation of a direct TCP FTL Connection
 * 
 * Commands:
 * D:<port>:<value>\n - Digital I/O
 * A:<port>:<value>\n - Analog I/O
 * P:<port>:<value>\n - PWM I/O
 * S:<message>\n - System Message
 * RC:<message>\n - RobotCommand
 * RC:EN\n - Enable Robot (Unlock speed controllers etc)
 * RC:DS\n - Disable robot (lock speed controllers)
 */
class FTLSimpleProtocol extends ProtocolInterface {
    constructor(port) {
        super('FTLSimpleProtocol');
        if (port === undefined) {
            port = DEFAULT_PORT;
        }

        this.d_port = port;

        this.d_clients = [];
        this.d_socket = net.createServer((socket) => {
            this.d_clients.push(socket);
            socket.setNoDelay(true);

            // Set up the socket events
            socket.on('data', this._processMessage.bind(this));

            socket.on('end', () => {
                this.d_clients.splice(this.d_clients.indexOf(socket), 1);
            });

            socket.on('error', () => {
                this.d_clients.splice(this.d_clients.indexOf(socket), 1);
            });
        });
    }

    get port() {
        return this.d_port;
    }

    start() {
        this.d_socket.listen(this.d_port);
    }

    stop() {
        this.d_socket.close();
    }

    setAnalogInput(port, value) {
        this.broadcast('A:' + channel + ':' + value.toString());
    }

    setDigitalInput(port, value) {
        this._broadcast('D:' + channel + ':' + (!!value ? '1':'0'));
    }

    sendStatus(type, msg) {
        this._broadcast('S:' + type + ': ' + msg);
    }

    sendRaw(buf) {
        // Do nothing, or we could base 64 encode the buffer
    }

    // Private
    _processMessage(message) {
        var messages = message.toString().trim().split(/\r?\n/);
        var channel;

        for (var i = 0; i < messages.length; i++) {
            var msg = messages[i];
            msg = msg.trim();
            var messageParts = msg.split(':');
        
            switch (messageParts[0]) {
                case 'D': {
                    if (messageParts.length < 3) {
                        console.log('Invalid Message: ' + msg);
                        continue;
                    }
                    channel = parseInt(messageParts[1], 10);
                    var dValue = (messageParts[2] === '1' ? true:false);
                    this.emit('digitalOutput', channel, dValue);
                } break;
                case 'A': {
                    if (messageParts.length < 3) {
                        console.log('Invalid Message: ' + msg);
                        continue;
                    }
                    channel = parseInt(messageParts[1], 10);
                    var aValue = parseFloat(messageParts[2]);
                    this.emit('analogOutput', channel, aValue);
                } break;
                case 'P': {
                    if (messageParts.length < 3) {
                        console.log('Invalid Message: ' + msg);
                        continue;
                    }
                    channel = parseInt(messageParts[1], 10);
                    var pValue = parseFloat(messageParts[2]);
                    // pValue => [0, 255]
                    this.emit('pwmOutput', channel, pValue);
                } break;
                case 'S': {
                    // System message
                    var sysMessage = messageParts.slice(1).join(':');
                    this.emit('sysMessage', sysMessage);
                } break;
                case 'RC': {
                    // RobotCommand
                    if (messageParts.length < 2) {
                        console.log('Invalid Message: ' + msg);
                        continue;
                    }

                    if (messageParts[1] === 'EN') {
                        this.emit('enableRobot');
                    }
                    else if (messageParts[1] === 'DS') {
                        this.emit('disableRobot');
                    }
                    else {
                        this.emit('robotCommand', messageParts.slice(1).join(':'));
                    }
                } break;
                default: {
                    console.log('Unknown Message: ' + msg);
                }
            }
        }
    }

    _broadcast(message) {
        if (this.d_clients[0]) {
            this.d_clients[0].write(message + '\n');
        }
    }
}

module.exports = FTLSimpleProtocol;