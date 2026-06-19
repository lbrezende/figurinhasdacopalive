import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  logger: {
    // Cookie de sessão antigo/assinado com outra AUTH_SECRET não descriptografa:
    // o Auth.js já trata como "deslogado", então não poluímos o console (nem o
    // overlay de erro do Next em dev) com esse caso benigno.
    error(error) {
      if (error?.name === "JWTSessionError") return;
      console.error(error);
    },
  },
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    // Magic link (Resend) entra aqui quando AUTH_RESEND_KEY estiver configurada.
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  events: {
    // Primeiro login (criação do usuário) → começa o trial de 14 dias.
    async createUser({ user }) {
      if (!user.id) return;
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      await db.user.update({
        where: { id: user.id },
        data: { plan: "TRIAL", trialEndsAt },
      });
    },
  },
});
