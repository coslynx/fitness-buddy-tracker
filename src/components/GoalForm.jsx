import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import Button from './Button';
import Input from './Input';

const GoalForm = ({ onSubmit, initialGoal }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    if (initialGoal) {
      setValue('name', initialGoal.name || '');
      setValue('goalType', initialGoal.goalType || '');
      setValue('targetValue', initialGoal.targetValue || '');
      setValue('startDate', initialGoal.startDate || '');
      setValue('endDate', initialGoal.endDate || '');
    }
  }, [initialGoal, setValue]);

  const submitHandler = (data) => {
      const sanitizedData = {
        name: String(data.name).trim(),
        goalType: String(data.goalType).trim(),
        targetValue: Number(data.targetValue),
        startDate: data.startDate ? String(data.startDate).trim() : null,
        endDate: data.endDate ? String(data.endDate).trim() : null
      };
      onSubmit(sanitizedData);
      reset();

  };

  const handleCancel = () => {
    reset();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {initialGoal ? 'Update Goal' : 'Add Goal'}
      </h2>
      <form onSubmit={handleSubmit(submitHandler)}>
        <Input
          type="text"
          name="name"
          placeholder="Goal Name"
          {...register('name', { required: 'Goal name is required' })}
           error={errors.name?.message}
           aria-label="Goal Name"
        />
        <Input
          type="text"
          name="goalType"
          placeholder="Goal Type"
          {...register('goalType', { required: 'Goal type is required' })}
            error={errors.goalType?.message}
             aria-label="Goal Type"
        />
         <Input
          type="number"
          name="targetValue"
          placeholder="Target Value"
          {...register('targetValue', {
            required: 'Target value is required',
            min: {
                value: 1,
                message: 'Target value must be a positive number',
            },
          })}
             error={errors.targetValue?.message}
              aria-label="Target Value"
        />
         <Input
          type="date"
          name="startDate"
          placeholder="Start Date"
          {...register('startDate')}
            aria-label="Start Date"
        />
        <Input
          type="date"
          name="endDate"
          placeholder="End Date"
          {...register('endDate')}
           aria-label="End Date"
        />
        <div className="flex justify-between mt-4">
            <Button type="submit" className="w-1/2 mr-2" aria-label={initialGoal ? "Update Goal" : "Add Goal"}>
              {initialGoal ? 'Update' : 'Add'}
            </Button>
             <Button type="button" onClick={handleCancel} className="w-1/2 ml-2" aria-label="Cancel">
              Cancel
            </Button>
        </div>
      </form>
    </div>
  );
};

GoalForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialGoal: PropTypes.shape({
      name: PropTypes.string,
      goalType: PropTypes.string,
      targetValue: PropTypes.number,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
  }),
};

export default GoalForm;