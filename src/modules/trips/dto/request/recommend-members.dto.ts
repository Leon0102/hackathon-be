import { IsString } from 'class-validator';

export class RecommendMembersDto {
  @IsString()
  keyword: string;
}
