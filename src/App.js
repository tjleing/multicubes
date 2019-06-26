import React from 'react';
import logo from './logo.svg';
import './App.css';
import Amplify, { XR } from 'aws-amplify';
import aws_exports from './aws-exports';
import scene_config from './sumerian_exports.json';

Amplify.configure(aws_exports);
XR.configure({ // XR category configuration
  SumerianProvider: { // Sumerian-specific configuration
    region: 'us-west-2', // Sumerian scene region
    scenes: {
      "SumerianAmplify": {   // Friendly scene name
          sceneConfig: scene_config // Scene JSON configuration
        },
    }
  }
});


function LabelledInput({label, type, onChange}) {
  return (
      <label>
          {label}
          <input type={type} onChange={(event) => onChange(event.target.value)}/>
      </label>
  );
}

function TextInput({label, onChange}) {
  return <LabelledInput label={label} type="text" onChange={onChange}/>
}

function ColorInput({label, onChange}) {
  return <LabelledInput label={label} type="color" onChange={onChange}/>;
}

class SceneControls extends React.Component {

  emit(channelName, value) {
      if (((this.props.sceneController || {}).sumerian || {}).SystemBus) {
          this.props.sceneController.sumerian.SystemBus.emit(channelName, value)
      }
  }

  updateSphereColor(value) {
      this.emit("updateSphereColor", value);
  }

  updateSphereName(value) {
      this.emit("updateSphereName", value);
  }

  render() {
      return (
          <div>
              <TextInput label="Box name" onChange={(value) => this.updateSphereName(value)}/>
              <ColorInput label="Box color" onChange={(value) => this.updateSphereColor(value)}/>
          </div>
      );
  }
}

function IndeterminateLoading() {
  return <img src={logo} className="App-logo" alt="logo"/>;
}

class SumerianScene extends React.Component {

  async componentDidMount() {
      await this.loadAndStartScene();
  }

  render() {
      return <div
          id="sumerian-scene-dom-id"
          style={{width: "100%", height: "97%", position: "absolute"}}
      />;
  }

  async loadAndStartScene() {
      await XR.loadScene(this.props.scene, "sumerian-scene-dom-id");
      const controller = XR.getSceneController(this.props.scene);
      this.props.onLoaded(controller);
      XR.start(this.props.scene);
  }

}

class App extends React.Component {

  constructor(props) {
      super(props);
      this.state = {
          loading: true,
          sceneController: null
      };
  }

  sceneLoaded(sceneController) {
      this.setState({
          loading: false,
          sceneController
      });
  }

  render() {
      return (
          <div className="App">
              {this.state.loading && <IndeterminateLoading/>}
              <div style={{visibility: this.state.loading && 'hidden'}}>
                  <SceneControls sceneController={this.state.sceneController}/>
                  <SumerianScene scene='SumerianAmplify' onLoaded={(controller) => this.sceneLoaded(controller)}/>
              </div>
          </div>
      );
  }
}

export default App;
