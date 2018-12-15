import * as React from "react";
import * as Enzyme from "enzyme";
import { BrowserRouter as Router } from "react-router-dom";
import ForgotPasswordContainer from "../container/forgot-password-container";
import * as fetchUtils from "../../../util/fetch-util";
import fetchMock from "fetch-mock";
import waitForExpect from "wait-for-expect";

const validData = {
	email: "test@test.com"
};

function fillOutForgotForm(wrapper) {
	const emailField = wrapper.find('input[name="email"]');

	expect(emailField).toHaveLength(1);

	emailField.instance().value = validData.email;
	emailField.simulate("change").simulate("blur");
}

function checkDidSubmitForgotForm(wrapper) {
	// Get instance of forgot container
	const forgotContainerInstance = wrapper.find("ForgotPasswordContainer").instance();

	// Setup spy on the submit method in instance, and update container
	const spy = spyOn(forgotContainerInstance, "submit");
	wrapper.update();

	// Need the container instance to update itself as well
	// (sometimes wrapper.update doesn't actually update the component)
	forgotContainerInstance.forceUpdate();

	// Find the form in our container
	const forgotForm = wrapper.find("form");
	expect(forgotForm).toHaveLength(1);
	forgotForm.simulate("submit");

	// Wait for our submit to have been called
	return waitForExpect(() => {
		return expect(spy).toHaveBeenCalled();
	});
}

function submitForgotForm(wrapper) {
	const wrapperContainer = wrapper.find("ForgotPasswordContainer");
	return wrapperContainer.instance().submit();
}

describe("ForgotPasswordContainer", () => {
	it("renders without crashing", () => {
		Enzyme.mount(<Router><ForgotPasswordContainer /></Router>);
	});

	it("renders a ForgotPasswordContainer", () => {
		const wrapper = Enzyme.mount(<Router><ForgotPasswordContainer /></Router>);
		expect(wrapper.find(ForgotPasswordContainer)).toHaveLength(1);
	});

	describe ("when filling out forgot password form", () => {
		let wrapper;
		let successMessage = "We found an account that matches, you should receive an email with instructions on how to reset your password shortly.";
		let notFoundMessage = "No account matches the email address";

		beforeEach(() => {
			wrapper = Enzyme.mount(<Router><ForgotPasswordContainer/></Router>);
		});

		afterEach(() => {
			fetchMock.restore();
			jest.restoreAllMocks();
		});

		it("can fill out form and submit", async () => {
			fillOutForgotForm(wrapper);
			await checkDidSubmitForgotForm(wrapper);
		});

		it("submits the forgot password email to api", async () => {
			fillOutForgotForm(wrapper);
			const fetchSpy = spyOn(fetchUtils, "default");

			// Submit the form
			await submitForgotForm(wrapper);

			// Expect the forgot password api call with the content we entered
			expect(fetchSpy).toHaveBeenCalledWith("/api/forgot-password", {
				body: {
					email: validData.email,
				},
				method: "POST",
			});
		});

		it ("should have the submit button be disabled without an email", () => {
			const submitButton = wrapper.find('input.dsk-Admin-form__submit');
			expect(submitButton).toHaveLength(1);
			expect(submitButton.prop("disabled")).toBe(true);
		});

		it("should give a success message with a valid email", async () => {
			fillOutForgotForm(wrapper);

			// Mock the forgot password response
			fetchMock.mock("/api/forgot-password", {
				status: 200,
				statusCode: 200,
				headers: new Headers({"Content-Type":  "application/json"}),
				body: {id: 1234},
			}, { method: "post"});

			const fetchSpy = spyOn(fetchUtils, "default").and.returnValue(Promise.resolve({ status: 200 }));

			// Submit the form
			await submitForgotForm(wrapper);

			// Expect the api to have been called at least once
			expect(fetchSpy).toHaveBeenCalledTimes(1);

			// Expect the page to change to inform them they started the reset password process
			const formText = wrapper.find('p.dsk-Admin-form__text');
			expect(formText).toHaveLength(1);

			waitForExpect(() => {
				expect(formText.text()).toBe(successMessage);
			});
		});

		it("should give a email not found message for one not in the system", async () => {
			fillOutForgotForm(wrapper);

			// Mock the forgot password response
			fetchMock.mock("/api/forgot-password", {
				status: 500,
				statusCode: 500,
				headers: new Headers({"Content-Type":  "application/json"}),
				body: {"code":500,"message":"User does not exist","error":{}},
			}, { method: "post"});

			const fetchSpy = spyOn(fetchUtils, "default").and.returnValue(Promise.resolve({ status: 200 }));

			// Submit the form
			await submitForgotForm(wrapper);

			// Expect the api to have been called at least once
			expect(fetchSpy).toHaveBeenCalledTimes(1);

			// Expect the page to change to inform them they started the reset password process
			const errorText = wrapper.find('div.dsk-Admin-form__error');
			expect(errorText).toHaveLength(1);

			waitForExpect(() => {
				expect(errorText.text()).toBe(notFoundMessage);
			});
		})
	});
});
