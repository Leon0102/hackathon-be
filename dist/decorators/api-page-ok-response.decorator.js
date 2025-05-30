"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiPageOkResponse = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const page_dto_1 = require("../common/dto/page.dto");
function ApiPageOkResponse(options) {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiExtraModels)(page_dto_1.PageDto), (0, swagger_1.ApiExtraModels)(options.type), (0, swagger_1.ApiOkResponse)({
        description: options.description,
        schema: {
            allOf: [
                {
                    properties: {
                        status: {
                            type: 'number',
                            example: 200
                        }
                    }
                },
                { $ref: (0, swagger_1.getSchemaPath)(page_dto_1.PageDto) },
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: (0, swagger_1.getSchemaPath)(options.type) }
                        }
                    }
                }
            ]
        }
    }));
}
exports.ApiPageOkResponse = ApiPageOkResponse;
//# sourceMappingURL=api-page-ok-response.decorator.js.map