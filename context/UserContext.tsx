// UserContext.tsx or UserContext.js (if using TypeScript extensions)

import React, { createContext, ReactNode, useState } from "react";

export const UserContext = createContext<{
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}>({
  user: null,
  setUser: () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
