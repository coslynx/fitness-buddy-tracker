interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
}

interface Goal {
    id: string;
    userId: string;
    name: string;
    description?: string;
    startDate: string;
    targetDate: string;
    targetValue: number;
    currentValue?: number;
    unit: string;
    status?: "active" | "completed" | "pending";
}

interface ProgressUpdate {
    id: string;
    goalId: string;
    date: string;
    value: number;
}

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

interface ApiError {
  message: string;
  statusCode?: number;
}


export type { User, Goal, ProgressUpdate, AuthContextType, ApiError };