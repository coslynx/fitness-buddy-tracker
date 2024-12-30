import axios from 'axios';

const request = async ({ url, method = 'get', data, headers }) => {
  if (!url) {
    throw new Error('Url is required');
  }

  const allowedMethods = ['get', 'post', 'put', 'delete'];
  if (!allowedMethods.includes(method.toLowerCase())) {
    throw new Error('Method Not Allowed');
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const config = {
    url,
    method,
    headers: defaultHeaders,
    ...(data ? { data } : {}),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] API Request:`, config);
  }

  try {
    const response = await axios(config);

     if (process.env.NODE_ENV === 'development') {
        console.log(`[${new Date().toISOString()}] API Response:`, response);
      }

    if (response.status >= 200 && response.status < 300) {
        return response.data;
    } else {
      throw {
          status: response.status,
          message: response.data.message || `Request failed with status ${response.status}`,
          data: response.data,
        };
    }
  } catch (error) {
      if (process.env.NODE_ENV === 'development') {
          console.error(`[${new Date().toISOString()}] API Error:`, error);
      }

    if (axios.isAxiosError(error)) {
      throw {
        status: error.response?.status || 500,
        message: error.response?.data?.message || error.message || "An unexpected error occurred",
        data: error.response?.data,
      };
    } else {
      throw {
        status: 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
};

export default request;