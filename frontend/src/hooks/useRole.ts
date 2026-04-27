import { createContext, useContext } from 'react';
import type { Role } from '@/lib/types';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

export const RoleContext = createContext<RoleContextType>({
  role: 'coordinator',
  setRole: () => {},
});

export function useRole() {
  return useContext(RoleContext);
}
