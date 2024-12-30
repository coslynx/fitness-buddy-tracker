import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthForm from '../../src/components/AuthForm';

describe('AuthForm Component', () => {
  it('should render the login form initially', () => {
    render(<AuthForm onSubmit={() => {}} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Login');
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login', type: 'submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register', type: 'button' })).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');
  });

  it('should handle input changes in login mode', () => {
    render(<AuthForm onSubmit={() => {}} />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

    it('should handle input changes in registration mode', () => {
        render(<AuthForm onSubmit={() => {}} />);

        const toggleButton = screen.getByRole('button', { name: 'Register', type: 'button' });
        fireEvent.click(toggleButton);

        const nameInput = screen.getByPlaceholderText('Name');
        const emailInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');

       fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
    });


  it('should call onSubmit with correct data in login mode', async () => {
    const onSubmitMock = jest.fn();
    render(<AuthForm onSubmit={onSubmitMock} />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login', type: 'submit' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
         expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

    it('should call onSubmit with correct data in registration mode', async () => {
        const onSubmitMock = jest.fn();
        render(<AuthForm onSubmit={onSubmitMock} />);

        const toggleButton = screen.getByRole('button', { name: 'Register', type: 'button' });
        fireEvent.click(toggleButton);


        const nameInput = screen.getByPlaceholderText('Name');
        const emailInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');
        const submitButton = screen.getByRole('button', { name: 'Register', type: 'submit' });

       fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
         fireEvent.click(submitButton);

         await waitFor(() => {
             expect(onSubmitMock).toHaveBeenCalledTimes(1);
             expect(onSubmitMock).toHaveBeenCalledWith({
                 name: 'Test User',
                 email: 'test@example.com',
                 password: 'password123',
             });
         });
    });


    it('should toggle between login and registration modes', () => {
      render(<AuthForm onSubmit={() => {}} />);

      const toggleButton = screen.getByRole('button', { name: 'Register', type: 'button' });
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Login');
      expect(screen.getByRole('button', { name: 'Login', type: 'submit' })).toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Name')).not.toBeInTheDocument();

      fireEvent.click(toggleButton);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Register');
      expect(screen.getByRole('button', { name: 'Register', type: 'submit' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();

      fireEvent.click(toggleButton);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Login');
      expect(screen.getByRole('button', { name: 'Login', type: 'submit' })).toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Name')).not.toBeInTheDocument();

    });

  it('should display email validation error', async () => {
    render(<AuthForm onSubmit={() => {}} />);

    const emailInput = screen.getByPlaceholderText('Email');
    const submitButton = screen.getByRole('button', { name: 'Login', type: 'submit' });


    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });


  it('should display password validation error', async () => {
    render(<AuthForm onSubmit={() => {}} />);

    const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login', type: 'submit' });


    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

    it('should sanitize inputs before submission in login mode', async () => {
        const onSubmitMock = jest.fn();
        render(<AuthForm onSubmit={onSubmitMock} />);

        const emailInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');
        const submitButton = screen.getByRole('button', { name: 'Login', type: 'submit' });

        fireEvent.change(emailInput, { target: { value: '  test@example.com  ' } });
        fireEvent.change(passwordInput, { target: { value: '  password123  ' } });
         fireEvent.click(submitButton);

        await waitFor(() => {
             expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });

    });
    it('should sanitize inputs before submission in registration mode', async () => {
        const onSubmitMock = jest.fn();
        render(<AuthForm onSubmit={onSubmitMock} />);

        const toggleButton = screen.getByRole('button', { name: 'Register', type: 'button' });
        fireEvent.click(toggleButton);

        const nameInput = screen.getByPlaceholderText('Name');
        const emailInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');
        const submitButton = screen.getByRole('button', { name: 'Register', type: 'submit' });

         fireEvent.change(nameInput, { target: { value: '  Test User  ' } });
        fireEvent.change(emailInput, { target: { value: '  test@example.com  ' } });
        fireEvent.change(passwordInput, { target: { value: '  password123  ' } });
         fireEvent.click(submitButton);
        await waitFor(() => {
            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith({
                 name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });
        });

    });
});