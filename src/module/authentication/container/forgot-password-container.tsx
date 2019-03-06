import * as React from "react";
import ForgotPasswordComponent from "../component/forgot-password-component";
import { observer } from "mobx-react";
import AuthStore from "../store/auth-store";
import { observable, action } from "mobx";
import autobind from "autobind-decorator";

@observer
export default class ForgotPasswordContainer extends React.Component<any> {
	@observable public successfulForgot: boolean = false;

	@autobind
	@action public checkForgotPasswordSuccess(success: any) {
		if (!success) { return; }
		this.successfulForgot = true;
	}

	@autobind
	public submit() {
		const {
			forgotPassword,
		} = AuthStore;

		forgotPassword().then(this.checkForgotPasswordSuccess);
	}

	public render() {
		const {
			email,
			emailError,
			updateField,
		} = AuthStore;

		const props = {
			email,
			emailError,
			updateField,
			submit: this.submit,
			successfulForgot: this.successfulForgot,
		};

		return (<ForgotPasswordComponent {...props} />);
	}
}
