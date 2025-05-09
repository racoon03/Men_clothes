import { UserResponse } from "../components/responses/user/user.response";

export interface Comment {
  content: string;
  user: UserResponse;
  updated_at: any;
}