"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageTypeException = void 0;
const common_1 = require("@nestjs/common");
class PageTypeException extends common_1.BadRequestException {
    constructor() {
        super('error.pageType');
    }
}
exports.PageTypeException = PageTypeException;
//# sourceMappingURL=page-type.exception.js.map