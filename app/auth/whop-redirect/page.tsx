import WhopRedirectClient from './whop-redirect-client';

export const metadata = {
  title: 'Connecting to CatchBarrels...',
  description: 'Connecting your Whop account',
};

export default function WhopRedirectPage() {
  return <WhopRedirectClient />;
}
