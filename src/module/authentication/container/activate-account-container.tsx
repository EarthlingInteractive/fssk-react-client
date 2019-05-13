import * as React from "react";
import { observer } from "mobx-react";
import AuthStore from "../store/auth-store";
import { withRouter } from "react-router-dom";
import ActivateAccountComponent from "../component/activate-account-component";

const initialState = { isLoading: true, validToken: false };
type State = Readonly<typeof initialState>;

@observer
class ActivateAccountContainer extends React.Component<any, State> {
	public state = initialState;

	public componentDidMount() {
		const { activateUser } = AuthStore;
		const {match: { params }} = this.props;

		if (params && params.token) {
			activateUser(params.token)
				.then((validToken: boolean) => {
					this.setState({ isLoading: false, validToken });
				});
		}
	}

	public render() {
		const props = {
			validToken: this.state.validToken,
			isLoading: this.state.isLoading,
		};

		return (<ActivateAccountComponent {...props} />);
	}
}

export default withRouter(ActivateAccountContainer);
