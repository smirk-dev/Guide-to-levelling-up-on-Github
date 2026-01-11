import NextAuth, { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { getServiceSupabase } from '@/lib/supabase';

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request write permissions to allow users to create issues/PRs from the app
          // repo: Full control of private and public repositories (includes issue/PR creation)
          // read:user: Read user profile data
          // user:email: Access user email addresses
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github' && profile) {
        const supabase = getServiceSupabase();
        const githubProfile = profile as any;

        // Check if user exists in our database
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('github_id', githubProfile.id.toString())
          .single();

        if (!existingUser) {
          // Create new user in our database
          const { error } = await supabase.from('users').insert({
            github_id: githubProfile.id.toString(),
            username: githubProfile.login,
            avatar_url: githubProfile.avatar_url,
            xp: 0,
            rank_tier: 'C', // Start at Rank C (Novice)
          });

          if (error) {
            console.error('Error creating user:', error);
            return false;
          }
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Add GitHub data to session for easier access
      if (token.sub) {
        session.user.id = token.sub;
        console.log('[NextAuth] Session ID set to:', token.sub);
      }
      if (token.username) {
        (session.user as any).username = token.username;
      }
      // Pass access token to session for API calls
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      console.log('[NextAuth] Session callback returning:', { userId: session.user.id, username: (session.user as any).username });
      return session;
    },
    async jwt({ token, account, profile }) {
      // Store GitHub access token for API calls
      if (account?.access_token) {
        token.accessToken = account.access_token;
        console.log('Stored access token in JWT');
      }
      if (profile) {
        const githubProfile = profile as any;
        token.githubId = githubProfile.id.toString();
        token.username = githubProfile.login;
        console.log('Stored GitHub profile in JWT:', { 
          githubId: token.githubId, 
          username: token.username 
        });
      }
      return token;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
