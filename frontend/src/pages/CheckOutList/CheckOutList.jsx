import React, { useState, useEffect } from "react";
import { getCheckOutList } from "../../Api/services";
import { Table, Pagination, Select, Spin, message } from "antd";
import listStyle from "./CheckoutList.module.css";
import { GrView } from "react-icons/gr";
import { Link } from "react-router-dom";

const { Option } = Select;

const CheckoutList = ({ accessToken }) => {
  const [checkoutDetails, setCheckoutDetails] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("asc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchCheckoutDetails = async (page = 1) => {
    const params = {
      pageNumber: page,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortField,
      sortOrder,
    };

    try {
      const access = localStorage.getItem("access");
      const data = await getCheckOutList(access, params);
      setCheckoutDetails(data.checkout_details);
      setPagination({ currentPage: page, totalPages: data.total_pages });
    } catch (error) {
      message.error("Error fetching checkout details");
    }
  };

  useEffect(() => {
    fetchCheckoutDetails();
  }, [sortField, sortOrder, startDate, endDate]);

  const handlePageChange = (page) => {
    fetchCheckoutDetails(page);
  };

  const handleSortChange = (field, order) => {
    setSortField(field);
    setSortOrder(order);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const columns = [
    /**
     * Modified by - Ashish Dewangan on 27-08-2024
     * Reason - To show specific columns
     */
    // {
    //   title: "Billing ID",
    //   dataIndex: "billing_detail_id",
    //   key: "billing_detail_id",
    // },
    // {
    //   title: "Room Charges",
    //   dataIndex: "room_charges",
    //   key: "room_charges",
    //   sorter: true,
    // },
    // {
    //   title: "Grand Total",
    //   dataIndex: "grand_total",
    //   key: "grand_total",
    //   sorter: true,
    // },
    // {
    //   title: "Created At",
    //   dataIndex: "created_at",
    //   key: "created_at",
    //   sorter: true,
    // },

    {
      title: "Guest Name",
      dataIndex: "guest_name",
      key: "guest_name",
      sorter: true,
    },
    {
      title: "Phone Number",
      dataIndex: "guest_phone_number",
      key: "guest_phone_number",
      sorter: true,
    },
    {
      title: "Room detail (No, type, variety)",
      dataIndex: "room_details",
      key: "room_details",
      sorter: false,
    },
    {
      title: "Grand Total",
      dataIndex: "grand_total",
      key: "grand_total",
      sorter: true,
    },
    {
      title: "Checkin Date",
      dataIndex: "checkin_date",
      key: "checkin_date",
      sorter: true,
    },
    {
      title: "Checkout Date",
      dataIndex: "checkout_date",
      key: "checkout_date",
      sorter: true,
    },
    {
      title: "Check-out Details",
      key: "checkout_details",
      render: (_, record) => (
        <Link to="" className={listStyle.viewLink}>
          <GrView className={listStyle.viewIcon} />
        </Link>
      ),
    },
    /**
     * End of modification by - Ashish Dewangan on 27-08-2024
     * Reason - To show specific columns
     */
  ];

  return (
    <div className={listStyle.pageFrame}>
      <div style={{ marginBottom: "16px" }}>
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          style={{ marginRight: "16px" }}
        />
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          style={{ marginRight: "16px" }}
        />
        <Select
          value={sortField}
          onChange={(value) => handleSortChange(value, sortOrder)}
          style={{ width: 120, marginRight: "16px" }}
        >
          <Option value="created_at">Created At</Option>
          <Option value="room_charges">Room Charges</Option>
          <Option value="grand_total">Grand Total</Option>
        </Select>
        <Select
          value={sortOrder}
          onChange={(value) => handleSortChange(sortField, value)}
          style={{ width: 120 }}
        >
          <Option value="asc">Ascending</Option>
          <Option value="desc">Descending</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={checkoutDetails}
        rowKey={(record) => record.id}
        pagination={false}
      />

      <Pagination
        current={pagination.currentPage}
        total={pagination.totalPages * 10} // Assuming 10 items per page
        onChange={handlePageChange}
        style={{ marginTop: "16px", textAlign: "right" }}
      />
    </div>
  );
};

export default CheckoutList;
