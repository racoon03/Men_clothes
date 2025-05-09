import { UserResponse } from './user.response';
export interface UserListResponse {
    users: UserResponse[];
    total_pages: number;
}