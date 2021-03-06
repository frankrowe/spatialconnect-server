'use strict';
import React, { PropTypes } from 'react';
import { Link, browserHistory } from 'react-router';
import '../style/FormList.less';

const FormItem = ({ form }) => (
  <div className="form-item" onClick={() => browserHistory.push(`/forms/${form.get('form_key')}`)}>
    <h4><Link to={`/forms/${form.get('form_key')}`}>{form.get('form_label')}</Link></h4>
    <ul>
      <li>Version: {form.get('version')}</li>
      <li>Number of Records: 23</li>
      <li>Last Active: 14 hours ago</li>
    </ul>
  </div>
);

FormItem.propTypes = {
  form: PropTypes.object.isRequired
};

const FormsList = ({ forms }) => (
  <div className="form-list">
    {forms.valueSeq().map(f => {
      return <FormItem form={f} key={f.get('id')} />
    })}
  </div>
);

FormsList.propTypes = {
  forms: PropTypes.object.isRequired
};

export default FormsList;
