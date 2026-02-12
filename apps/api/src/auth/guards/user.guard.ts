import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class UserGuard extends JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await super.canActivate(context);
    if (!result) return false;

    const request = context.switchToHttp().getRequest();
    if (request.user?.role !== 'user') {
      throw new UnauthorizedException('User access required');
    }
    return true;
  }
}
