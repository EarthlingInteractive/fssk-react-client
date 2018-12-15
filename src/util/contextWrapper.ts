// import { BrowserRouter } from 'react-router-dom';
import * as Enzyme from "enzyme";
import { shape } from 'prop-types';
import { createBrowserHistory as createHistory } from "history";

// Instantiate router context
const router = (route:any) => {
  return {
    history: createHistory({}), //new BrowserRouter().history,
    route,
  }
};

const createContext = (givenRoute:any) => {
  return {
    context: { router: router(givenRoute) },
    childContextTypes: { router: shape({}) },
  }
};

export function mountWrap(node:any, route:any) {
  return Enzyme.mount(node, createContext(route));
}