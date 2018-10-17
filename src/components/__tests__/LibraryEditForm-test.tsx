import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import LibraryEditForm from "../LibraryEditForm";
import EditableInput from "../EditableInput";
import ProtocolFormField from "../ProtocolFormField";
import SaveButton from "../SaveButton";

describe("LibraryEditForm", () => {
  let wrapper;
  let save;
  let libraryData = {
    uuid: "uuid",
    name: "name",
    short_name: "short_name",
    settings: {
      "privacy-policy": "http://privacy",
      "copyright": "http://copyright"
    }
  };
  let settingFields = [
    { key: "privacy-policy", label: "Privacy Policy" },
    { key: "copyright", label: "Copyright" }
  ];

  let editableInputByName = (name) => {
    let inputs = wrapper.find(EditableInput);
    if (inputs.length >= 1) {
      return inputs.filterWhere(input => input.props().name === name);
    }
    return [];
  };

  let protocolFormFieldByKey = (key) => {
    let formFields = wrapper.find(ProtocolFormField);
    if (formFields.length >= 1) {
      return formFields.filterWhere(formField => formField.props().setting.key === key);
    }
    return [];
  };

  describe("rendering", () => {
    beforeEach(() => {
      save = stub();
      wrapper = shallow(
        <LibraryEditForm
          data={{ libraries: [libraryData], settings: settingFields }}
          disabled={false}
          save={save}
          urlBase="url base"
          listDataKey="libraries"
          />
      );
    });

    it("renders hidden uuid", () => {
      let input = wrapper.find("input[name=\"uuid\"]");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: libraryData });
      input = wrapper.find("input[name=\"uuid\"]");
      expect(input.props().value).to.equal("uuid");
    });

    it("renders name", () => {
      let input = editableInputByName("name");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: libraryData });
      input = editableInputByName("name");
      expect(input.props().value).to.equal("name");
    });

    it("renders short name", () => {
      let input = editableInputByName("short_name");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: libraryData });
      input = editableInputByName("short_name");
      expect(input.props().value).to.equal("short_name");
    });

    it("renders settings", () => {
      let privacyInput = protocolFormFieldByKey("privacy-policy");
      expect(privacyInput.props().setting).to.equal(settingFields[0]);
      expect(privacyInput.props().value).not.to.be.ok;
      let copyrightInput = protocolFormFieldByKey("copyright");
      expect(copyrightInput.props().setting).to.equal(settingFields[1]);
      expect(copyrightInput.props().value).not.to.be.ok;

      wrapper.setProps({ item: libraryData });
      privacyInput = protocolFormFieldByKey("privacy-policy");
      expect(privacyInput.props().value).to.equal("http://privacy");
      copyrightInput = protocolFormFieldByKey("copyright");
      expect(copyrightInput.props().value).to.equal("http://copyright");
    });

    it("has a save button", () => {
      let saveButton = wrapper.find("SaveButton");
      expect(saveButton.length).to.equal(1);
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      save = stub().returns(new Promise<void>(resolve => resolve()));
      wrapper = mount(
        <LibraryEditForm
          data={{ libraries: [libraryData], settings: settingFields }}
          disabled={false}
          save={save}
          urlBase="url base"
          listDataKey="libraries"
        />
      );
    });

    it("calls save when the save button is clicked", () => {
      let saveButton = wrapper.find("SaveButton");
      saveButton.simulate("click");
      expect(save.callCount).to.equal(1);
    });

    it("calls save when the form is submitted directly", () => {
      wrapper.simulate("submit");
      expect(save.callCount).to.equal(1);
    });

    it("submits data", () => {
      wrapper.setProps({ item: libraryData });

      let saveButton = wrapper.find("SaveButton");
      saveButton.simulate("click");

      expect(save.callCount).to.equal(1);
      let formData = save.args[0][0];
      expect(formData.get("uuid")).to.equal("uuid");
      expect(formData.get("name")).to.equal("name");
      expect(formData.get("short_name")).to.equal("short_name");
      expect(formData.get("privacy-policy")).to.equal("http://privacy");
      expect(formData.get("copyright")).to.equal("http://copyright");
    });

    let fillOutFormFields = () => {
      let nameInput = wrapper.find("input[name='name']");
      let nameInputElement = nameInput.get(0);
      nameInputElement.value = "new name";
      nameInput.simulate("change");
    };

   it("clears the form", () => {
     fillOutFormFields();
     let nameInput = wrapper.find("input[name='name']");
     expect(nameInput.props().value).to.equal("new name");

     wrapper.simulate("submit");
     let newProps = {responseBody: "new library", ...wrapper.props()};
     wrapper.setProps(newProps);

     expect(nameInput.props().value).to.equal("");

   });

   it("doesn't clear the form if there's an error message", () => {
     fillOutFormFields();
     let nameInput = wrapper.find("input[name='name']");
     expect(nameInput.props().value).to.equal("new name");

     wrapper.simulate("submit");
     let newProps = {fetchError: "ERROR", ...wrapper.props()};
     wrapper.setProps(newProps);

     expect(nameInput.props().value).to.equal("new name");
   });

  });
});
