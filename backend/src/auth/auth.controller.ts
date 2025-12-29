import { Controller, Post, Body, UseGuards, Req, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) { }

    @Post('login')
    async login(@Body('token') token: string) {
        if (!token) {
            throw new UnauthorizedException('Token is required');
        }

        // Verify token
        const decodedToken = await this.authService.verifyToken(token);

        // Create or update user
        const { email, name, picture } = decodedToken;
        console.log('Login attempt for:', email);

        if (!email) {
            throw new UnauthorizedException('Email not found in token');
        }

        try {
            const user = await this.userService.findOrCreateUser(decodedToken.uid, email, name || 'User', picture);
            return {
                message: 'Login successful',
                user,
            };
        } catch (error) {
            console.error('User creation failed:', error);
            throw error;
        }
    }
}
