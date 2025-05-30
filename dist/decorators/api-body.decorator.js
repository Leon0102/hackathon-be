"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiBodyWithFile = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
function ApiBodyWithFile(dto, description) {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiConsumes)('multipart/form-data'), (0, swagger_1.ApiBody)({
        description,
        schema: {
            allOf: [
                {
                    $ref: (0, swagger_1.getSchemaPath)(dto),
                    nullable: true
                },
                {
                    properties: {
                        file: {
                            type: 'string',
                            format: 'binary'
                        }
                    }
                }
            ]
        }
    }), (0, swagger_1.ApiExtraModels)(dto));
}
exports.ApiBodyWithFile = ApiBodyWithFile;
//# sourceMappingURL=api-body.decorator.js.map