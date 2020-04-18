import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import isEmpty from 'lodash.isempty';
import { Row, Col, Form, Card, Collapse, Dropdown, Menu, Popover, notification } from 'antd';
import { Formik } from 'formik';
import MapMarker from 'components/MapMarker';
import { connect } from 'react-redux';
import {
  FormWrapper,
  FormGroup,
  Label,
  FormInput as Input,
  FormButton as Button,
  Tabs,
  TabPane,
  Select,
  SelectOption
} from 'components/Form';
import { AddressConstant, MultiJobsType } from 'App/AppConstant';
import {
  getJob,
  //getQuota,
  cancelJob,
  updateparcel,
  clearJob,
  getnextdayestimate,
  getParcel,
  deleteParcel,
  deleteItem
} from 'redux/booking/actions';
import { BookingConstant, receipt, settingParcel, settingLocation, settingItem } from './constant';
import { BookingWrapper, RoutePreview, RoutePreviewDiv } from './style';
import { AccordianStyle, LocationPreviewWrapper } from 'components/CommonStyle/style';
import { Bookingplaceholder } from 'container/BookingOffline/constant';
import { onError } from 'modules/errorHandler';

const { Panel } = Collapse;
const { SubMenu } = Menu;
export class BookingDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditLocation: false,
      currentForm: {},
      deliverys: [],
      pickups: [],
      parcelID: '',
      itemID: '',
      detailKey: '1',
      tab: '1',
      addressID: '',
      jobInx: ''
    };
  }
  RouteContent = () => {
    const { jobDetails } = this.props;
    let mapData = [];
    if (jobDetails.multi_job_type === MultiJobsType.MULTI_DROP) {
      mapData.push({
        color: 'red',
        latitude: jobDetails.pickup_location_lat,
        longitude: jobDetails.pickup_location_lng
      });
      jobDetails.subjobs.map(data => {
        if (data.delivery_location_lat) {
          mapData.push({
            latitude: data.delivery_location_lat,
            longitude: data.delivery_location_lng
          });
        }
      });
    } else {
      if (jobDetails.pickup_location_lng && jobDetails.pickup_location_lng) {
        mapData = [
          {
            latitude: jobDetails.pickup_location_lat,
            longitude: jobDetails.pickup_location_lng
          }
        ];
      }
      if (jobDetails.delivery_location_lat && jobDetails.delivery_location_lng) {
        mapData.push({
          latitude: jobDetails.delivery_location_lat,
          longitude: jobDetails.delivery_location_lng
        });
      }
    }
    if (mapData.length > 0) {
      return (
        <RoutePreview>
          <MapMarker isBound={true} markerPoints={mapData} />
        </RoutePreview>
      );
    }
  };
  OrderReceipt = () => {
    let { jobDetails } = this.props;
    return (
      <li className="active">
        <Collapse accordion>
          <Panel
            header={
              <div className="d-flex pickup-dropoff-main">
                <div className="pickup-dropoff">
                  <span>{jobDetails && jobDetails.job_title ? jobDetails.job_title : '-'}</span>
                </div>
                <div className="toggle-icon-main"></div>
                <div className="price-text">
                  {BookingConstant.pound}
                  {this.getTotalPrice()}
                </div>
              </div>
            }
          >
            {this.getPickupDropoff()}
          </Panel>
        </Collapse>
      </li>
    );
  };
  getPickupDropoff = () => {
    let { jobDetails } = this.props;
    if (jobDetails.pickup_address1) {
      let country =
        jobDetails.pickup_country_code != null
          ? jobDetails.pickup_country_code == 'GB' || jobDetails.pickup_country_code == 'UK'
            ? BookingConstant.UK
            : ''
          : '';
      let pickup_address = jobDetails.pickup_address1;
      pickup_address =
        jobDetails.pickup_address2 != null && jobDetails.pickup_address2
          ? pickup_address + ', ' + jobDetails.pickup_address2
          : pickup_address;
      pickup_address =
        pickup_address +
        ', ' +
        jobDetails.pickup_city +
        ', ' +
        jobDetails.pickup_postcode +
        ', ' +
        country;
      /* Drop of Details */
      let delivery_address = 'No Delivery Location';
      if (jobDetails.delivery_address1) {
        delivery_address = `${jobDetails.delivery_address1}, ${
          jobDetails.delivery_address2 ? jobDetails.delivery_address2 + ', ' : ''
        }${jobDetails.delivery_city}, ${jobDetails.delivery_postcode}, ${
          jobDetails.delivery_country_code
        }`;
      }
      let multi_addr = [];
      if (!isEmpty(jobDetails) && !isEmpty(jobDetails.subjobs)) {
        multi_addr = jobDetails.subjobs.map(address => (
          <div className="d-flex pickup-dropoff-main" key={address.id}>
            <div className="pickup-dropoff">
              <span className="vat-span">
                {`${address.pickup_address1}, ${
                  address.pickup_address2 ? address.pickup_address2 + ', ' : ''
                }${address.pickup_city}, ${address.pickup_postcode}, ${
                  address.pickup_country_code
                }`}
              </span>
            </div>
            <div className="price-text font-weight-low">
              {this.props.nextDayEstimate.jobs
                ? Object.keys(this.props.nextDayEstimate.jobs).includes(address.id)
                  ? BookingConstant.pound +
                    this.props.nextDayEstimate.jobs[address.id].total_price.toFixed(2)
                  : ''
                : ''}
            </div>
          </div>
        ));
      }
      /* Multi Drop of Details */
      let multi_deliver_addr = [];
      if (!isEmpty(jobDetails) && !isEmpty(jobDetails.subjobs)) {
        if (jobDetails.delivery_address1 != null) {
          multi_deliver_addr = jobDetails.subjobs.map(address =>
            address.delivery_address1 != null ? (
              <div className="d-flex pickup-dropoff-main" key={address.id}>
                <div className="pickup-dropoff">
                  <span className="vat-span">
                    {`${address.delivery_address1}, ${
                      address.delivery_address2 ? address.delivery_address2 + ', ' : ''
                    }${address.delivery_city}, ${address.delivery_postcode}, ${
                      address.delivery_country_code
                    }`}
                  </span>
                </div>
                <div className="price-text font-weight-low">
                  {this.props.nextDayEstimate.jobs
                    ? Object.keys(this.props.nextDayEstimate.jobs).includes(address.id)
                      ? BookingConstant.pound +
                        this.props.nextDayEstimate.jobs[address.id].total_price.toFixed(2)
                      : ''
                    : ''}
                </div>
              </div>
            ) : (
              ' - '
            )
          );
        } else {
          multi_deliver_addr = 'No Delivery Location';
        }
      }
      delivery_address = delivery_address != '' ? delivery_address : ' - ';
      return (
        <div className="accor-content">
          {jobDetails.multi_job_type == '111' ? multi_addr : <p>{pickup_address}</p>}
          <p>
            <strong>{BookingConstant.to}</strong>
          </p>
          {jobDetails.multi_job_type == '112' ? multi_deliver_addr : <p>{delivery_address}</p>}
        </div>
      );
    }
    return null;
  };
  getTotalPrice = () => {
    const { nextDayEstimate, jobDetails } = this.props;
    let { match } = this.props;
    let price = 0.0;
    if (!isEmpty(match) && !isEmpty(match.params.jobId) && !isEmpty(nextDayEstimate.jobs)) {
      if (
        jobDetails.multi_job_type === MultiJobsType.MULTI_DROP ||
        jobDetails.multi_job_type === MultiJobsType.MULTI_PICKUP
      ) {
        price = nextDayEstimate.cheapest_service.total_price.toFixed(2) || 0.0;
      } else {
        price = nextDayEstimate.cheapest_service.total_price.toFixed(2) || 0.0;
      }
      return <>{price}</>;
    }
    return 0.0;
  };
  menuItemClick = data => {
    let { match, cancelJob, jobDetails } = this.props;
    if (data.key === '1') {
      this.editLocation();
    } else if (data.key === '2') {
      cancelJob({ id: match.params.jobId });
      // cancelJob({ id: this.state.addressID, jobDetails: jobDetails });
    }
  };
  parcelClick = e => {
    if (e.key === '1') {
      this.editParcel();
    } else if (e.key === '2') {
      this.deleteParcel();
    }
  };
  editParcel = () => {
    const { parcelID } = this.state;
    let { match, parcels } = this.props;
    if (!isEmpty(match) && !isEmpty(match.params.jobId)) {
      if (parcels.jobs) {
        const parcel = parcels.jobs.find(i => i.parcels.parcel_id == parcelID);
        if (parcel) {
          this.props.parcelsEdit(parcel);
        }
      }
    }
  };
  deleteParcel = async e => {
    try {
      let { match } = this.props;
      if (!isEmpty(match) && !isEmpty(match.params.jobId)) {
        const { parcelID } = this.state;
        let postData = { parcel_id: parcelID };
        this.props.loaderSpin(true);
        await this.props.deleteParcel(postData);
        await this.props.getParcel({ job_id: match.params.jobId });
        this.props.loaderSpin(false);
      }
    } catch (error) {
      onError(error, 'BookingDetails', 'delete parcel error');
    }
  };
  handleSubMove = async e => {
    const { parcelID } = this.state;
    const { updateparcel, getParcel, match } = this.props;
    if (!isEmpty(e) && !isEmpty(e.item) && !isEmpty(e.item.props)) {
      let status = await updateparcel({
        job_id: e.item.props.value,
        parcel_id: parcelID
      });
      if (status) {
        await getParcel({ job_id: match.params.jobId });
      }
    }
  };
  list = id => {
    const { jobDetails } = this.props;
    let address = null;
    let UI = settingParcel.map((element, key) => (
      <Menu.Item key={key + 1} onClick={this.parcelClick}>
        {element}
      </Menu.Item>
    ));
    if (
      jobDetails.multi_job_type === MultiJobsType.MULTI_DROP ||
      jobDetails.multi_job_type === MultiJobsType.MULTI_PICKUP
    ) {
      if (jobDetails.multi_job_type === MultiJobsType.MULTI_PICKUP) {
        address = jobDetails.subjobs.map((element, key) => (
          <Menu.Item key={key + 1}>{element.pickup_address1}</Menu.Item>
        ));
      } else if (jobDetails.multi_job_type == MultiJobsType.MULTI_DROP) {
        address = jobDetails.subjobs.map((element, key) => (
          <Menu.Item key={key + 1} onClick={this.handleSubMove} value={element.id}>
            {element.delivery_address1}
          </Menu.Item>
        ));
      }
    }
    return (
      <div>
        <Menu style={{ width: 256 }} mode="vertical" selectable={false}>
          {!isEmpty(jobDetails) &&
            (jobDetails.multi_job_type === MultiJobsType.MULTI_DROP ||
              jobDetails.multi_job_type === MultiJobsType.MULTI_PICKUP) &&
            jobDetails.subjobs.length > 1 && (
              <SubMenu key="sub4" title={BookingConstant.moveParcelTo}>
                {address}
              </SubMenu>
            )}
          {UI}
        </Menu>
      </div>
    );
  };
  locationMenuList = () => {
    let UI = settingLocation.map((element, key) => <Menu.Item key={key + 1}>{element}</Menu.Item>);
    return (
      <div>
        <Menu
          selectable={false}
          mode="vertical"
          onClick={this.menuItemClick}
          className="location-item-menus"
        >
          {UI}
        </Menu>
      </div>
    );
  };
  parcelItem = items => {
    return items.map((data, i) => {
      return (
        <li key={i + 1}>
          <span>{data}</span>
          <div className="ml-auto d-flex">
            <button className="location-dots" type="button">
              <i className="las la-ellipsis-h"></i>
            </button>
          </div>
        </li>
      );
    });
  };
  getParcelData = () => {
    const { jobInx } = this.state;
    let ui = [];
    let jobId = this.props.subjobsId != null ? this.props.subjobsId : '';
    let { match, parcels, jobDetails } = this.props;
    if (!isEmpty(match) && !isEmpty(match.params.jobId)) {
      if (parcels.jobs) {
        parcels.jobs.map((data, i) => {
          if (jobId == '') {
            if (data.job_id == match.params.jobId) {
              jobId = data.job_id;
            } else {
              if (
                jobDetails.multi_job_type !== MultiJobsType.STANDARD &&
                !isEmpty(jobDetails.subjobs)
              ) {
                jobId = jobDetails.subjobs[jobInx || 0].id;
              } else {
                jobId = data.job_id;
              }
            }
          }
          if (jobId == data.job_id) {
            ui.push(
              <Panel
                disabled={
                  data.parcels.items ? (data.parcels.items.length > 0 ? false : true) : true
                }
                key={i}
                header={
                  <div className="collapse-header" id={`collapse-head-parcel`}>
                    <span>
                      {data.parcels.description}
                      {data.title}
                      {data.parcels.items ? (
                        <span>
                          {BookingConstant.countBefore}
                          {data.parcels.items.length}
                          {BookingConstant.countafter}
                        </span>
                      ) : (
                        data.parcels.items
                      )}
                    </span>
                    {/* <span>
                      {BookingConstant.countBefore}
                      {data.parcels.items ? data.parcels.items.length : '0'}
                      {BookingConstant.countafter}
                    </span> */}
                    <div className="ml-auto" id={BookingConstant.parcel + i}>
                      {data.parcels.items ? (
                        data.parcels.items.length > 0 ? (
                          <div className="toggle-icon-main"></div>
                        ) : (
                          ''
                        )
                      ) : (
                        ''
                      )}
                      <Dropdown
                        overlay={this.list()}
                        trigger={['click']}
                        getPopupContainer={() =>
                          document.getElementById(BookingConstant.parcel + i)
                        }
                      >
                        <a
                          className="setting-btn"
                          onClick={event => {
                            this.setState({ parcelID: data.parcels.parcel_id });
                            event.stopPropagation();
                          }}
                        ></a>
                      </Dropdown>
                      <button type="button" className="draggable-icon"></button>
                    </div>
                  </div>
                }
              >
                <div className="under-list-accordion">
                  <ul className="parcel-items">{this.parcelItems(data.parcels.items)}</ul>
                </div>
              </Panel>
            );
          }
        });
        //if (parcels[match.params.jobId].length > 0) {}
        return <Collapse accordion>{ui}</Collapse>;
      }
    }
  };
  parcelItems = items => {
    if (items) {
      return items.map((data, i) => {
        return (
          <li key={i + 1} id={data.item_id}>
            <span>{data.description}</span>
            <div className="ml-auto d-flex" id={`item-${i}`}>
              <button className="location-dots" type="button">
                <Dropdown
                  overlay={this.itemList()}
                  trigger={['click']}
                  getPopupContainer={() => document.getElementById('collapse-head-parcel')}
                >
                  <i
                    className="las la-ellipsis-h"
                    onClick={event => {
                      this.setState({ itemID: data.item_id });
                      event.stopPropagation();
                    }}
                  ></i>
                </Dropdown>
              </button>
            </div>
          </li>
        );
      });
    }
  };
  itemList = () => {
    let UI = settingItem.map((element, key) => (
      <Menu.Item key={key + 1} onClick={this.itemClick}>
        {element}
      </Menu.Item>
    ));
    return (
      <div>
        <Menu style={{ width: 256 }} mode="vertical" selectable={false}>
          {UI}
        </Menu>
      </div>
    );
  };
  itemClick = e => {
    if (e.key === '1') {
      this.editItem();
    } else if (e.key === '2') {
      this.deleteItem();
    }
  };
  editItem = () => {
    const { itemID } = this.state;
    let { match, parcels } = this.props;
    if (!isEmpty(match) && !isEmpty(match.params.jobId)) {
      if (parcels.jobs) {
        let job = parcels.jobs;
        let id = 0;
        for (let j = 0; job.length > j; j++) {
          let item = job[j].parcels.items;
          if (item) {
            for (let i = 0; item.length > i; i++) {
              if (item[i].item_id == itemID) {
                item[i].parcelID = job[j].parcels.parcel_id;
                this.props.itemEdit(item[i]);
                id = parseInt(item[i].item_id);
                break;
              }
            }
          }
          if (id > 0) {
            break;
          }
        }
      }
    }
  };
  deleteItem = async e => {
    try {
      let { match } = this.props;
      if (!isEmpty(match) && !isEmpty(match.params.jobId)) {
        const { itemID } = this.state;
        let postData = { item_id: itemID };
        this.props.loaderSpin(true);
        await this.props.deleteItem(postData);
        await this.props.getParcel({ job_id: match.params.jobId });
        this.props.loaderSpin(false);
      }
    } catch (error) {
      onError(error, 'BookingDetails', 'delete item error');
    }
  };
  mapDataToPost = jobType => {
    let { jobDetails } = this.props;
    return {
      type: jobType,
      actionType: 'edit',
      id: jobDetails.id,
      street: jobDetails[`${jobType}_address1`] || '',
      city: jobDetails[`${jobType}_city`] || '',
      postcode: jobDetails[`${jobType}_postcode`] || '',
      country_code: jobDetails[`${jobType}_country_code`] || 'GB',
      mobileNumber: jobDetails[`${jobType}_mobile_number`] || '',
      personName: jobDetails[`${jobType}_person_name`] || '',
      email: jobDetails[`${jobType}_email`] || '',
      phoneNumber: jobDetails[`${jobType}_phone_number`] || '',
      building: jobDetails[`${jobType}_address2`] || '',
      tips: jobDetails[`${jobType}_tips_how_to_find`] || '',
      companyName: jobDetails[`${jobType}_company_name`] || ''
    };
  };
  editLocation = () => {
    const { jobDetails } = this.props;
    const { isEditLocation: jobType, addressID } = this.state;
    let postData = {};
    if (
      jobDetails.multi_job_type === MultiJobsType.MULTI_PICKUP ||
      jobDetails.multi_job_type === MultiJobsType.MULTI_DROP
    ) {
      if (jobDetails.id === addressID) {
        postData = this.mapDataToPost(jobType);
      } else {
        let dataSubJob = jobDetails.subjobs.find(ele => ele.id === addressID);
        postData = {
          type: jobType,
          actionType: 'edit',
          id: dataSubJob.id,
          street: dataSubJob[`${jobType}_address1`] || '',
          city: dataSubJob[`${jobType}_city`] || '',
          postcode: dataSubJob[`${jobType}_postcode`] || '',
          country_code: dataSubJob[`${jobType}_country_code`] || 'GB',
          mobileNumber: dataSubJob[`${jobType}_mobile_number`] || '',
          personName: dataSubJob[`${jobType}_person_name`] || '',
          email: dataSubJob[`${jobType}_email`] || '',
          phoneNumber: dataSubJob[`${jobType}_phone_number`] || '',
          building: dataSubJob[`${jobType}_address2`] || '',
          tips: dataSubJob[`${jobType}_tips_how_to_find`] || '',
          companyName: dataSubJob[`${jobType}_company_name`] || ''
        };
      }
    } else {
      postData = this.mapDataToPost(jobType);
    }
    this.props.locationData(postData);
  };
  checkParcelStatus = () => {
    let { parcelsProps, jobDetails } = this.props;
    let check = false;
    if (!isEmpty(jobDetails)) {
      if (
        jobDetails.multi_job_type === MultiJobsType.MULTI_DROP ||
        jobDetails.multi_job_type === MultiJobsType.MULTI_PICKUP
      ) {
        if (!isEmpty(parcelsProps) && !isEmpty(parcelsProps.jobs)) {
          let size = jobDetails.subjobs.filter(sub =>
            parcelsProps.jobs.some(parcel => parcel.job_id === sub.id)
          );
          if (size.length === jobDetails.subjobs.length) {
            check = true;
          }
        }
      } else {
        if (!isEmpty(parcelsProps) && !isEmpty(parcelsProps.jobs)) {
          check = true;
        }
      }
    }
    return check;
  };
  handleMultiClick = e => {
    const { match } = this.props;
    const { detailKey } = this.state;
    if (detailKey === '2' && e.target.name === 'next') {
      if (this.checkParcelStatus()) {
        this.props.history.push('/review-order/' + match.params.jobId);
      } else {
        notification['error']({
          message: 'Please add one parcel to all address'
        });
      }
    }
    this.setState(
      {
        detailKey: e.target.name === 'prev' ? '1' : '2'
      },
      () => {
        const { detailKey } = this.state;
        this.props.changePageKey(detailKey);
      }
    );
  };
  tabChange = e => {
    if (e === '4') {
      this.setState({
        detailKey: e
      });
    } else {
      this.setState({
        detailKey: e
      });
      this.props.changePageKey(e);
    }
  };
  getsubPickup = subjobs => {
    let dropdata = [];
    subjobs.map((data, i) => {
      dropdata.push(
        <ul key={i} className="location-listing-wrapper">
          <li>
            <span>{`${data.pickup_address1}, ${data.pickup_city}, ${data.pickup_postcode}`}</span>
            <div className="ml-auto side-grp-btn">
              <Dropdown
                overlay={this.locationMenuList()}
                className="custom-picker-dropdown"
                trigger={['click']}
                getPopupContainer={() => document.getElementById('location-preview')}
              >
                <a
                  className="setting-btn"
                  onClick={event => {
                    event.stopPropagation();
                    this.setState({
                      isEditLocation: 'pickup',
                      addressID: data.id
                    });
                  }}
                />
              </Dropdown>
              <button type="button" className="draggable-icon" />
            </div>
          </li>
        </ul>
      );
    });
    if (dropdata.length > 0) {
      return <>{dropdata}</>;
    }
  };
  getsubDropoff = subjobs => {
    let dropdata = [];
    subjobs.map((data, i) => {
      if (data.delivery_address1 != null) {
        dropdata.push(
          <ul key={i} className="location-listing-wrapper">
            <li>
              <span>{`${data.delivery_address1}, ${data.delivery_city}, ${data.delivery_postcode}`}</span>
              <div className="ml-auto side-grp-btn">
                <Dropdown
                  overlay={this.locationMenuList()}
                  className="custom-picker-dropdown"
                  trigger={['click']}
                  getPopupContainer={() => document.getElementById('location-preview')}
                >
                  <a
                    className="setting-btn"
                    onClick={event => {
                      event.stopPropagation();
                      this.setState({
                        isEditLocation: 'delivery',
                        addressID: data.id
                      });
                    }}
                  />
                </Dropdown>
                <button type="button" className="draggable-icon" />
              </div>
            </li>
          </ul>
        );
      }
    });
    if (dropdata.length > 0) {
      return (
        <>
          <div className="location-title d-flex">
            <span className="ml-auto">{BookingConstant.dropoff}</span>
          </div>
          {dropdata}
        </>
      );
    }
  };
  getparcelAddress = () => {
    const { jobDetails } = this.props;
    if (
      jobDetails.multi_job_type === MultiJobsType.MULTI_PICKUP ||
      jobDetails.multi_job_type === MultiJobsType.SUBJOB_MULTI_PICKUP
    ) {
      return `${jobDetails.subjobs[0].pickup_address1}, ${
        jobDetails.subjobs[0].pickup_address2 ? jobDetails.subjobs[0].pickup_address2 + ', ' : ''
      }${jobDetails.subjobs[0].pickup_city}, ${jobDetails.subjobs[0].pickup_postcode}, ${
        jobDetails.subjobs[0].pickup_country_code
      }`;
    } else if (
      jobDetails.multi_job_type === MultiJobsType.MULTI_DROP ||
      jobDetails.multi_job_type === MultiJobsType.SUBJOB_MULTI_DROP
    ) {
      return `${jobDetails.subjobs[0].delivery_address1}, ${
        jobDetails.subjobs[0].delivery_address2
          ? jobDetails.subjobs[0].delivery_address2 + ', '
          : ''
      }${jobDetails.subjobs[0].delivery_city}, ${jobDetails.subjobs[0].delivery_postcode}, ${
        jobDetails.subjobs[0].delivery_country_code
      }`;
    }
  };
  getAddress = () => {
    let address = [];
    let jobId = this.props.subjobsId != null ? this.props.subjobsId : '';
    let { jobDetails } = this.props;
    if (!isEmpty(jobDetails) && !isEmpty(jobDetails.subjobs)) {
      if (jobId) {
        if (
          jobDetails.multi_job_type === MultiJobsType.MULTI_PICKUP ||
          jobDetails.multi_job_type === MultiJobsType.SUBJOB_MULTI_PICKUP
        ) {
          jobDetails.subjobs.map((data, i) => {
            if (jobId == data.id) {
              address.push(
                <>
                  {data.pickup_address1 + ', '}
                  {data.pickup_address2 ? data.pickup_address2 + ', ' : ''}
                  {data.pickup_city + ', '}
                  {data.pickup_postcode + ', '}
                  {data.pickup_country_code}
                </>
              );
            }
          });
        } else if (
          jobDetails.multi_job_type === MultiJobsType.MULTI_DROP ||
          jobDetails.multi_job_type === MultiJobsType.SUBJOB_MULTI_DROP
        ) {
          jobDetails.subjobs.map((data, i) => {
            if (jobId == data.id) {
              address.push(
                <>
                  {data.delivery_address1 + ', '}
                  {data.delivery_address2 ? data.delivery_address2 + ', ' : ''}
                  {data.delivery_city + ', '}
                  {data.delivery_postcode + ', '}
                  {data.delivery_country_code}
                </>
              );
            }
          });
        }
        return <>{address}</>;
      }
    }
  };
  subjobsAdress = data => {
    const { jobDetails } = this.props;
    if (
      jobDetails.multi_job_type === MultiJobsType.MULTI_PICKUP ||
      jobDetails.multi_job_type === MultiJobsType.SUBJOB_MULTI_PICKUP
    ) {
      return data.map((ele, index) => (
        <SelectOption key={index}>
          {ele.pickup_address1 +
            ',' +
            ele.pickup_postcode +
            ',' +
            ele.pickup_city +
            ',' +
            ele.pickup_country_code}
        </SelectOption>
      ));
    } else if (
      jobDetails.multi_job_type === MultiJobsType.MULTI_DROP ||
      jobDetails.multi_job_type === MultiJobsType.SUBJOB_MULTI_DROP
    ) {
      return data.map((ele, index) => (
        <SelectOption key={index}>
          {ele.delivery_address1 +
            ',' +
            ele.delivery_city +
            ',' +
            ele.delivery_postcode +
            ',' +
            ele.delivery_country_code}
        </SelectOption>
      ));
    }
  };
  handleSelect = (e, setFieldValue) => {
    this.setState({ jobInx: e.ele });
    setFieldValue(e.name, e.ele);
  };
  render() {
    const { detailKey } = this.state;
    const { jobDetails, userData, parcels, match, pageKey } = this.props;
    return (
      <BookingWrapper>
        <LocationPreviewWrapper>
          <Tabs
            defaultActiveKey="1"
            destroyInactiveTabPane={true}
            activeKey={detailKey}
            onChange={this.tabChange}
            renderTabBar={(props, DefaultTabBar) => (
              <DefaultTabBar {...props}>
                {node => (
                  <React.Fragment key={node.key}>
                    {node.key === '4'
                      ? React.cloneElement(node, {
                          className: `${node.props.className} pay-review-panel`
                        })
                      : node}
                  </React.Fragment>
                )}
              </DefaultTabBar>
            )}
          >
            <TabPane tab={BookingConstant.dateLocation} key="1">
              <Card
                bordered={false}
                title={
                  <div className="card-header d-flex">
                    <h5>{BookingConstant.orderPreview}</h5>
                    <div className="ml-auto panel-next-day-text">
                      {BookingConstant.nextDaysingle}
                    </div>
                  </div>
                }
              >
                <div className="form-styling2">
                  <Row gutter={20}>
                    <Col xs={24} sm={12} md={12} lg={12}>
                      <FormGroup className="form-group">
                        <Label className="label" title={AddressConstant.firstName} />
                        <Input
                          type="text"
                          className="form-control"
                          value={
                            !isEmpty(userData) && !isEmpty(userData.firstname)
                              ? userData.firstname
                              : ''
                          }
                          placeholder={Bookingplaceholder.empty}
                          readOnly={true}
                        />
                      </FormGroup>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12}>
                      <FormGroup className="form-group">
                        <Label className="label" title={AddressConstant.lastName} />
                        <Input
                          type="text"
                          className="form-control"
                          value={
                            !isEmpty(userData) && !isEmpty(userData.lastname)
                              ? userData.lastname
                              : ''
                          }
                          placeholder={Bookingplaceholder.empty}
                          readOnly={true}
                        />
                      </FormGroup>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12}>
                      <FormGroup className="form-group">
                        <Label className="label" title={AddressConstant.email} />
                        <Input
                          type="text"
                          className="form-control"
                          value={
                            !isEmpty(userData) && !isEmpty(userData.email) ? userData.email : ''
                          }
                          placeholder={Bookingplaceholder.empty}
                          readOnly={true}
                        />
                      </FormGroup>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12}>
                      <FormGroup className="form-group">
                        <Label className="label" title={AddressConstant.phoneNumber} />
                        <Input
                          type="text"
                          className="form-control"
                          value={
                            !isEmpty(userData) && !isEmpty(userData.phone_number)
                              ? userData.phone_number
                              : ''
                          }
                          placeholder={Bookingplaceholder.empty}
                          readOnly={true}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  {!isEmpty(jobDetails) && !isEmpty(jobDetails.pickup_address1) && (
                    <div className="location-preview" id="location-preview">
                      <div className="location-title d-flex">
                        <span>{BookingConstant.location}</span>
                        <span className="ml-auto">{BookingConstant.pickUp}</span>
                      </div>
                      {jobDetails.multi_job_type === MultiJobsType.MULTI_PICKUP ? (
                        this.getsubPickup(jobDetails.subjobs)
                      ) : (
                        <ul className="location-listing-wrapper">
                          <li>
                            <span>{`${jobDetails.pickup_address1}, ${jobDetails.pickup_city}, ${jobDetails.pickup_postcode}`}</span>
                            <div className="ml-auto side-grp-btn">
                              <Dropdown
                                overlay={this.locationMenuList()}
                                className="custom-picker-dropdown"
                                trigger={['click']}
                                getPopupContainer={() =>
                                  document.getElementById('location-preview')
                                }
                              >
                                <a
                                  className="setting-btn"
                                  onClick={event => {
                                    event.stopPropagation();
                                    this.setState({
                                      isEditLocation: 'pickup',
                                      addressID: jobDetails.id
                                    });
                                  }}
                                />
                              </Dropdown>
                              <button type="button" className="draggable-icon" />
                            </div>
                          </li>
                        </ul>
                      )}
                      {!isEmpty(jobDetails) &&
                      !isEmpty(jobDetails.delivery_address1) &&
                      jobDetails.multi_job_type === MultiJobsType.MULTI_DROP ? (
                        this.getsubDropoff(jobDetails.subjobs)
                      ) : jobDetails.delivery_address1 != null ? (
                        <>
                          <div className="location-title d-flex">
                            <span className="ml-auto">{BookingConstant.dropoff}</span>
                          </div>
                          <ul className="location-listing-wrapper">
                            <li>
                              <span>{`${jobDetails.delivery_address1}, ${jobDetails.delivery_city}, ${jobDetails.delivery_postcode}`}</span>
                              <div className="ml-auto side-grp-btn">
                                <Dropdown
                                  overlay={this.locationMenuList()}
                                  className="custom-picker-dropdown"
                                  trigger={['click']}
                                  getPopupContainer={() =>
                                    document.getElementById('location-preview')
                                  }
                                >
                                  <a
                                    className="setting-btn"
                                    onClick={event => {
                                      event.stopPropagation();
                                      this.setState({
                                        isEditLocation: 'delivery'
                                      });
                                    }}
                                  />
                                </Dropdown>
                                <button type="button" className="draggable-icon" />
                              </div>
                            </li>
                          </ul>
                        </>
                      ) : (
                        ''
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </TabPane>
            <TabPane
              tab={BookingConstant.parcels}
              key="2"
              disabled={match && jobDetails.delivery_address1 ? false : true}
            >
              <Card
                bordered={false}
                title={
                  <div className="card-header">
                    <h5>{BookingConstant.parcelsPreview}</h5>
                  </div>
                }
              >
                {match && match.params.jobId ? (
                  <Formik
                    initialValues={{ address: '' }}
                    enableReinitialize
                    onSubmit={this.handleBookingSubmit}
                    onChange={this.onChange}
                    //validationSchema={bookingValidationSchema}
                  >
                    {({
                      values,
                      errors,
                      touched,
                      setFieldValue,
                      handleChange,
                      onBlur,
                      handleSubmit
                    }) => (
                      <Form onSubmit={handleSubmit} noValidate>
                        <FormWrapper className="middle-field">
                          <FormGroup className="form-group three-fields-group">
                            {!isEmpty(userData) && !isEmpty(jobDetails.subjobs) && (
                              <>
                                <i className="label-parcel">{BookingConstant.address}</i>
                                <Select
                                  placeholder={'-'}
                                  name="address"
                                  value={
                                    values.address
                                      ? this.props.subjobsId != null
                                        ? this.getAddress()
                                        : values.address
                                      : this.props.subjobsId != null
                                      ? this.getAddress()
                                      : this.getparcelAddress()
                                  }
                                  isFormik={false}
                                  onChange={e => this.handleSelect(e, setFieldValue)}
                                >
                                  {this.subjobsAdress(jobDetails.subjobs)}
                                </Select>
                              </>
                            )}
                          </FormGroup>
                          <div className="location-preview">
                            <div className="location-title d-flex before">
                              <span>{BookingConstant.parcels}</span>
                            </div>
                            <AccordianStyle id="parcel-item-preview">
                              {this.getParcelData()}
                            </AccordianStyle>
                          </div>
                        </FormWrapper>
                      </Form>
                    )}
                  </Formik>
                ) : (
                  'Coming soon..'
                )}
              </Card>
            </TabPane>
            <TabPane tab=" " key="4" disabled={match && match.params.jobId ? false : true}>
              <Card
                bordered={false}
                title={
                  <div className="card-header d-flex">
                    <h5>{BookingConstant.orderQuote}</h5>
                    <div className="ml-auto panel-next-day-text">{BookingConstant.nextDay}</div>
                  </div>
                }
              >
                <div className="form-styling2">
                  <div className="location-preview">
                    <div className="location-title beforenone order-receipt-titile d-flex">
                      {BookingConstant.yourReceipt}
                    </div>
                    <ul className="order-receipt-list">
                      {this.OrderReceipt()}
                      {((!isEmpty(userData) && userData.is_registered_company === null) ||
                        userData.is_registered_company === '0') && (
                        <li className="active">
                          <div className="d-flex pickup-dropoff-main">
                            <div className="pickup-dropoff">
                              <span className="vat-span">{BookingConstant.courierGov}</span>
                            </div>
                            <div className="price-text font-weight-low">
                              {BookingConstant.pound}
                              {this.props.jobDetails.vat
                                ? ' '
                                : BookingConstant.courierGovPrice.toFixed(2)}
                            </div>
                          </div>
                        </li>
                      )}
                    </ul>
                    <div className="location-title d-flex">
                      <span className="ml-auto">{BookingConstant.totalPricetxt}</span>
                    </div>
                    <ul className="total-price">
                      <li>
                        <div className="pickup-dropoff-main d-flex">
                          <div className="pickup-dropoff">
                            <p>{BookingConstant.pricesChange}</p>
                          </div>
                          <div className="price-text">{this.getTotalPrice()}</div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabPane>
          </Tabs>
        </LocationPreviewWrapper>
        <div className="slide-nav">
          <Row>
            <Col xs={24} sm={8} md={8} lg={8}>
              <div className="nav-slide-arrow">
                <button
                  type="button"
                  className={`prev-btn arrow-btn ${
                    detailKey === '2' || pageKey === 'next' ? 'active' : ''
                  }`}
                  onClick={this.handleMultiClick}
                  name="prev"
                  disabled={detailKey === '2' || pageKey === 'next' ? false : true}
                />
                <button
                  type="button"
                  className={`next-btn arrow-btn ${
                    (jobDetails.pickup_address1 && jobDetails.delivery_address1) ||
                    (jobDetails.subjobs && jobDetails.subjobs.length > 0)
                      ? detailKey === '1'
                        ? 'active'
                        : this.checkParcelStatus()
                        ? 'active'
                        : ''
                      : ''
                  }`}
                  onClick={this.handleMultiClick}
                  name="next"
                  disabled={
                    isEmpty(jobDetails)
                      ? true
                      : !isEmpty(jobDetails.pickup_address1) &&
                        !isEmpty(jobDetails.delivery_address1)
                      ? false
                      : true
                  }
                />
              </div>
            </Col>
            <Col xs={24} sm={8} md={8} lg={8} className="align-center">
              <div className="nav-dots">
                <i className={`gray-dot ${detailKey === '1' ? 'active' : ''}`}></i>
                <i className={`gray-dot ${detailKey === '2' ? 'active' : ''}`}></i>
              </div>
            </Col>
            <Col xs={24} sm={8} md={8} lg={8} className="d-flex">
              <RoutePreviewDiv>
                <div className="ml-auto popover-route-container">
                  {!isEmpty(jobDetails) ? (
                    jobDetails.pickup_location_lat ? (
                      <Popover
                        title={
                          <div className="card-header card-header-pink d-flex">
                            <h5>{BookingConstant.routePreview}</h5>
                            <div className="ml-auto">
                              <i className="route-filter-icon"></i>
                            </div>
                          </div>
                        }
                        getPopupContainer={() => document.querySelector('.popover-route-container')}
                        content={this.RouteContent()}
                        trigger="click"
                      >
                        <button type="button" className="tag-btn" />
                      </Popover>
                    ) : (
                      <button type="button" className="tag-btn gray-btn" />
                    )
                  ) : (
                    <button type="button" className="tag-btn gray-btn" />
                  )}
                </div>
              </RoutePreviewDiv>
            </Col>
          </Row>
        </div>
      </BookingWrapper>
    );
  }
}
const mapStateToProps = state => ({
  userData: state.profileUpdate.userData,
  parcelsProps: state.booking.parcels,
  jobDetails: state.booking.jobDetails,
  quotaDetails: state.booking.quotaDetails,
  nextDayEstimate: state.booking.nextDayEstimate,
  parcels: state.booking.parcels,
  subjobsId: state.booking.latestParcelId
});
const mapDispatchToProps = dispatch => ({
  getJob: payload => dispatch(getJob(payload)),
  //getQuota: payload => dispatch(getQuota(payload)),
  getnextdayestimate: payload => dispatch(getnextdayestimate(payload)),
  clearJob: () => dispatch(clearJob()),
  cancelJob: payload => dispatch(cancelJob(payload)),
  getParcel: payload => dispatch(getParcel(payload)),
  deleteParcel: payload => dispatch(deleteParcel(payload)),
  updateparcel: payload => dispatch(updateparcel(payload)),
  deleteItem: payload => dispatch(deleteItem(payload))
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BookingDetails));
