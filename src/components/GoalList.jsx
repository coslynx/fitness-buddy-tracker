import React from 'react';
import PropTypes from 'prop-types';
import ProgressTracker from './ProgressTracker';

const GoalList = ({ goals = [] }) => {
  const handleClick = (goalId, progress) => {
    console.log(`Goal ID: ${goalId}, Progress:`, progress);
  };

  return (
    <div className="goal-list-container">
      {goals && goals.length > 0 ? (
        goals.map((goal) => {
          if (!goal || typeof goal !== 'object') {
            return null;
          }

          const { id, name, goalType, targetValue, progress } = goal;

          if (!id || !name || !goalType || typeof targetValue !== 'number') {
            return null;
          }


          return (
              <div key={id} className="bg-white p-4 rounded-md shadow-md mb-4" onClick={() => handleClick(id, progress)}>
                <p className="font-semibold">
                  Name: <span className="font-normal">{String(name).trim()}</span>
                </p>
                 <p className="font-semibold">
                  Type: <span className="font-normal">{String(goalType).trim()}</span>
                </p>
                <p className="font-semibold">
                  Target: <span className="font-normal">{targetValue}</span>
                </p>
                <ProgressTracker goalId={id} progress={progress} />
              </div>
          );
        })
      ) : (
        <p className="text-gray-500 italic">No goals found</p>
      )}
    </div>
  );
};

GoalList.propTypes = {
    goals: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            goalType: PropTypes.string.isRequired,
            targetValue: PropTypes.number.isRequired,
             startDate: PropTypes.string,
             endDate: PropTypes.string,
              progress: PropTypes.shape({
                currentValue: PropTypes.number,
                updatedAt: PropTypes.string
            }),
        })
    ).isRequired,
};

export default GoalList;