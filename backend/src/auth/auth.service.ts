import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService implements OnModuleInit {
    onModuleInit() {
        if (!admin.apps.length) {
            const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account.json';
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const serviceAccount = require(require('path').resolve(process.cwd(), serviceAccountPath));

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
