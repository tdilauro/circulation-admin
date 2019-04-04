import * as React from "react";
import WithRemoveButton from "./WithRemoveButton";
import LanguageField from "./LanguageField";
import { SettingData } from "../interfaces";
import ToolTip from "./ToolTip";
import { LocatorIcon } from "@nypl/dgx-svg-icons";

export interface InputListProps {
  createEditableInput: (setting: SettingData, customProps?: any, children?: JSX.Element[]) => JSX.Element;
  labelAndDescription: (SettingData) => JSX.Element[];
  setting: SettingData;
  disabled: boolean;
  value: Array<string | {}>;
  additionalData?: any;
}

export interface InputListState {
  listItems: Array<string | {}>;
  newItem?: string;
}

export default class InputList extends React.Component<InputListProps, InputListState> {

  constructor(props) {
    super(props);
    this.state = {
      listItems: (props.value as string[] || []),
      newItem: ""
    };
    this.updateNewItem = this.updateNewItem.bind(this);
    this.addListItem = this.addListItem.bind(this);
    this.removeListItem = this.removeListItem.bind(this);
    this.clear = this.clear.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({ listItems: (newProps.value || []) });
  }

  render(): JSX.Element {
    const setting = this.props.setting;
    return (
      <div>
        { this.props.labelAndDescription(setting) }
        { this.state.listItems && this.state.listItems.map((listItem) => {
          let value = typeof(listItem) === "string" ? listItem : Object.keys(listItem)[0];
          return (
            <WithRemoveButton
              key={value}
              disabled={this.props.disabled}
              onRemove={() => this.removeListItem(listItem)}
            >
              {
                this.props.setting.format === "language-code" ?
                  <LanguageField
                    disabled={this.props.disabled}
                    value={value}
                    name={setting.key}
                    languages={this.props.additionalData}
                  /> :
                  this.props.createEditableInput(setting, {
                  type: "text",
                  description: null,
                  disabled: this.props.disabled,
                  value: value,
                  name: setting.key,
                  label: null,
                  extraContent: this.renderToolTip(listItem, setting.format)
                })
              }
            </WithRemoveButton>
          );
        })}
        <div>
          <span className="add-list-item">
            { this.props.setting.format === "language-code" ?
                <LanguageField
                  disabled={this.props.disabled}
                  ref="addListItem"
                  name={setting.key}
                  languages={this.props.additionalData}
                  onChange={this.updateNewItem}
                /> :
              this.props.createEditableInput(setting, {
                value: null,
                disabled: this.props.disabled,
                onChange: this.updateNewItem,
                ref: "addListItem",
                label: null,
                description: null
              })
            }
          </span>
          <button
            type="button"
            className="btn btn-default add-list-item"
            disabled={this.props.disabled || !this.state.newItem.length}
            onClick={this.addListItem}
            >Add</button>
        </div>
      </div>
    );
  }

  renderToolTip(item: {} | string, format: string) {
    const icons = {
      "geographic": <LocatorIcon />
    };
    if (typeof(item) === "object") {
      return (
        <span className="input-group-addon">
          <ToolTip trigger={icons[format]} direction="point-right" text={Object.values(item)[0]}/>
        </span>
      );
    }
    return null;
  }

  updateNewItem() {
    let ref = this.props.setting.format === "language-code" ?
      (this.refs["addListItem"] as any).refs["autocomplete"] :
      (this.refs["addListItem"] as any);

    this.setState({...this.state, ...{ newItem: ref.getValue() }});
  }

  removeListItem(listItem: string | {}) {
    this.setState({ listItems: this.state.listItems.filter(stateListItem => stateListItem !== listItem) });
  }

  addListItem() {
    let ref = this.props.setting.format === "language-code" ?
      (this.refs["addListItem"] as any).refs["autocomplete"] :
      (this.refs["addListItem"] as any);

    const listItem = ref.getValue();
    this.setState({ listItems: this.state.listItems.concat(listItem), newItem: "" });
    ref.clear();
  }

  getValue() {
    return this.state.listItems;
  }

  clear() {
    this.setState({ listItems: [] });
  }
}