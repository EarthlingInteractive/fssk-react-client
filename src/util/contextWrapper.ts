import * as Enzyme from "enzyme";
import { shape } from "prop-types";
import { createBrowserHistory as createHistory } from "history";

// Instantiate router context with no history
const router = (route: any) => {
	return {
		history: createHistory({}),
		route,
	};
};

const createContext = (givenRoute: any) => {
	return {
		context: { router: router(givenRoute) },
		childContextTypes: { router: shape({}) },
	};
};

// Create an enzyme mount with our given reactcontainer, and
// create a context based off of the
export function mountWrap(node: any, route: any) {
	return Enzyme.mount(node, createContext(route));
}
