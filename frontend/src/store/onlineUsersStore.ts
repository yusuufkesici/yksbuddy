import create from 'zustand';

interface User {
  userId: string;
  username: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

interface OnlineUsersState {
  users: User[];
  typingUsers: { [key: string]: string }; // userId: username
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUserStatus: (userId: string, status: User['status']) => void;
  setUserLastSeen: (userId: string, lastSeen: Date) => void;
  addTypingUser: (userId: string, username: string) => void;
  removeTypingUser: (userId: string) => void;
}

export const useOnlineUsersStore = create<OnlineUsersState>((set) => ({
  users: [],
  typingUsers: {},

  setUsers: (users) => {
    set({ users });
  },

  addUser: (user) => {
    set((state) => ({
      users: [...state.users.filter(u => u.userId !== user.userId), user]
    }));
  },

  removeUser: (userId) => {
    set((state) => ({
      users: state.users.filter(u => u.userId !== userId)
    }));
  },

  updateUserStatus: (userId, status) => {
    set((state) => ({
      users: state.users.map(user =>
        user.userId === userId
          ? { ...user, status }
          : user
      )
    }));
  },

  setUserLastSeen: (userId, lastSeen) => {
    set((state) => ({
      users: state.users.map(user =>
        user.userId === userId
          ? { ...user, lastSeen, status: 'offline' }
          : user
      )
    }));
  },

  addTypingUser: (userId, username) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [userId]: username
      }
    }));
  },

  removeTypingUser: (userId) => {
    set((state) => {
      const newTypingUsers = { ...state.typingUsers };
      delete newTypingUsers[userId];
      return { typingUsers: newTypingUsers };
    });
  }
})); 