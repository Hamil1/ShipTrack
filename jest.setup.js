// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
