import * as React from "react";
import EditableInput from "./EditableInput";
import { IndividualAdminsData, IndividualAdminData, AdminRoleData } from "../interfaces";

export interface IndividualAdminEditFormProps {
  data: IndividualAdminsData;
  item?: IndividualAdminData;
  disabled: boolean;
  editItem: (data: FormData) => Promise<void>;
  urlBase: string;
  listDataKey: string;
  editedIdentifier?: string;
}

export interface IndividualAdminEditFormState {
  roles: AdminRoleData[];
}

export interface IndividualAdminEditFormContext {
  settingUp: boolean;
}

/** Form for editing an individual admin from the individual admin configuration page. */
export default class IndividualAdminEditForm extends React.Component<IndividualAdminEditFormProps, IndividualAdminEditFormState> {
  context: IndividualAdminEditFormContext;

  static contextTypes: React.ValidationMap<IndividualAdminEditFormContext> = {
    settingUp: React.PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      roles: (this.props.item && this.props.item.roles) || [],
    };
    this.isSelected = this.isSelected.bind(this);
    this.handleRoleChange = this.handleRoleChange.bind(this);
    this.save = this.save.bind(this);
  }

  render(): JSX.Element {
    return (
      <form ref="form" onSubmit={this.save} className="edit-form">
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          readOnly={!!(this.props.item && this.props.item.email)}
          name="email"
          label="Email"
          value={this.props.item && this.props.item.email}
          />
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name="password"
          label="Password"
          />
        <h4>Roles</h4>
        <EditableInput
          elementType="input"
          type="checkbox"
          disabled={this.props.disabled}
          name="system"
          label="System Admin"
          checked={this.isSelected("system")}
          onChange={() => this.handleRoleChange("system")}
          />
        <table className="library-admin-roles">
          <thead>
            <tr>
              <th></th>
              <th>
                <EditableInput
                  elementType="input"
                   type="checkbox"
                   disabled={this.props.disabled}
                   name="manager-all"
                   label="Library Manager"
                   checked={this.isSelected("manager-all")}
                   onChange={() => this.handleRoleChange("manager-all")}
                   />
              </th>
              <th>
                <EditableInput
                  elementType="input"
                  type="checkbox"
                  disabled={this.props.disabled}
                  name="librarian-all"
                  label="Librarian"
                  checked={this.isSelected("librarian-all")}
                  onChange={() => this.handleRoleChange("librarian-all")}
                  />
              </th>
            </tr>
          </thead>
          <tbody>
            { this.props.data && this.props.data.allLibraries && this.props.data.allLibraries.map(library =>
              <tr key={library.short_name}>
                <td>
                  {library.name}
                </td>
                <td>
                  <EditableInput
                    elementType="input"
                    type="checkbox"
                    disabled={this.props.disabled}
                    name={"manager-" + library.short_name}
                    label=""
                    checked={this.isSelected("manager", library.short_name)}
                    onChange={() => this.handleRoleChange("manager", library.short_name)}
                    />
                </td>
                <td>
                  <EditableInput
                    elementType="input"
                    type="checkbox"
                    disabled={this.props.disabled}
                    name={"librarian-" + library.short_name}
                    label=""
                    checked={this.isSelected("librarian", library.short_name)}
                    onChange={() => this.handleRoleChange("librarian", library.short_name)}
                    />
                </td>
              </tr>
            ) }
          </tbody>
        </table>
        <button
          type="submit"
          className="btn btn-default"
          disabled={this.props.disabled}
          >Submit</button>
      </form>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.item && nextProps.item !== this.props.item) {
      this.setState({ roles: nextProps.item.roles || [] });
    }
  }

  isSelected(role: string, library?: string) {
    for (const stateRole of this.state.roles) {
      if (stateRole.role === "system") {
        return true;
      }
      if (stateRole.role === "manager-all" && role !== "system") {
        return true;
      }
      if (stateRole.role === "librarian-all" && role === "librarian") {
        return true;
      }
      if (stateRole.role === "manager" && stateRole.library === library) {
        return true;
      }
      if (stateRole.role === role && stateRole.library === library) {
        return true;
      }
    }
    return false;
  }

  handleRoleChange(role: string, library?: string) {
    if (role === "system") {
      if (this.isSelected(role)) {
        this.setState(Object.assign({}, this.state, { roles: [] }));
      } else {
        this.setState(Object.assign({}, this.state, { roles: [{ role }] }));
      }
    } else if (role === "manager-all") {
      if (this.isSelected(role)) {
        this.setState(Object.assign({}, this.state, { roles: [{ role: "librarian-all" }] }));
      } else {
        this.setState(Object.assign({}, this.state, { roles: [{ role: "manager-all" }] }));
      }
    } else if (role === "librarian-all") {
      if (this.isSelected(role)) {
        // Remove librarian-all role, but leave manager roles.
        const roles = this.state.roles.filter(stateRole => stateRole.role === "manager");
        this.setState(Object.assign({}, this.state, { roles }));
      } else {
        // Remove old librarian roles, but leave manager roles.
        const roles = this.state.roles.filter(stateRole => stateRole.role === "manager");
        roles.push({ role: "librarian-all" });
        this.setState(Object.assign({}, this.state, { roles }));
      }
    } else if (role === "manager") {
      if (this.isSelected(role, library)) {
        // Remove the manager role for this library, and add the librarian role.
        // If manager-all was selected, remove it and add individual manager 
        // roles for other libraries and the librarian-all role.
        if (this.isSelected("manager-all")) {
          const roles = [];
          for (const l of this.props.data.allLibraries || []) {
            if (l.short_name !== library) {
              roles.push({ role: "manager", library: l.short_name });
            }
          }
          roles.push({ role: "librarian-all" });
          this.setState(Object.assign({}, this.state, { roles }));
        } else {
          // Remove the manager role for this library and add the librarian role,
          // unless librarian-all is already selected.
          const roles = this.state.roles.filter(stateRole => stateRole.library !== library);
          if (!this.isSelected("librarian-all")) {
            roles.push({ role: "librarian", library: library });
          }
          this.setState(Object.assign({}, this.state, { roles }));
        }
      } else {
        // Add the manager role for the library, and remove the librarian role if it was
        // there.
        const roles = this.state.roles.filter(stateRole => stateRole.library !== library);
        roles.push({ role: "manager", library: library });
        this.setState(Object.assign({}, this.state, { roles }));
      }
    } else if (role === "librarian") {
      if (this.isSelected(role, library)) {
        // Remove the librarian role for this library, and the manager role if it was
        // selected. If any 'all' roles were selected, remove them and add roles for
        // individual libraries.
        if (this.isSelected("librarian-all")) {
           if (this.isSelected("manager-all")) {
             const roles = [];
             for (const l of this.props.data.allLibraries || []) {
               if (l.short_name !== library) {
                 roles.push({ role: "manager", library: l.short_name });
               }
             }
             this.setState(Object.assign({}, this.state, { roles }));
           } else if (this.isSelected("librarian-all")) {
             const roles = this.state.roles.filter(stateRole => (stateRole.role === "manager" && stateRole.library !== library));
             for (const l of this.props.data.allLibraries || []) {
               if (l.short_name !== library) {
                 roles.push({ role: "librarian", library: l.short_name });
               }
             }
             this.setState(Object.assign({}, this.state, { roles }));
           }
        } else {
          const roles = this.state.roles.filter(stateRole => stateRole.library !== library);
          this.setState(Object.assign({}, this.state, { roles }));
        }
      } else {
          const roles = this.state.roles;
          roles.push({ role, library });
          this.setState(Object.assign({}, this.state, { roles }));
      }
    }
  }

  save(event) {
    event.preventDefault();
    const data = new (window as any).FormData(this.refs["form"] as any);
    data.append("roles", JSON.stringify(this.state.roles));
    this.props.editItem(data).then(() => {
      // If we're setting up an admin for the first time, refresh the page
      // to go to login.
      if (this.context.settingUp) {
        window.location.reload();
        return;
      }

      // If a new admin was created, go to its edit page.
      if (!this.props.item && this.props.editedIdentifier) {
        window.location.href = this.props.urlBase + "edit/" + this.props.editedIdentifier;
      }
    });
  }
}