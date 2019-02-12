import { expect } from "chai";

import * as React from "react";
import { mount } from "enzyme";

import DiagnosticsServiceType from "../DiagnosticsServiceType";
import DiagnosticsServiceTabs from "../DiagnosticsServiceTabs";

describe("DiagnosticsServiceType", () => {
  let wrapper;
  let services;

  let ts1 = {
    service: "test_service_1",
    id: "1",
    start: "start_time_string_1",
    duration: "0",
    collection_name: "collection1"
  };
  let ts2 = {
    service: "test_service_2",
    id: "2",
    start: "start_time_string_2",
    duration: "0",
    collection_name: "collection2"
  };

  services = {"test_service_1": {"collection1": [ts1]}, "test_service_2": {"collection2": [ts2]}};

  beforeEach(() => {
    wrapper = mount(
      <DiagnosticsServiceType type="monitor" services={services} />
    );
  });

  it("renders service tabs", () => {
    expect(wrapper.hasClass("config")).to.be.true;
    expect(wrapper.hasClass("services")).to.be.true;

    let tabs = wrapper.find("DiagnosticsServiceTabs");
    expect(tabs.length).to.equal(1);
    expect(tabs.prop("tab")).to.equal(wrapper.state()["tab"]);
    expect(tabs.prop("content")).to.equal(wrapper.prop("services"));
  });

  it("switches tabs", () => {
    expect(wrapper.state()["tab"]).to.equal("test_service_1");

    wrapper.instance().goToTab("test_service_2");

    expect(wrapper.state()["tab"]).to.equal("test_service_2");
    expect(wrapper.find("DiagnosticsServiceTabs").prop("tab")).to.equal("test_service_2");
  });

  it("displays a message if there are no services", () => {
    wrapper.setProps({ services: null });

    expect(wrapper.find("DiagnosticsServiceTabs").length).to.equal(0);

    let message = wrapper.find("span");
    expect(message.length).to.equal(1);
    expect(message.text()).to.equal("There are currently no monitor services.");
  });

});