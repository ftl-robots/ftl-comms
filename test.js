const Proto = require('./interfaces/comm-proto-iface');

var test = new Proto();

test.on('digitalOutput', (port, value) => {
    console.log('Received digital input for port ', port, ' and value ', value);
});

test.on('pwmOutput', (port, value) => {
    console.log('Received pwm input for port ', port, ' and value ', value);
});

test.on('robotCommand', (cmd) => {
    console.log('Received command: ', cmd);
});

test.on('systemMessge', (msg) => {
    console.log('Received Message: ', msg);
});

test.emit('digitalOutput', 1, true);