import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import GoalForm from '../components/GoalForm';
import GoalList from '../components/GoalList';
import Button from '../components/Button';
import request from '../utils/api';

const Goals = () => {
  const { isAuthenticated, navigate } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editGoal, setEditGoal] = useState(null);

    const handleAddGoalClick = () => {
        setIsAdding(true);
        setEditGoal(null);
    };

    const handleCancelEdit = () => {
        setIsAdding(false);
        setEditGoal(null);
    };


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
              } else {
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


  const handleGoalSubmit = async (goalData) => {
      setLoading(true);
      setError(null);

      try {
            const sanitizedData = {
              ...goalData,
              name: String(goalData.name).trim(),
              goalType: String(goalData.goalType).trim(),
                targetValue: Number(goalData.targetValue)
            };
           if(editGoal){
                 await request({
                      url: `/api/goals/${editGoal.id}`,
                    method: 'PUT',
                      data: sanitizedData
                  });
           } else{
                await request({
                    url: '/api/goals',
                    method: 'POST',
                    data: sanitizedData,
                });
           }
            const fetchUpdatedGoals = async () => {
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
                }
            }
            await fetchUpdatedGoals();
        setIsAdding(false);
          setEditGoal(null);

      } catch (err) {
          console.error('Error creating/updating goal:', err);
          setError(err.message || 'Failed to create/update goal');
      } finally {
            setLoading(false);
        }
    };


    const handleGoalEdit = (goal) => {
        setEditGoal(goal);
        setIsAdding(true);
    }


    const handleDeleteGoal = async (goalId) => {
        setLoading(true);
        setError(null);
        try {
            await request({
                url: `/api/goals/${goalId}`,
                method: 'DELETE',
            });
             const fetchUpdatedGoals = async () => {
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
                }
            }
            await fetchUpdatedGoals();
            setIsAdding(false);
             setEditGoal(null);
        } catch (err) {
            console.error('Error deleting goal:', err);
            setError(err.message || 'Failed to delete goal');
        } finally {
             setLoading(false);
        }
    };

    const handleDashboardNavigation = () => {
        navigate('/dashboard');
    };


    if (!isAuthenticated) {
        return null;
    }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl p-6 bg-white rounded-md shadow-md">
        <h1 className="text-3xl font-semibold text-center mb-6">Goals</h1>
           <div className="text-center mb-4">
            <Button onClick={handleDashboardNavigation}>
                Dashboard
            </Button>
        </div>
        {error && (
          <p className="text-red-500 text-center mb-4">Error: {error}</p>
        )}
        {loading ? (
          <div className="text-center text-gray-500 italic">Loading goals...</div>
        ) : (
            <>
                <div className="flex justify-end mb-4">
                    {!isAdding && (
                        <Button onClick={handleAddGoalClick} aria-label="Add Goal">
                            Add Goal
                        </Button>
                    )}
                </div>
                 {isAdding ? (
                        <GoalForm onSubmit={handleGoalSubmit} initialGoal={editGoal} onCancel={handleCancelEdit}/>
                    ) : (
                        <GoalList goals={goals} onDelete={handleDeleteGoal} onEdit={handleGoalEdit}/>
                    )}
            </>
        )}
      </div>
    </div>
  );
};

Goals.propTypes = {
};

export default Goals;