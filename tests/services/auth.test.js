import { useAuth, AuthProvider } from '../../src/hooks/useAuth';
import axios from 'axios';
import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';

jest.mock('axios');

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    axios.mockReset();
  });

    it('should load user from local storage on initialization', async () => {
      const token = 'test_token';
      const userData = { id: '123', username: 'Test User', email: 'test@example.com' };
      localStorage.setItem('authToken', token);
        axios.get.mockResolvedValue({ status: 200, data: userData });
      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
           wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
       });


      await waitForNextUpdate();
        expect(result.current.user).toEqual({
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
            token: token,
        });
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.loading).toBe(false);
      expect(axios.get).toHaveBeenCalledWith('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
      });
    });
  
    it('should handle invalid token on initialization', async () => {
      const token = 'invalid_token';
    localStorage.setItem('authToken', token);
      axios.get.mockResolvedValue({ status: 401, data: { message: 'Invalid token' } });
      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
         wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
     });
        await waitForNextUpdate();

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid token');
      expect(result.current.loading).toBe(false);
      expect(localStorage.getItem('authToken')).toBeNull();
        expect(axios.get).toHaveBeenCalledWith('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` },
        });

    });

    it('should handle network error during user loading', async () => {
         localStorage.setItem('authToken', 'test_token');
        axios.get.mockRejectedValue(new Error('Network error'));
        const { result, waitForNextUpdate } = renderHook(() => useAuth(),{
              wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
          });

      await waitForNextUpdate();
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid token');
        expect(result.current.loading).toBe(false);
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('should handle no token in local storage on initialization', async () => {
        const { result, waitForNextUpdate } = renderHook(() => useAuth(),{
              wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
        });

      await waitForNextUpdate();

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
        expect(axios.get).not.toHaveBeenCalled();
    });

  it('should log in a user successfully', async () => {
    const mockUser = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
    };
    const mockToken = 'test_token';
    axios.post.mockResolvedValue({
      status: 200,
      data: { user: mockUser, token: mockToken },
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth(),{
          wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });


    await waitForNextUpdate();
    expect(result.current.user).toEqual({
      id: '123',
        name: 'Test User',
      email: 'test@example.com',
        token: mockToken
    });
    expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    expect(localStorage.getItem('authToken')).toBe(mockToken);
    expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
      expect(result.current.loading).toBe(false);
  });

  it('should handle login failure with incorrect credentials', async () => {
    axios.post.mockResolvedValue({
      status: 401,
      data: { message: 'Invalid credentials' },
    });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(),{
           wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
        });
    await act(async () => {
      await result.current.login('test@example.com', 'wrongpassword');
    });

      await waitForNextUpdate();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'wrongpassword',
    });
        expect(result.current.loading).toBe(false);
  });

   it('should handle login failure with network error', async () => {
        axios.post.mockRejectedValue(new Error('Network error'));
      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
           wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
       });
       await act(async () => {
            await result.current.login('test@example.com', 'password123');
        });

        await waitForNextUpdate();
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Network error');
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
            email: 'test@example.com',
            password: 'password123',
        });
        expect(result.current.loading).toBe(false);
    });

    it('should sanitize login inputs before submission', async () => {
      const mockUser = {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
      };
        const mockToken = 'test_token';

        axios.post.mockResolvedValue({
            status: 200,
            data: { user: mockUser, token: mockToken },
        });

        const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
             wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
         });
        await act(async () => {
            await result.current.login('  test@example.com  ', '  password123  ');
        });

        await waitForNextUpdate();
        expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
            email: 'test@example.com',
            password: 'password123',
        });
      expect(result.current.loading).toBe(false);
    });

  it('should register a user successfully', async () => {
    const mockUser = {
        id: '456',
      name: 'New User',
      email: 'new@example.com',
    };
      const mockToken = 'new_token';
    axios.post.mockResolvedValue({
        status: 201,
      data: { user: mockUser, token: mockToken },
    });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(),{
           wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
       });
    await act(async () => {
      await result.current.register('New User', 'new@example.com', 'password123');
    });

      await waitForNextUpdate();
    expect(result.current.user).toEqual({
      id: '456',
        name: 'New User',
      email: 'new@example.com',
        token: mockToken
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('authToken')).toBe(mockToken);
      expect(result.current.error).toBeNull();
    expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    });
      expect(result.current.loading).toBe(false);
  });

    it('should handle registration failure with email already registered', async () => {
        axios.post.mockResolvedValue({
            status: 409,
            data: { message: 'Email already registered' },
        });

        const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
            wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
        });

        await act(async () => {
            await result.current.register('New User', 'new@example.com', 'password123');
        });

        await waitForNextUpdate();

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.error).toBe('Registration failed');
      expect(localStorage.getItem('authToken')).toBeNull();

        expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
            name: 'New User',
            email: 'new@example.com',
            password: 'password123',
        });
          expect(result.current.loading).toBe(false);
    });

  it('should handle registration failure with network error', async () => {
        axios.post.mockRejectedValue(new Error('Network error'));
        const { result, waitForNextUpdate } = renderHook(() => useAuth(),{
           wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
       });

      await act(async () => {
        await result.current.register('New User', 'new@example.com', 'password123');
      });

        await waitForNextUpdate();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Network error');
      expect(localStorage.getItem('authToken')).toBeNull();

    expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    });
      expect(result.current.loading).toBe(false);
  });

    it('should sanitize registration inputs before submission', async () => {
      const mockUser = {
            id: '456',
          name: 'New User',
          email: 'new@example.com',
      };
        const mockToken = 'new_token';

        axios.post.mockResolvedValue({
            status: 201,
            data: { user: mockUser, token: mockToken },
        });
        const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
            wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
        });
        await act(async () => {
            await result.current.register(
                '  New User  ',
                '  new@example.com  ',
                '  password123  '
            );
        });

        await waitForNextUpdate();
         expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
            name: 'New User',
            email: 'new@example.com',
            password: 'password123',
        });
      expect(result.current.loading).toBe(false);
    });

  it('should log out a user successfully', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
          wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
          await result.current.logout();
      });
      await waitForNextUpdate();

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(axios.get).toHaveBeenCalledWith('/api/auth/logout');
      expect(result.current.loading).toBe(false);
  });


  it('should handle logout failure with network error', async () => {
      axios.get.mockRejectedValue(new Error('Network error during logout'));
      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
          wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });
    await act(async () => {
      await result.current.logout();
    });

      await waitForNextUpdate();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
     expect(result.current.error).toBe('Network error during logout');
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(axios.get).toHaveBeenCalledWith('/api/auth/logout');
      expect(result.current.loading).toBe(false);
  });


    it('should set loading state during API calls', async () => {
         const { result } = renderHook(() => useAuth(), {
             wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
         });
        axios.post.mockResolvedValue({status: 200, data:{user:{id:'123', name:'test', email: 'test@test.com'}, token: 'test_token'}});
        expect(result.current.loading).toBe(true);
        await act(async () => {
             await result.current.login('test@example.com', 'password123');
        });
          expect(result.current.loading).toBe(false);

          axios.post.mockResolvedValue({status: 201, data:{user:{id:'123', name:'test', email: 'test@test.com'}, token: 'test_token'}});
        expect(result.current.loading).toBe(false);
          await act(async () => {
            await result.current.register('test', 'test@example.com', 'password123');
        });
         expect(result.current.loading).toBe(false);

        axios.get.mockResolvedValue({status:200});
        expect(result.current.loading).toBe(false);

          await act(async () => {
              await result.current.logout();
          });
         expect(result.current.loading).toBe(false);
          expect(result.current.loading).toBe(false);

    });

});