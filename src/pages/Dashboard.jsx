import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import GoalList from '../components/GoalList';
import Button from '../components/Button';
import request from '../utils/api';

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      if (!isAuthenticated) {
          navigate('/login');
          return;
      }

      const fetchGoals = async () => {
          setLoading(true);
          setError(null);
          try {
              const data = await request({ url: '/api/goals' });
              if (Array.isArray(data)) {
                  const sanitizedGoals = data.map(goal => ({
                      ...goal,
                      name: String(goal.name).trim(),
                      goalType: String(goal.goalType).trim(),
                      targetValue: typeof goal.targetValue === 'number' ? goal.targetValue : 0,
                  }));
                  setGoals(sanitizedGoals);

              } else{
                   setError('Invalid data format for goals');
                   setGoals([]);
              }

          } catch (err) {
                console.error('Error fetching goals:', err);
                setError(err.message || 'Failed to fetch goals');
                setGoals([]);
            } finally {
              setLoading(false);
          }
      };
    fetchGoals();
  }, [isAuthenticated, navigate]);



  const handleLogout = () => {
    logout();
    navigate('/login');
  };

    if (!isAuthenticated) {
        return null;
    }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl p-6 bg-white rounded-md shadow-md">
        <h1 className="text-3xl font-semibold text-center mb-6">
          Dashboard
        </h1>
        {error && (
          <p className="text-red-500 text-center mb-4">Error: {error}</p>
        )}
        {loading ? (
            <div className="text-center text-gray-500 italic">Loading goals...</div>
        ) : (
          <GoalList goals={goals} />
        )}
          <div className="text-center mt-4">
              <Button onClick={handleLogout}>Logout</Button>
          </div>
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  
};

export default Dashboard;