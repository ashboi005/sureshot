import { useEffect, useState } from 'react';
import axios from 'axios';
import { User } from '@/types/User';
import { useAtom } from 'jotai';
import { doctorIdAtom } from '@/lib/atoms';
import { getDoctorIdByUserId } from '@/lib/api/doctors/doctorId';

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [, setDoctorId] = useAtom(doctorIdAtom);

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
        );        console.log("User data fetched:", response.data);
        setUser(response.data);          // If user is a doctor, fetch and set doctor ID only in atom
        if (response.data && response.data.account_type === 'doctor') {
          try {
            // First check if the doctor_id is already in the response
            if (response.data.doctor_id) {
              setDoctorId(response.data.doctor_id);
            } else {
              // If not, fetch it from the API
              const doctorData = await getDoctorIdByUserId(response.data.user_id);
              if (doctorData && doctorData.doctor_id) {
                setDoctorId(doctorData.doctor_id);
              }
            }
          } catch (docErr) {
            console.error("Failed to fetch doctor ID:", docErr);
            // Non-blocking error - we continue with user data
          }
        }
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