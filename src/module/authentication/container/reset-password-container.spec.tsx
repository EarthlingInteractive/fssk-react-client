import * as React from "react";
import * as Enzyme from "enzyme";
import { BrowserRouter as Router } from "react-router-dom";
import { mountWrap } from "../../../util/contextWrapper";
import ResetPasswordContainer from "../container/reset-password-container";
import * as fetchUtils from "../../../util/fetch-util";
import waitForExpect from "wait-for-expect";
import fetchMock from "fetch-mock";

const validData = {
	name: "Doctor Test",
	email: "drtest@test.com",
	password: "passPASSpass",
	confirmPassword: "passPASSpass",
};

function filloutResetPasswordForm(wrapper) {
	const passwordField = wrapper.find('input[name="password"]');
	const passwordConfirmField = wrapper.find('input[name="confirmPassword"]');

	expect(passwordField).toHaveLength(1);
	expect(passwordConfirmField).toHaveLength(1);

	passwordField.instance().value = validData.password;
	passwordField.simulate("change").simulate("blur");

	passwordConfirmField.instance().value = validData.confirmPassword;
	passwordConfirmField.simulate("change").simulate("blur");
}

function checkDidSubmitResetPasswordForm(wrapper) {
	// Get instance of reset password container
	const resetPasswordContainerInstance = wrapper.find("ResetPasswordContainer").instance();

	// Setup spy on the submit method in instance, and update container
	const spy = spyOn(resetPasswordContainerInstance, "submit");
	wrapper.update();

	// Need the container instance to update itself as well
	// (sometimes wrapper.update doesn't actually update the component)
	resetPasswordContainerInstance.forceUpdate();

	// Find the form in our container
	const resetForm = wrapper.find("form");
	expect(resetForm).toHaveLength(1);
	resetForm.simulate("submit");

	// Wait for our submit to have been called
	return waitForExpect(() => {
		return expect(spy).toHaveBeenCalled();
	});
}

function submitResetPasswordForm(wrapper) {
	const wrapperContainer = wrapper.find("ResetPasswordContainer");
	return wrapperContainer.instance().submit();
}

async function waitForTokenValidation(wrapper, locateForm = true) {
	// Get instance of reset password container and force it to reset
	const resetPasswordContainerInstance = wrapper.find("ResetPasswordContainer").instance();
	resetPasswordContainerInstance.forceUpdate();

	// Wait and expect that the token validation api was called
	await waitForExpect(() => {
		expect(fetchMock.called("/api/reset-password/validate-token/5555-5555")).toBe(true);
	});

	// If we're told to wait for the reset form to show up
	if (locateForm) {
		// Wait for the form
		await waitForExpect(() => {
			const form = wrapper.update().find("form");
			expect(form).toHaveLength(1);
		});

		// Check that the form has the name and email from our valid token validation
		const nameText = wrapper.find("dd.userName");
		expect(nameText).toHaveLength(1);

		const emailText = wrapper.find("dd.userEmail");
		expect(emailText).toHaveLength(1);

		return waitForExpect(() => {
			expect(nameText.text()).toBe(validData.name);
			expect(emailText.text()).toBe(validData.email);
		});
	}
}

