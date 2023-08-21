import "./widgetSm.css";
import { useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import { Box } from "@mui/material";

export default function WidgetSm() {
  const [newUsers, setNewUsers] = useState([]);

  useEffect(() => {
    const getNewUsers = async () => {
      try {
        const res = await makeRequest.get("/users?new=true", {
          headers: {
            token:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZTZmYzQ2NDk0Mjc3MTYwNDg4MmMxNiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTYyNTgzMjMxMSwiZXhwIjoxNjI2MjY0MzExfQ.ATXV-1TTWIGyVBttTQSf0erRWjsgZ8jHQv1ZsUixbng",
          },
        });
        const slicedData = res.data.slice(0, 4);
        setNewUsers(slicedData);
      } catch (err) {
        console.log(err);
      }
    };
    getNewUsers();
  }, []);
  console.log("new user: ", newUsers);
  
  return (
    <Box className="widgetSm" sx={{display:'flex', width:{xs:'55%', sm:'55%', md:'30%'}, alignItems:'center', flexDirection:'column', marginBottom:'1em'}}>
      <span className="widgetSmTitle">New Members</span>
      <ul className="widgetSmList">
        {newUsers?.map((user) => (
          <li className="widgetSmListItem">
            <div className="imgContainer">
              <img
                src={
                  user?.profilePic ||
                  "https://pbs.twimg.com/media/D8tCa48VsAA4lxn.jpg"
                }
                alt=""
                className="widgetSmImg"
              />
            </div>
            <div className="widgetSmUser">
              <span className="widgetSmUsername">{user?.username}</span>
            </div>
          </li>
        ))}
      </ul>
    </Box>
  );
}
