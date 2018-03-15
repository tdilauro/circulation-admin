import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import CustomListEditor from "../CustomListEditor";
import TextWithEditMode from "../TextWithEditMode";
import EditableInput from "../EditableInput";
import CustomListEntriesEditor from "../CustomListEntriesEditor";

describe("CustomListEditor", () => {
  let wrapper;
  let editCustomList;
  let search;
  let loadMoreSearchResults;

  let listData = {
    id: 1,
    name: "list",
    entries: [
      { pwid: "1", title: "title 1", authors: ["author 1"] },
      { pwid: "2", title: "title 2", authors: ["author 2a", "author 2b"] }
    ],
    collections: [
      { id: 2, name: "collection 2", protocol: "protocol" }
    ]
  };

  let searchResults = {
    id: "id",
    url: "url",
    title: "title",
    lanes: [],
    books: [],
    navigationLinks: []
  };

  let collections = [
    { id: 1, name: "collection 1", protocol: "protocol", libraries: [{ short_name: "library" }] },
    { id: 2, name: "collection 2", protocol: "protocol", libraries: [{ short_name: "library" }] },
    { id: 3, name: "collection 3", protocol: "protocol", libraries: [{ short_name: "library" }] }
  ];

  beforeEach(() => {
    editCustomList = stub().returns(new Promise<void>(resolve => resolve()));
    search = stub();
    loadMoreSearchResults = stub();
    wrapper = shallow(
      <CustomListEditor
        library="library"
        list={listData}
        searchResults={searchResults}
        collections={collections}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );
  });

  it("shows list name", () => {
    let name = wrapper.find(TextWithEditMode);
    expect(name.length).to.equal(1);
    expect(name.props().text).to.equal("list");
    expect(name.props().placeholder).to.equal("list name");
  });

  it("shows list id", () => {
    let listId = wrapper.find(".custom-list-editor-header h4");
    expect(listId.length).to.equal(1);
    expect(listId.text()).to.contain("1");
  });

  it("shows entries editor with list entries and search results", () => {
    let entriesEditor = wrapper.find(CustomListEntriesEditor);
    expect(entriesEditor.length).to.equal(1);
    expect(entriesEditor.props().entries).to.equal(listData.entries);
    expect(entriesEditor.props().searchResults).to.equal(searchResults);
    expect(entriesEditor.props().loadMoreSearchResults).to.equal(loadMoreSearchResults);
    expect(entriesEditor.props().isFetchingMoreSearchResults).to.equal(false);
  });

  it("shows collections", () => {
    let inputs = wrapper.find(EditableInput);
    expect(inputs.length).to.equal(3);
    expect(inputs.at(0).props().label).to.equal("collection 1");
    expect(inputs.at(0).props().value).to.equal("1");
    expect(inputs.at(0).props().checked).to.equal(false);
    expect(inputs.at(1).props().label).to.equal("collection 2");
    expect(inputs.at(1).props().value).to.equal("2");
    expect(inputs.at(1).props().checked).to.equal(true);
    expect(inputs.at(2).props().label).to.equal("collection 3");
    expect(inputs.at(2).props().value).to.equal("3");
    expect(inputs.at(2).props().checked).to.equal(false);
  });

  it("saves list", () => {
    wrapper = mount(
      <CustomListEditor
        library="library"
        list={listData}
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );
    let getTextStub = stub(TextWithEditMode.prototype, "getText").returns("new list name");
    let newEntries = [
      { pwid: "pwid1" }, { pwid: "pwid2" }
    ];
    let getEntriesStub = stub(CustomListEntriesEditor.prototype, "getEntries").returns(newEntries);
    let saveButton = wrapper.find(".save-list");
    saveButton.simulate("click");

    expect(editCustomList.callCount).to.equal(1);
    let formData = editCustomList.args[0][0];
    expect(formData.get("id")).to.equal("1");
    expect(formData.get("name")).to.equal("new list name");
    expect(formData.get("entries")).to.equal(JSON.stringify(newEntries));
    expect(formData.get("collections")).to.equal(JSON.stringify([2]));
    let listId = editCustomList.args[0][1];
    expect(listId).to.equal("1");

    getTextStub.restore();
    getEntriesStub.restore();
  });

  it("navigates to edit page after a new list is created", async () => {
    // Set window.location.href to be writable, jsdom doesn't normally allow changing it but browsers do.
    // Start on the create page.
    Object.defineProperty(window.location, "href", { writable: true, value: "/admin/web/lists/library/create" });

    wrapper = mount(
      <CustomListEditor
        library="library"
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );
    let getTextStub = stub(TextWithEditMode.prototype, "getText").returns("new list name");
    let newEntries = [
      { pwid: "pwid1" }, { pwid: "pwid2" }
    ];
    let getEntriesStub = stub(CustomListEntriesEditor.prototype, "getEntries").returns(newEntries);
    let saveButton = wrapper.find(".save-list");
    saveButton.simulate("click");

    expect(editCustomList.callCount).to.equal(1);
    getTextStub.restore();
    getEntriesStub.restore();

    wrapper.setProps({ editedIdentifier: "5" });
    // Let the call stack clear so the callback after editCustomList will run.
    const pause = (): Promise<void> => {
        return new Promise<void>(resolve => setTimeout(resolve, 0));
    };
    await pause();
    expect(window.location.href).to.contain("edit");
    expect(window.location.href).to.contain("5");
  });

  it("cancels changes", () => {
    let listNameReset = stub(TextWithEditMode.prototype, "reset");
    let listEntriesReset = stub(CustomListEntriesEditor.prototype, "reset");

    wrapper = mount(
      <CustomListEditor
        library="library"
        list={listData}
        searchResults={searchResults}
        collections={collections}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );

    // the cancel button isn't shown when there are no changes.
    let cancelButton = wrapper.find(".cancel-changes");
    expect(cancelButton.length).to.equal(0);

    (wrapper.instance() as CustomListEditor).changeName("new name");
    cancelButton = wrapper.find(".cancel-changes");
    expect(cancelButton.length).to.equal(1);
    cancelButton.simulate("click");

    expect(listNameReset.callCount).to.equal(1);
    expect(listEntriesReset.callCount).to.equal(1);

    (wrapper.instance() as CustomListEditor).changeName(listData.name);
    cancelButton = wrapper.find(".cancel-changes");
    expect(cancelButton.length).to.equal(0);

    (wrapper.instance() as CustomListEditor).changeCollection(collections[0]);
    cancelButton = wrapper.find(".cancel-changes");
    expect(cancelButton.length).to.equal(1);
    cancelButton.simulate("click");

    cancelButton = wrapper.find(".cancel-changes");
    expect(cancelButton.length).to.equal(0);

    wrapper = mount(
      <CustomListEditor
        library="library"
        list={listData}
        searchResults={searchResults}
        collections={collections}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );
    (wrapper.instance() as CustomListEditor).changeEntries([{ pwid: "1234", title: "a", authors: [] }]);
    cancelButton = wrapper.find(".cancel-changes");
    expect(cancelButton.length).to.equal(1);
    cancelButton.simulate("click");

    expect(listNameReset.callCount).to.equal(3);
    expect(listEntriesReset.callCount).to.equal(3);
    cancelButton = wrapper.find(".cancel-changes");

    (wrapper.instance() as CustomListEditor).changeEntries(listData.entries);
    cancelButton = wrapper.find(".cancel-changes");
    expect(cancelButton.length).to.equal(0);

    listNameReset.restore();
    listEntriesReset.restore();
  });

  it("changes selected collections", () => {
    wrapper = mount(
      <CustomListEditor
        library="library"
        list={listData}
        searchResults={searchResults}
        collections={collections}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );

    let inputs = wrapper.find(EditableInput);
    expect(inputs.at(0).props().checked).to.equal(false);
    expect(inputs.at(1).props().checked).to.equal(true);

    inputs.at(0).props().onChange();
    inputs = wrapper.find(EditableInput);
    expect(inputs.at(0).props().checked).to.equal(true);
    expect(inputs.at(1).props().checked).to.equal(true);

    inputs.at(1).props().onChange();
    inputs = wrapper.find(EditableInput);
    expect(inputs.at(0).props().checked).to.equal(true);
    expect(inputs.at(1).props().checked).to.equal(false);
  });

  it("searches", () => {
    wrapper = mount(
      <CustomListEditor
        library="library"
        list={listData}
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );
    let input = wrapper.find(".form-control") as any;
    input.get(0).value = "test";

    let searchForm = wrapper.find("form");
    searchForm.simulate("submit");

    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal("/library/search?q=test");
  });
});