describe("ResetPasswordContainer", () => {
	it("renders without crashing", () => {
		Enzyme.mount(<Router><ResetPasswordContainer /></Router>);
	});

	it("renders a RegisterContainer", () => {
		const wrapper = Enzyme.mount(<Router><ResetPasswordContainer /></Router>);
		expect(wrapper.find(ResetPasswordContainer)).toHaveLength(1);
	});

	describe ("when filling out forgot password form", () => {
		let wrapper;
		const props = {};
		const wrappedMount = (route) => mountWrap(<ResetPasswordContainer {...props} />, route);

		describe("with an invalid token", () => {
			beforeEach(() => {
				// Mock the failed token validation response
				fetchMock.mock("/api/reset-password/validate-token/5555-5555", {
					statusCode: 500,
					headers: new Headers({"Content-Type":  "application/json"}),
					body: {code: 500, message: "Reset Token was already used", error: {}},
				}, { method: "get"});

				wrapper = wrappedMount({
					location: {},
					match: {params: {token: "5555-5555"}},
				});
			});

			afterEach(() => {
				fetchMock.restore();
				jest.restoreAllMocks();
			});

			it ("attempts to validate the token", async () => {
				// Check for token validation - but don't bother looking for a form
				await waitForTokenValidation(wrapper, false);

				// Force the container to update itself
				const resetPasswordContainerInstance = wrapper.find("ResetPasswordContainer").instance();
				resetPasswordContainerInstance.forceUpdate();

				// Expect the page to change to inform the user they have an invalid token
				await waitForExpect(() => {
					const errorText = wrapper.update().find("div.reset-password-invalid");
					expect(errorText).toHaveLength(1);
					expect(errorText.text()).toBe("Your token is invalid or has expired. Please reset your password again.");
				});
			});
		});

		describe("with a valid token", () => {
			beforeEach(() => {
				// Mock the reset password's validate token response
				fetchMock.mock("/api/reset-password/validate-token/5555-5555", {
					isValid: true,
					token: {tokenhash: "5555-5555", completed: false, expires_at: "2030-12-26T00:00:00.000Z"},
					user: {name: validData.name, email: validData.email},
				}, { method: "get"});

				wrapper = wrappedMount({
					location: {},
					match: {params: {token: "5555-5555"}},
				});
			});

			afterEach(() => {
				fetchMock.restore();
				jest.restoreAllMocks();
			});

			it("can validate token show the form", async () => {
				await waitForTokenValidation(wrapper);
			});

			it("can fill out form and submit", async () => {
				await waitForTokenValidation(wrapper);
				filloutResetPasswordForm(wrapper);
				await checkDidSubmitResetPasswordForm(wrapper);
			});

			it("has the right name and email after token validation", async () => {
				await waitForTokenValidation(wrapper);
			});

			it("submits password reset to api", async () => {
				// Wait for the token to be validated, and to populate the AuthStore with values
				await waitForTokenValidation(wrapper);

				filloutResetPasswordForm(wrapper);

				const fetchSpy = spyOn(fetchUtils, "default");

				// Submit the form
				submitResetPasswordForm(wrapper);

				expect(fetchSpy).toHaveBeenCalledTimes(1);

				// Expect the registration api call with the content we entered
				expect(fetchSpy).toHaveBeenCalledWith("/api/reset-password", {
					body: {
						email: validData.email,
						password: validData.password,
						resetToken: "5555-5555",
					},
					method: "POST",
				});
			});

			it ("should login after valid password reset", async () => {
				// Wait for the token to be validated, and to populate the AuthStore with values
				await waitForTokenValidation(wrapper);

				filloutResetPasswordForm(wrapper);

				// Mock the registration response
				fetchMock.mock("/api/reset-password", {
					status: 200,
					body: {
						user: {id: 1234, email: validData.email},
					},
				}, { method: "post"})
				.mock("/api/auth", {
					status: 200,
					body: {
						user: {id: 1234, email: validData.email, name: "Mister Loggedin"},
					},
				}, { method: "post"});

				// Get instance of reset password container
				const resetPasswordContainerInstance = wrapper.find("ResetPasswordContainer").instance();

				// Setup spy on the submit method in instance, and update container
				const spy = spyOn(resetPasswordContainerInstance, "checkResetPasswordSuccess");
				wrapper.update();

				// Need the container instance to update itself as well
				// (sometimes wrapper.update doesn't actually update the component)
				resetPasswordContainerInstance.forceUpdate();

				// Submit the form
				submitResetPasswordForm(wrapper);

				// Wait for the registration form to attempt a login
				await waitForExpect(() => {
					expect(fetchMock.called("/api/auth")).toBe(true);
				});
			});
		});
	});
});
