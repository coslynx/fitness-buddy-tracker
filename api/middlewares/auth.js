import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.id || !decoded.username || !decoded.email) {
          return res.status(401).json({ message: 'Invalid token' });
       }


    req.user = {
      id: decoded.id,
      username: decoded.username,
        email: decoded.email
    };


    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

export { authMiddleware };
/*
Test case suggestions:

  1. Valid Token:
    - Input: Valid token in the Authorization header.
    - Expected: `req.user` should be populated, and `next()` should be called.

  2. Missing Token:
    - Input: No Authorization header.
    - Expected: Respond with 401 status and JSON: `{ message: 'Unauthorized' }`.

  3. Invalid Token Format:
     - Input: Authorization header without 'Bearer ' prefix
     - Expected: Respond with 401 status and JSON: `{ message: 'Unauthorized' }`.

  4. Invalid Token:
    - Input: Invalid token format.
    - Expected: Respond with 401 status and JSON: `{ message: 'Invalid token' }`.
    
  5. Expired Token:
    - Input: Expired Token.
    - Expected: Respond with 401 status and JSON: `{ message: 'Invalid token' }`.

  6. Token with missing payload
    - Input: Token with missing id, username or email properties.
    - Expected: Respond with 401 status and JSON: `{ message: 'Invalid token' }`

   7. Unexpected Error:
      - Input: Any unexpected error during token verification.
      - Expected: Respond with 500 status and JSON: `{ message: 'Server error during authentication' }`, and log the error.
*/