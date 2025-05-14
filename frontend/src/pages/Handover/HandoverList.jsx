/**Creation by Tejasve Gupta on 21-06-2024*/


import React, { useState, useEffect } from "react";
import { getExpenseDetailsApi } from "../../Api/services";
import listStyle from "./HandoverList.module.css";

const HandoverList = () => {
  const [expenses, setExpenses] = useState([]);
  const [sortedExpenses, setSortedExpenses] = useState([]);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState({
    date: "",
    expense_type: "",
    paid_by: "",
    paid_to: "",
    user: "",
  });

  useEffect(() => {
    const fetchExpenseDetails = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await getExpenseDetailsApi(access);
        setExpenses(response);
        setSortedExpenses(response);
        // console.log("Fetched expenses:", response);
      } catch (error) {
        console.error("Error fetching expense details:", error);
      }
    };

    fetchExpenseDetails();
  }, []);

  useEffect(() => {
    let filteredExpenses = [...expenses];

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        filteredExpenses = filteredExpenses.filter((expense) =>
          expense[key]
            .toString()
            .toLowerCase()
            .includes(filters[key].toLowerCase())
        );
      }
    });

    const sorted = filteredExpenses.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setSortedExpenses(sorted);
  }, [sortField, sortOrder, filters, expenses]);

  const handleSortChange = (e) => {
    const [field, order] = e.target.value.split(",");
    setSortField(field);
    setSortOrder(order);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <fieldset className={listStyle.listContainer}>
      <legend style={{ marginLeft: "5%" }}>Expense List</legend>
      <div className={listStyle.sortContainer}>
        <label>Sort By: </label>
        <select onChange={handleSortChange}>
          <option value="">Select</option>
          <option value="date,asc">Date (Ascending)</option>
          <option value="date,desc">Date (Descending)</option>
          <option value="expense_type,asc">Expense Type (Ascending)</option>
          <option value="expense_type,desc">Expense Type (Descending)</option>
          <option value="paid_by,asc">Paid By (Ascending)</option>
          <option value="paid_by,desc">Paid By (Descending)</option>
          <option value="paid_to,asc">Paid To (Ascending)</option>
          <option value="paid_to,desc">Paid To (Descending)</option>
          <option value="user,asc">User (Ascending)</option>
          <option value="user,desc">User (Descending)</option>
        </select>
      </div>
      <div className={listStyle.filterContainer}>
        <label>
          Date:
          <input
            type="text"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Expense Type:
          <input
            type="text"
            name="expense_type"
            value={filters.expense_type}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Paid By:
          <input
            type="text"
            name="paid_by"
            value={filters.paid_by}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Paid To:
          <input
            type="text"
            name="paid_to"
            value={filters.paid_to}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          User:
          <input
            type="text"
            name="user"
            value={filters.user}
            onChange={handleFilterChange}
          />
        </label>
      </div>
      {sortedExpenses.length > 0 ? (
        <table className={listStyle.table}>
          <thead>
            <tr>
              <th className={listStyle.th}>Amount</th>
              <th className={listStyle.th}>Date</th>
              <th className={listStyle.th}>Time</th>
              <th className={listStyle.th}>Paid To</th>
              <th className={listStyle.th}>Paid By</th>
              <th className={listStyle.th}>Expense Type</th>
              <th className={listStyle.th}>User</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.map((expense) => (
              <tr key={expense.id}>
                <td className={listStyle.td}>{expense.amount}</td>
                <td className={listStyle.td}>{expense.date}</td>
                <td className={listStyle.td}>{expense.time}</td>
                <td className={listStyle.td}>{expense.paid_to}</td>
                <td className={listStyle.td}>{expense.paid_by}</td>
                <td className={listStyle.td}>{expense.expense_type}</td>
                <td className={listStyle.td}>{expense.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No expenses found.</p>
      )}
    </fieldset>
  );
};

export default HandoverList;
