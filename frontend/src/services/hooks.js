import { useState, useEffect, useCallback } from "react";

// Generic fetch hook
export function useFetch(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const run = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetchFn();
      setData(res);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}

// Mutation hook (post/patch/delete)
export function useMutation(mutateFn) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const mutate = async (...args) => {
    setLoading(true); setError(""); setSuccess(false);
    try {
      const res = await mutateFn(...args);
      setSuccess(true);
      return res;
    } catch (e) {
      setError(e.message || "Something went wrong.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, success, clearError: () => setError("") };
}
