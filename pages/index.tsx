import { useEffect } from 'react';
import { useRouter } from 'next/router';

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/register');
  }, [router]);

  return null; // You can also return a loading indicator if you prefer
};

export default IndexPage;
