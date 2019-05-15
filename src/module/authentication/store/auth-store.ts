import {action, observable, configure} from "mobx";
import {checkRequiredFields} from "../../../util/validation";
import * as validator from "validator";
import fetchUtil from "../../../util/fetch-util";

configure({
	enforceActions: true, // don't allow editing of state outside of mobx actions
});

export class AuthStore {
	@observable public email: string = "";
	@observable public name: string = "";
	@observable public password: string = "";
	@observable public confirmPassword: string = "";
	@observable public resetToken: string = "";

	@observable public emailError: string = "";
	@observable public nameError: string = "";
	@observable public passwordError: string = "";
	@observable public confirmPasswordError: string = "";
	@observable public activationError: string = "";

	@observable public user: any = null;
	@observable public hasLoadedSession: boolean = false;

	// make the object indexable so [] notation works
	[key: string]: any;

	private errorFields = ["emailError", "nameError", "passwordError", "confirmPasswordError", "activationError"];
	private dataFields = ["email", "name", "password", "confirmPassword", "resetToken"];

	@action.bound public updateField(field: string, val: string) {
		if (this.dataFields.includes(field)) {
			this[field] = val;
		} else {
			this.handleError(new Error(`Something tried to update a field named ${field} in the authorization store`));
		}
	}

	@action.bound public updateErrorField(field: string, val: string) {
		if (this.errorFields.includes(field)) {
			this[field] = val;
		} else {
			this.handleError(new Error(`Something tried to update an error field named ${field} in the authorization store`));
		}
	}

	@action.bound public async register() {
		if (!this.isRegistrationValid()) { return false; }

		const {email, name, password} = this;

		try {
			await fetchUtil("/api/users/register", {
				body: {
					email,
					name,
					password,
				},
				method: "POST",
			});

			// clear the fields for the next time the user comes to this page
			this.clearProperties(["name", "password"]);
			return true;

		} catch (error) {
			this.handleError(error);
			return false;
		}
	}

	public validateRegistration(name: string, email: string, password: string, confirmPassword: string) {
		const results: any = {
			nameError: "",
			emailError: "",
			passwordError: "",
			confirmPasswordError: "",
			allValid: true,
		};

		const missingRequired = checkRequiredFields(
			["email", "name", "password", "confirmPassword"],
			{ email, name, password, confirmPassword },
		);

		if (missingRequired.length > 0) {
			missingRequired.forEach((key: string) => {
				results[`${key}Error`] = "Required Field";
			});
			results.allValid = false;
		}

		if (!results.emailError && !validator.isEmail(email)) {
			results.emailError = "Invalid Email Format";
			results.allValid = false;
		}

		if (!results.passwordError && !validator.isLength(password, {min: 10, max: 100})) {
			results.passwordError = "Password must be at least 10 characters";
			results.allValid = false;
		}

		if (!results.confirmPasswordError && (password !== confirmPassword)) {
			results.confirmPasswordError = "Passwords do not match";
			results.allValid = false;
		}

		return results;
	}

	public validatePasswordReset(password: string, confirmPassword: string) {
		const results: any = {
			passwordError: "",
			confirmPasswordError: "",
			allValid: true,
		};

		const missingRequired = checkRequiredFields(
			["password", "confirmPassword"],
			{password, confirmPassword },
		);

		if (missingRequired.length > 0) {
			missingRequired.forEach((key: string) => {
				results[`${key}Error`] = "Required Field";
			});
			results.allValid = false;
		}

		if (!results.passwordError && !validator.isLength(password, {min: 10, max: 100})) {
			results.passwordError = "Password must be at least 10 characters";
			results.allValid = false;
		}

		if (!results.confirmPasswordError && (password !== confirmPassword)) {
			results.confirmPasswordError = "Passwords do not match";
			results.allValid = false;
		}

		return results;
	}

	@action.bound public async resetPassword() {
		if (!this.isPasswordResetValid()) { return false; }
		const { password, email, resetToken } = this;
		try {
			await fetchUtil("/api/reset-password", {
				body: {
					password, email, resetToken,
				},
				method: "POST",
			});
			return true;
		} catch (error) {
			this.handleError(error);
			return false;
		}
	}

	@action.bound public async resendActivationEmail(email: string): Promise<boolean> {
		try {
			const response = await fetchUtil(`/api/users/resend-activation/${email}`, {
				method: "GET",
			});
			if (response && response.id) {
				return true;
			}
			return false;
		} catch (error) {
			this.handleError(error);
			return false;
		}
	}

	public async resendActivationEmailWithAlert(email: string): Promise<boolean> {
		const success = await this.resendActivationEmail(email);
		if (!success) {
			alert("Too many attempts to resend the activation email in a short period of time, please try again in 5 minutes");
		}
		return success;
	}

	@action.bound public async activateUser(token: string) {
		try {
			const response = await fetchUtil(`/api/users/activate/${token}`, {
				method: "GET",
			});
			if (response && response.isValid && response.user) {
				this.updateVarsFromUser(response.user);
				return true;
			}
			return false;
		} catch (error) {
			this.handleError(error);
			return false;
		}
	}

	@action.bound public async verifyResetToken(token: string) {
		try {
			const response = await fetchUtil(`/api/reset-password/validate-token/${token}`, {
				method: "GET",
			});
			if (response && response.isValid && response.user) {
				// We update our vars (name, email) from the user data
				// We cannot just assign the this.user to the response user because that
				// would count as being 'logged in'
				this.updateVarsFromUser(response.user);
				this.updateField("resetToken", token);
				return true;
			}
			return false;
		} catch (error) {
			this.handleError(error);
			return false;
		}
	}

