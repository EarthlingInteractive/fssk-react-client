import {observer} from "mobx-react";
import * as React from "react";

interface IResetPasswordComponentSuccessProps {
	submit: () => void;
	updateField: (field: string, val: string) => void;
	password?: string;
	name?: string;
	email?: string;
	passwordError?: string;
	confirmPassword?: string;
	confirmPasswordError?: string;
	validToken ?: boolean;
	resetSuccessful ?: boolean;
	isLoading ?: boolean;
}

@observer
export default class ResetPasswordComponentSuccess extends React.Component<IResetPasswordComponentSuccessProps> {
	constructor(props: IResetPasswordComponentSuccessProps) {
		super(props);
	}

	public render() {
		return (
			<div className="dsk-Admin-form login container d-flex justify-content-center ">
				<div className="dsk-AdminLogin__content justify-content-center">
					<div className="dsk-Admin-form__title d-flex justify-content-center">
						Reset Password
					</div>
					<div className="reset-success justify-content-center">
						<p>You have successfully changed your password and you are now logged in.</p>
						<a href="/" className="btn btn-primary">Go to App</a>
					</div>
				</div>
			</div>
		);
	}
}
