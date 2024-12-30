import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  className = '',
  onBlur,
}) => {
  const handleChange = (event) => {
    if (onChange) {
      const sanitizedValue = String(event.target.value).trim();
      onChange(sanitizedValue);
    }
  };
    const handleBlur = (event) => {
    if (onBlur) {
      onBlur(event);
    }
  };


  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-gray-700 text-sm font-bold mb-2">
        {placeholder}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
          error ? 'border-red-500' : ''
        } ${className}`}
      />
      {error && (
        <p className="text-red-500 text-xs italic">{error}</p>
      )}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.oneOf(['text', 'email', 'password', 'number']),
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
    onBlur: PropTypes.func,
};

export default Input;