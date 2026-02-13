import type { AuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const supervisor = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          }
        });

        if (!supervisor) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          supervisor.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: supervisor.id,
          email: supervisor.email,
          name: supervisor.name,
          role: 'supervisor'
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }: unknown) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: unknown) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
