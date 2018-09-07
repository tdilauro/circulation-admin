import * as React from "react";
import { ServiceEditFormProps } from "./ServiceEditForm";
import EditableInput from "./EditableInput";
import { ServicesWithRegistrationsData, LibraryDataWithStatus } from "../interfaces";

export interface LibraryRegistrationState {
  registration_stage?: { [key: string]: string } | null;
  protocol: string;
}

export interface LibraryRegistrationProps extends ServiceEditFormProps<ServicesWithRegistrationsData> {
  registerLibrary: (library, registration_stage) => void;
  protocol: string;
}

export default class LibraryRegistration extends React.Component<LibraryRegistrationProps, LibraryRegistrationState> {
  constructor(props) {
    super(props);

    this.state = {
      registration_stage: {},
      protocol: this.props.protocol,
    };
  }

  render() {
    if (this.props.item && this.protocolSupportsRegistration() && this.props.data && this.props.data.allLibraries && this.props.data.allLibraries.length > 0) {
      return (
        <div>
          <h2>Register libraries</h2>
          { this.props.data.allLibraries.map(library => {
              const libraryRegistrationStatus = this.getLibraryProp(library, "status");
              const currentRegistryStage = this.getLibraryProp(library, "stage");
              const registration_stage =
                (this.state.registration_stage && this.state.registration_stage[library.short_name]) || "testing";

              return (
                <div className="service-with-registrations-library" key={library.short_name}>
                  <div className="library-name">{ library.name }</div>
                  <div className="library-registration-info">
                    <div className="current-stage">
                      { (currentRegistryStage && libraryRegistrationStatus !== "failure") ?
                        <span>Current Stage: {currentRegistryStage}</span> :
                        <span>No current stage</span>
                      }
                      { currentRegistryStage !== "production" &&
                        <EditableInput
                          elementType="select"
                          name="registration_stage"
                          label="Stage"
                          value={currentRegistryStage || "testing"}
                          ref={`stage-${library.short_name}`}
                          onChange={() => this.updateRegistrationStage(library)}
                        >
                          <option value="testing">Testing</option>
                          <option value="production">Production</option>
                        </EditableInput>
                      }
                    </div>

                    { libraryRegistrationStatus === "success" &&
                      <div>
                        <span className="bg-success">
                          Registered
                        </span>
                        {this.registerButton("Update registration", library, registration_stage)}
                      </div>
                    }
                    { libraryRegistrationStatus === "failure" &&
                      <div>
                        <span className="bg-danger">
                          Registration failed
                        </span>
                        {this.registerButton("Retry registration", library, registration_stage)}
                      </div>
                    }
                    { libraryRegistrationStatus === null &&
                      <div>
                        <span className="bg-warning">
                          Not registered
                        </span>
                        {this.registerButton("Register", library, registration_stage)}
                      </div>
                    }
                  </div>
                </div>);
              }
            )
          }
        </div>
      );
    }
    return null;
  }

  registerButton(label, library, registration_stage) {
    return (
      <button
        type="button"
        className="btn btn-default"
        disabled={this.props.disabled}
        onClick={() => this.props.registerLibrary(library, registration_stage)}
      >
        {label}
      </button>
    );
  }

  updateRegistrationStage(library) {
    const registration_stage = (this.refs[`stage-${library.short_name}`] as any).getValue();

    this.setState({
      registration_stage: Object.assign(
        {}, this.state.registration_stage, { [library.short_name]: registration_stage }
      ),
      protocol: this.state.protocol,
    });
  }

  getLibraryInfo(library): LibraryDataWithStatus | null {
    const serviceId = this.props.item && this.props.item.id;
    const libraryRegistrations = this.props.data && this.props.data.libraryRegistrations || [];
    for (const serviceInfo of libraryRegistrations) {
      if (serviceInfo.id === serviceId) {
        for (const libraryInfo of serviceInfo.libraries) {
          if (libraryInfo.short_name === library.short_name) {
            return libraryInfo;
          }
        }
      }
    }
    return null;
  }

  getLibraryProp(library, prop): string | null {
    const libraryInfo = this.getLibraryInfo(library);
    return libraryInfo && libraryInfo[prop];
  }

  protocolSupportsRegistration(): boolean {
    if (this.state.protocol && this.props.data.protocols) {
      for (const protocol of this.props.data.protocols) {
        if (protocol.name === this.state.protocol) {
          return !!protocol.supports_registration;
        }
      }
    }
    return false;
  }
}