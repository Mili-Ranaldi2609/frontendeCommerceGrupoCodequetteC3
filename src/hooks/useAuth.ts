
export const useAuth = () => {
  const userStr = localStorage.getItem("usuario");
  if (!userStr) return { isAuthenticated: false, role: null, user: null };

  try {
    const user = JSON.parse(userStr);
    const token = localStorage.getItem("token");

    return {
      isAuthenticated: !!token,
      role: user.role,
      user,
    };
  } catch (err) {
    return { isAuthenticated: false, role: null, user: null };
  }
};
