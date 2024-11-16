import nodemailer from "nodemailer";

interface SendEmailProps {
  email: string;
  token: string;
}

export const sendVerificationEmail = async ({
  email,
  token,
}: SendEmailProps) => {
  const confirmLink = `<a href="${process.env.URL}/new-verification?token=${token}">Click here to verify your email</a>`;
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.SMTP_ACCOUNT,
        pass: process.env.SMTP_PASSWORD,
      },
      debug: true,
      logger: true,
    });
    await transporter.verify();
    await transporter.sendMail({
      from: process.env.SMTP_ACCOUNT,
      subject: "verification email",
      to: email,
      html: confirmLink,
    });
  } catch (error) {
    return { error: "Sending authentication email failed" };
  }
};

export const sendVerificationForgotPassword = async (
  email: string,
  token: string
) => {
  const confirmLink = `<a href="${process.env.URL}/forgot-password?token=${token}">Click here to reset your password</a>`;
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.SMTP_ACCOUNT,
        pass: process.env.SMTP_PASSWORD,
      },
      debug: true,
      logger: true,
    });
    await transporter.verify();
    await transporter.sendMail({
      from: process.env.SMTP_ACCOUNT,
      subject: "verification email",
      to: email,
      html: confirmLink,
    });
  } catch (error) {
    return { error: "Sending authentication email failed" };
  }
};