	@action.bound public async forgotPassword() {
		if (!this.isEmailValid()) { return false; }
		const { email } = this;
		try {
			await fetchUtil("/api/forgot-password", {
				body: {
					email,
				},
				method: "POST",
			});

			this.clearAll();
			return true;
		} catch (error) {
			// If we weren't able to handle the error, then indicate that something unexpected happened
			if (!this.handleError(error)) {
				this.updateErrorField("emailError", "An unknown error occurred resetting email.");
			}
			return false;
		}
	}

	@action.bound public async login() {
		if (!this.isLoginValid()) { return false; }

		const {email, password} = this;
		try {
			const response = await fetchUtil("/api/auth", {
				body: {
					email,
					password,
				},
				method: "POST",
			});

			// clear the fields for the next time the user comes to this page
			this.clearAll();

			// save the user info
			if (response.user) {
				this.updateUser(response.user);
			}

			return true;
		} catch (error) {
			if (!this.handleError(error)) {
				this.updateErrorField("passwordError", "Log in failed.");
			}
			return false;
		}
	}

	public validateEmail(email: string) {
		const results: any = {
			emailError: "",
			allValid: true,
		};

		const missingRequired = checkRequiredFields(
			["email"],
			{ email },
		);

		if (missingRequired.length > 0) {
			missingRequired.forEach((key: string) => {
				results[`${key}Error`] = "Required Field";
			});
			results.allValid = false;
		}

		if (!results.emailError && !validator.isEmail(email)) {
			results.emailError = "Invalid Email Format";
			results.allValid = false;
		}

		return results;
	}

	public validateLogin(email: string, password: string) {
		const results: any = {
			emailError: "",
			passwordError: "",
			allValid: true,
		};

		const missingRequired = checkRequiredFields(
			["email", "password"],
			{ email, password },
		);

		if (missingRequired.length > 0) {
			missingRequired.forEach((key: string) => {
				results[`${key}Error`] = "Required Field";
			});
			results.allValid = false;
		}

		if (!results.emailError && !validator.isEmail(email)) {
			results.emailError = "Invalid Email Format";
			results.allValid = false;
		}

		return results;
	}

	/**
	 * Attempts to parse an error message to set an email and password.
	 * Returns true if we parsed the response.
	 * @param error
	 * @returns boolean true if the response was parsed and added to error fields
	 */
	@action.bound public parseServerErrorResponse(error: any) {
		// for now the only error we really expect and can handle gracefully is a non-unique email
		if (error.status === 401) {
			// setting emailError to a non-empty string so both fields get shown in an error state
			// but we only want the error message at the bottom (under password)
			this.emailError = " ";
			this.passwordError = "Incorrect email or password";
			return true;
		} else if (error.status === 500) {
			// A flag to see if we recognize the error message
			let parsedError = false;

			if (error.json) {
				switch (error.json.message) {
					case "Something went wrong when trying to send an email.":
						this.updateErrorField("emailError", error.json.message);
						parsedError = true;
						break;
					case "email is not unique":
						this.updateErrorField("emailError", "A user already exists with this email");
						parsedError = true;
						break;
					case "User does not exist":
						this.updateErrorField("emailError", "No account matches the email address");
						parsedError = true;
						break;
					case "user not activated":
						this.updateErrorField("activationError",
							"You can't log in yet. We previously sent an activation email to you at " + this.email +
							". Please follow the instructions in that email to activate your account.");
						parsedError = true;
						break;
					default:
						break;
				}
			}
			return parsedError;
		}
		return false;
	}

	public async loadSession() {
		try {
			const response = await fetchUtil("/api/auth");

			// save the user info
			this.updateUser(response.user);

		} catch (error) {
			this.handleError(error);
		}
	}

	@action.bound public async logout() {
		try {
			await fetchUtil("/api/auth", {
				method: "DELETE",
			});

			this.updateUser(null, true);

		} catch (error) {
			this.handleError(error);
		}
	}

	@action.bound public updateVarsFromUser(user: any) {
		this.name = user.name;
		this.email = user.email;
	}

	@action.bound public updateUser(user: any, isClearing = false) {
		this.user = user;
		this.hasLoadedSession = !isClearing;
	}

	public isLoggedIn() {
		return (this.user && this.user.id);
	}

	private isRegistrationValid() {
		const validation: any = this.validateRegistration(this.name, this.email, this.password, this.confirmPassword);

		this.emailError = validation.emailError;
		this.nameError = validation.nameError;
		this.passwordError = validation.passwordError;
		this.confirmPasswordError = validation.confirmPasswordError;

		return validation.allValid;
	}

	private isPasswordResetValid() {
		const validation: any = this.validatePasswordReset(this.password, this.confirmPassword);

		this.passwordError = validation.passwordError;
		this.confirmPasswordError = validation.confirmPasswordError;

		return validation.allValid;
	}

	private isEmailValid() {
		const validation: any = this.validateEmail(this.email);
		this.emailError = validation.emailError;
		return validation.allValid;
	}

	private isLoginValid() {
		const validation: any = this.validateLogin(this.email, this.password);

		this.emailError = validation.emailError;
		this.passwordError = validation.passwordError;

		return validation.allValid;
	}

	private clearAll() {
		const keys = this.errorFields.concat(this.dataFields);
		this.clearProperties(keys);
	}

	@action.bound private clearProperties(props: string[]) {
		props.forEach((key) => { this[key] = ""; });
	}

	private handleError(error: any) {
		// @todo report this error, somehow...?
		// console.error(error);
		return this.parseServerErrorResponse(error);
	}
}

const authStore = new AuthStore();
export default authStore;
