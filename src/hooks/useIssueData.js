const { useState, useEffect, useCallback } = wp.element;
const { __ } = wp.i18n;
import { fetchIssue } from '../services/issueApi'; // Assuming this will be created

const useIssueData = (issueId, isOpen) => {
  const [issueDetails, setIssueDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (issueId && isOpen) {
      setIsLoadingDetails(true);
      setError(null);

      fetchIssue(issueId)
        .then((issueData) => {
          setIssueDetails(issueData);
        })
        .catch((err) => {
          console.error('Error fetching issue data:', err);
          setError(__('Failed to load issue details. Please try again.', 'alpaca'));
          setIssueDetails(null);
        })
        .finally(() => {
          setIsLoadingDetails(false);
        });
    }
  }, [issueId, isOpen]);

  const refetchData = useCallback(() => {
    if (issueId && isOpen) {
      setIsLoadingDetails(true);
      setError(null);

      fetchIssue(issueId)
        .then(setIssueDetails)
        .catch((err) => {
          console.error('Error refetching issue data:', err);
          setError(__('Failed to load issue details. Please try again.', 'alpaca'));
        })
        .finally(() => setIsLoadingDetails(false));
    }
  }, [issueId, isOpen]);

  return {
    issueDetails,
    setIssueDetails,
    isLoadingDetails,
    error,
    refetchData,
  };
};

export default useIssueData;
