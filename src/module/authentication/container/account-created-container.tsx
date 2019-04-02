import {observer} from "mobx-react";
import * as React from "react";
import AccountCreatedComponent from "../component/account-created-component";
import AuthStore from "../store/auth-store";

@observer
export default class AccountCreatedContainer extends React.Component<any> {
	public render() {
		const {
			email
		} = AuthStore;

		const resendEmail = () => {
			AuthStore.resendActivationEmail(email);
		};

		const props = {
			email,
			resendEmail,
		};
		return (<AccountCreatedComponent {...props} />);
	}
}
