import { IsEnum } from 'class-validator';
import { MemberStatus } from '../../../../constants';

export class UpdateMemberStatusDto {
    @IsEnum(MemberStatus)
    status: MemberStatus;
}
