import "./userList.css";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { makeRequest } from "../../axios";

export default function UserList() {
  const [newUsers, setNewUsers] = useState([]);
  

  useEffect(() => {
    const getNewUsers = async () => {
      try {
        const res = await makeRequest.get("/users?new=true", {
          headers: {
            token: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZTZmYzQ2NDk0Mjc3MTYwNDg4MmMxNiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTYyNTgzMjMxMSwiZXhwIjoxNjI2MjY0MzExfQ.ATXV-1TTWIGyVBttTQSf0erRWjsgZ8jHQv1ZsUixbng",
          },
        });
        const modifiedUsers = res.data.map((user, index) => ({
          id: index + 1,
          ...user,
        }));
        setNewUsers(modifiedUsers);
      } catch (err) {
        console.log(err);
      }
    };
    getNewUsers();
  }, []);

  // console.log('users',newUsers)
  // const handleDelete = (id) => {
  //   setData(data.filter((item) => item.id !== id));
  // };
 
  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
    },
    {
      field: "username",
      headerName: "User",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="userListUser">
            <img className="userListImg" src={params.row.profilePic? params.row.profilePic : 'https://toppng.com/uploads/preview/app-icon-set-login-icon-comments-avatar-icon-11553436380yill0nchdm.png'} alt="" />
            {params.row.username}
          </div>
        );
      },
    },
    { field: "email", headerName: "Email", width: 200 },
    {
      field: "",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        return (
          <span>active</span>
        );
      },
    },
    {
      field: "",
      headerName: "Transaction Volume",
      width: 160,
      renderCell: (params) => {
        return (
          <span>R 120.00</span>
        );
      },
    },
    // {
    //   field: "action",
    //   headerName: "Action",
    //   width: 150,
    //   renderCell: (params) => {
    //     return (
    //       <>
    //         <DeleteOutline
    //           className="userListDelete"
    //           onClick={() => handleDelete(params.row._id)}
    //         />
    //       </>
    //     );
    //   },
    // },
  ];

  return (
    <div className="userList">
      <DataGrid
        rows={newUsers}
        disableSelectionOnClick
        columns={columns}
        pageSize={8}
        checkboxSelection
      />
    </div>
  );
}
