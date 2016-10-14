import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import Header from "../Header";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { Link } from "react-router";

class TestSearch extends React.Component<any, any> {
  render(): JSX.Element {
    return (
      <div className="test-search">collection</div>
    );
  }
}

describe("Header", () => {
  let wrapper;
  let push, context;

  beforeEach(() => {
    push = stub();
    context = { homeUrl: "home url" };

    wrapper = shallow(
      <Header>
        <TestSearch />
      </Header>,
      { context }
    );
  });

  it("shows the brand name", () => {
    expect(wrapper.containsMatchingElement("Admin")).to.equal(true);
  });

  it("shows a search component", () => {
    let search = wrapper.find(TestSearch);
    expect(search).to.be.ok;
  });

  it("shows links", () => {
    let catalogLinks = wrapper.find(CatalogLink);

    expect(catalogLinks.length).to.equal(3);

    let homeLink = catalogLinks.at(0);
    expect(homeLink.prop("collectionUrl")).to.equal("home url");
    expect(homeLink.prop("bookUrl")).to.equal(null);
    expect(homeLink.children().text()).to.equal("Catalog");

    let complaintsLink = catalogLinks.at(1);
    expect(complaintsLink.prop("collectionUrl")).to.equal("/admin/complaints");
    expect(complaintsLink.prop("bookUrl")).to.equal(null);
    expect(complaintsLink.children().text()).to.equal("Complaints");

    let hiddenLink = catalogLinks.at(2);
    expect(hiddenLink.prop("collectionUrl")).to.equal("/admin/suppressed");
    expect(hiddenLink.prop("bookUrl")).to.equal(null);
    expect(hiddenLink.children().text()).to.equal("Hidden Books");

    let link = wrapper.find(Link);
    expect(link.prop("to")).to.equal("/admin/web/dashboard");
    expect(link.children().text()).to.equal("Dashboard");
  });
});