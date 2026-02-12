export enum AuthProvider {
  EMAIL = 'email',
  KAKAO = 'kakao',
  GOOGLE = 'google',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  WITHDRAWN = 'withdrawn',
}

export enum AdminStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
}

export enum PublishStatus {
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
}

export enum RecruitStatus {
  UPCOMING = 'upcoming',
  RECRUITING = 'recruiting',
  CLOSED = 'closed',
}

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  FIRST_PASS = 'first_pass',
  FINAL_PASS = 'final_pass',
  REJECTED = 'rejected',
}

export enum ParticipationStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  PERIOD_ENDED = 'period_ended',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}
