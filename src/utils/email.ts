// src/utils/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'no-reply@xarwix.com';
const BASE_URL = process.env.FRONTEND_URL || 'https://www.xarwix.com';

export const sendVerificationEmail = async (email: string, token: string) => {
  const link = `${BASE_URL}/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your Xarwix email',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Welcome to Xarwix!</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${link}" style="display:inline-block;padding:12px 28px;background:#1d4ed8;color:#fff;border-radius:12px;text-decoration:none;font-weight:600">
          Verify Email
        </a>
        <p style="margin-top:20px;color:#64748b;font-size:13px">Link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const link = `${BASE_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your Xarwix password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Reset your password</h2>
        <p>Click the button below to set a new password. This link expires in 1 hour.</p>
        <a href="${link}" style="display:inline-block;padding:12px 28px;background:#1d4ed8;color:#fff;border-radius:12px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="margin-top:20px;color:#64748b;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};