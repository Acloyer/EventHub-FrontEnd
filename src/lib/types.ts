// src/lib/types.ts

export interface Event {
  Id: number
  Title: string
  Description: string
  StartDate: string
  EndDate: string
  Category: string
  Location: string
  MaxParticipants: number
  OrganizerEmail: string
  OrganizerName: string
  CreatorId: number
  CreatorRoles?: string[]
  FavoritedBy?: number[]
  GoingUsers?: number[]
  IsFavorite: boolean
  IsPlanned: boolean
  CommentsCount?: number
  ReactionsCount?: number
}

export interface UserDto {
  id: number
  name: string
  email?: string
  roles?: string[]
}

export interface User {
  Id: number
  Email: string
  Name: string
  Roles: string[]
  TelegramId?: number
  IsTelegramVerified: boolean
  NotifyBeforeEvent: boolean
  IsBanned?: boolean
  IsMuted?: boolean
  MuteExpiresAt?: string
}

export interface Role {
  Id: number
  Name: string
  userCount?: number
}

export interface FavoriteEvent {
  Id: number
  UserId: number
  EventId: number
  event?: Event
}

export interface PlannedEvent {
  Id: number
  UserId: number
  EventId: number
  event?: Event
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  name: string
}

export interface EventCreateDto {
  title: string
  description: string
  startDate: string
  endDate: string
  category: string
  location: string
  maxParticipants: number
  organizerName?: string
  organizerEmail?: string
}

export interface EventDto {
  Id?: number
  Title: string
  Description: string
  StartDate: string
  EndDate: string
  Category: string
  Location: string
  MaxParticipants: number
  IsFavorite?: boolean
  IsPlanned?: boolean
  OrganizerEmail: string
  OrganizerName: string
  CreatorId: number
  CommentsCount: number
}

export interface AuthResponse {
  Token: string
  User: User
}

export interface UserProfileDto {
  Id: number
  Email: string
  Name: string
  Roles: string[]
  TelegramId?: number
  IsTelegramVerified: boolean
  NotifyBeforeEvent: boolean
  IsBanned?: boolean
}

export interface ProfileUpdateDto {
  email?: string
  name?: string
  telegramId?: number
  notifyBeforeEvent?: boolean
}

export interface UserUpdateDto {
  Id: number
  Email: string
  Name: string
  Roles: string[]
}

export interface NotificationSettings {
  notifyBeforeEvent: boolean
}

export interface CommentDto {
  Id?: number
  EventId: number
  UserId: number
  ParentCommentId?: number
  Comment: string
  PostDate: string
  IsEdited: boolean
  EditDate?: string
  IsPinned: boolean
  User?: User
  ChildComments?: CommentDto[]
}

export interface CreateCommentDto {
  Comment: string
}

export interface UpdateCommentDto {
  Comment: string
}

export interface ReactionDto {
  Id?: number
  EventId: number
  UserId: number
  Emoji: string
  User?: User
}

export interface TelegramLinkDto {
  LinkUrl: string
}

export interface ConfirmTelegramCodeDto {
  Code: number
}

export interface MuteDto {
  IsMuted: boolean
}

export interface MuteDurationDto {
  Seconds: number
  Minutes: number
  Hours: number
}

export interface BanDto {
  IsBanned: boolean
  Reason?: string
}

export interface BanDurationDto {
  Seconds: number
  Minutes: number
  Hours: number
  Reason?: string
}

export interface NotificationDto {
  Id: number
  UserId: number
  Type: 'comment' | 'reaction' | 'event'
  Message: string
  IsRead: boolean
  CreatedAt: string
  ReferenceId: number
}

export interface PaginatedResponse<T> {
  Items: T[]
  TotalCount: number
  PageNumber: number
  PageSize: number
  TotalPages: number
}

export interface EventFilterDto {
  SearchTerm?: string
  Category?: string
  StartDate?: string
  EndDate?: string
  PageNumber?: number
  PageSize?: number
}

export interface UserFilterDto {
  SearchTerm?: string
  Role?: string
  IsBanned?: boolean
  IsMuted?: boolean
  PageNumber?: number
  PageSize?: number
}

export interface CommentFilterDto {
  EventId?: number
  UserId?: number
  IsPinned?: boolean
  ParentCommentId?: number
  PageNumber?: number
  PageSize?: number
}

export interface TransferOwnershipRequestDto {
  NewOwnerId: number
}

export interface TransferOwnershipDto {
  NewOwnerId: number
  VerificationCode: string
}

export interface TransferOwnershipResponseDto {
  Success: boolean
  Message: string
  VerificationCode: string
}

export interface ActivityLog {
  Id: number
  UserId: number
  UserName: string
  UserEmail: string
  Action: string
  EntityType: string
  EntityId?: number
  Details: string
  IpAddress: string
  UserAgent: string
  Timestamp: string
}

export interface ActivityLogFilterDto {
  Action?: string
  EntityType?: string
  UserId?: number
  StartDate?: string
  EndDate?: string
  PageNumber?: number
  PageSize?: number
}

export interface ActivitySummary {
  Summary: Array<{
    Action: string
    EntityType: string
    Count: number
    LastOccurrence: string
  }>
  TopUsers: Array<{
    UserId: number
    ActionCount: number
    LastActivity: string
  }>
}

export interface OrganizerBlacklistDto {
  Id: number
  OrganizerId: number
  BannedUserId: number
  CreatedAt: string
  Reason?: string
  OrganizerName: string
  BannedUserName: string
  BannedUserEmail: string
}

export interface CreateBlacklistEntryDto {
  BannedUserId: number
  Reason?: string
}

export interface RemoveBlacklistEntryDto {
  BannedUserId: number
}

export interface AssignRolesDto {
  Roles: string[]
}
