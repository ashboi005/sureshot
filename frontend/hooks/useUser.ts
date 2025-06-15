import { useEffect, useState } from 'react';
import axios from 'axios';
import { User } from '@/types/User';

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get<User>(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setUser(response.data);
        
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch user');
        setError(error);
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []); // Empty dependency array means this runs once on mount

  return { user, loading, error };
};

export default useUser;