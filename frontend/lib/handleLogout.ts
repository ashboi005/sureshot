import { cookies } from "next/headers";

export async function handleLogout() {
  // Clear the access token from cookies
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");

  // Optionally, you can also clear other user-related cookies if needed
  cookieStore.delete("role");
  
  // Redirect to the login page or home page after logout
  return {
    redirect: {
      destination: "/auth/login",
      permanent: false,
    },
  };
}