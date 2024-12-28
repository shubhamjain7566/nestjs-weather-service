import { SetMetadata } from '@nestjs/common';

export const RateLimit = (points: number, duration: number) =>
  SetMetadata('rateLimit', { points, duration });
