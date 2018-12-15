import * as React from "react";
import ResetPasswordComponent from "../component/reset-password-component";
import { observer } from "mobx-react";
import AuthStore from "../store/auth-store";
import { withRouter } from "react-router-dom";
import autobind from "autobind-decorator";
import { observable, action } from "mobx";
import ResetPasswordComponentSuccess from "../component/reset-password-component-success";

@observer
class ResetPasswordContainer extends React.Component<any> {
	@observable hasValidToken:boolean = false;
	@observable resetSuccessful:boolean = false;
	@observable isLoading:boolean = false;

	@action changeIsLoading(loadingStatus:boolean) {
		this.isLoading = loadingStatus;
	}

	@autobind
	@action checkVerifyResetToken(results: any) {
		this.hasValidToken = results;
		this.changeIsLoading(false);
	}

	@autobind
	@action checkLoginSuccess(loginSuccess: boolean) {
		this.resetSuccessful = loginSuccess;
	}

	@autobind
	@action checkResetPasswordSuccess(resetSuccess: any) {
		const { login } = AuthStore;
		if (resetSuccess) {
			login().then(this.checkLoginSuccess);
		}
	}

	@autobind
	submit() {
		const {
			resetPassword,
		} = AuthStore;

		resetPassword().then(this.checkResetPasswordSuccess);
	}

	componentDidMount() {
		const { verifyResetToken } = AuthStore;
		const {match: { params }} = this.props;

		if (params && params.token) {
			this.changeIsLoading(true);
			verifyResetToken(params.token).then(this.checkVerifyResetToken);
		}
	}

	public render() {
		const {match: { params }} = this.props;
		const token = (params && params.token) ? params.token : '';

		const {
			email,
			name,
			updateField,
			password,
			confirmPassword,
			passwordError,
			confirmPasswordError,
		} = AuthStore;

		const props = {
			email,
			name,
			updateField,
			password,
			confirmPassword,
			passwordError,
			submit: this.submit,
			resetToken: token,
			validToken: this.hasValidToken,
			confirmPasswordError,
			isLoading: this.isLoading,
		}

		if (this.resetSuccessful) {
			return (<ResetPasswordComponentSuccess {...props} />);
		}

		return (<ResetPasswordComponent {...props} />);
	}
}

export default withRouter(ResetPasswordContainer);
