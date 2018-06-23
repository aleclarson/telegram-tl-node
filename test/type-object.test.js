require('should');

var TypeObject = require('../lib/type-object');

describe('TypeObject', function () {

    describe('#init()', function () {
        it('should create a TypeObject instance', function (done) {
            var obj = new TypeObject();
            obj.should.be.ok;
            done();
        })
    });

    describe('#retrieveBuffer()', function () {
        it('should retrieve the buffer and put object in readonly', function (done) {
            var obj = new TypeObject();
            obj.isReadonly().should.be.false;
            obj.retrieveBuffer();
            obj.isReadonly().should.be.true;
            done();
        })
    });

    describe('#writeInt()', function () {
        it('should write an int value', function (done) {
            var obj = new TypeObject();
            obj.writeInt(0x80a0c0e0).should.be.true;
            var bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(4);
            bytes.should.be.eql(new Buffer([0xe0, 0xc0, 0xa0, 0x80]));
            obj.writeInt(0).should.be.false;

            obj = new TypeObject();
            obj.writeInt(-2).should.be.true;
            bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(4);
            bytes.should.be.eql(new Buffer([254, 255, 255, 255]));
            done();
        })
    });

    describe('#writeDouble()', function () {
        it('should write a double value', function (done) {
            var obj = new TypeObject();
            obj.writeDouble(0xdeadbeefcafebabe).should.be.true;
            var bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(8);
            bytes.should.be.eql(new Buffer([0xd7, 0x5f, 0xf9, 0xdd, 0xb7, 0xd5, 0xeb, 0x43]));
            obj.writeDouble(0).should.be.false;
            done();
        })
    });

    describe('#_writeBigInt()', function () {
        it('should write a big int value', function (done) {
            var obj = new TypeObject();
            obj._writeBigInt('1', 4).should.be.true;
            var bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(4);
            bytes.should.be.eql(new Buffer([1, 0, 0, 0]));

            obj = new TypeObject();
            obj._writeBigInt('1', 8).should.be.true;
            var bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(8);
            bytes.should.be.eql(new Buffer([1, 0, 0, 0, 0, 0, 0, 0]));

            obj = new TypeObject();
            obj._writeBigInt(1, 4).should.be.true;
            bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(4);
            bytes.toString('hex').should.be.eql('01000000');

            obj = new TypeObject();
            obj._writeBigInt('0x01', 4).should.be.true;
            bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(4);
            bytes.toString('hex').should.be.eql('01000000');

            obj = new TypeObject();
            obj._writeBigInt('0xee000000ff', 4).should.be.true;
            bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(4);
            bytes.toString('hex').should.be.eql('ff000000');

            obj = new TypeObject();
            obj._writeBigInt('1022202216703' /*'0xee000000ff'*/, 4).should.be.true;
            bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(4);
            bytes.toString('hex').should.be.eql('ff000000');

            obj = new TypeObject();
            obj._writeBigInt('18441921394529845472', 8).should.be.true;
            bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(8);
            bytes.toString('hex').should.be.eql('e0c0a080ccddeeff');

            obj = new TypeObject();
            obj._writeBigInt('0xffeeddcc80a0c0e0', 8).should.be.true;
            bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(8);
            bytes.toString('hex').should.be.eql('e0c0a080ccddeeff');
            done();
        })
    });

    describe('#writeInt256', function () {
        it('should write an  int256 value ', function (done) {
            var obj = new TypeObject();
            obj.writeInt256('0xffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100').should.be.true;
            var bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(32);
            bytes.toString('hex').should.be.eql('00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff');
            done();
        })
    });


    describe('#writeBytes()', function () {
        it('should write few bytes', function (done) {
            var obj = new TypeObject();
            obj.writeBytes(new Buffer('130c81d08c748257', 'hex')).should.be.true;
            var bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(12);
            bytes.toString('hex').should.be.eql('08130c81d08c748257000000');
            done();
        })
    });

    describe('#writeBytes()', function () {
        it('should write a lot of bytes', function (done) {
            var obj = new TypeObject();
            var buffer = new Buffer(605);
            buffer.fill(254);
            obj.writeBytes(buffer).should.be.true;
            var bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(612);
            done();
        })
    });
    describe('#writeString()', function () {
        it('should write a string', function (done) {
            var obj = new TypeObject();
            obj.writeString('Lorem ipsum dolor sit amet, consectetur adipisci elit, ' +
            'sed eiusmod tempor incidunt ut labore et dolore magna aliqua.').should.be.true;
            var bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(120);
            bytes.toString('hex').should.be.eql('744c6f72656d20697073756d20646f6c6f722073697420616d65742c20636f6' +
            'e736563746574757220616469706973636920656c69742c2073656420656975736d6f642074656d706f7220696e6369647' +
            '56e74207574206c61626f726520657420646f6c6f7265206d61676e6120616c697175612e000000');
            done();
        })
    });
    describe('#writeString()', function () {
        it('should write an  empty string', function (done) {
            var obj = new TypeObject();
            obj.writeString('').should.be.true;
            var bytes = obj.retrieveBuffer();
            bytes.length.should.be.equal(4);
            bytes.toString('hex').should.be.eql('00000000');
            done();
        })
    });

    describe('#readInt()', function () {
        it('should read an int value', function (done) {
            var obj = new TypeObject(new Buffer('feffffff', 'hex'));
            var intValue = obj.readInt();
            intValue.should.be.equal(4294967294);
            obj.getReadOffset().should.be.equal(4);
            done();
        })
    });

    describe('#readDouble()', function () {
        it('should read a double value', function (done) {
            var obj = new TypeObject(new Buffer('d75ff9ddb7d5eb43', 'hex'));
            var doubleValue = obj.readDouble();
            doubleValue.should.be.equal(0xdeadbeefcafebabe);
            obj.getReadOffset().should.be.equal(8);
            done();
        })
    });

    describe('#_readBigInt()', function () {
        it('should read a big int value', function (done) {
            var obj = new TypeObject(new Buffer('8899aabbccddeeff', 'hex'));
            var bigintValue = obj._readBigInt(8);
            bigintValue.should.be.equal('0xffeeddccbbaa9988');
            obj.getReadOffset().should.be.equal(8);
            done();
        })
    });

    describe('#readInt256()', function () {
        it('should read an int256 value', function (done) {
            var obj = new TypeObject(new Buffer('00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff', 'hex'));
            var intValue = obj.readInt256();
            intValue.should.be.eql('0xffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100');
            obj.getReadOffset().should.be.equal(32);
            done();
        })
    });


    describe('#readBytes()', function () {
        it('should read few bytes', function (done) {
            var obj = new TypeObject(new Buffer('08130c81d08c748257000000', 'hex'));
            var bytes = obj.readBytes();
            bytes.toString('hex').should.be.eql('130c81d08c748257');
            obj.getReadOffset().should.be.equal(12);
            done();
        })
    });

    describe('#readBytes()', function () {
        it('should read a lot of bytes', function (done) {
            var buffers = [];
            buffers.push(new Buffer('fe5d0200', 'hex'));
            var data = new Buffer(605);
            data.fill(254);
            buffers.push(data);
            var padding = new Buffer(3);
            padding.fill(0);
            buffers.push(padding);
            var buffer = Buffer.concat(buffers);
            var obj = new TypeObject(buffer);
            var bytes = obj.readBytes();
            bytes.length.should.be.equal(605);
            obj.getReadOffset().should.be.equal(612);
            done();
        })
    });

    describe('#readString()', function () {
        it('should read a string', function (done) {
            var obj = new TypeObject(new Buffer('744c6f72656d20697073756d20646f6c6f722073697420616d65742c20636f6' +
            'e736563746574757220616469706973636920656c69742c2073656420656975736d6f642074656d706f7220696e6369647' +
            '56e74207574206c61626f726520657420646f6c6f7265206d61676e6120616c697175612e000000', 'hex'));
            var str = obj.readString();
            str.should.be.eql('Lorem ipsum dolor sit amet, consectetur adipisci elit, ' +
            'sed eiusmod tempor incidunt ut labore et dolore magna aliqua.');
            done();
        })
    });

    describe('#readString()', function () {
        it('should read an empty string', function (done) {
            var obj = new TypeObject(new Buffer('00000000', 'hex'));
            var str = obj.readString();
            str.should.be.eql('');
            done();
        })
    });
});

