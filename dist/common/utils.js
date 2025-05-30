"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUrlValid = exports.getVariableName = exports.validateHash = exports.generateHash = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
function generateHash(password) {
    return bcrypt_1.default.hashSync(password, 10);
}
exports.generateHash = generateHash;
function validateHash(password, hash) {
    if (!password || !hash) {
        return Promise.resolve(false);
    }
    return bcrypt_1.default.compare(password, hash);
}
exports.validateHash = validateHash;
function getVariableName(getVar) {
    const m = /\(\)=>(.*)/.exec(getVar.toString().replace(/(\r\n|\n|\r|\s)/gm, ''));
    if (!m) {
        throw new Error("The function does not contain a statement matching 'return variableName;'");
    }
    const fullMemberName = m[1];
    const memberParts = fullMemberName.split('.');
    return memberParts[memberParts.length - 1];
}
exports.getVariableName = getVariableName;
function isUrlValid(url) {
    const res = url.match(/^https?:\/\/.+\.([^/]+)\/.*/);
    return res == null ? false : true;
}
exports.isUrlValid = isUrlValid;
//# sourceMappingURL=utils.js.map