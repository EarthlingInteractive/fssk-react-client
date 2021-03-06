import {observer} from "mobx-react";
import * as React from "react";
import {Link} from "react-router-dom";
import FormInput from "../../common/component/form-input-component";

const logo = require("../../../img/logo.png"); // tslint:disable-line

interface ILoginComponentProps {
	submit: () => void;
	updateField: (field: string, val: string) => void;
	resendEmail: () => void;
	email?: string;
	emailError?: string;
	name?: string;
	nameError?: string;
	password?: string;
	passwordError?: string;
	confirmPassword?: string;
	confirmPasswordError?: string;
	activationError?: string;
}

@observer
export default class LoginComponent extends React.Component<ILoginComponentProps> {

	constructor(props: ILoginComponentProps) {
		super(props);
		this.onSubmit = this.onSubmit.bind(this);
		this.resendEmail = this.resendEmail.bind(this);
	}

	public render() {
		const {
			updateField,
			email,
			emailError,
			password,
			passwordError,
			activationError,
		} = this.props;

		const contentStyle = {
				width: "25rem",
				marginTop: "20px",
		};

		let activationErrorEl;
		if (activationError) {
			activationErrorEl = (
				<div>
					<p>{activationError}</p>
					<button className="btn btn-primary" onClick={this.resendEmail}>
						Resend Activation Email
					</button>
				</div>
			);
		}

		return (
			<div className="dsk-Admin-form login container d-flex justify-content-center">
				<div className="dsk-AdminLogin__content d-flex flex-column justify-content-center" style={contentStyle}>
					<div className="dsk-Admin-form__title d-flex justify-content-center">
						Application Log In!
					</div>
					<div className="d-flex justify-content-center">
						<img src={logo} />
					</div>
					<form onSubmit={this.onSubmit}>

						<FormInput
							label="Email"
							type="email"
							name="email"
							value={email}
							error={emailError}
							onChange={updateField}
							fieldsetClass="dsk-Admin-form__item"
							labelClass="dsk-Admin-form__label"
							inputClass="dsk-Admin-form__input form-control"
							errorClass="dsk-Admin-form__error"
						/>

						<FormInput
							label="Password"
							type="password"
							name="password"
							value={password}
							error={passwordError}
							onChange={updateField}
							fieldsetClass="dsk-Admin-form__item"
							labelClass="dsk-Admin-form__label"
							inputClass="dsk-Admin-form__input form-control"
							errorClass="dsk-Admin-form__error"
						/>

						<input type="submit" value="Log In" className="dsk-Admin-form__submit btn btn-primary" />
					</form>
					<p className="dsk-Admin-form__text a-text-align-center">
						<Link to="/forgot-password" className="dsk-Admin-form__textlink">
							I forgot my password.
						</Link>
					</p>
					<p className="dsk-Admin-form__text a-text-align-center">
						Don't have an account?&nbsp;
						<Link to="/register" className="dsk-Admin-form__textlink">
							Create an account here.
						</Link>
					</p>
					{activationErrorEl}
				</div>
			</div>
		);
	}

	private resendEmail(e: any) {
		this.props.resendEmail();
	}

	private onSubmit(e: any) {
		e.preventDefault();
		this.props.submit();
	}
}
