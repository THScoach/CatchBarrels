
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string | null;
      role?: string | null;
      isCoach?: boolean | null;
    };
  }

  interface User {
    id: string;
    username?: string | null;
    role?: string | null;
    isCoach?: boolean | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username?: string | null;
    role?: string | null;
    isCoach?: boolean | null;
  }
}
