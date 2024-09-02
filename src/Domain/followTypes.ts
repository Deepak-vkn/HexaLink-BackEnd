import { ObjectId } from 'mongoose';

export interface FollowStatus {
  id: ObjectId;
  followTime: Date;
  status: 'requested' | 'approved';
}

export interface Follow {
  following: FollowStatus[];
  followers: FollowStatus[];
  userId: ObjectId | null;
}
