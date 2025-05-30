import { IsString } from 'class-validator';

export class RecommendGroupsDto {
    @IsString()
    keyword: string;
}
