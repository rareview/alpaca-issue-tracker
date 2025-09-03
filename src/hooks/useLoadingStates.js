const { useState, useCallback } = wp.element;

const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState({
    assignees: false,
    deadline: false,
    screenshot: false,
    title: false,
  });

  const setLoading = useCallback((key, value) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return { loadingStates, setLoading };
};

export default useLoadingStates;
