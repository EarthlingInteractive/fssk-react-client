import {observer} from "mobx-react";
import * as React from "react";

interface IAccountCreatedComponentProps {
	email: string;
	resendEmail: () => void;
}

@observer
export default class AccountCreatedComponent extends React.Component<IAccountCreatedComponentProps> {

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
			<div className="d-flex justify-content-center">
				<p>You're almost done! We sent an activation mail to {email}. Please follow the instructions in the mail to activate your account.</p>
				<p>If it doesn't arrive, check your spam folder.</p>
				<button className="btn btn-primary" onClick={this.resendEmail}>
					Resend Activation Email
				</button>
			</div>
		);
	}

	static defaultProps = { email: 'your email' };
}
