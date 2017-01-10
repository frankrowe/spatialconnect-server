import React, { Component, PropTypes } from 'react';
import isEmpty from 'lodash/isEmpty';
import NotificationItem from './NotificationItem';
import '../style/Triggers.less';

const format = new ol.format.GeoJSON();

const iconStyle = new ol.style.Style({
  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: '/marker-icon.png',
  })),
});

const triggerStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 0, 0, 0.1)',
  }),
  stroke: new ol.style.Stroke({
    color: '#f00',
    width: 1,
  }),
});

const triggerStyleSelected = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 0, 0, 0.2)',
  }),
  stroke: new ol.style.Stroke({
    color: '#f00',
    width: 2,
  }),
});

const valueStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(0, 0, 255, 0.1)',
  }),
  stroke: new ol.style.Stroke({
    color: '#00f',
    width: 1,
  }),
});

const style = {
  popup: {
    background: 'white',
    padding: 10,
    borderWidth: 2,
    borderRadius: 3,
    borderColor: '#333',
  },
};

class TriggerNotification extends Component {

  static makePopup(geojson) {
    let rows = [];
    if (geojson.geometry.type === 'Point') {
      rows.push(<tr key="lat">
        <td className="form-label">Latitude</td>
        <td>{geojson.geometry.coordinates[1]}</td>
      </tr>);
      rows.push(<tr key="lng">
        <td className="form-label">Longitude</td>
        <td>{geojson.geometry.coordinates[0]}</td>
      </tr>);
    }
    const properties = geojson.properties;
    if (properties && Object.keys(properties).length) {
      rows = rows.concat(Object.keys(properties).map(key => (
        <tr key={key}>
          <td className="form-label">{key}</td>
          <td>{properties[key]}</td>
        </tr>
      )));
    }
    return (
      <table className="table table-bordered table-striped">
        <tbody>{rows}</tbody>
      </table>);
  }

  constructor(props) {
    super(props);
    this.state = {
      activeFeature: false,
    };
  }

  componentDidMount() {
    this.createMap();
    window.addEventListener('resize', () => {
      this.createMap();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.menu.open !== nextProps.menu.open) {
      // wait for menu to transition
      setTimeout(() => this.map.updateSize(), 200);
    }
  }

  addRules(trigger) {
    if (trigger.rules) {
      trigger.rules.forEach((rule) => {
        if (rule.comparator === '$geowithin') {
          this.addTrigger(rule);
        }
      });
    }
  }

  addTrigger(rule) {
    if (isEmpty(rule.rhs)) return;
    const features = format.readFeatures(rule.rhs);
    features.forEach((feature) => {
      feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
      this.triggerSource.addFeature(feature);
    });
    this.map.getView().fit(this.triggerSource.getExtent(), this.map.getSize());
  }

  addValue(value) {
    const feature = format.readFeature(value);
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    feature.setStyle(iconStyle);
    this.valueSource.addFeature(feature);
  }

  createMap() {
    while (this.mapRef.firstChild) {
      this.mapRef.removeChild(this.mapRef.firstChild);
    }
    this.triggerSource = new ol.source.Vector();
    const triggerLayer = new ol.layer.Vector({
      source: this.triggerSource,
      style: triggerStyle,
    });
    this.valueSource = new ol.source.Vector();
    const valueLayer = new ol.layer.Vector({
      source: this.valueSource,
      style: valueStyle,
    });
    const popup = new ol.Overlay({
      element: this.popup,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -5],
    });
    this.select = new ol.interaction.Select({
      wrapX: false,
      style: triggerStyleSelected,
      layers: [triggerLayer, valueLayer],
    });
    this.map = new ol.Map({
      target: this.mapRef,
      interactions: ol.interaction.defaults().extend([this.select]),
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
        triggerLayer,
        valueLayer,
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([-100, 30]),
        zoom: 3,
      }),
    });
    this.map.addOverlay(popup);
    this.select.on('select', (e) => {
      const coordinate = e.mapBrowserEvent.coordinate;
      if (e.selected.length) {
        const feature = e.selected[0];
        const gj = JSON.parse(format.writeFeature(feature));
        this.setState({
          activeFeature: gj,
        });
        popup.setPosition(coordinate);
      } else {
        this.setState({
          activeFeature: false,
        });
      }
    });

    const info = this.props.notification.info;
    if (info.trigger) {
      this.addRules(info.trigger);
    }
    if (info.value) {
      this.addValue(info.value);
    }
  }

  render() {
    return (
      <div className="wrapper">
        <section className="main noPad">
          <div className="trigger-details">
            <div className="trigger-props">
              <NotificationItem notification={this.props.notification} />
            </div>
            <div className="trigger-map" ref={(c) => { this.mapRef = c; }} />
          </div>
          <div
            className="popup"
            ref={(c) => { this.popup = c; }}
            style={{ ...style.popup, display: this.state.activeFeature ? 'block' : 'none' }}
          >
            {!!this.state.activeFeature &&
              TriggerNotification.makePopup(this.state.activeFeature)}
          </div>
        </section>
      </div>
    );
  }

}

TriggerNotification.propTypes = {
  notification: PropTypes.object.isRequired,
  menu: PropTypes.object.isRequired,
};

export default TriggerNotification;
