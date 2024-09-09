import { useEffect } from 'react';
import { useRouter } from 'next/router';

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/register');
  }, [router]);

  return null;
};

export default IndexPage;
