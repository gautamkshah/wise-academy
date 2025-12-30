import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService implements OnModuleInit {
    onModuleInit() {
        if (!admin.apps.length) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const path = require('path');
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const fs = require('fs');

            let serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

            if (!serviceAccountPath) {
                if (fs.existsSync('/etc/secrets/service-account.json')) {
                    serviceAccountPath = '/etc/secrets/service-account.json';
                } else {
                    serviceAccountPath = './service-account.json';
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
        }
    }

    async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
        try {
            const decoded = await admin.auth().verifyIdToken(token);
            return decoded;
        } catch (error) {
            console.error('Firebase Token Verification Failed:', error);
            throw new UnauthorizedException('Invalid or expired token', { cause: error });
        }
    }
}
