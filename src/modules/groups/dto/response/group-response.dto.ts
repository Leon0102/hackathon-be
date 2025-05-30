import { Expose, Transform, Type } from 'class-transformer';
import { UserResponseDto } from '../../../users/dto/response/user-response.dto';

export class GroupResponseDto {
    @Expose()
    @Transform(({ obj, key }) => {
        if (obj._id) return obj._id.toString();
        if (obj.id) return obj.id.toString();
        return obj[key]?.toString();
    })
    id: string;

    @Expose()
    name: string;

    @Expose()
    @Type(() => UserResponseDto)
    owner: UserResponseDto;

    @Expose()
    @Type(() => UserResponseDto)
    members: UserResponseDto[];

    @Expose()
    @Transform(({ value }) => value?.toString())
    trip: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}
