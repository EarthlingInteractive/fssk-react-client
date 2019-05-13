import * as React from "react";
// these react-router-dom vars are implicitly "any"
// because the type definition file isn't compatible with our version of typescript
import { BrowserRouter as Router, Route, Switch} from "react-router-dom";
import LoginContainer from "../../authentication/container/login-container";
import RegisterContainer from "../../authentication/container/register-container";
import TodoContainer from "../../todo/container/todo-container";
import ProtectedRouteContainer from "./protected-route-container";
import ForgotPasswordContainer from "../../authentication/container/forgot-password-container";
import ResetPasswordContainer from "../../authentication/container/reset-password-container";
import AccountCreatedContainer from "../../authentication/container/account-created-container";
import ActivateAccountContainer from "../../authentication/container/activate-account-container";

export default class RoutingContainer extends React.Component<any> {
	public render() {
		const pageNotFound = () => (<h1>404 - Page not found</h1>);
		return (
				<Router>
					<Switch>
						<Route exact path="/login" component={LoginContainer} />
						<Route exact path="/register" component={RegisterContainer} />
						<Route exact path="/account-created" component={AccountCreatedContainer} />
						<Route exact path="/activate-account/:token" component={ActivateAccountContainer} />
						<Route exact path="/forgot-password" component={ForgotPasswordContainer} />
						<Route exact path="/reset-password/:token" component={ResetPasswordContainer} />
						<ProtectedRouteContainer exact path="/" component={TodoContainer} />
						<Route component={pageNotFound} />
					</Switch>
				</Router>
		);
	}
}
