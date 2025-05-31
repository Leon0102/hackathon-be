"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const openai_1 = require("openai");
const users_schema_1 = require("../users/schema/users.schema");
const trips_schema_1 = require("../trips/schema/trips.schema");
const group_schema_1 = require("./schema/group.schema");
let GroupsService = class GroupsService {
    constructor(groupModel, userModel, tripsModel) {
        this.groupModel = groupModel;
        this.userModel = userModel;
        this.tripsModel = tripsModel;
        const apiKey = process.env.AZURE_OPENAI_KEY;
        const endpoint = `https://${process.env.AZURE_OPENAI_RESOURCE_NAME}.openai.azure.com`;
        const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
        const apiVersion = '2024-10-21';
        if (!apiKey || !process.env.AZURE_OPENAI_RESOURCE_NAME || !deployment) {
            throw new Error('Azure OpenAI configuration is missing. Please check AZURE_OPENAI_KEY, AZURE_OPENAI_RESOURCE_NAME, and AZURE_OPENAI_DEPLOYMENT_NAME environment variables.');
        }
        this.openai = new openai_1.AzureOpenAI({
            apiKey,
            endpoint,
            deployment,
            apiVersion
        });
    }
    async getMyGroups(userId) {
        return this.groupModel.find({ members: new mongoose_2.Types.ObjectId(userId) }).exec();
    }
    async getGroupById(groupId) {
        const group = await this.groupModel.findById(groupId).exec();
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        return group;
    }
    async recommendGroups(userId, dto) {
        var _a, _b;
        const userGroups = await this.groupModel.find({ members: new mongoose_2.Types.ObjectId(userId) }).exec();
        const excludedGroupIds = userGroups.map((g) => g._id.toString());
        const candidates = await this.groupModel
            .find({ _id: { $nin: excludedGroupIds } })
            .populate('owner', 'fullName email profilePictureUrl')
            .populate('trip', 'destination startDate endDate')
            .exec();
        const profiles = candidates
            .map((g) => {
            var _a, _b, _c;
            const trip = g.trip;
            return `ID: ${g._id}, Name: ${g.name}, Destination: ${(_a = trip === null || trip === void 0 ? void 0 : trip.destination) !== null && _a !== void 0 ? _a : 'N/A'}, Owner: ${(_c = (_b = g.owner) === null || _b === void 0 ? void 0 : _b.fullName) !== null && _c !== void 0 ? _c : 'Unknown'}`;
        })
            .join('\n');
        const prompt = `Recommend up to 10 group IDs best matching keyword "${dto.keyword}" from the groups list:\n${profiles}`;
        try {
            const completion = await this.openai.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: '',
                max_tokens: 256
            });
            let recommendedIds = [];
            try {
                const responseContent = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
                if (responseContent) {
                    recommendedIds = JSON.parse(responseContent);
                }
            }
            catch (_c) {
                const keywordLower = dto.keyword.toLowerCase();
                recommendedIds = candidates
                    .filter((g) => {
                    var _a;
                    const trip = g.trip;
                    return (g.name.toLowerCase().includes(keywordLower) ||
                        ((_a = trip === null || trip === void 0 ? void 0 : trip.destination) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(keywordLower)));
                })
                    .map((g) => { var _a, _b; return (_b = (_a = g._id) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ''; });
            }
            let recommended = candidates.filter((g) => { var _a, _b; return recommendedIds.includes((_b = (_a = g._id) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ''); });
            if (recommended.length === 0) {
                recommended = candidates.slice(0, 10);
            }
            return recommended.slice(0, 10);
        }
        catch (error) {
            console.error('Azure OpenAI API error:', error);
            const keywordLower = dto.keyword.toLowerCase();
            const recommended = candidates
                .filter((g) => {
                var _a;
                const trip = g.trip;
                return (g.name.toLowerCase().includes(keywordLower) ||
                    ((_a = trip === null || trip === void 0 ? void 0 : trip.destination) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(keywordLower)));
            })
                .slice(0, 10);
            if (recommended.length === 0) {
                return candidates.slice(0, 10);
            }
            return recommended;
        }
    }
    async searchGroupsForRecommendations(keyword, excludeUserId, userPatterns, limit = 20) {
        try {
            const userGroups = await this.groupModel
                .find({ members: new mongoose_2.Types.ObjectId(excludeUserId) })
                .select('_id')
                .lean()
                .exec();
            const excludedGroupIds = userGroups.map((g) => g._id.toString());
            const searchQuery = {
                _id: { $nin: excludedGroupIds }
            };
            if (keyword === null || keyword === void 0 ? void 0 : keyword.trim()) {
                const keywordRegex = new RegExp(keyword.trim(), 'i');
                searchQuery.$or = [
                    { name: keywordRegex }
                ];
            }
            const groups = await this.groupModel
                .find(searchQuery)
                .populate('owner', 'fullName email profilePictureUrl')
                .populate('trip', 'destination startDate endDate')
                .select('name maxParticipants members')
                .limit(limit)
                .lean()
                .exec();
            return groups.map(group => (Object.assign(Object.assign({}, group), { memberCount: Array.isArray(group.members) ? group.members.length : 0, isPublic: true, tags: [], lastActivityAt: new Date() })));
        }
        catch (error) {
            console.error('Error searching groups for recommendations:', error);
            return [];
        }
    }
};
GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(group_schema_1.Group.name)),
    __param(1, (0, mongoose_1.InjectModel)(users_schema_1.Users.name)),
    __param(2, (0, mongoose_1.InjectModel)(trips_schema_1.Trips.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], GroupsService);
exports.GroupsService = GroupsService;
//# sourceMappingURL=groups.service.js.map