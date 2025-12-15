/**
 * DragContext - React Context for sharing drag state between components.
 * Replaces the window.__alpacaDragState global pattern for cleaner React architecture.
 */
import PropTypes from 'prop-types';

const { createContext, useContext, useState, useCallback, useMemo } =
  wp.element;

const DragContext = createContext(null);

/**
 * DragProvider wraps components that need access to drag state.
 *
 * @param {Object}      props          - Component props
 * @param {JSX.Element} props.children - Child components
 * @return {JSX.Element} Provider component
 */
export function DragProvider({ children }) {
  const [dragState, setDragStateInternal] = useState(null);

  const setDragState = useCallback((payload) => {
    setDragStateInternal(payload);
  }, []);

  const clearDragState = useCallback(() => {
    setDragStateInternal(null);
  }, []);

  const value = useMemo(
    () => ({
      dragState,
      setDragState,
      clearDragState,
    }),
    [dragState, setDragState, clearDragState],
  );

  return <DragContext.Provider value={value}>{children}</DragContext.Provider>;
}

DragProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to access drag state from any component within DragProvider.
 *
 * @return {Object} { dragState, setDragState, clearDragState }
 */
export function useDragState() {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error('useDragState must be used within a DragProvider');
  }
  return context;
}

export default DragContext;
