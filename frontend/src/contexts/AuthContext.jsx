"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import Cookies from "js-cookie";
import { authAPI } from "../services/api";

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get("auth_token");

      if (token) {
        try {
          const response = await authAPI.getProfile();
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user: response.user,
              token,
            },
          });
        } catch (error) {
          console.error("Token validation failed:", error);
          Cookies.remove("auth_token");
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response;

      Cookies.set("auth_token", token, {
        expires: 7,
        // Only mark secure on https to ensure the cookie is actually set on localhost during development
        secure: typeof window !== "undefined" ? window.location.protocol === "https:" : false,
        // Lax is generally safer for most flows and works across same-site ports; Strict is okay too, but Lax avoids edge cases
        sameSite: "lax",
      });

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response;

      Cookies.set("auth_token", token, {
        expires: 7,
        secure: typeof window !== "undefined" ? window.location.protocol === "https:" : false,
        sameSite: "lax",
      });

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    Cookies.remove("auth_token");
    dispatch({ type: "LOGOUT" });
  };

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};