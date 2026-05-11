import prisma from '@/lib/server/prisma/prisma';
import { getVerificationTokenByEmail } from '../server/verification-token';
import { v4 as uuidV4 } from 'uuid';

export const generateVerificationToken = async (email: string) => {
  const token = uuidV4().toString();

  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const verificationToken = await prisma.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });
  return verificationToken;
};
