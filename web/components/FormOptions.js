import React, { Component, PropTypes } from 'react';
import '../style/FormDetails.less';

class FormOptions extends Component {

  componentWillReceiveProps(nextProps) {

  }

  changeLabel(e) {
    this.props.updateFormName(
      this.props.form.get('form_key'),
      e.target.value
    );
  }

  deleteForm() {
    this.props.deleteForm(this.props.form.get('form_key'));
  }

  render() {
    const { form } = this.props;
    return (
      <div className="form-options form-pane">
        <div className="form-pane-title"><h5>Form Options</h5></div>
        <div className="form-pane-wrapper">
          <div className="form-group">
            <label htmlFor="exampleInputEmail1">Form name</label>
            <input type="text" className="form-control"
              value={form.get('form_label')}
              onChange={this.changeLabel.bind(this)}
             />
          </div>
          <button className="btn btn-danger" onClick={this.deleteForm.bind(this)}>Delete Form</button>
        </div>
      </div>
    );
  }
}

FormOptions.propTypes = {
  form: PropTypes.object.isRequired
};

export default FormOptions;