import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
      const loadUserFromLocalStorage = async () => {
           setLoading(true);
          try {
            const storedToken = localStorage.getItem('authToken');
              if (storedToken) {
                  const response = await axios.get('/api/auth/verify', {
                       headers: {
                           Authorization: `Bearer ${storedToken}`,
                       }
                   });

                   if(response.status === 200){
                    const userData = response.data;
                        setUser({
                          id: String(userData.id).trim(),
                          name: String(userData.name).trim(),
                          email: String(userData.email).trim(),
                          token: storedToken
                         });

                        setError(null);
                   }
                  else{
                        localStorage.removeItem('authToken');
                        setUser(null);
                        setError('Invalid token');
                    }

              }
              else{
                setUser(null);
              }

            } catch (err) {
              console.error('Error loading user from local storage:', err);
              localStorage.removeItem('authToken');
              setUser(null);
              setError('Invalid token');
            } finally {
                setLoading(false);
            }
        };

        loadUserFromLocalStorage();
    }, []);


  const login = async (email, password) => {
      setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', {
        email: String(email).trim(),
        password: String(password).trim(),
      });

       if (response.status === 200) {
           const { user: userData, token } = response.data;
        localStorage.setItem('authToken', token);
        setUser({
          id: String(userData.id).trim(),
          name: String(userData.name).trim(),
          email: String(userData.email).trim(),
           token: token
        });
        setError(null);
      } else {
        setError(response.data.message || 'Login failed');
        setUser(null);
      }
    } catch (err) {
        console.error('Login error:', err);
      setError(err.response?.data?.message || 'Network error');
       setUser(null);
    } finally {
        setLoading(false);
    }
  };

    const register = async (name, email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/auth/register', {
                name: String(name).trim(),
                email: String(email).trim(),
                password: String(password).trim(),
            });

            if (response.status === 201) {
                const { user: userData, token } = response.data;
                localStorage.setItem('authToken', token);
                setUser({
                     id: String(userData.id).trim(),
                    name: String(userData.name).trim(),
                    email: String(userData.email).trim(),
                     token: token
                });
                setError(null);
            } else {
                setError(response.data.message || 'Registration failed');
                  setUser(null);
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Network error');
             setUser(null);
        }
         finally {
            setLoading(false);
        }
    };


  const logout = async () => {
       setLoading(true);
        setError(null);
    try {
      await axios.get('/api/auth/logout');
      localStorage.removeItem('authToken');
         setUser(null);
    } catch (err) {
        console.error('Logout error:', err);
        setError(err.response?.data?.message || 'Network error during logout');

    } finally {
          setLoading(false);
        }
  };

  const isAuthenticated = !!user;

    const authContextValue = {
         user,
         login,
         register,
         logout,
        isAuthenticated,
        error,
        loading,
    };

  return (
      <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};


export { useAuth, AuthProvider };