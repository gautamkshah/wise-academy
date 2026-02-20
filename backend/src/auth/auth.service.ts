import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService implements OnModuleInit {
    onModuleInit() {
        if (!admin.apps.length) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const path = require('path');
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const fs = require('fs');

                let serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

                if (!serviceAccountPath) {
                    if (fs.existsSync('/etc/secrets/service-account.json')) {
                        serviceAccountPath = '/etc/secrets/service-account.json';
                    } else if (fs.existsSync('./service-account.json')) { // Check if file exists in root
                        serviceAccountPath = './service-account.json';
                    } else if (fs.existsSync('../service-account.json')) { // Check parent
                        serviceAccountPath = '../service-account.json';
                    } else {
                        console.warn('[AuthService] No service-account.json found. Auth will not work.');
                        return;
                    }
                }

                const resolvedPath = path.isAbsolute(serviceAccountPath)
                    ? serviceAccountPath
                    : path.resolve(process.cwd(), serviceAccountPath);

                console.log(`[AuthService] Loading Firebase credentials from: ${resolvedPath}`);

                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const serviceAccount = require(resolvedPath);

                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
            } catch (error) {
                console.error('[AuthService] Failed to initialize Firebase Admin:', error);
            }
        }
    }

    async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
        console.log('[AuthService] verifyToken called. Admin apps length:', admin.apps.length);

        if (!admin.apps.length) {
            console.warn('[AuthService] Firebase Admin not initialized. Bypassing token verification for DEV.');
            const parts = token.split('.');
            if (parts.length === 3) {
                try {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                    return {
                        uid: payload.user_id || payload.sub,
                        email: payload.email,
                        name: payload.name,
                        picture: payload.picture,
                        ...payload
                    } as admin.auth.DecodedIdToken;
                } catch (e) {
                    console.error('[AuthService] Token parse failed:', e);
                    throw new UnauthorizedException('Invalid token format (Dev Bypass)');
                }
            }
        }

        try {
            console.log('[AuthService] Attempting real verification...');
            const decoded = await admin.auth().verifyIdToken(token);
            return decoded;
        } catch (error) {
            console.error('Firebase Token Verification Failed:', error);
            throw new UnauthorizedException('Invalid or expired token', { cause: error });
        }
    }
}
