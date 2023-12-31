import React, { useState, useEffect, ChangeEvent } from "react";
import "./adminUserPage.css";
import { Popconfirm, Tabs } from "antd";
import { Table } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue } from "antd/es/table/interface";
import adminService from "../../services/user.service";
import { IUser } from "../../types/interface";
import { useDispatch, useSelector } from "react-redux";
import { update } from "../../store/reducers/update";
import { notifySuccess } from "../../common/toastify";
import AdminModalAdd from "../adminUserAddModal/adminModalAdd";
import AdminService from "../../services/admin.service";

interface TableParams {
  pagination?: TablePaginationConfig;

  filters?: Record<string, FilterValue>;
}

const Users = (): JSX.Element => {
  const [popUpAdd, setPopUpAdd] = useState<boolean>(false);
  const [admin, setAdmin] = useState<IUser>();
  const [admins, setAdmins] = useState<IUser[]>([]);
  const [data, setData] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const updateStatus = useSelector((state: any) => state.update);
  const dispatch = useDispatch();
  const idAdmin = localStorage.getItem("idUser");
  const adminService = new AdminService();
  const columns: ColumnsType<IUser> = [
    {
      title: "Name",
      dataIndex: "fullName",
      width: "25%",
      render: (dataIndex, record: any) => (
        <span
          style={
            record.status === false
              ? { textDecoration: "line-through" }
              : { textDecoration: "none" }
          }
        >
          {dataIndex}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (dataIndex, record: any) => (
        <span
          style={
            record.status === false
              ? { textDecoration: "line-through" }
              : { textDecoration: "none" }
          }
        >
          {dataIndex}
        </span>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      render: (dataIndex, record: any) => (
        <span
          style={
            record.status === false
              ? { textDecoration: "line-through" }
              : { textDecoration: "none" }
          }
        >
          {dataIndex}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (dataIndex: any) => (
        <span>{dataIndex === true ? "Active" : "Block"}</span>
      ),
    },

    {
      title: "Action",
      dataIndex: "id",
      render: (dataIndex: any, record: any) => {
        return (
          <div>
            {record.status === true ? (
              <Popconfirm
                title="Block this user"
                description="Are you sure to BLOCK this user?"
                onConfirm={() => onBlock(dataIndex)}
                okText="Yes"
                cancelText="No"
              >
                <button className="btnActionUsers">Block</button>
              </Popconfirm>
            ) : (
              <Popconfirm
                title="Unblock this user"
                description="Are you sure to UNBLOCK this user?"
                onConfirm={() => onActive(dataIndex)}
                okText="Yes"
                cancelText="No"
              >
                <button className="btnActionUsers">Unblock</button>
              </Popconfirm>
            )}
          </div>
        );
      },
      width: "20%",
    },
  ];

  const onActive = async (id: number) => {
    await adminService.active(id);
    dispatch(update());
  };
  const onBlock = async (id: number) => {
    await adminService.block(id);
    dispatch(update());
  };
  const onChange = (key: string) => {
    // console.log(key);
  };

  const fetchData = async () => {
    setLoading(true);
    const data: any = await adminService.getAllUsers();

    setData(data);
    setLoading(false);
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        total: data.length,
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(tableParams), updateStatus]);

  const handleTableChange: any = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue>
  ) => {
    setTableParams({
      pagination,
      filters,
    });

    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };
  useEffect(() => {
    const getAdmin = async () => {
      const admins = await adminService.getAllAdmin();
      const admin = await adminService.getAdminById(Number(idAdmin));
      setAdmin(admin);
      setAdmins(admins);
    };
    getAdmin();
  }, [updateStatus]);
  const handleAddAdmin = () => {
    setPopUpAdd(true);
  };
  const offPopUpAdd = () => {
    setPopUpAdd(false);
  };
  const handleDeleteAdmin = async (id: number) => {
    await adminService.deleteAdmin(id);
    notifySuccess("Delete Success");
    dispatch(update());
  };
  const handleSearchUsers = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 0) {
      setSearchValue(e.target.value);
    } else {
      setSearchValue("");
    }
  };
  useEffect(() => {
    const getData = async () => {
      const data = await adminService.searchUsers(searchValue);
      setData(data);
    };
    setTimeout(() => {
      getData();
    }, 1000);
  }, [searchValue]);

  return (
    <section className="usersAdmins">
      <Tabs
        className="users"
        onChange={onChange}
        type="card"
        items={new Array(2).fill(null).map((_, i) => {
          const id = String(i + 1);
          if (id === "1") {
            return {
              label: `Users`,
              key: id,
              children: (
                <section className="usersGroup">
                  <div className="searchUsers">
                    <input
                      onChange={handleSearchUsers}
                      value={searchValue}
                      autoFocus
                      placeholder="Search by Name..."
                      type="text"
                    />
                  </div>
                  <Table
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                  />
                </section>
              ),
            };
          } else {
            return {
              label: `Admin`,
              key: id,
              children: (
                <section className="admins">
                  <table>
                    <thead>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Position</th>
                      <th>Action</th>
                    </thead>
                    <tbody>
                      {admins.length > 0 &&
                        admins.map((item: IUser) => {
                          return (
                            <tr key={item.id}>
                              <td>{item.fullName}</td>
                              <td>{item.email}</td>
                              <td>Admin </td>
                              <td className="adminsActions">
                                {admin?.role === 3 ? (
                                  <div className="actionUsers">
                                    <Popconfirm
                                      title="Delete the task"
                                      description="Are you sure to delete this task?"
                                      onConfirm={() =>
                                        handleDeleteAdmin(Number(item.id))
                                      }
                                      okText="Yes"
                                      cancelText="No"
                                    >
                                      <button>Delete</button>
                                    </Popconfirm>
                                  </div>
                                ) : (
                                  "Can't change"
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  {admin?.role === 3 ? (
                    <button onClick={handleAddAdmin} className="btnActionUsers">
                      Add+ Admin
                    </button>
                  ) : null}
                </section>
              ),
            };
          }
        })}
      />
      {popUpAdd ? <AdminModalAdd offPopUpAdd={offPopUpAdd} /> : null}
    </section>
  );
};

export default Users;
