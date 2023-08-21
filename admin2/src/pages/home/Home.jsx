import FeaturedInfo from "../../components/featuredInfo/FeaturedInfo";
import "./home.css";
import WidgetSm from "../../components/widgetSm/WidgetSm";
import WidgetLg from "../../components/widgetLg/WidgetLg";
import { useEffect,  useState } from "react";
import { makeRequest } from "../../axios";
import { getStorage, ref, listAll, getMetadata } from 'firebase/storage';
import app from "../../firebase";
import { Box, CircularProgress, LinearProgress, Stack, Typography} from "@mui/material";
import { useCallback } from "react";

export default function Home() {
  const [totalSizeInGB, setTotalSizeInGB] = useState(null);
  // const [remainingStorageInMB, setRemainingStorageInMB] = useState(null);
  // const [remainingStorageInGB, setRemainingStorageInGB] = useState(null);
  const [GBDownloadsLimit, setGBDownloadsLimit] = useState(1);
  const [uploadOperations, setUploadOperations] = useState(0);
  const [uploadOperationsPercentage, setUploadOperationsPercentage] = useState(0);
  const [downloadOperations, setDownloadOperations] = useState(0);
  const [fetchedData, setFetchedData] = useState(false);
  const [progress, setProgress] = useState(0);
  const [DBprogress, setDBProgress] = useState(0);
  const [DBkB, setDBkB] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  // const projectKey = process.env.REACT_APP_PROJECT_KEY;
  

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        
        if(fetchedData===false){
          const resStorageSize = await makeRequest.get("/dataOperations/find"); 
          const resDBSize = await makeRequest.get("/dataOperations/mongoDBStorageSize"); 

          console.log("Data Operations fetch",resStorageSize.data);
          console.log("DB fetch",resDBSize.data);
          //setting data operation variables
          setUploadOperations(uploadOperations + resStorageSize.data.upload);
          setDate(resStorageSize.data.date);
          //setting DBstorage
          //max storage size is 512Mb*1024= 524288KB
          setDBProgress((resDBSize.data.storageSize/524288)*100);
          setDBkB(resDBSize.data.storageSize)
          console.log("DB fetch %",(resDBSize.data.storageSize/524288)*100);
          setFetchedData(true);
        }
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchOperations();
  }, [fetchedData, uploadOperations]);  

  function CircularProgressWithLabel(props) {
    return (
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress variant="determinate" {...props} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
            {`${Math.round(props.value)}%`}
          </Typography>
        </Box>
      </Box>
    );
  }

  CircularProgressWithLabel.propTypes = {
    value: progress,
  };

  function LinearProgressWithLabel(props) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', flex:'9' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>
      </Box>
    );
  }
  
  LinearProgressWithLabel.propTypes = {
    value: DBprogress,
  };
  //getting the data Operations 
  
  const dataOperations= async(data)=>{
    const res= await makeRequest.post("/dataOperations", data, {
      headers: {
        token: "Bearer " + JSON.parse(localStorage.getItem("user")).accessToken,
      },
    })
    .catch (function (error) { // add a catch method to handle the error response
        alert(error.response.data.message); // display the custom message in an alert box
        console.log("error",error)
    });
    console.log("Uploaded DATA", res.data);
  }
  
  const calculateTotalFileSize = async () => {
    const storage = getStorage(app);
    const itemsRef = ref(storage, "/items/");
    try {
      const listResult = await listAll(itemsRef);

      // Recursively list all items in each prefix
      const allItems = [...listResult.items];
      for (const prefix of listResult.prefixes) {
        const prefixListResult = await listAll(prefix);
        allItems.push(...prefixListResult.items);
        // console.log("first", prefixListResult)
      }

      // Retrieve metadata for all items
      const metadataPromises = allItems.map((item) => getMetadata(item));
      const metadataList = await Promise.all(metadataPromises);

      // Calculate total size
      const totalSize = metadataList.reduce(
        (total, metadata) => total + metadata.size,
        0
      );

      return totalSize;
    } catch (error) {
      console.log("Error calculating total file size:", error);
      return 0;
    }
  };

  const calculateTotalStorageLimit = async () => {
    const GBStoredLimit = 5;
    const totalStorageLimit = GBStoredLimit * 1024 * 1024 * 1024; // Convert GB to bytes
    console.log("Total storage limit:", GBStoredLimit + " GB");
    return totalStorageLimit;
  };

  // Usage
  const display = useCallback(async () => {
    try {
      const totalSizeInBytes = await calculateTotalFileSize();
      
      // const totalSizeIn_MB = (totalSizeInBytes / (1024 * 1024)); // Convert bytes to megabytes
      const totalSizeIn_GB = (totalSizeInBytes / (1024 * 1024 * 1024)); // Convert bytes to megabytes
      const totalStorageLimit = await calculateTotalStorageLimit();
      const remainingStorageInBytes = totalStorageLimit - totalSizeInBytes;
      const remainingStorageIn_MB = remainingStorageInBytes / (1024 * 1024); // Convert bytes to megabytes
      const remainingStorageIn_GB = remainingStorageInBytes / (1024 * 1024 * 1024); // Convert bytes to gigabytes
      const fileSizePercentage = (totalSizeInBytes / totalStorageLimit) * 100;
      const uploadPercentage= (uploadOperations/20000)*100;
      const downloadPercentage= (downloadOperations/50000)*100;
      const dataOperationsInput= {
        "fileSize":totalSizeIn_GB.toFixed(2),
        "percentage":fileSizePercentage,
      }
      await dataOperations(dataOperationsInput);
      uploadOperations? setUploadOperationsPercentage(uploadPercentage): setUploadOperationsPercentage(0);
      console.log("Total file size:", totalSizeIn_GB.toFixed(2) + " GB");
      console.log("Total storage limit:",
        (totalStorageLimit / (1024 * 1024 * 1024)).toFixed(2) + " GB"
      );
      console.log("Remaining storage:", remainingStorageIn_MB.toFixed(2) + " MB");
      console.log("Remaining storage:", remainingStorageIn_GB.toFixed(2) + " GB");
      console.log("upload count:",uploadOperations);
      console.log("Remaining upload operations:",uploadOperationsPercentage);
      console.log("download count:",downloadOperations);
      console.log("Remaining download operations:",downloadPercentage);

      downloadOperations? setGBDownloadsLimit(downloadOperations): setGBDownloadsLimit(0);
      
      downloadPercentage? setDownloadOperations(downloadPercentage): setDownloadOperations(0);
      
      setTotalSizeInGB(totalSizeIn_GB.toFixed(2));
      // setRemainingStorageInMB(remainingStorageIn_MB);
      // setRemainingStorageInGB(remainingStorageIn_GB);
      setProgress(((totalSizeIn_GB.toFixed(2)/(totalStorageLimit / (1024 * 1024 * 1024)).toFixed(2)))*100);
      // Make the HTTP request using Axios
      
      // Process the retrieved usage data
    } catch (error) {
      console.log("Error in display function:", error);
    }
  }, [downloadOperations,uploadOperations,uploadOperationsPercentage]);

  useEffect(() => {
    display();
  }, [display]);

  return (
    <div className="home">
      <Box className="FeaturedInfoContainer" sx={{display:'flex', flexDirection:{xs:'column', sm: 'column', md:'row'}, mt:'1em', gap:{xs:'1em', sm:"1em"}, width:{xs:'70%', sm:'70%', md:'100%'}}}>
        <FeaturedInfo progress={GBDownloadsLimit} title={'GB download'} date={date} data={downloadOperations}/>
        <FeaturedInfo progress={uploadOperationsPercentage} title={'Upload Count'} date={date} data={uploadOperations}/>
        <FeaturedInfo progress={downloadOperations} title={'Download Count'} date={date} data={downloadOperations}/>
      </Box>
      
      <Stack className="featuredItem2" sx={{width:{xs:'80%', sm: '80%', md:'50%'}, border:'1px solid green'}}>
        <Box className="CircularProgress" sx={{display:'flex', flexDirection:'row', Height:'80%', flex:'9'}}>
          <div className="left2">
            <span className="featuredTitle2" style={{ color:'blue' }}>{date}</span>
            <div className="featuredMoneyContainer">
              <span className="featuredMoney2">Current Storage size</span>
            </div>
            <span className="featuredSub2">Amount: {totalSizeInGB} GB</span>
          </div>
          <div className="right2">
            <CircularProgressWithLabel value={progress} style={{ transform: 'scale(5)' }}/>

          </div>
        </Box>
        
        <Box className="linearProgress" style={{ Height:'20%', flex:'1' }}>
          <Stack direction="row" spacing={2} sx={{ width:'100%' }}>
            <span style={{ flex:'1' }}>DB Storage {DBkB} kB</span>
            <LinearProgressWithLabel value={DBprogress} />
          </Stack>
          
        </Box>
      </Stack>
      <Box className="homeWidgets" sx={{display:'flex', flexDirection:{xs:'column', sm: 'column', md:'row'}, mt:'1em', gap:{xs:'1em', sm:"1em"}, margin:'20px'}}>
        <WidgetSm />
        <WidgetLg />
      </Box>
    </div>
  );
}
