import {observer} from "mobx-react";
import * as React from "react";

interface IActivateAccountComponentProps {
	validToken: boolean;
	isLoading: boolean;
}

@observer
export default class ActivateAccountComponent extends React.Component<IActivateAccountComponentProps> {

	public renderActivationSuccessful()  {
		return (
			<div className="reset-success justify-content-center">
				<p>Your account is now confirmed.</p>
				<a href="/" className="btn btn-primary">Go to App</a>
			</div>
		);
	}

	public renderLoading() {
		return (
			<div>
				<p>Validating token...</p>
			</div>
		);
	}


	public renderInvalidToken() {
		return (
			<div>
				<p>Your token is invalid or has expired.</p>
				<a href="/" className="btn btn-default">Return to Log in</a>
			</div>
		);
	}

	public render() {

		let componentContents;
		if (this.props.isLoading) {
			componentContents = this.renderLoading();
		} else if (this.props.validToken === true) {
			componentContents = this.renderActivationSuccessful();
		} else if (this.props.validToken === false) {
			componentContents = this.renderInvalidToken();
		}

		return (
			<div className="d-flex justify-content-center">
				{componentContents}
			</div>
		);
	}
}
