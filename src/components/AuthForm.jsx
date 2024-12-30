import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import Button from './Button';
import Input from './Input';

const AuthForm = ({ onSubmit }) => {
  const [isLogin, setIsLogin] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };


  const submitHandler = (data) => {
    onSubmit(data);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {isLogin ? 'Login' : 'Register'}
      </h2>
      <form onSubmit={handleSubmit(submitHandler)}>
        {!isLogin && (
          <Input
            type="text"
            name="name"
            placeholder="Name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
        )}
        <Input
          type="email"
          name="email"
          placeholder="Email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          error={errors.email?.message}
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
          error={errors.password?.message}
        />
        <Button type="submit" className="w-full">
          {isLogin ? 'Login' : 'Register'}
        </Button>
      </form>
      <div className="mt-4 text-center">
          <span className="text-gray-600 mr-2">
            Or
          </span>
        <Button type="button" onClick={toggleForm}>
          {isLogin ? 'Register' : 'Login'}
        </Button>
      </div>
    </div>
  );
};

AuthForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default AuthForm;