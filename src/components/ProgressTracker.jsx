import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import Input from './Input';
import request from '../utils/api';

const ProgressTracker = ({ goalId, progress }) => {
  const [currentValue, setCurrentValue] = useState(progress?.currentValue || 0);
  const [targetValue, setTargetValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
   const [inputError, setInputError] = useState(null);
    const [networkError, setNetworkError] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const debounceTimeout = useRef(null);


  useEffect(() => {
      const fetchGoal = async () => {
          setLoading(true);
          setError(null);
          setNetworkError(null);
          try {
              const goalData = await request({ url: `/api/goals/${goalId}` });
              if (typeof goalData?.targetValue !== 'number') {
                setError('Invalid target value');
                setTargetValue(null)
                  return
              }

              setTargetValue(goalData.targetValue);
               if (goalData.progress && typeof goalData.progress.currentValue === 'number'){
                    setCurrentValue(goalData.progress.currentValue)
               }


          } catch (err) {
              console.error('Error fetching goal data:', err);
                setNetworkError(err.message || 'Failed to fetch goal data');
              setError('Error fetching goal');
          } finally {
              setLoading(false);
          }
      };

    fetchGoal();

  }, [goalId]);


  useEffect(() => {
      if (targetValue !== null && typeof targetValue === 'number') {
          const percentage = targetValue === 0 ? 0 : Math.min(100, Math.max(0, (currentValue / targetValue) * 100));
          setProgressPercentage(percentage);
      } else{
        setProgressPercentage(0);
      }

  }, [currentValue, targetValue]);




  const handleProgressChange = (value) => {
      const sanitizedValue = String(value).trim();
      if (sanitizedValue === '' || Number.isNaN(Number(sanitizedValue))) {
          setInputError('Please enter a valid number.');
           setCurrentValue(0);
           return;
      }

    setInputError(null);
    setCurrentValue(Number(sanitizedValue));
  };

    const handleProgressUpdate = async () => {

    clearTimeout(debounceTimeout.current);
         if (targetValue === null || typeof targetValue !== 'number') {
            return;
        }
        if (Number.isNaN(Number(currentValue))) {
          setInputError('Please enter a valid number.');
          return;
      }
        setInputError(null);
        setLoading(true);
        setNetworkError(null);
         try {
            const sanitizedValue = Number(currentValue);
            await request({
                url: `/api/goals/${goalId}/progress`,
                method: 'PUT',
                data: { currentValue: sanitizedValue },
            });
        } catch (err) {
            console.error('Error updating progress:', err);
            setNetworkError(err.message || 'Failed to update progress');
            setError('Error updating progress');
        } finally {
            setLoading(false);
        }
    };



    const handleInputBlur = () => {
        clearTimeout(debounceTimeout.current);
            if (Number(currentValue) !== (progress?.currentValue || 0)){
             debounceTimeout.current = setTimeout(() => {
                handleProgressUpdate();
            }, 500);
        }
    };



  if (error) {
    return <span className="text-red-500">Error fetching goal</span>;
  }
    if (targetValue === null) {
    return <div className="text-gray-500 italic">Loading...</div>
  }

  const displayPercentage = targetValue === 0 ? 'N/A' : `${progressPercentage.toFixed(0)}%`;

  return (
    <div className="mt-2">
         {networkError && (
            <p className="text-red-500 text-xs italic">{networkError}</p>
         )}
      <div className="flex items-center mb-2">
          <label htmlFor={`progress-${goalId}`} className="mr-2 text-sm font-medium text-gray-700">
               Progress:
          </label>
            <Input
              type="number"
              name={`progress-${goalId}`}
              value={currentValue}
              onChange={handleProgressChange}
              onBlur={handleInputBlur}
             className="w-20 mr-2"
             error={inputError}
             aria-label="Update Current Value"
            />
        <span className="text-sm text-gray-700">
           {displayPercentage}
        </span>
      </div>
      <div className="bg-gray-200 rounded-full h-2.5 w-full">
        <div
          className="bg-blue-600 rounded-full h-2.5"
          style={{ width: `${progressPercentage}%` }}
            aria-label="Progress Bar"
        ></div>
      </div>
      {loading && <span className="text-gray-500 italic">Updating...</span>}
    </div>
  );
};

ProgressTracker.propTypes = {
  goalId: PropTypes.string.isRequired,
    progress: PropTypes.shape({
        currentValue: PropTypes.number,
        updatedAt: PropTypes.string,
    }),
};

export default ProgressTracker;