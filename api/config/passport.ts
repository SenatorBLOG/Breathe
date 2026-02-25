import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User'; // 

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!; //  full flow
const JWT_SECRET = process.env.JWT_SECRET!;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Вариант проще: верифицируем id_token от фронта
export const googleAuth = async (req: { body: { credential: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): void; new(): any; }; }; json: (arg0: { token: any; }) => void; }) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'No credential' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid token');

    const { email, name, picture, sub: googleId } = payload;

    // Search and create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        googleId,
        name, // for name
        picture,
      });
      await user.save();
    }

    // gen JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Google auth failed' });
  }
};