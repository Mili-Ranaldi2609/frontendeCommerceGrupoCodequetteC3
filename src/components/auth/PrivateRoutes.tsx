import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: JSX.Element;
  roles?: string[]; // roles permitidos
}

export const PrivateRoute = ({ children, roles }: Props) => {
  const token = localStorage.getItem('token');
  const userRol = localStorage.getItem('rol');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(userRol || '')) {
    return <Navigate to="/" replace />;
  }

  return children;
};
