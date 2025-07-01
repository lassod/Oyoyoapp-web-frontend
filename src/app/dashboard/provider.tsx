import React from 'react';
interface ProviderProps {
  children: React.ReactNode;
}
const Provider = ({ children }: ProviderProps) => {
  return <div>{children}</div>;
};

export default Provider;
