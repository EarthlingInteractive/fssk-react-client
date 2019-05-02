import {observer} from "mobx-react";
import * as React from "react";

interface IAccountCreatedComponentProps {
	email: string;
	resendEmail: () => void;
}

@observer
export default class AccountCreatedComponent extends React.Component<IAccountCreatedComponentProps> {

	static defaultProps = { email: 'your email' };

	constructor(props: IAccountCreatedComponentProps) {
		super(props);
		this.resendEmail = this.resendEmail.bind(this);
	}

	private resendEmail(e: any) {
		this.props.resendEmail();
	}

	public render() {
		const {email} = this.props;
		return (
			<div className="container">
				<p>You're almost done! We sent an activation mail to {email}. Please follow the instructions in the mail to activate your account.</p>
				<p>If it doesn't arrive, check your spam folder.</p>
				<a href="/" className="btn btn-primary mr-1">Return to Log in</a>
				<button className="btn btn-secondary" onClick={this.resendEmail}>
					Resend Activation Email
				</button>

			</div>
		);
	}
}
