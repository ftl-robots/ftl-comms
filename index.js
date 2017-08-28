const Interface = require('./interfaces/comm-proto-iface');
const SimpleProto = require('./interfaces/builtin/simple-proto');

module.exports = {
    ProtocolInterface: Interface,
    StandardProtocols: {
        FTLSimpleProtocol: SimpleProto
    }
};