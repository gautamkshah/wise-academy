import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { UserService } from '../user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private userService: UserService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // 'user' here is the result of AuthGuard (DecodedIdToken from Firebase)
        if (!user || !user.uid) {
            return false;
        }

        // Fetch user from DB to check role
        const dbUser = await this.userService.findByUid(user.uid);
        if (!dbUser) {
            throw new ForbiddenException('User not found in database');
        }

        const hasRole = requiredRoles.some((role) => dbUser.role === role);
        if (!hasRole) {
            throw new ForbiddenException('Insufficient permissions');
        }

        // Optionally attach dbUser to request for further use
        request.dbUser = dbUser;

        return true;
    }
}
