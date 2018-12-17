import { observer } from "mobx-react";
import * as React from "react";
import {Link} from "react-router-dom";
import FormInput from "../../common/component/form-input-component";

interface IForgotPasswordProps {
	email ?: string;
	emailError ?: string;
	successfulForgot ?: boolean;
	submit: () => void;
	updateField: (field: string, val: string) => void;
}

@observer
export default class ForgotPasswordComponent extends React.Component<IForgotPasswordProps> {
	constructor(props: IForgotPasswordProps) {
		super(props);
		this.onSubmit = this.onSubmit.bind(this);
	}

	public onSubmit(e: any) {
		e.preventDefault();
		this.props.submit();
	}

	public renderForm() {
		const {
			email,
			emailError,
			updateField,
		} = this.props;

		return (
			<form onSubmit={this.onSubmit}>
				<p className="dsk-Admin-form__text a-text-align-center">
					Enter your email address, and we'll send you a password reset email.
				</p>
				<FormInput
					label="Email"
					type="email"
					name="email"
					value={email}
					error={emailError}
					onChange={updateField}
					autoFocus
					fieldsetClass="dsk-Admin-form__item"
					labelClass="dsk-Admin-form__label"
					inputClass="dsk-Admin-form__input form-control"
					errorClass="dsk-Admin-form__error"
				/>
				<input
					type="submit"
					value="Reset Password"
					className="dsk-Admin-form__submit btn btn-primary"
					disabled={email === ""}
				/>
			</form>
		);
	}

	public renderSuccessMessage() {
		return (
			<div className="justify-content-center">
				<p className="dsk-Admin-form__text a-text-align-center">
					We found an account that matches, you should receive an email with instructions
					on how to reset your password shortly.
				</p>
				<Link to="/login" className="dsk-Admin-form__submit btn btn-primary">
					Return to Login
				</Link>
			</div>
		);
	}

	public render() {
		const {	successfulForgot } = this.props;

		const contentStyle = {
			width: "25rem",
			marginTop: "20px",
		};

		// If the submission process for the forgot password is a success, then display a message
		// otherwise display the form
		const forgotPasswordElement = successfulForgot ? this.renderSuccessMessage() : this.renderForm();

		return (
			<div className="dsk-Admin-form forgot-password container d-flex justify-content-center">
				<div className="dsk-AdminLogin__content d-flex flex-column justify-content-center" style={contentStyle}>
					<div className="dsk-Admin-form__title d-flex justify-content-center">
						Forgot Password
					</div>
					{forgotPasswordElement}
				</div>
			</div>
		);
	}
}
