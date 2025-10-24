import 'dotenv/config';
import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});

export function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid as string, (err, key) => {
    if (err) return callback(err as any);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export async function verifyToken(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
        algorithms: ['RS256'],
        ignoreExpiration: false,
      },
      (err, decoded: any) => {
        if (err) return reject(err);

        // Cognito adds token_use = "id" or "access"
        if (!decoded.token_use) return reject(new Error('Invalid token: missing token_use'));

        const expectedClientId = process.env.COGNITO_APP_CLIENT_ID;

        if (decoded.token_use === 'id') {
          // For ID tokens, check the audience claim
          if (decoded.aud !== expectedClientId)
            return reject(new Error(`Invalid audience: ${decoded.aud}`));
        } else if (decoded.token_use === 'access') {
          // For Access tokens, check the client_id claim
          if (decoded.client_id !== expectedClientId)
            return reject(new Error(`Invalid client_id: ${decoded.client_id}`));
        } else {
          return reject(new Error(`Unknown token_use: ${decoded.token_use}`));
        }

        resolve(decoded);
      }
    );
  });
}


// export async function verifyToken(token: string): Promise<any> {
//   return new Promise((resolve, reject) => {
//     console.log('[verifyToken] Step 1: Starting token verification');

//     console.log('[verifyToken] Step 2: Token received:', token);

//     try {
//       jwt.verify(
//         token,
//         getKey,
//         {
//           issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
//           algorithms: ['RS256'],
//           ignoreExpiration: false,
//         },
//         (err, decoded: any) => {
//           console.log('[verifyToken] Step 3: JWT verify callback triggered');

//           if (err) {
//             console.error('[verifyToken] Step 4: JWT verification failed:', err.message, {
//               name: err.name,
//               stack: err.stack,
//             });
//             return reject(err);
//           }

//           console.log('[verifyToken] Step 5: Token successfully decoded:', decoded);

//           if (!decoded.token_use) {
//             console.error('[verifyToken] Step 6: Invalid token: missing token_use', decoded);
//             return reject(new Error('Invalid token: missing token_use'));
//           }

//           const expectedClientId = process.env.COGNITO_APP_CLIENT_ID;
//           console.log('[verifyToken] Step 7: Expected client ID:', expectedClientId);

//           if (decoded.token_use === 'id') {
//             console.log('[verifyToken] Step 8: token_use is "id"');
//             if (decoded.aud !== expectedClientId) {
//               console.error('[verifyToken] Step 9: Invalid audience', {
//                 expected: expectedClientId,
//                 received: decoded.aud,
//               });
//               return reject(new Error(`Invalid audience: ${decoded.aud}`));
//             } else {
//               console.log('[verifyToken] Step 10: Audience matches expected client ID');
//             }
//           } else if (decoded.token_use === 'access') {
//             console.log('[verifyToken] Step 11: token_use is "access"');
//             if (decoded.client_id !== expectedClientId) {
//               console.error('[verifyToken] Step 12: Invalid client_id', {
//                 expected: expectedClientId,
//                 received: decoded.client_id,
//               });
//               return reject(new Error(`Invalid client_id: ${decoded.client_id}`));
//             } else {
//               console.log('[verifyToken] Step 13: client_id matches expected client ID');
//             }
//           } else {
//             console.error('[verifyToken] Step 14: Unknown token_use', decoded.token_use);
//             return reject(new Error(`Unknown token_use: ${decoded.token_use}`));
//           }

//           console.log('[verifyToken] Step 15: Token verification successful, resolving promise');
//           resolve(decoded);
//         }
//       );
//     } catch (error) {
//       console.error('[verifyToken] Step 16: Unexpected error during verification', error);
//       reject(error);
//     }
//   });
// }
