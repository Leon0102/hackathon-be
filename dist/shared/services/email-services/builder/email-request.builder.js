"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailRequestBuilder = void 0;
class EmailRequestBuilder {
    constructor() {
        this.request = {};
    }
    setDestination(email) {
        this.request.Destination = { ToAddresses: email };
        return this;
    }
    setBBCDestination(email) {
        this.request.Destination = { BccAddresses: email };
        return this;
    }
    setMessage(message) {
        var _a;
        if (this.request.Message === undefined) {
            this.request.Message = {};
        }
        this.request.Message.Body = {
            Html: { Charset: (_a = message.charset) !== null && _a !== void 0 ? _a : 'utf8', Data: message.data }
        };
        return this;
    }
    setSubject(subject) {
        var _a;
        if (this.request.Message === undefined) {
            this.request.Message = {};
        }
        const embedded = Object.assign(this.request.Message, {
            Subject: {
                Charset: (_a = subject.charset) !== null && _a !== void 0 ? _a : 'utf8',
                Data: subject.data
            }
        });
        this.request.Message = embedded;
        return this;
    }
    setSource(source) {
        this.request.Source = source;
        return this;
    }
    build(data, bbc) {
        const builder = new EmailRequestBuilder();
        if (data.email && bbc) {
            builder.setBBCDestination(data.email);
        }
        if (data.email && !bbc) {
            builder.setDestination(data.email);
        }
        if (data.message) {
            builder.setMessage(data.message);
        }
        if (data.subject) {
            builder.setSubject(data.subject);
        }
        if (data.source) {
            builder.setSource(data.source);
        }
        return builder.request;
    }
}
exports.EmailRequestBuilder = EmailRequestBuilder;
//# sourceMappingURL=email-request.builder.js.map