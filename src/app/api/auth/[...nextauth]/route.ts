import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "SebYhun",
      credentials: {
        username: { label: "Usuario", type: "text", placeholder: "sebastián o yhunksu" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        // Usuarios predefinidos para Sebastián y Yhunksu
        const users = [
          { id: "1", name: "Sebastián", email: "sebastian@sebyhun.com", username: "sebastian" },
          { id: "2", name: "Yhunksu", email: "yhunksu@sebyhun.com", username: "yhunksu" }
        ];

        if (credentials?.username && credentials?.password) {
          // Contraseña simple para ambos (puedes cambiarla)
          if (credentials.password === "sebyhun2025") {
            const user = users.find(u => 
              u.username.toLowerCase() === credentials.username?.toLowerCase()
            );
            if (user) {
              return user;
            }
          }
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
