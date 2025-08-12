// This exposes WordPress global React

export const createElement = wp.element.createElement;
export const useState = wp.element.useState;
export const useEffect = wp.element.useEffect;
export const useRef = wp.element.useRef;
export const useCallback = wp.element.useCallback;
export const createContext = wp.element.createContext;
export const useContext = wp.element.useContext;
export const useMemo = wp.element.useMemo;
export const memo = wp.element.memo;
export const useReducer = wp.element.useReducer;
export const cloneElement = wp.element.cloneElement;
export const forwardRef = wp.element.forwardRef;
export const useLayoutEffect = wp.element.useLayoutEffect;

export default wp.element; // default export is the whole wp.element
