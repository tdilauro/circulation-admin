import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import LibraryEditForm from "../LibraryEditForm";
import EditableInput from "../EditableInput";

describe("LibraryEditForm", () => {
  let wrapper;
  let editLibrary;
  let libraryData = {
    uuid: "uuid",
    name: "name",
    short_name: "short_name",
    library_registry_short_name: "registry name"
  };

  let editableInputByName = (name) => {
    let inputs = wrapper.find(EditableInput);
    if (inputs.length >= 1) {
      return inputs.filterWhere(input => input.props().name === name);
    }
    return [];
  };

  describe("rendering", () => {
    beforeEach(() => {
      editLibrary = stub();
      wrapper = shallow(
        <LibraryEditForm
          csrfToken="token"
          disabled={false}
          editLibrary={editLibrary}
          />
      );
    });

    it("renders hidden csrf token", () => {
      let input = wrapper.find("input[name=\"csrf_token\"]");
      expect(input.props().value).to.equal("token");
    });

    it("renders hidden uuid", () => {
      let input = wrapper.find("input[name=\"uuid\"]");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ library: libraryData });
      input = wrapper.find("input[name=\"uuid\"]");
      expect(input.props().value).to.equal("uuid");
    });

    it("renders name", () => {
      let input = editableInputByName("name");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ library: libraryData });
      input = editableInputByName("name");
      expect(input.props().value).to.equal("name");
    });

    it("renders short name", () => {
      let input = editableInputByName("short_name");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ library: libraryData });
      input = editableInputByName("short_name");
      expect(input.props().value).to.equal("short_name");
    });

    it("renders registry short name", () => {
      let input = editableInputByName("library_registry_short_name");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ library: libraryData });
      input = editableInputByName("library_registry_short_name");
      expect(input.props().value).to.equal("registry name");
    });

    it("renders random registry shared secret checkbox", () => {
      let input = editableInputByName("random_library_registry_shared_secret");
      expect(input.props().label).to.contain("random");
      expect(input.props().type).to.equal("checkbox");

      // it's still there if there's a library but no shared secret
      wrapper.setProps({ library: libraryData });
      input = editableInputByName("random_library_registry_shared_secret");
      expect(input.props().label).to.contain("random");
      expect(input.props().type).to.equal("checkbox");

      // but it's gone if there's a library with a secret
      libraryData = Object.assign({}, libraryData, {
        library_registry_shared_secret: "secret"
      });
      wrapper.setProps({ library: libraryData });
      input = editableInputByName("random_library_registry_shared_secret");
      expect(input.length).to.equal(0);
    });

    it("renders registry shared secret", () => {
      let input = editableInputByName("library_registry_shared_secret");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ library: libraryData });
      input = editableInputByName("library_registry_shared_secret");
      expect(input.props().value).to.equal("secret");
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      editLibrary = stub();
      wrapper = mount(
        <LibraryEditForm
          csrfToken="token"
          disabled={false}
          editLibrary={editLibrary}
          />
      );
    });

    it("shows and hides secret field when random secret is selected/unselected", () => {
      let randomSecret = editableInputByName("random_library_registry_shared_secret");
      let secret = editableInputByName("library_registry_shared_secret");
      expect(secret.length).to.equal(1);

      randomSecret.find("input").simulate("change");
      secret = editableInputByName("library_registry_shared_secret");
      expect(secret.length).to.equal(0);

      randomSecret.find("input").simulate("change");
      secret = editableInputByName("library_registry_shared_secret");
      expect(secret.length).to.equal(1);
    });

    it("submits data", () => {
      wrapper.setProps({ library: libraryData });

      let form = wrapper.find("form");
      form.simulate("submit");

      expect(editLibrary.callCount).to.equal(1);
      let formData = editLibrary.args[0][0];
      expect(formData.get("csrf_token")).to.equal("token");
      expect(formData.get("uuid")).to.equal("uuid");
      expect(formData.get("name")).to.equal("name");
      expect(formData.get("short_name")).to.equal("short_name");
      expect(formData.get("library_registry_short_name")).to.equal("registry name");
    });
  });
});