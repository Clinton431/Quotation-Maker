// src/hooks/useCompanies.js
// Handles cold-start delays on Render free tier by retrying with
// exponential back-off. Drop this hook into any component that needs
// the companies list.
//
// Usage:
//   const { companies, loading, error, refetch, attempt } = useCompanies();

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const MAX_RETRIES = 4; // give up after 4 attempts
const BASE_DELAY_MS = 1500; // 1.5s → 3s → 6s → 12s

export function useCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const fetchCompanies = useCallback(async (retryCount = 0) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(`${API_URL}/api/companies`, {
        // First request gets extra time to allow Render cold start (~20s)
        timeout: retryCount === 0 ? 20000 : 10000,
      });

      // API returns either a plain array or { data: [...] }
      setCompanies(Array.isArray(data) ? data : data.data ?? []);
      setLoading(false);
      setAttempt(0);
    } catch (err) {
      console.warn(
        `[useCompanies] attempt ${retryCount + 1} failed:`,
        err.message
      );

      if (retryCount < MAX_RETRIES) {
        // Exponential back-off: 1.5s, 3s, 6s, 12s
        const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
        console.log(`[useCompanies] retrying in ${delay}ms…`);
        setAttempt(retryCount + 1);
        setTimeout(() => fetchCompanies(retryCount + 1), delay);
      } else {
        setError(
          "Could not load companies. The server may be starting up — please wait a moment and try again."
        );
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchCompanies(0);
  }, [fetchCompanies]);

  const refetch = useCallback(() => {
    setAttempt(0);
    fetchCompanies(0);
  }, [fetchCompanies]);

  return { companies, loading, error, refetch, attempt };
}
