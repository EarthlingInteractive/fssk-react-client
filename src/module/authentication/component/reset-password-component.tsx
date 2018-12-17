import {observer} from "mobx-react";
import * as React from "react";
import FormInput from "../../common/component/form-input-component";

interface IResetPasswordComponentProps {
	submit: () => void;
	updateField: (field: string, val: string) => void;
	password?: string;
	name?: string;
	email?: string;
	passwordError?: string;
	confirmPassword?: string;
	confirmPasswordError?: string;
	validToken ?: boolean;
	isLoading ?: boolean;
}

@observer
export default class ResetPasswordComponent extends React.Component<IResetPasswordComponentProps> {
	constructor(props: IResetPasswordComponentProps) {
		super(props);
		this.onSubmit = this.onSubmit.bind(this);
	}

	public renderUserInformation() {
		const {	name, email } = this.props;
		return (
			<dl className="col-md-4">
				<dt>Full Name:</dt>
				<dd className="userName">{name}</dd>
				<dt>Email:</dt>
				<dd className="userEmail">{email}</dd>
			</dl>
		);
	}

	public renderResetSuccessful()  {
		return (
			<div className="reset-success justify-content-center">
				<p>You have successfully changed your password and you are now logged in.</p>
				<a href="/" className="btn btn-primary">Go to App</a>
			</div>
		);
	}

	public renderLoading() {
		return (
			<div className="justify-content-center">
				<p>Validating reset token</p>
			</div>
		);
	}

	public renderInvalidToken() {
		return (
			<div className="reset-password-invalid">Your token is invalid or has expired. Please <a href="/forgot-password">reset your password</a> again.</div>
		);
	}

	public renderResetForm() {
		const {
			updateField,
			password,
			passwordError,
			confirmPassword,
			confirmPasswordError,
		} = this.props;

		return (
			<div className="row">
				<div className="col-md-8">
					<p>Choose a new password.</p>
					<form onSubmit={this.onSubmit}>
						<FormInput
							label="password"
							type="password"
							name="password"
							value={password}
							error={passwordError}
							onChange={updateField}
							autoFocus
							fieldsetClass="dsk-Admin-form__item"
							labelClass="dsk-Admin-form__label"
							inputClass="dsk-Admin-form__input form-control"
							errorClass="dsk-Admin-form__error"
						/>
						<FormInput
							label="confirm password"
							type="password"
							name="confirmPassword"
							value={confirmPassword}
							error={confirmPasswordError}
							onChange={updateField}
							fieldsetClass="dsk-Admin-form__item"
							labelClass="dsk-Admin-form__label"
							inputClass="dsk-Admin-form__input form-control"
							errorClass="dsk-Admin-form__error"
						/>
						<input
							type="submit"
							value="Set Password"
							className="dsk-Admin-form__submit btn btn-primary"
							disabled={password == '' || confirmPassword == ''}
						/>
					</form>
				</div>
				{this.renderUserInformation()}
			</div>
		);
	}

	public render() {
		const { validToken, isLoading } = this.props;

		let componentContents;

		if (isLoading) {
			// Container is busy loading stuff
			componentContents = this.renderLoading();
		} else if (validToken) {
			// Token was validated so show the form
			componentContents = this.renderResetForm();
		} else {
			// Token is invalid
			componentContents = this.renderInvalidToken();
		}

		return (
			<div className="dsk-Admin-form login container d-flex justify-content-center ">
				<div className="dsk-AdminLogin__content justify-content-center">
					<div className="dsk-Admin-form__title d-flex justify-content-center">
						Reset Password
					</div>
					{componentContents}
				</div>
			</div>
		);
	}

	private onSubmit(e: any) {
		e.preventDefault();
		this.props.submit();
	}
}
